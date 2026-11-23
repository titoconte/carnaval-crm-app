/**
 * Módulo de Conexão com o Banco de Dados (Vercel Postgres / Neon Serverless).
 * 
 * Permite persistência na nuvem com fallback gracioso para ambiente local
 * caso as variáveis de ambiente ainda não tenham sido configuradas na Vercel.
 */

import { Pool } from '@neondatabase/serverless';
import {
  RegistroPresencaEvento,
  USUARIOS_INICIAIS,
  UsuarioBloco,
  autenticarUsuario
} from '../data/blocoData';

let cachedPool: Pool | null = null;
let schemaInitialized = false;
let fatoPresencaInitialized = false;

/**
 * DDL oficial da tabela fato de presenças em ensaios e reuniões do calendário.
 * Armazena as chaves dimensionais (evento_id e integrante_id) com snapshot do elenco
 * para consultas analíticas e restrição de unicidade por evento/integrante.
 */
export const FATO_PRESENCA_EVENTOS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS fato_presenca_eventos (
    id VARCHAR(120) PRIMARY KEY,
    evento_id VARCHAR(100) NOT NULL,
    integrante_id VARCHAR(100) NOT NULL,
    integrante_nome VARCHAR(150) NOT NULL,
    grande_grupo VARCHAR(100) NOT NULL,
    instrumento_ou_funcao VARCHAR(120) NOT NULL,
    evento_data VARCHAR(50) NOT NULL,
    evento_tipo VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Presente',
    observacao TEXT,
    registrado_por VARCHAR(100),
    registrado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fato_presenca_evento_integrante UNIQUE (evento_id, integrante_id)
  );
`;

/**
 * Reseta o pool de conexão (útil para testes unitários ou reconexão).
 */
export function resetDbPool(): void {
  cachedPool = null;
  schemaInitialized = false;
  fatoPresencaInitialized = false;
}

/**
 * Obtém ou cria a instância de conexão Pool com o Vercel Postgres / Neon.
 * 
 * @returns Instância do Pool ou null se banco não configurado
 */
export function getDbPool(): Pool | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!cachedPool) {
    cachedPool = new Pool({ connectionString: url });
  }
  return cachedPool;
}

/**
 * Obtém a URL de conexão com o banco de dados das variáveis de ambiente.
 * 
 * @returns String de conexão ou string vazia se não configurada
 */
export function getDatabaseUrl(): string {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    ''
  );
}

/**
 * Verifica se a conexão com o banco Vercel Postgres / Neon está ativa.
 * 
 * @returns Booleano indicando se a URL do banco foi definida
 */
export function isDatabaseConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(url && url.trim().length > 0);
}

/**
 * Executa uma instrução SQL parametrizada no banco Neon / Vercel Postgres.
 * 
 * @param query - Comando SQL com placeholders $1, $2...
 * @param params - Parâmetros opcionais da consulta
 * @returns Array de resultados ou array vazio caso o banco não esteja configurado
 */
export async function executeSql<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const pool = getDbPool();
  if (!pool) {
    return [];
  }

  const result = await pool.query(query, params);
  return (result.rows || []) as T[];
}

/**
 * Garante que a tabela central de estados bloco_state exista no banco
 * antes de qualquer operação de leitura ou escrita.
 */
export async function ensureSchemaInitialized(): Promise<void> {
  if (schemaInitialized || !isDatabaseConfigured()) return;
  try {
    await executeSql(`
      CREATE TABLE IF NOT EXISTS bloco_state (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    schemaInitialized = true;
  } catch (error) {
    console.error('Erro ao verificar/criar tabela bloco_state:', error);
  }
}

/**
 * Inicializa a estrutura das tabelas principais no Vercel Postgres.
 * Cria a tabela central de estados do bloco e as tabelas relacionais de apoio.
 * 
 * @returns Objeto com status de sucesso e mensagem informativa
 */
