"""
Testes unitários para o módulo collector/bloco_planner.py.
Valida o carregamento do quadro de membros, agenda de ensaios, tarefas operacionais e cálculo de métricas.
"""

import os
import pytest
import openpyxl
from collector.bloco_planner import (
    clean_text,
    load_bloco_roster,
    load_bloco_schedule,
    load_bloco_activities,
    calculate_bloco_metrics
)

# Caminho para o arquivo oficial de dados
EXCEL_PATH = os.path.join("docs", "DATES BICHARADA. 2027.xlsx")


def test_clean_text_formatting():
    """
    Testa a função clean_text garantindo que marcadores, espaços e caracteres invisíveis sejam limpos.
    """
    assert clean_text("- André Luis ") == "André Luis"
    assert clean_text("\u2060-Guigo ") == "Guigo"
    assert clean_text("  •  Rafa  ") == "Rafa"
    assert clean_text(None) == ""
    assert clean_text(123) == "123"


def test_load_bloco_roster_valid():
    """
    Testa o carregamento estruturado da aba 'BICHOS ' com participantes e naipes.
    """
    roster = load_bloco_roster(EXCEL_PATH)
    
    assert "bateria" in roster
    assert "sopros" in roster
    assert "brincantes" in roster
    assert "vocais" in roster
    assert "organizacao" in roster
    assert "apoio" in roster

    # Verifica naipes da bateria
    assert "caixas" in roster["bateria"]
    assert "repiniques" in roster["bateria"]
    assert "surdos" in roster["bateria"]
    assert len(roster["bateria"]["caixas"]) > 0

    # Verifica sopros
    assert "trompete" in roster["sopros"]
    assert len(roster["sopros"]["trompete"]) > 0

    # Verifica se pessoas chave constam nas listas
    apoio_str = " ".join(roster["apoio"])
    assert "Tito" in apoio_str


def test_load_bloco_schedule_valid():
    """
    Testa o carregamento da agenda de ensaios e reuniões na aba 'Agenda'.
    """
    schedule = load_bloco_schedule(EXCEL_PATH)
    assert isinstance(schedule, list)
    assert len(schedule) > 0

    first_event = schedule[0]
    assert "date" in first_event
    assert "weekday" in first_event
    assert "activity" in first_event

    activities = [e["activity"].lower() for e in schedule]
    assert any("ensaio" in a for a in activities)
    assert any("reuni" in a for a in activities)


def test_load_bloco_activities_valid():
    """
    Testa o carregamento das atividades e registros de notas operacionais da aba 'ATV.'.
    """
    activities_data = load_bloco_activities(EXCEL_PATH)
    assert "tasks" in activities_data
    assert "log_notes" in activities_data

    tasks = activities_data["tasks"]
    assert len(tasks) > 0

    # Verifica se há missões conhecidas
    missoes = [t["missao"].lower() for t in tasks]
    assert any("rifa" in m or "tessouraria" in m or "apoi" in m for m in missoes)

    # Verifica notas operacionais de Nathy/equipe
    log_notes = activities_data["log_notes"]
    assert len(log_notes) > 0
    assert any("kombi" in n.lower() or "graffi" in n.lower() for n in log_notes)


def test_calculate_bloco_metrics_valid():
    """
    Testa o cálculo consolidado de métricas do bloco.
    """
    metrics = calculate_bloco_metrics(EXCEL_PATH)
    assert metrics["total_musicos_e_artistas"] > 0
    assert metrics["total_ensaios_agendados"] >= 10
    assert metrics["total_tarefas_mapeadas"] > 0
    assert "detalhe_integrantes" in metrics


def test_missing_file_raises_error():
    """
    Garante que arquivo inexistente levanta FileNotFoundError.
    """
    with pytest.raises(FileNotFoundError):
        load_bloco_roster("docs/arquivo_inexistente.xlsx")


def test_missing_sheet_raises_error(tmp_path):
    """
    Garante que planilha sem as abas obrigatórias levanta ValueError.
    """
    dummy_file = tmp_path / "dummy.xlsx"
    wb = openpyxl.Workbook()
    wb.create_sheet(title="OutraAba")
    wb.save(dummy_file)

    with pytest.raises(ValueError):
        load_bloco_roster(str(dummy_file))

