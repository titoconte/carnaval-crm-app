import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAW_DIR = path.resolve(__dirname, '../data/bicharada/raw');

/**
 * Garante que o diretório de destino para armazenamento das mensagens brutas exista.
 * @param {string} dirPath - Caminho absoluto do diretório
 */
export function ensureDataDirectory(dirPath = RAW_DIR) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Configura os cabeçalhos de CORS para permitir requisições da extensão do WhatsApp Web.
 * @param {http.ServerResponse} res - Objeto de resposta HTTP
 */
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Processa a carga útil (payload) recebida da extensão e persiste no disco em formato JSON.
 * @param {object} payload - Objeto com metadados e array de mensagens
 * @param {string} destinationDir - Diretório onde o arquivo será salvo
 * @returns {object} Metadados do arquivo salvo (nome, quantidade de mensagens)
 */
export function saveRawMessages(payload, destinationDir = RAW_DIR) {
  ensureDataDirectory(destinationDir);

  const safeGroup = (payload.group || 'desconhecido').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-');
  const filename = `${safeGroup}_${dateStr}.json`;
  const filePath = path.join(destinationDir, filename);

  const content = JSON.stringify(payload, null, 2);
  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    filename,
    filePath,
    count: Array.isArray(payload.messages) ? payload.messages.length : 0
  };
}

/**
 * Cria e configura a instância do servidor HTTP coletor de mensagens.
 * @param {number} port - Porta em que o servidor escutará requisições
 * @param {string} storageDir - Diretório para salvar arquivos
 * @returns {http.Server} Instância do servidor configurada
 */
export function createCollectorServer(port = 3141, storageDir = RAW_DIR) {
  ensureDataDirectory(storageDir);

  const server = http.createServer((req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'collector-bicharada', target: 'Bicharada' }));
      return;
    }

    if (req.method === 'POST' && req.url === '/ingest') {
      let body = '';

      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');

          if (!payload.group || !Array.isArray(payload.messages)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Payload inválido. "group" e "messages" são obrigatórios.' }));
            return;
          }

          const result = saveRawMessages(payload, storageDir);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: `Recebidas ${result.count} mensagens com sucesso.`,
            filename: result.filename
          }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Erro ao processar JSON da requisição.', details: err.message }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rota não encontrada.' }));
  });

  return server;
}

// Se executado diretamente via terminal (`node server/collector.js`)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3141;
  const server = createCollectorServer(PORT);
  server.listen(PORT, () => {
    console.log(`[Collector Bicharada] Servidor ativo e escutando na porta http://localhost:${PORT}`);
  });
}