export async function initDatabaseSchema(): Promise<{ success: boolean; message: string }> {
  if (!isDatabaseConfigured()) {
    return {
      success: false,
      message: 'Variável POSTGRES_URL não configurada no ambiente. Rodando em modo LocalStorage.'
    };
  }

  try {
    // 1. Tabela central de snapshots de estado (JSONB resiliente e performático)
    await executeSql(`
      CREATE TABLE IF NOT EXISTS bloco_state (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabela de Inscrições do Bloco
    await executeSql(`
      CREATE TABLE IF NOT EXISTS inscritos_bloco (
        id VARCHAR(100) PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        experiencia VARCHAR(50),
        disponibilidade VARCHAR(100),
        status VARCHAR(30) DEFAULT 'Pendente',
        data_inscricao VARCHAR(50),
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Tabela de Rifas Criadas
    await executeSql(`
      CREATE TABLE IF NOT EXISTS rifas (
        id VARCHAR(100) PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        coordenador VARCHAR(150) NOT NULL,
        quantidade_numeros INTEGER NOT NULL,
        preco_numero NUMERIC(10, 2) NOT NULL,
        data_limite VARCHAR(50) NOT NULL,
        data_criacao VARCHAR(50) NOT NULL,
        status VARCHAR(30) DEFAULT 'Ativa',
        premios JSONB NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Tabela de Vendas de Bilhetes de Rifas
    await executeSql(`
      CREATE TABLE IF NOT EXISTS rifas_vendas (
        id VARCHAR(100) PRIMARY KEY,
        rifa_id VARCHAR(100) NOT NULL,
        numero INTEGER NOT NULL,
        comprador_nome VARCHAR(150) NOT NULL,
        comprador_telefone VARCHAR(50) NOT NULL,
        data_venda VARCHAR(50) NOT NULL,
        valor_pago NUMERIC(10, 2) NOT NULL,
        forma_pagamento VARCHAR(50) DEFAULT 'PIX',
        comprovante_ref TEXT,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tabela de Documentos Oficiais
    await executeSql(`
      CREATE TABLE IF NOT EXISTS documentos_bloco (
        id VARCHAR(100) PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        nome_arquivo VARCHAR(200) NOT NULL,
        tamanho_formatado VARCHAR(50),
        formato_extensao VARCHAR(20),
        url_download TEXT,
        data_upload VARCHAR(50),
        tags JSONB,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Tabela de Eventos e Ensaios do Calendário
    await executeSql(`
      CREATE TABLE IF NOT EXISTS eventos_calendario (
        id VARCHAR(100) PRIMARY KEY,
        data VARCHAR(50) NOT NULL,
        dia_semana VARCHAR(50) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        local VARCHAR(200) NOT NULL,
        horario VARCHAR(50) NOT NULL,
        observacoes TEXT,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Tabela de Usuários e Autenticação do Bloco
    await executeSql(`
      CREATE TABLE IF NOT EXISTS usuarios_bloco (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(100) NOT NULL,
        perfil VARCHAR(30) NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Tabela Fato de Lista de Presença em Ensaios e Reuniões (Exclusivo Coordenação)
    await executeSql(FATO_PRESENCA_EVENTOS_TABLE_SQL);
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_fato_presenca_evento_id ON fato_presenca_eventos (evento_id);'
    );
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_fato_presenca_integrante_id ON fato_presenca_eventos (integrante_id);'
    );
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_fato_presenca_evento_data ON fato_presenca_eventos (evento_data);'
    );

    schemaInitialized = true;
    fatoPresencaInitialized = true;

    return {
      success: true,
      message: 'Esquema de banco de dados Vercel Postgres inicializado com sucesso!'
    };
  } catch (error: any) {
    console.error('Erro ao inicializar esquema do banco:', error);
    return {
      success: false,
      message: `Erro na criação das tabelas: ${error.message}`
    };
  }
}

/**
 * Salva ou atualiza um conjunto de dados do bloco na tabela central de estados.
 * 
 * @param key - Chave identificadora do estado (ex: 'rifas', 'inscritos', 'tarefas')
 * @param data - Dados em formato serializável JSON
 * @returns Booleano indicando se o salvamento foi bem-sucedido
 */
export async function salvarEstadoNoBanco(key: string, data: any): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    await ensureSchemaInitialized();

    await executeSql(
      `
      INSERT INTO bloco_state (key, data, updated_at)
      VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = CURRENT_TIMESTAMP;
      `,
      [key, JSON.stringify(data)]
    );
    return true;
  } catch (error) {
    console.error(`Erro ao salvar estado "${key}" no banco:`, error);
    return false;
  }
}

/**
 * Recupera um conjunto de dados do bloco pela sua chave identificadora.
 * 
 * @param key - Chave do estado a recuperar
 * @returns Os dados decodificados ou null se não encontrados
 */
export async function obterEstadoDoBanco<T = any>(key: string): Promise<T | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    await ensureSchemaInitialized();

    const rows = await executeSql<{ key: string; data: any }>(
      'SELECT data FROM bloco_state WHERE key = $1 LIMIT 1',
      [key]
    );

    if (rows && rows.length > 0) {
      return rows[0].data as T;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao obter estado "${key}" do banco:`, error);
    return null;
  }
}

/**
 * Retorna todos os estados salvos no banco para sincronização inicial completa.
 * 
 * @returns Dicionário com todas as chaves e seus respectivos dados
 */
export async function obterTodosEstadosDoBanco(): Promise<Record<string, any>> {
  if (!isDatabaseConfigured()) {
    return {};
  }

  try {
    await ensureSchemaInitialized();

    const rows = await executeSql<{ key: string; data: any }>(
      'SELECT key, data FROM bloco_state'
    );

    const resultado: Record<string, any> = {};
    for (const row of rows) {
      resultado[row.key] = row.data;
    }
    return resultado;
  } catch (error) {
    console.error('Erro ao obter todos os estados do banco:', error);
    return {};
  }
}

/**
 * Garante que a tabela fato fato_presenca_eventos e seus índices existam no PostgreSQL
 * antes de executar operações de leitura ou escrita de presenças.
 */
export async function ensureFatoPresencaInitialized(): Promise<void> {
  if (fatoPresencaInitialized || !isDatabaseConfigured()) return;
  try {
    await executeSql(FATO_PRESENCA_EVENTOS_TABLE_SQL);
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_fato_presenca_evento_id ON fato_presenca_eventos (evento_id);'
    );
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_fato_presenca_integrante_id ON fato_presenca_eventos (integrante_id);'
    );
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_fato_presenca_evento_data ON fato_presenca_eventos (evento_data);'
    );
    fatoPresencaInitialized = true;
  } catch (error) {
    console.error('Erro ao verificar/criar tabela fato_presenca_eventos:', error);
  }
}

/**
 * Converte uma linha retornada da tabela fato_presenca_eventos (snake_case)
 * para o modelo de domínio RegistroPresencaEvento (camelCase).
 * 
 * @param row - Linha bruta retornada pela consulta PostgreSQL
 * @returns Objeto RegistroPresencaEvento padronizado
 */
function mapearLinhaFatoPresenca(row: any): RegistroPresencaEvento {
  return {
    id: String(row.id),
    eventoId: String(row.evento_id),
    integranteId: String(row.integrante_id),
    integranteNome: String(row.integrante_nome),
    grandeGrupo: row.grande_grupo,
    instrumentoOuFuncao: String(row.instrumento_ou_funcao),
    eventoData: String(row.evento_data),
    eventoTipo: row.evento_tipo,
    status: row.status,
    observacao: row.observacao ?? undefined,
    registradoPor: row.registrado_por ?? undefined,
    registradoEm: row.registrado_em
      ? new Date(row.registrado_em).toISOString()
      : new Date().toISOString(),
    atualizadoEm: row.atualizado_em
      ? new Date(row.atualizado_em).toISOString()
      : undefined
  };
}

/**
 * Lista os registros da tabela fato fato_presenca_eventos, opcionalmente filtrados por evento.
 * 
 * @param eventoId - Identificador opcional do evento para filtrar a consulta
 * @returns Lista de registros de presença armazenados no banco
 */
export async function listarPresencasNoBanco(
  eventoId?: string
): Promise<RegistroPresencaEvento[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    await ensureFatoPresencaInitialized();

    const rows = eventoId
      ? await executeSql(
          `SELECT * FROM fato_presenca_eventos
           WHERE evento_id = $1
           ORDER BY integrante_nome ASC`,
          [eventoId]
        )
      : await executeSql(
          `SELECT * FROM fato_presenca_eventos
           ORDER BY evento_data DESC, integrante_nome ASC`
        );

    return rows.map(mapearLinhaFatoPresenca);
  } catch (error) {
    console.error('Erro ao listar presenças da tabela fato:', error);
    return [];
  }
}

/**
 * Insere ou atualiza (upsert) um registro na tabela fato fato_presenca_eventos.
 * Garante unicidade pelo par (evento_id, integrante_id).
 * 
 * @param registro - Registro de presença a persistir na tabela fato
 * @returns Verdadeiro se salvo com sucesso no banco
 */
export async function salvarPresencaNoBanco(
  registro: RegistroPresencaEvento
): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    await ensureFatoPresencaInitialized();

    await executeSql(
      `
      INSERT INTO fato_presenca_eventos (
        id,
        evento_id,
        integrante_id,
        integrante_nome,
        grande_grupo,
        instrumento_ou_funcao,
        evento_data,
        evento_tipo,
        status,
        observacao,
        registrado_por,
        registrado_em,
        atualizado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (evento_id, integrante_id)
      DO UPDATE SET
        integrante_nome = EXCLUDED.integrante_nome,
        grande_grupo = EXCLUDED.grande_grupo,
        instrumento_ou_funcao = EXCLUDED.instrumento_ou_funcao,
        evento_data = EXCLUDED.evento_data,
        evento_tipo = EXCLUDED.evento_tipo,
        status = EXCLUDED.status,
        observacao = EXCLUDED.observacao,
        registrado_por = EXCLUDED.registrado_por,
        atualizado_em = CURRENT_TIMESTAMP;
      `,
      [
        registro.id,
        registro.eventoId,
        registro.integranteId,
        registro.integranteNome,
        registro.grandeGrupo,
        registro.instrumentoOuFuncao,
        registro.eventoData,
        registro.eventoTipo,
        registro.status,
        registro.observacao || null,
        registro.registradoPor || null
      ]
    );
    return true;
  } catch (error) {
    console.error('Erro ao salvar presença na tabela fato:', error);
    return false;
  }
}

