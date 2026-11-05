import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  prepareRoundBatch,
  generateExecutiveReportTemplate,
  executeSynthesisRound
} from '../src/synthesizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_SYNTH_DIR = path.resolve(__dirname, '../data/test_synth');

describe('Módulo Sintetizador Executivo', () => {
  const rawDir = path.join(TMP_SYNTH_DIR, 'raw');
  const reportsDir = path.join(TMP_SYNTH_DIR, 'reports');
  const checkpointPath = path.join(TMP_SYNTH_DIR, 'checkpoint.json');

  before(() => {
    if (fs.existsSync(TMP_SYNTH_DIR)) {
      fs.rmSync(TMP_SYNTH_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(rawDir, { recursive: true });
    fs.mkdirSync(reportsDir, { recursive: true });
  });

  after(() => {
    if (fs.existsSync(TMP_SYNTH_DIR)) {
      fs.rmSync(TMP_SYNTH_DIR, { recursive: true, force: true });
    }
  });

  test('generateExecutiveReportTemplate deve gerar mensagem de período inativo quando não houver mensagens', () => {
    const report = generateExecutiveReportTemplate([]);
    assert.match(report, /Período sem novas movimentações/);
    assert.match(report, /Mensagens Analisadas:\*\* 0/);
  });

  test('generateExecutiveReportTemplate deve formatar dados e participantes quando houver mensagens', () => {
    const mockMessages = [
      { id: '1', author: 'Carlos', timestamp: '2026-11-04T10:15:00.000Z', text: 'Revisar proposta' },
      { id: '2', author: 'Carlos', timestamp: '2026-11-04T10:16:00.000Z', text: 'Alinhar prazos' },
      { id: '3', author: 'Ana', timestamp: '2026-11-04T10:20:00.000Z', text: 'De acordo com o prazo' }
    ];

    const report = generateExecutiveReportTemplate(mockMessages);
    assert.match(report, /Volume Analisado:\*\* 3 nova\(s\) mensagem\(ns\)/);
    assert.match(report, /Carlos:\*\* 2 mensagem\(ns\)/);
    assert.match(report, /Ana:\*\* 1 mensagem\(ns\)/);
    assert.match(report, /Revisar proposta/);
  });

  test('executeSynthesisRound deve processar o lote, gerar arquivo de relatório e atualizar checkpoint', () => {
    // Insere arquivo raw simulado
    const batchData = {
      group: 'Bicharada',
      extractedAt: '2026-11-04T10:30:00.000Z',
      messages: [
        { id: 'm1', author: 'Tito', timestamp: '2026-11-04T10:00:00.000Z', text: 'Mensagem 1' },
        { id: 'm2', author: 'Tito', timestamp: '2026-11-04T10:25:00.000Z', text: 'Mensagem 2' }
      ]
    };
    fs.writeFileSync(path.join(rawDir, 'batch_test.json'), JSON.stringify(batchData));

    const result = executeSynthesisRound({ rawDir, checkpointPath, reportsDir });

    assert.equal(result.success, true);
    assert.equal(result.totalMessages, 2);
    assert.ok(fs.existsSync(result.reportFilePath));

    // Valida se checkpoint foi atualizado com o timestamp da última mensagem
    const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
    assert.equal(checkpoint.lastProcessedTimestamp, '2026-11-04T10:25:00.000Z');
  });
});

