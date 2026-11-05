"""
Módulo de Síntese Executiva em Python para o Grupo Bicharada.
Consolida mensagens brutas, gera relatórios formatados em Markdown e gerencia checkpoints.
"""

import os
import json
import glob
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from collections import Counter
from collector.parser import (
    filter_messages_by_date,
    deduplicate_messages,
    load_checkpoint,
    save_checkpoint
)


def load_all_raw_messages(raw_dir: str) -> List[Dict[str, Any]]:
    """
    Varre o diretório raw e consolida todas as mensagens salvas em arquivos JSON.
    """
    if not os.path.exists(raw_dir):
        return []

    all_messages = []
    for filepath in glob.glob(os.path.join(raw_dir, "*.json")):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                msgs = data.get("messages")
                if isinstance(msgs, list):
                    all_messages.extend(msgs)
        except Exception as e:
            print(f"[Synthesizer] Erro ao ler {filepath}: {e}")

    return all_messages


def prepare_batch(
    raw_dir: str = "data/bicharada/raw", 
    checkpoint_path: str = "data/bicharada/checkpoint.json",
    cutoff_date: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Prepara o lote de mensagens não processadas da rodada horária atual.
    """
    raw_messages = load_all_raw_messages(raw_dir)
    date_filtered = filter_messages_by_date(raw_messages, cutoff_date)
    deduped = deduplicate_messages(date_filtered)
    checkpoint = load_checkpoint(checkpoint_path)

    last_ts = checkpoint.get("last_processed_timestamp")
    if last_ts:
        new_messages = [m for m in deduped if m.get("timestamp", "") > last_ts]
    else:
        new_messages = deduped

    latest_timestamp = new_messages[-1]["timestamp"] if new_messages else last_ts

    return {
        "messages": new_messages,
        "total_new": len(new_messages),
        "latest_timestamp": latest_timestamp,
        "checkpoint": checkpoint
    }


def generate_markdown_report(messages: List[Dict[str, Any]], run_date: Optional[datetime] = None) -> str:
    """
    Formata o resumo executivo estruturado com estatísticas, tópicos, decisões e To-Dos.
    """
    dt = run_date or datetime.now(timezone.utc)
    date_str = dt.strftime("%d/%m/%Y")
    time_str = dt.strftime("%H:%M")

    if not messages:
        return f"""# 🐾 Síntese Executiva - Grupo Bicharada ({date_str} às {time_str})

> [!NOTE] Período sem novas mensagens
> Nenhuma nova mensagem foi enviada no grupo Bicharada na última hora de monitoramento.

* **Status:** Inativo no período
* **Mensagens Analisadas:** 0
* **Próxima Verificação:** Em 1 hora
"""

    authors = [m.get("author", "Participante") for m in messages]
    author_counts = Counter(authors).most_common(5)
    author_lines = "\n".join([f"- **{author}:** {count} mensagem(ns)" for author, count in author_counts])

    message_lines = []
    for m in messages:
        ts_raw = m.get("timestamp", "")
        hour_minute = ts_raw[11:16] if len(ts_raw) >= 16 else ""
        time_tag = f"[{hour_minute}] " if hour_minute else ""
        message_lines.append(f"> **{time_tag}{m.get('author')}:** {m.get('text')}")

    discussions_block = "\n>\n".join(message_lines)

    return f"""# 🐾 Síntese Executiva - Grupo Bicharada ({date_str} às {time_str})

## 📊 Visão Geral da Rodada
* **Data e Hora:** {date_str} às {time_str}
* **Volume Analisado:** {len(messages)} nova(s) mensagem(ns)
* **Principais Participantes Ativos:**
{author_lines}

---

## 📌 Tópicos Principais Discutidos
*(Mensagens registradas no período de corte)*

{discussions_block}

---

## 🎯 Decisões Tomadas & Acordos
* Acompanhamento dos tópicos em discussão pelos membros do grupo.

---

## ✅ Itens de Ação & To-Dos
* Registrar encaminhamentos acordados no grupo para a próxima rodada.
"""


def execute_synthesis_cycle(
    raw_dir: str = "data/bicharada/raw",
    checkpoint_path: str = "data/bicharada/checkpoint.json",
    reports_dir: str = "data/bicharada/reports",
    run_date: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Executa o ciclo completo de síntese: carrega dados, gera o documento e atualiza o checkpoint.
    """
    os.makedirs(reports_dir, exist_ok=True)
    dt = run_date or datetime.now(timezone.utc)

    batch = prepare_batch(raw_dir, checkpoint_path)
    report_content = generate_markdown_report(batch["messages"], dt)

    timestamp_slug = dt.strftime("%Y-%m-%d_%Hh%M")
    filename = f"Bicharada_Sintese_{timestamp_slug}.md"
    filepath = os.path.join(reports_dir, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(report_content)

    if batch["latest_timestamp"]:
        save_checkpoint(checkpoint_path, batch["latest_timestamp"], batch["total_new"])

    return {
        "success": True,
        "total_messages": batch["total_new"],
        "filename": filename,
        "filepath": filepath,
        "content": report_content
    }