/**
 * Persiste múltiplos registros de presença em lote na tabela fato fato_presenca_eventos.
 * 
 * @param registros - Lista de registros de presença a inserir ou atualizar
 * @returns Verdadeiro se todos os registros foram persistidos com sucesso
 */
export async function salvarPresencasEmLoteNoBanco(
  registros: RegistroPresencaEvento[]
): Promise<boolean> {
  if (!isDatabaseConfigured() || registros.length === 0) {
    return false;
  }

  try {
    await ensureFatoPresencaInitialized();

    for (const registro of registros) {
      const ok = await salvarPresencaNoBanco(registro);
      if (!ok) return false;
    }
    return true;
  } catch (error) {
    console.error('Erro ao salvar presenças em lote na tabela fato:', error);
    return false;
  }
}

/**
 * Exclui um registro específico de presença (por evento e integrante) ou todos os registros
 * de um evento da tabela fato fato_presenca_eventos.
 * 
 * @param eventoId - Identificador do evento
 * @param integranteId - Identificador opcional do integrante (se omitido, exclui todas as presenças do evento)
 * @returns Verdadeiro se a exclusão foi executada com sucesso
 */
export async function excluirPresencaNoBanco(
  eventoId: string,
  integranteId?: string
): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    await ensureFatoPresencaInitialized();

    if (integranteId) {
      await executeSql(
        'DELETE FROM fato_presenca_eventos WHERE evento_id = $1 AND integrante_id = $2',
        [eventoId, integranteId]
      );
    } else {
      await executeSql(
        'DELETE FROM fato_presenca_eventos WHERE evento_id = $1',
        [eventoId]
      );
    }
    return true;
  } catch (error) {
    console.error('Erro ao excluir presença da tabela fato:', error);
    return false;
  }
}

