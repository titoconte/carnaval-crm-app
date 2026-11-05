/**
 * Módulo de Conexão com o Banco de Dados (Vercel Postgres / Neon Serverless).
 * 
 * Permite persistência na nuvem com fallback gracioso para ambiente local
 * caso as variáveis de ambiente ainda não tenham sido configuradas na Vercel.
 */

import { Pool } from '@neondatabase/serverless';

let cachedPool: Pool | null = null;

/**
 * Reseta o pool de conexão (útil para testes unitários ou reconexão).
 */
export function resetDbPool(): void {
  cachedPool = null;
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
