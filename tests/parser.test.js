import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  filterMessagesByDate,
  deduplicateMessages,
  filterByTimeWindow,
  loadCheckpoint,
  saveCheckpoint,
  loadAllRawMessages
} from '../src/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_TEST_DIR = path.resolve(__dirname, '../data/test_parser');

describe('Módulo Parser & Ingestor de Mensagens', () => {
  before(() => {
    if (fs.existsSync(TMP_TEST_DIR)) {
      fs.rmSync(TMP_TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TMP_TEST_DIR, { recursive: true });
  });

  after(() => {
    if (fs.existsSync(TMP_TEST_DIR)) {
      fs.rmSync(TMP_TEST_DIR, { recursive: true, force: true });
    }
  });

  test('filterMessagesByDate deve descartar mensagens anteriores a 04/11/2026', () => {
    const messages = [
      { id: '1', timestamp: '2026-11-03T23:59:59.000Z', text: 'Mensagem de ontem' },
      { id: '2', timestamp: '2026-11-04T00:00:01.000Z', text: 'Mensagem de hoje de madrugada' },
      { id: '3', timestamp: '2026-11-04T10:15:00.000Z', text: 'Mensagem da manhã' }
    ];

    const result = filterMessagesByDate(messages, '2026-11-04T00:00:00.000Z');
    assert.equal(result.length, 2);
    assert.equal(result[0].id, '2');
    assert.equal(result[1].id, '3');
  });

  test('deduplicateMessages deve remover mensagens repetidas e ordenar cronologicamente', () => {
    const messages = [
      { id: 'b', timestamp: '2026-11-04T10:20:00.000Z', text: 'Segunda mensagem' },
      { id: 'a', timestamp: '2026-11-04T10:10:00.000Z', text: 'Primeira mensagem' },
      { id: 'a', timestamp: '2026-11-04T10:10:00.000Z', text: 'Primeira mensagem duplicada' }
    ];

    const result = deduplicateMessages(messages);
    assert.equal(result.length, 2);
    // Verifica ordenação cronológica
    assert.equal(result[0].id, 'a');
    assert.equal(result[1].id, 'b');
  });

  test('filterByTimeWindow deve retornar apenas mensagens dentro do intervalo horário informado', () => {
    const messages = [
      { id: '1', timestamp: '2026-11-04T08:50:00.000Z', text: 'Antes da janela' },
      { id: '2', timestamp: '2026-11-04T09:15:00.000Z', text: 'Dentro da janela' },
      { id: '3', timestamp: '2026-11-04T09:45:00.000Z', text: 'Dentro da janela 2' },
      { id: '4', timestamp: '2026-11-04T10:05:00.000Z', text: 'Após a janela' }
    ];

    const start = '2026-11-04T09:00:00.000Z';
    const end = '2026-11-04T09:59:59.000Z';
    const result = filterByTimeWindow(messages, start, end);

    assert.equal(result.length, 2);
    assert.equal(result[0].id, '2');
    assert.equal(result[1].id, '3');
  });

  test('saveCheckpoint e loadCheckpoint devem persistir e restaurar o estado da rodada', () => {
    const checkpointPath = path.join(TMP_TEST_DIR, 'checkpoint.json');

    // Inicialmente não existe
    const initial = loadCheckpoint(checkpointPath);
    assert.equal(initial.lastProcessedTimestamp, null);

    // Salva novo checkpoint
    saveCheckpoint(checkpointPath, '2026-11-04T10:30:00.000Z', 15);

    const loaded = loadCheckpoint(checkpointPath);
    assert.equal(loaded.lastProcessedTimestamp, '2026-11-04T10:30:00.000Z');
    assert.equal(loaded.processedCount, 15);
    assert.ok(loaded.lastRunAt);
  });

  test('loadAllRawMessages deve ler múltiplos arquivos e consolidar mensagens', () => {
    const rawDir = path.join(TMP_TEST_DIR, 'raw');
    fs.mkdirSync(rawDir, { recursive: true });

    fs.writeFileSync(path.join(rawDir, 'batch1.json'), JSON.stringify({
      messages: [{ id: '1', text: 'Msg 1' }]
    }));
    fs.writeFileSync(path.join(rawDir, 'batch2.json'), JSON.stringify({
      messages: [{ id: '2', text: 'Msg 2' }]
    }));

    const all = loadAllRawMessages(rawDir);
    assert.equal(all.length, 2);
    assert.equal(all[0].id, '1');
    assert.equal(all[1].id, '2');
  });
});

