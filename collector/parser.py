"""
Módulo de Parsing e Higienização de Mensagens do WhatsApp.
Responsável por extrair autores, datas, deduplicar e filtrar mensagens por janela temporal.
"""

import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import json
import os


def parse_timestamp(text: str, default_date: Optional[datetime] = None) -> datetime:
    """
    Converte uma string de data/hora do WhatsApp em um objeto datetime ciente de fuso.
    Formatos suportados:
    - [10:33, 04/11/2026]
    - [10:33, 04/11/26]
    - 10:33 (assume o dia de default_date ou data atual)
    """
    if not text:
        return default_date or datetime.now(timezone.utc)

    # Padrão completo: [HH:MM, DD/MM/YYYY] ou [HH:MM, DD/MM/YY]
    match_full = re.search(r'\[?(\d{1,2}):(\d{2}),?\s*(\d{1,2})/(\d{1,2})/(\d{2,4})\]?', text)
    if match_full:
        hour, minute, day, month, year = map(int, match_full.groups())
        if year < 100:
            year += 2000
        return datetime(year, month, day, hour, minute, tzinfo=timezone.utc)

    # Padrão apenas horário: HH:MM
    match_time = re.search(r'(\d{1,2}):(\d{2})', text)
    if match_time:
        hour, minute = map(int, match_time.groups())
        base = default_date or datetime.now(timezone.utc)
        return datetime(base.year, base.month, base.day, hour, minute, tzinfo=timezone.utc)

    return default_date or datetime.now(timezone.utc)


def parse_author(pre_plain_text: str) -> str:
    """
    Extrai o autor da mensagem a partir da string prévia gerada pelo WhatsApp.
    Exemplo: "[10:33, 04/11/2026] Júlia Bicharada 2: " -> "Júlia Bicharada 2"
    """
    if not pre_plain_text:
        return "Participante"

    match = re.search(r'\]\s*([^:]+):', pre_plain_text)
    if match and match.group(1).strip():
        return match.group(1).strip()

    return "Participante"


def filter_messages_by_date(
    messages: List[Dict[str, Any]], 
    cutoff_date: Optional[datetime] = None
) -> List[Dict[str, Any]]:
    """
    Filtra mensagens garantindo que apenas aquelas com data igual ou superior à data de corte sejam mantidas.
    """
    if not messages:
        return []

    if cutoff_date is None:
        now = datetime.now(timezone.utc)
        cutoff_date = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)

    filtered = []
    for msg in messages:
        ts_str = msg.get("timestamp")
        if not ts_str:
            continue
        try:
            msg_dt = datetime.fromisoformat(ts_str)
            if msg_dt >= cutoff_date:
                filtered.append(msg)
        except (ValueError, TypeError):
            continue

    return filtered


def deduplicate_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove mensagens duplicadas preservando a ordem cronológica.
    Utiliza o id da mensagem ou a combinação de autor + timestamp + texto como chave única.
    """
    seen = set()
    result = []

    for msg in messages:
        text = (msg.get("text") or "").strip()
        if not text:
            continue

        msg_id = msg.get("id") or f"{msg.get('author')}_{msg.get('timestamp')}_{text}"
        if msg_id not in seen:
            seen.add(msg_id)
            result.append(msg)

    # Ordena pelo timestamp cronológico
    return sorted(result, key=lambda m: m.get("timestamp", ""))


def load_checkpoint(checkpoint_path: str) -> Dict[str, Any]:
    """
    Carrega o arquivo de checkpoint do disco com o último timestamp processado.
    """
    if not os.path.exists(checkpoint_path):
        return {"last_processed_timestamp": None, "last_run_at": None, "processed_count": 0}
    try:
        with open(checkpoint_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"last_processed_timestamp": None, "last_run_at": None, "processed_count": 0}


def save_checkpoint(checkpoint_path: str, last_timestamp: str, count: int = 0) -> None:
    """
    Grava os dados atualizados de checkpoint em formato JSON.
    """
    os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)
    payload = {
        "last_processed_timestamp": last_timestamp,
        "last_run_at": datetime.now(timezone.utc).isoformat(),
        "processed_count": count
    }
    with open(checkpoint_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
