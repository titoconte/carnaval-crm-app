/**
 * Bicharada WhatsApp Sync - Content Script (Versão Aprimorada e Resiliente)
 * Detecta confiavelmente a conversa do grupo "Bicharada" inspecionando o container #main,
 * extrai mensagens de hoje em diante e envia para o servidor local (localhost:3141).
 */

const TARGET_KEYWORDS = ['bicharada'];
const COLLECTOR_URL = 'http://localhost:3141/ingest';

/**
 * Obtém a data de corte (início do dia atual em UTC e local).
 * @returns {Date}
 */
function getCutoffDate() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

/**
 * Obtém o nome da conversa atualmente aberta no painel principal (#main) do WhatsApp Web.
 * @returns {string|null} Nome do grupo/contato ou null se nenhum chat estiver aberto
 */
function getActiveChatName() {
  // O WhatsApp Web sempre renderiza a conversa ativa dentro do container #main
  const main = document.querySelector('#main');
  if (!main) {
    return null;
  }

  const header = main.querySelector('header');
  if (!header) {
    return null;
  }

  // 1. Procura por span com title explícito dentro do header de #main
  const titleSpan = header.querySelector('span[title]');
  if (titleSpan && titleSpan.getAttribute('title')) {
    const title = titleSpan.getAttribute('title').trim();
    if (title) return title;
  }

  // 2. Procura pelo container clicável de informações do contato/grupo
  const infoButton = header.querySelector('div[role="button"]') || header;
  const dirElements = infoButton.querySelectorAll('span[dir="auto"], span[title], div[dir="auto"]');

  for (const el of dirElements) {
    const text = (el.getAttribute('title') || el.textContent || '').trim();
    // Ignora status de presença ("online", "digitando...") ou listas longas com vírgulas de membros
    if (text && !text.includes(',') && !text.toLowerCase().includes('online') && !text.toLowerCase().includes('digitando')) {
      return text;
    }
  }

  // 3. Fallback: qualquer texto significativo no primeiro span do botão do header
  const allSpans = infoButton.querySelectorAll('span');
  for (const span of allSpans) {
    const text = span.textContent.trim();
    if (text && text.length > 1 && !text.includes(',') && !text.toLowerCase().includes('online')) {
      return text;
    }
  }

  return null;
}

/**
 * Verifica se o chat atual corresponde ao grupo alvo "Bicharada".
 * @param {string|null} chatName 
 * @returns {boolean}
 */
function isTargetGroup(chatName) {
  if (!chatName) return false;
  const lower = chatName.toLowerCase();
  return TARGET_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Converte data e hora de atributos como `data-pre-plain-text` ou textos de horário em um Date válido.
 * @param {string} prePlainText 
 * @returns {Date}
 */
function parseTimestamp(prePlainText) {
  const now = new Date();
  if (!prePlainText) return now;

  // Formato completo: [10:24, 04/11/2026] ou [10:24, 04/11/26] ou [10:24, 4/11/2026]
  const fullMatch = prePlainText.match(/\[(\d{1,2}):(\d{2}),?\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\]/);
  if (fullMatch) {
    const [, hour, minute, day, month, yearRaw] = fullMatch;
    let year = parseInt(yearRaw, 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10));
  }

  // Se tiver apenas horário [HH:MM] ou HH:MM, assume que é do dia de hoje
  const timeOnlyMatch = prePlainText.match(/(\d{1,2}):(\d{2})/);
  if (timeOnlyMatch) {
    const [, hour, minute] = timeOnlyMatch;
    const msgDate = new Date();
    msgDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
    return msgDate;
  }

  return now;
}

/**
 * Extrai o nome do autor da mensagem.
 * @param {string} prePlainText 
 * @param {Element} messageNode 
 * @returns {string}
 */
function parseAuthor(prePlainText, messageNode) {
  if (prePlainText) {
    const match = prePlainText.match(/\]\s*([^:]+):/);
    if (match && match[1].trim()) return match[1].trim();
  }

  // Fallback: procura elemento de autor no topo do balão de mensagem (comum em grupos)
  if (messageNode) {
    const authorSpan = messageNode.querySelector('span[dir="auto"][aria-label=""], span[class*="color-"], span._ao3e');
    if (authorSpan && authorSpan.textContent.trim()) {
      return authorSpan.textContent.trim();
    }
  }

  return 'Participante';
}

