import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCollectorServer } from '../server/collector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.resolve(__dirname, '../data/test_raw');
const TEST_PORT = 3199;

describe('Servidor Coletor de Mensagens (Collector)', () => {
  let server;

  before(async () => {
    // Inicializa o servidor na porta de teste com diretório temporário
    server = createCollectorServer(TEST_PORT, TEST_DIR);
    await new Promise(resolve => server.listen(TEST_PORT, resolve));
  });

  after(async () => {
    // Encerra o servidor e limpa arquivos de teste
    await new Promise(resolve => server.close(resolve));
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('GET /health deve responder com status 200 e informações do serviço', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.target, 'Bicharada');
  });

  test('POST /ingest deve salvar mensagens válidas e retornar status 201', async () => {
    const payload = {
      group: 'Bicharada',
      extractedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-001',
          author: 'Tito',
          timestamp: '2026-11-04T10:00:00.000Z',
          text: 'Bom dia pessoal, reunião confirmada para as 14h.'
        }
      ]
    };

    const res = await fetch(`http://localhost:${TEST_PORT}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.match(data.filename, /^bicharada_/);

    // Valida se o arquivo foi realmente escrito no diretório de destino
    const savedFiles = fs.readdirSync(TEST_DIR);
    assert.ok(savedFiles.length > 0);
    const fileContent = JSON.parse(fs.readFileSync(path.join(TEST_DIR, savedFiles[0]), 'utf-8'));
    assert.equal(fileContent.group, 'Bicharada');
    assert.equal(fileContent.messages.length, 1);
  });

  test('POST /ingest deve rejeitar payload sem grupo ou mensagens com status 400', async () => {
    const invalidPayload = { algo: 'aleatório' };

    const res = await fetch(`http://localhost:${TEST_PORT}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });

  test('GET /rota-inexistente deve retornar 404', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/rota-inexistente`);
    assert.equal(res.status, 404);
  });
});

