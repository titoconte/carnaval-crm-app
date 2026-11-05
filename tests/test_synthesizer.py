"""
Testes unitários para o módulo collector/synthesizer.py
"""

import os
import json
import tempfile
from datetime import datetime, timezone
import pytest
from collector.synthesizer import (
    load_all_raw_messages,
    prepare_batch,
    generate_markdown_report,
    execute_synthesis_cycle
)


def test_generate_markdown_report_empty():
    """Valida formato de relatório quando nenhuma mensagem é passada."""
    dt = datetime(2026, 11, 4, 11, 0, tzinfo=timezone.utc)
    report = generate_markdown_report([], run_date=dt)
    assert "Período sem novas mensagens" in report
    assert "Mensagens Analisadas:** 0" in report


def test_generate_markdown_report_with_messages():
    """Valida formatação do relatório com mensagens e autores."""
    dt = datetime(2026, 11, 4, 11, 0, tzinfo=timezone.utc)
    messages = [
        {"id": "1", "author": "Júlia", "timestamp": "2026-11-04T10:33:00+00:00", "text": "Lugares pra sexta"},
        {"id": "2", "author": "Guigo", "timestamp": "2026-11-04T10:18:00+00:00", "text": "Sábado na UFSC"}
    ]
    report = generate_markdown_report(messages, run_date=dt)
    assert "Volume Analisado:** 2 nova(s) mensagem(ns)" in report
    assert "Júlia:** 1 mensagem(ns)" in report
    assert "Lugares pra sexta" in report


def test_execute_synthesis_cycle():
    """Valida ciclo completo salvando relatório e atualizando checkpoint."""
    with tempfile.TemporaryDirectory() as tmpdir:
        raw_dir = os.path.join(tmpdir, "raw")
        reports_dir = os.path.join(tmpdir, "reports")
        cp_path = os.path.join(tmpdir, "checkpoint.json")
        os.makedirs(raw_dir, exist_ok=True)

        batch_file = os.path.join(raw_dir, "batch1.json")
        with open(batch_file, "w", encoding="utf-8") as f:
            json.dump({
                "group": "Bicharada",
                "messages": [
                    {"id": "a", "author": "Boi", "timestamp": "2026-11-04T10:28:00+00:00", "text": "Nova enquete"}
                ]
            }, f)

        res = execute_synthesis_cycle(
            raw_dir=raw_dir,
            checkpoint_path=cp_path,
            reports_dir=reports_dir,
            run_date=datetime(2026, 11, 4, 11, 0, tzinfo=timezone.utc)
        )

        assert res["success"] is True
        assert res["total_messages"] == 1
        assert os.path.exists(res["filepath"])

        with open(cp_path, "r", encoding="utf-8") as f:
            cp_data = json.load(f)
            assert cp_data["last_processed_timestamp"] == "2026-11-04T10:28:00+00:00"
