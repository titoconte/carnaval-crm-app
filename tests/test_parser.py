"""
Testes unitários para o módulo collector/parser.py
"""

from datetime import datetime, timezone
import os
import json
import tempfile
import pytest
from collector.parser import (
    parse_timestamp,
    parse_author,
    filter_messages_by_date,
    deduplicate_messages,
    load_checkpoint,
    save_checkpoint
)


def test_parse_timestamp_full_format():
    """Valida conversão de formato completo com dia, mês, ano e hora."""
    raw = "[10:33, 04/11/2026] Júlia: "
    dt = parse_timestamp(raw)
    assert dt.year == 2026
    assert dt.month == 11
    assert dt.day == 4
    assert dt.hour == 10
    assert dt.minute == 33


def test_parse_timestamp_time_only():
    """Valida conversão quando apenas o horário HH:MM é fornecido."""
    base = datetime(2026, 11, 4, tzinfo=timezone.utc)
    raw = "14:45"
    dt = parse_timestamp(raw, default_date=base)
    assert dt.year == 2026
    assert dt.month == 11
    assert dt.day == 4
    assert dt.hour == 14
    assert dt.minute == 45


def test_parse_author():
    """Valida extração correta do nome do autor."""
    assert parse_author("[10:33, 04/11/2026] Júlia Bicharada 2: ") == "Júlia Bicharada 2"
    assert parse_author("[10:18, 04/11/26] Guigo Arruda: ") == "Guigo Arruda"
    assert parse_author("") == "Participante"


def test_filter_messages_by_date():
    """Valida filtragem descartando mensagens anteriores à data de corte."""
    cutoff = datetime(2026, 11, 4, 0, 0, 0, tzinfo=timezone.utc)
    messages = [
        {"id": "1", "timestamp": "2026-11-03T23:59:59+00:00", "text": "Ontem"},
        {"id": "2", "timestamp": "2026-11-04T08:00:00+00:00", "text": "Hoje cedo"},
        {"id": "3", "timestamp": "2026-11-04T10:30:00+00:00", "text": "Hoje agora"}
    ]
    filtered = filter_messages_by_date(messages, cutoff)
    assert len(filtered) == 2
    assert filtered[0]["id"] == "2"
    assert filtered[1]["id"] == "3"


def test_deduplicate_messages():
    """Valida remoção de mensagens com id ou conteúdo idêntico."""
    messages = [
        {"id": "msg-b", "timestamp": "2026-11-04T10:20:00+00:00", "text": "Segunda"},
        {"id": "msg-a", "timestamp": "2026-11-04T10:10:00+00:00", "text": "Primeira"},
        {"id": "msg-a", "timestamp": "2026-11-04T10:10:00+00:00", "text": "Primeira repetida"}
    ]
    deduped = deduplicate_messages(messages)
    assert len(deduped) == 2
    assert deduped[0]["id"] == "msg-a"
    assert deduped[1]["id"] == "msg-b"


def test_checkpoint_persistence():
    """Valida gravação e leitura de checkpoints no disco."""
    with tempfile.TemporaryDirectory() as tmpdir:
        cp_file = os.path.join(tmpdir, "checkpoint.json")
        initial = load_checkpoint(cp_file)
        assert initial["last_processed_timestamp"] is None

        save_checkpoint(cp_file, "2026-11-04T11:00:00+00:00", 10)
        reloaded = load_checkpoint(cp_file)
        assert reloaded["last_processed_timestamp"] == "2026-11-04T11:00:00+00:00"
        assert reloaded["processed_count"] == 10
