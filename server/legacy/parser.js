import fs from 'node:fs';
import path from 'node:path';

/**
 * Filtra mensagens garantindo que apenas aquelas enviadas na data de corte ou posteriormente sejam consideradas.
 * @param {Array<object>} messages - Lista de mensagens brutas
 * @param {string|Date} cutoffDate - Data mínima permitida (padrão: 04/11/2026)
 * @returns {Array<object>} Lista filtrada
 */
export function filterMessagesByDate(messages, cutoffDate = '2026-11-04T00:00:00.000Z') {
  if (!Array.isArray(messages)) return [];

  const cutoff = new Date(cutoffDate);
  return messages.filter(msg => {
    if (!msg || !msg.timestamp) return false;
    const msgDate = new Date(msg.timestamp);
    return !isNaN(msgDate.getTime()) && msgDate >= cutoff;
  });
}

/**
 * Remove mensagens duplicadas com base no ID único ou na combinação de autor, timestamp e texto.
 * @param {Array<object>} messages - Lista de mensagens
 * @returns {Array<object>} Lista deduplicada
 */
export function deduplicateMessages(messages) {
  if (!Array.isArray(messages)) return [];

  const seen = new Set();
  const result = [];

  for (const msg of messages) {
    if (!msg || !msg.text) continue;
    // Cria uma chave única robusta para identificar a mensagem
    const key = msg.id || `${msg.author}_${msg.timestamp}_${msg.text.trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(msg);
    }
  }

  // Ordena cronologicamente por timestamp
  return result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Filtra mensagens que pertencem a uma janela temporal específica (ex: última hora entre 08h e 22h).
 * @param {Array<object>} messages - Lista de mensagens
 * @param {Date} startTime - Início do intervalo
 * @param {Date} endTime - Fim do intervalo
 * @returns {Array<object>} Mensagens contidas no intervalo
 */
export function filterByTimeWindow(messages, startTime, endTime) {
  if (!Array.isArray(messages)) return [];

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  return messages.filter(msg => {
    const time = new Date(msg.timestamp).getTime();
    return time >= start && time <= end;
  });
}

/**
 * Lê e consolida todas as mensagens salvas nos arquivos JSON da pasta raw.
 * @param {string} rawDir - Caminho da pasta de arquivos brutos
 * @returns {Array<object>} Todas as mensagens consolidadas
 */
export function loadAllRawMessages(rawDir) {
  if (!fs.existsSync(rawDir)) return [];

  const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
  let allMessages = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(rawDir, file), 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.messages)) {
        allMessages = allMessages.concat(parsed.messages);
      }
    } catch (err) {
      console.error(`Erro ao ler arquivo raw ${file}:`, err.message);
    }
  }

  return allMessages;
}

/**
 * Lê o estado atual do checkpoint de processamento do grupo.
 * @param {string} checkpointPath - Caminho do arquivo de checkpoint
 * @returns {object} Dados do checkpoint atual
 */
export function loadCheckpoint(checkpointPath) {
  if (!fs.existsSync(checkpointPath)) {
    return { lastProcessedTimestamp: null, lastRunAt: null, processedCount: 0 };
  }
  try {
    return JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
  } catch {
    return { lastProcessedTimestamp: null, lastRunAt: null, processedCount: 0 };
  }
}

/**
 * Atualiza o arquivo de checkpoint com o timestamp da última mensagem processada.
 * @param {string} checkpointPath - Caminho do arquivo de checkpoint
 * @param {string} lastTimestamp - Timestamp ISO da última mensagem
 * @param {number} count - Total de mensagens processadas nesta rodada
 */
export function saveCheckpoint(checkpointPath, lastTimestamp, count = 0) {
  const dir = path.dirname(checkpointPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const data = {
    lastProcessedTimestamp: lastTimestamp,
    lastRunAt: new Date().toISOString(),
    processedCount: count
  };

  fs.writeFileSync(checkpointPath, JSON.stringify(data, null, 2), 'utf-8');
}