/**
 * Valida no servidor se as credenciais informadas pertencem a um usuário com perfil 'coordenador'.
 * Consulta os usuários sincronizados no banco de dados e inclui os usuários iniciais como fallback seguro.
 * 
 * @param username - Nome de usuário enviado no cabeçalho da requisição
 * @param senha - Senha enviada no cabeçalho da requisição
 * @returns Verdadeiro exclusivamente se o usuário existir e tiver perfil 'coordenador'
 */
export async function validarCoordenadorNoBanco(
  username?: string | null,
  senha?: string | null
): Promise<boolean> {
  if (!username || !senha) return false;

  let listaUsuarios: UsuarioBloco[] = [...USUARIOS_INICIAIS];

  if (isDatabaseConfigured()) {
    try {
      const usuariosSalvos = await obterEstadoDoBanco<UsuarioBloco[]>('usuarios');
      if (Array.isArray(usuariosSalvos) && usuariosSalvos.length > 0) {
        // Mescla garantindo que o coordenador mestre inicial nunca fique órfão
        const existentes = new Set(usuariosSalvos.map(u => u.username.toLowerCase()));
        const faltantes = USUARIOS_INICIAIS.filter(
          u => !existentes.has(u.username.toLowerCase())
        );
        listaUsuarios = [...usuariosSalvos, ...faltantes];
      }
    } catch (error) {
      console.error('Erro ao consultar usuários para validação de coordenador:', error);
    }
  }

  const usuario = autenticarUsuario(listaUsuarios, username, senha);
  return Boolean(usuario && usuario.perfil === 'coordenador');
}
