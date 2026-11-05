import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  getDatabaseUrl,
  isDatabaseConfigured,
  executeSql,
  initDatabaseSchema,
  salvarEstadoNoBanco,
  obterEstadoDoBanco,
  obterTodosEstadosDoBanco,
  resetDbPool
} from '../src/lib/db';
import {
  isBlobConfigured,
  uploadArquivoBlob
} from '../src/lib/blob';

describe('Integração Vercel Postgres e Vercel Blob', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_URL_NON_POOLING;
    delete process.env.DATABASE_URL;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    resetDbPool();
  });

  afterEach(() => {
    process.env = { ...envBackup };
    resetDbPool();
  });

  it('deve identificar corretamente quando o banco Postgres NÃO está configurado', () => {
    assert.strictEqual(isDatabaseConfigured(), false);
    assert.strictEqual(getDatabaseUrl(), '');
  });

  it('deve identificar quando o banco Postgres está configurado via POSTGRES_URL', () => {
    process.env.POSTGRES_URL = 'postgres://user:pass@localhost:5432/bloco_db';
    assert.strictEqual(isDatabaseConfigured(), true);
    assert.strictEqual(getDatabaseUrl(), 'postgres://user:pass@localhost:5432/bloco_db');
  });

  it('deve retornar array vazio ao executar consulta SQL com banco desconectado', async () => {
    const resultado = await executeSql('SELECT * FROM bloco_state');
    assert.deepStrictEqual(resultado, []);
  });

  it('deve avisar que o banco não está configurado ao chamar initDatabaseSchema', async () => {
    const res = await initDatabaseSchema();
    assert.strictEqual(res.success, false);
    assert.ok(res.message.includes('POSTGRES_URL não configurada'));
  });

  it('deve retornar falso ao tentar salvar estado com banco desconectado (fallback local)', async () => {
    const ok = await salvarEstadoNoBanco('tarefas', [{ id: '1', titulo: 'Testar som' }]);
    assert.strictEqual(ok, false);
  });

  it('deve retornar null ao buscar estado com banco desconectado', async () => {
    const dado = await obterEstadoDoBanco('tarefas');
    assert.strictEqual(dado, null);
  });

  it('deve retornar objeto vazio ao buscar todos os estados com banco desconectado', async () => {
    const todos = await obterTodosEstadosDoBanco();
    assert.deepStrictEqual(todos, {});
  });

  it('deve identificar quando o Vercel Blob NÃO está configurado', () => {
    assert.strictEqual(isBlobConfigured(), false);
  });

  it('deve identificar quando o Vercel Blob está configurado com token', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test_token_123';
    assert.strictEqual(isBlobConfigured(), true);
  });

  it('deve realizar upload com fallback local gracioso quando token Blob não estiver presente', async () => {
    const res = await uploadArquivoBlob('partituras/marchinha_2027.pdf', 'conteudo-fake-teste', 'application/pdf');
    assert.strictEqual(res.sucesso, true);
    assert.strictEqual(res.nomeArquivo, 'partituras/marchinha_2027.pdf');
    assert.ok(res.mensagem?.includes('modo local'));
  });
});