/**
 * Varre o container #main e extrai as mensagens da conversa ativa.
 * @returns {Array<object>}
 */
function extractMessagesFromDOM() {
  const activeChat = getActiveChatName();
  if (!isTargetGroup(activeChat)) {
    return [];
  }

  const main = document.querySelector('#main');
  if (!main) return [];

  const cutoffDate = getCutoffDate();
  const extracted = [];
  const seenIds = new Set();

  // 1. Tenta por elementos com data-pre-plain-text (mais rico e confiável)
  const copyableNodes = main.querySelectorAll('div.copyable-text[data-pre-plain-text]');

  if (copyableNodes.length > 0) {
    copyableNodes.forEach((node, idx) => {
      const prePlainText = node.getAttribute('data-pre-plain-text') || '';
      const date = parseTimestamp(prePlainText);

      // Filtra mensagens anteriores ao início de hoje
      if (date < cutoffDate) return;

      const textSpan = node.querySelector('.selectable-text') || node;
      const text = textSpan ? textSpan.innerText.trim() : '';
      if (!text) return;

      const author = parseAuthor(prePlainText, node);
      const parentRow = node.closest('[data-id]') || node;
      const id = parentRow.getAttribute('data-id') || `msg-${date.getTime()}-${idx}`;

      if (!seenIds.has(id)) {
        seenIds.add(id);
        extracted.push({
          id,
          author,
          timestamp: date.toISOString(),
          text
        });
      }
    });
  }

  // 2. Fallback caso a versão do WhatsApp Web não utilize data-pre-plain-text
  if (extracted.length === 0) {
    const messageRows = main.querySelectorAll('div[data-id], div.message-in, div.message-out, div[role="row"]');

    messageRows.forEach((row, idx) => {
      const textEl = row.querySelector('.selectable-text') || row.querySelector('span[dir="ltr"]');
      const text = textEl ? textEl.innerText.trim() : '';
      if (!text) return;

      const timeEl = row.querySelector('span[dir="auto"][class*="time"], span[dir="auto"]:last-child');
      const timeText = timeEl ? timeEl.textContent.trim() : '';
      const date = parseTimestamp(timeText);

      const author = parseAuthor('', row);
      const id = row.getAttribute('data-id') || `row-${date.getTime()}-${idx}`;

      if (!seenIds.has(id)) {
        seenIds.add(id);
        extracted.push({
          id,
          author,
          timestamp: date.toISOString(),
          text
        });
      }
    });
  }

  console.log(`[Bicharada Sync] Extraídas ${extracted.length} mensagens para o chat "${activeChat}".`);
  return extracted;
}

/**
 * Envia as mensagens coletadas para o servidor coletor local.
 * @param {Array<object>} messages 
 * @returns {Promise<object>}
 */
async function sendMessagesToCollector(messages) {
  if (!messages || messages.length === 0) {
    throw new Error('Nenhuma mensagem de hoje encontrada para sincronizar.');
  }

  const payload = {
    group: 'Bicharada',
    extractedAt: new Date().toISOString(),
    messages
  };

  const response = await fetch(COLLECTOR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Servidor local retornou status ${response.status}`);
  }

  return await response.json();
}

/**
 * Listener de mensagens vindas do popup da extensão.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_STATUS') {
    const activeChat = getActiveChatName();
    const isTarget = isTargetGroup(activeChat);
    const messages = isTarget ? extractMessagesFromDOM() : [];

    sendResponse({
      activeChat: activeChat || 'Nenhuma conversa aberta no painel principal',
      isTargetGroup: Boolean(isTarget),
      messageCount: messages.length
    });
    return true;
  }

  if (request.action === 'SYNC_NOW') {
    const messages = extractMessagesFromDOM();
    sendMessagesToCollector(messages)
      .then(res => sendResponse({ success: true, details: res }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

console.log('[Bicharada Sync] Content script v1.1 ativo e monitorando.');
