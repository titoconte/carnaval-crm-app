# Backlog de Desenvolvimento: Síntese WhatsApp (Grupo Bicharada)

Este backlog organiza as tarefas e a evolução do projeto em épicos funcionais, alinhados com os agentes criados (`bicharada-ingestor`, `bicharada-synthesizer`, `bicharada-artifact-publisher`).

---

## 📋 Épico 1: Infraestrutura & Servidor Coletor Local
* [x] **TASK-01:** Criar estrutura de diretórios do projeto (`data/bicharada/raw/`, `server/`, `extension/`, `tests/`).
* [x] **TASK-02:** Implementar servidor HTTP local (`server/collector.js`) em Node.js (porta 3141) para receber payloads da extensão via POST `/ingest` e salvar em disco.
* [x] **TASK-03:** Adicionar testes automatizados para o servidor coletor validando recebimento e persistência de dados.

## 🧩 Épico 2: Extensão de Navegador (Chrome Manifest V3)
* [x] **TASK-04:** Configurar `manifest.json` com permissões para `https://web.whatsapp.com/*` e comunicação com `localhost`.
* [x] **TASK-05:** Implementar `content.js` para identificar o chat "Bicharada", extrair mensagens com autor, data/hora e texto, descartando mensagens anteriores a 04/11/2026.
* [x] **TASK-06:** Criar interface popup (`popup.html` / `popup.js`) exibindo status do grupo detectado, contador de mensagens e botão de sincronização imediata.

## 🧹 Épico 3: Motor de Ingestão, Deduplicação e Testes
* [x] **TASK-07:** Implementar biblioteca `src/parser.js` com funções de:
  - Filtragem estrita por data (>= 04/11/2026).
  - Deduplicação de mensagens por ID e hash de conteúdo.
  - Segmentação por janela horária.
* [x] **TASK-08:** Escrever suíte de testes unitários (`tests/parser.test.js`) validando todos os casos de borda.

## 🤖 Épico 4: Síntese de IA, Publicação de Artefatos e Cron
* [x] **TASK-09:** Implementar o orquestrador `src/synthesizer.js` que formata o resumo executivo, tópicos, decisões e To-Dos.
* [x] **TASK-10:** Implementar publicador de artefatos com controle de checkpoint (`data/bicharada/checkpoint.json`).
* [x] **TASK-11:** Configurar rotina cron horária (08h às 22h) para execução automática das rodadas e emissão dos artefatos.
