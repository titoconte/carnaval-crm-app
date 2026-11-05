import fs from 'node:fs';
import path from 'node:path';
import {
  filterMessagesByDate,
  deduplicateMessages,
  loadAllRawMessages,
  loadCheckpoint,
  saveCheckpoint
} from './parser.js';

/**
 * Prepara o lote de novas mensagens do grupo Bicharada para a rodada atual com base no checkpoint anterior.
 * @param {string} rawDir - Caminho do diretório com os arquivos brutos
 * @param {string} checkpointPath - Caminho do arquivo de checkpoint
 * @param {string} cutoffDate - Data de corte mínima (04/11/2026)
 * @returns {object} Objeto com mensagens filtradas e novo timestamp de corte
 */
export function prepareRoundBatch(rawDir, checkpointPath, cutoffDate = '2026-11-04T00:00:00.000Z') {
  const allMessages = loadAllRawMessages(rawDir);
  const dateFiltered = filterMessagesByDate(allMessages, cutoffDate);
  const deduplicated = deduplicateMessages(dateFiltered);
  const checkpoint = loadCheckpoint(checkpointPath);

  let newMessages = deduplicated;
  if (checkpoint.lastProcessedTimestamp) {
    const lastTime = new Date(checkpoint.lastProcessedTimestamp).getTime();
    newMessages = deduplicated.filter(m => new Date(m.timestamp).getTime() > lastTime);
  }

  const latestTimestamp = newMessages.length > 0 
    ? newMessages[newMessages.length - 1].timestamp 
    : checkpoint.lastProcessedTimestamp;

  return {
    messages: newMessages,
    totalNew: newMessages.length,
    latestTimestamp,
    checkpoint
  };
}

/**
 * Gera um template estruturado em Markdown com o resumo executivo e métricas da rodada horária.
 * @param {Array<object>} messages - Lista de mensagens novas do período
 * @param {Date} runDate - Data e hora da execução da rodada
 * @returns {string} Conteúdo em Markdown formatado
 */
export function generateExecutiveReportTemplate(messages, runDate = new Date()) {
  const dateStr = runDate.toLocaleDateString('pt-BR');
  const timeStr = runDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (!messages || messages.length === 0) {
    return `# 🐾 Síntese Executiva - Grupo Bicharada (${dateStr} às ${timeStr})

> [!NOTE] Período sem novas movimentações
> Nenhuma mensagem nova foi enviada no grupo Bicharada durante a última hora.

* **Status:** Inativo no período
* **Mensagens Analisadas:** 0
* **Próxima Verificação:** Em 1 hora
`;
  }

  // Agrupa estatísticas de autores
  const authorCounts = {};
  messages.forEach(m => {
    authorCounts[m.author] = (authorCounts[m.author] || 0) + 1;
  });

  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([author, count]) => `- **${author}:** ${count} mensagem(ns)`)
    .join('\n');

  return `# 🐾 Síntese Executiva - Grupo Bicharada (${dateStr} às ${timeStr})

## 📊 Visão Geral da Rodada
* **Data/Hora da Coleta:** ${dateStr} às ${timeStr}
* **Volume Analisado:** ${messages.length} nova(s) mensagem(ns)
* **Participantes Ativos:**
${topAuthors}

---

## 📌 Tópicos Principais Discutidos
*(Identificados a partir das mensagens registradas no período)*

${messages.map(m => `> **[${new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}] ${m.author}:** ${m.text}`).join('\n>\n')}

---

## 🎯 Decisões Tomadas & Acordos
*(Mapeamento de decisões consolidadas na conversa)*
* Aguardando consolidação dos participantes para o período.

---

## ✅ Itens de Ação & To-Dos
*(Tarefas, pendências e compromissos firmados)*
* Acompanhar os próximos passos detalhados no grupo.
`;
}

/**
 * Executa uma rodada completa de síntese: lê os dados, gera o relatório e atualiza o checkpoint.
 * @param {object} options - Opções com caminhos de diretórios e arquivos
 * @returns {object} Resultado consolidado da rodada
 */
export function executeSynthesisRound(options = {}) {
  const rawDir = options.rawDir || path.resolve('data/bicharada/raw');
  const checkpointPath = options.checkpointPath || path.resolve('data/bicharada/checkpoint.json');
  const reportsDir = options.reportsDir || path.resolve('data/bicharada/reports');
  const runDate = options.runDate || new Date();

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const batch = prepareRoundBatch(rawDir, checkpointPath);
  const reportContent = generateExecutiveReportTemplate(batch.messages, runDate);

  const timestampFile = runDate.toISOString().slice(0, 13).replace('T', '_') + 'h00';
  const reportFilename = `Bicharada_Sintese_${timestampFile}.md`;
  const reportFilePath = path.join(reportsDir, reportFilename);

  fs.writeFileSync(reportFilePath, reportContent, 'utf-8');

  if (batch.latestTimestamp) {
    saveCheckpoint(checkpointPath, batch.latestTimestamp, batch.totalNew);
  }

  return {
    success: true,
    totalMessages: batch.totalNew,
    reportFilename,
    reportFilePath,
    reportContent
  };
}

