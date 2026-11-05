# Documento de Arquitetura e Design: Síntese Inteligente WhatsApp (Grupo Bicharada)

## 1. Resumo do Entendimento
* **Objetivo:** Coleta automática de conversas do grupo específico "Bicharada" via WhatsApp Web e geração de resumos executivos periódicos utilizando IA.
* **Escopo Temporal:** Mensagens enviadas a partir de hoje (04/11/2026).
* **Frequência de Processamento:** Rodadas a cada 1 hora entre as 08:00 e as 22:00.
* **Formato do Output:** Artefatos no Antigravity contendo resumo executivo estruturado (tópicos principais, decisões tomadas, pendências/To-Dos), devidamente datados para cada rodada.
* **Consumo de IA:** O próprio agente Antigravity realiza as sínteses através do modelo integrado, sem necessidade de chaves de API externas adicionais.

---

## 2. Premissas e Regras de Negócio
1. **Deduplicação e Checkpoints:** Cada rodada registrará o último timestamp ou ID processado em `data/bicharada/checkpoint.json`. Apenas mensagens novas enviadas na última hora são sintetizadas.
2. **Rodadas Inativas:** Se não houver mensagens no período avaliado, o artefato registrará ausência de novas interações sem invocar síntese desnecessária.
3. **Privacidade e Isolamento:** A extensão coletará dados restrita e unicamente do grupo "Bicharada". Todo o armazenamento é local na máquina do usuário.

---

## 3. Registro de Decisões Técnicas (Decision Log)

| Decisão | Alternativas Consideradas | Motivo da Escolha |
| :--- | :--- | :--- |
| **Origem dos Dados: WhatsApp Web via Extensão Chrome** | WhatsApp Desktop Oficial (WinUI/MSIX), Baileys / Evolution API, Meta Cloud API | O app desktop tem banco criptografado e exigiria automação visual (OCR/pywinauto) que trava o mouse do usuário. A extensão no Chrome roda silenciosa e extrai o DOM de forma estruturada com zero risco de banimento. |
| **Ponte de Dados: Extensão + Servidor Local Mínimo** | Download de arquivo pelo navegador, File System Access API | Um micro-servidor local (~30 linhas de código em Node/Python) recebe os dados via `POST` diretamente da extensão e salva em disco sem intervenção manual de confirmação de download do Chrome. |
| **Orquestração da IA: Cron Nativo do Antigravity** | Agendador externo (Windows Task Scheduler / cron do OS) | O Antigravity já possui ferramentas nativas de agendamento (`schedule`), geração direta de artefatos markdown e raciocínio de alto nível. |

---

## 4. Arquitetura da Solução

```
┌──────────────────────────────────────────────┐
│ Chrome: WhatsApp Web (Aba aberta)           │
│  └── Extensão Manifest V3 (Content Script)   │
│      - Monitora grupo "Bicharada"            │
│      - Filtra mensagens >= 04/11/2026        │
│      - Envia lote para localhost:3141/ingest │
└──────────────────────┬───────────────────────┘
                       │ HTTP POST (JSON)
                       ▼
┌──────────────────────────────────────────────┐
│ Servidor Local Coletor (Node.js/Express)     │
│  └── Salva em: data/bicharada/raw/           │
└──────────────────────┬───────────────────────┘
                       │ Arquivos .json
                       ▼
┌──────────────────────────────────────────────┐
│ Pipeline Antigravity (Cron: 0 8-22 * * *)    │
│  ├── Ingestor: Sanitiza e deduplica          │
│  ├── Analista: Identifica tópicos & To-Dos   │
│  └── Redator: Emite Artefato datado no Brain │
└──────────────────────────────────────────────┘
```

---

## 5. Estrutura de Pastas Proposta
```
app/
├── docs/
│   └── design-sintese-bicharada.md
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   └── popup.js
├── server/
│   ├── collector.js
│   └── package.json
├── data/
│   └── bicharada/
│       ├── raw/
│       └── checkpoint.json
├── scripts/
│   └── run_synthesis.js
└── tests/
    └── parser.test.js
```

