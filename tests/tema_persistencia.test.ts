import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  TemaAnoBloco,
  TEMA_ANO_INICIAL,
  atualizarTemaAno
} from '../src/data/blocoData';
import {
  salvarEstadoNoBanco,
  obterEstadoDoBanco,
  resetDbPool
} from '../src/lib/db';

/**
 * Suíte de testes para edição e persistência do Tema do Carnaval e Subtítulo Oficial.
 */
describe('Edição do Tema, Subtítulo e Persistência de Dados', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_URL_NON_POOLING;
    delete process.env.DATABASE_URL;
    resetDbPool();
  });

  afterEach(() => {
    process.env = { ...envBackup };
    resetDbPool();
  });

  /**
   * Testa a atualização do tema e do subtítulo via função atualizarTemaAno.
   */
  it('deve atualizar o título e o subtítulo/slogan do tema corretamente', () => {
    const temaOriginal: TemaAnoBloco = { ...TEMA_ANO_INICIAL };

    const novoTitulo = 'Bicharada nas Estrelas 🌟';
    const novoSubtitulo = 'Um salto cósmico de liberdade e folia no Carnaval';

    const temaAtualizado = atualizarTemaAno(temaOriginal, {
      titulo: novoTitulo,
      subtituloOuSlogan: novoSubtitulo
    });

    assert.strictEqual(temaAtualizado.titulo, novoTitulo);
    assert.strictEqual(temaAtualizado.subtituloOuSlogan, novoSubtitulo);
    assert.strictEqual(temaAtualizado.ano, 2027);
    assert.ok(temaAtualizado.dataAtualizacao);
  });

  /**
   * Testa a preservação do subtítulo quando apenas outros campos (fantasia ou cores) são atualizados.
   */
  it('deve preservar o subtítulo existente quando apenas outros campos forem alterados', () => {
    const temaComSubtitulo: TemaAnoBloco = {
      ano: 2027,
      titulo: 'Tema Especial',
      subtituloOuSlogan: 'Slogan Inalterado',
      fantasia: 'Fantasia antiga',
      descricaoCores: 'Cores antigas'
    };

    const atualizado = atualizarTemaAno(temaComSubtitulo, {
      fantasia: 'Fantasia renovada com tecidos prateados'
    });

    assert.strictEqual(atualizado.subtituloOuSlogan, 'Slogan Inalterado');
    assert.strictEqual(atualizado.fantasia, 'Fantasia renovada com tecidos prateados');
  });

  /**
   * Testa a limpeza do subtítulo para string vazia quando o usuário decidir remover.
   */
  it('deve permitir limpar o subtítulo/slogan definindo string vazia', () => {
    const temaComSubtitulo: TemaAnoBloco = {
      ano: 2027,
      titulo: 'Tema com Slogan',
      subtituloOuSlogan: 'Subtítulo que será removido',
      fantasia: 'Asas',
      descricaoCores: 'Rosa e Verde'
    };

    const atualizado = atualizarTemaAno(temaComSubtitulo, {
      subtituloOuSlogan: ''
    });

    assert.strictEqual(atualizado.subtituloOuSlogan, '');
  });

  /**
   * Testa a fidelidade da serialização JSON do tema (simulando gravação no Postgres JSONB e LocalStorage).
   */
  it('deve manter integridade completa do tema e subtítulo na serialização e deserialização JSON', () => {
    const temaParaSalvar: TemaAnoBloco = {
      ano: 2027,
      titulo: 'Folia Tropical 🦜',
      subtituloOuSlogan: 'Cores, ritmos e asas abertas na Passarela Nego Quirido',
      fantasia: 'Máscaras e plumas',
      descricaoCores: 'Verde e Amarelo'
    };

    const serializado = JSON.stringify(temaParaSalvar);
    const deserializado: TemaAnoBloco = JSON.parse(serializado);

    assert.deepStrictEqual(deserializado, temaParaSalvar);
    assert.strictEqual(deserializado.subtituloOuSlogan, 'Cores, ritmos e asas abertas na Passarela Nego Quirido');
  });

  /**
   * Testa o comportamento resiliente da função de persistência do banco em ambiente desconectado.
   */
  it('deve lidar graciosamente com banco desconectado retornando false sem quebrar', async () => {
    const temaParaSalvar: TemaAnoBloco = {
      ano: 2027,
      titulo: 'Tema Resiliente',
      subtituloOuSlogan: 'Subtítulo de Fallback',
      fantasia: 'Pernas de pau',
      descricaoCores: 'Roxo'
    };

    const salvou = await salvarEstadoNoBanco('temaAno', temaParaSalvar);
    assert.strictEqual(salvou, false);

    const recuperado = await obterEstadoDoBanco('temaAno');
    assert.strictEqual(recuperado, null);
  });
});

