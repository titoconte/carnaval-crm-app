import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeSynthesisRound } from '../src/synthesizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dispara a execução da rodada de síntese horária do grupo Bicharada.
 * Lê o lote não processado, formata o relatório e persiste em data/bicharada/reports/.
 */
export function runHourlyRound() {
  const rootDir = path.resolve(__dirname, '..');
  const rawDir = path.join(rootDir, 'data/bicharada/raw');
  const checkpointPath = path.join(rootDir, 'data/bicharada/checkpoint.json');
  const reportsDir = path.join(rootDir, 'data/bicharada/reports');

  const result = executeSynthesisRound({
    rawDir,
    checkpointPath,
    reportsDir,
    runDate: new Date()
  });

  console.log(`[Bicharada] Rodada executada com sucesso!`);
  console.log(`- Mensagens novas: ${result.totalMessages}`);
  console.log(`- Relatório gerado: ${result.reportFilename}`);

  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runHourlyRound();
}

