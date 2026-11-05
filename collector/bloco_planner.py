"""
Módulo de Planejamento e Estruturação de Dados do Bloco Bicharada.
Realiza a leitura, higienização e consolidação das informações de participantes,
calendário de ensaios e plano de atividades a partir da planilha de gestão oficial.
"""

import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
import openpyxl


def clean_text(value: Any) -> str:
    """
    Higieniza strings removendo marcadores de lista, espaços excedentes e caracteres invisíveis.
    
    :param value: Valor bruto a ser limpo.
    :return: String limpa e formatada.
    """
    if value is None:
        return ""
    text = str(value)
    # Remove caracteres de espaço de largura zero e marcadores comuns
    text = text.replace("\u2060", "").replace("\ufeff", "")
    text = re.sub(r"^[-\u2022\s]+", "", text)
    return text.strip()


def load_bloco_roster(excel_path: str) -> Dict[str, Any]:
    """
    Carrega o quadro completo de participantes do bloco agrupados por naipe/ala.
    Lê a aba 'BICHOS ' da planilha de planejamento.
    
    :param excel_path: Caminho para o arquivo .xlsx do planejamento.
    :return: Dicionário estruturado com as seções da Bateria, Sopros, Brincantes, Vocais, etc.
    """
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Arquivo não encontrado: {excel_path}")

    wb = openpyxl.load_workbook(excel_path, data_only=True)
    if "BICHOS " not in wb.sheetnames:
        raise ValueError("Aba 'BICHOS ' não encontrada na planilha fornecida.")

    ws = wb["BICHOS "]

    roster: Dict[str, Any] = {
        "bateria": {},
        "sopros": {},
        "brincantes": [],
        "vocais": [],
        "outros_instrumentos": [],
        "dancantes": [],
        "organizacao": [],
        "apoio": []
    }

    # 1. Bateria (Linhas 3 a 15)
    # Cabeçalho na linha 3
    bateria_cols = {}
    for col in range(1, 15):
        val = clean_text(ws.cell(3, col).value)
        if val:
            bateria_cols[col] = val.lower()
            roster["bateria"][val.lower()] = []

    for row in range(4, 16):
        for col, inst_name in bateria_cols.items():
            member = clean_text(ws.cell(row, col).value)
            if member and len(member) > 1:
                roster["bateria"][inst_name].append(member)

    # 2. Sopros (Linhas 18 a 22)
    sopro_cols = {}
    for col in range(1, 10):
        val = clean_text(ws.cell(18, col).value)
        if val:
            sopro_cols[col] = val.lower()
            roster["sopros"][val.lower()] = []

    for row in range(19, 23):
        for col, inst_name in sopro_cols.items():
            member = clean_text(ws.cell(row, col).value)
            if member and len(member) > 1:
                roster["sopros"][inst_name].append(member)

    # 3. Brincantes, Vocais, Outros e Dançantes (Linhas 23 a 35)
    for row in range(24, 36):
        # Col 1: Brincantes
        brincante = clean_text(ws.cell(row, 1).value)
        if brincante and len(brincante) > 1:
            roster["brincantes"].append(brincante)

        # Col 3: Vocais
        vocal = clean_text(ws.cell(row, 3).value)
        if vocal and len(vocal) > 1:
            roster["vocais"].append(vocal)

        # Col 5: Outros Instrumentos
        outro = clean_text(ws.cell(row, 5).value)
        if outro and len(outro) > 1:
            roster["outros_instrumentos"].append(outro)

        # Col 7: Dançantes
        dancante = clean_text(ws.cell(row, 7).value)
        if dancante and len(dancante) > 1:
            roster["dancantes"].append(dancante)

    # 4. Organização e Apoio (Linhas 37 a 48)
    for row in range(37, 49):
        org = clean_text(ws.cell(row, 1).value)
        if org and len(org) > 1:
            roster["organizacao"].append(org)

        apoio = clean_text(ws.cell(row, 5).value)
        if apoio and len(apoio) > 1:
            roster["apoio"].append(apoio)

    return roster


def load_bloco_schedule(excel_path: str) -> List[Dict[str, Any]]:
    """
    Carrega o cronograma oficial de ensaios, reuniões presenciais e cortejo.
    Lê a aba 'Agenda' da planilha de planejamento.
    
    :param excel_path: Caminho para o arquivo .xlsx do planejamento.
    :return: Lista de eventos com data ISO, dia da semana, atividade e observações.
    """
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Arquivo não encontrado: {excel_path}")

    wb = openpyxl.load_workbook(excel_path, data_only=True)
    if "Agenda" not in wb.sheetnames:
        raise ValueError("Aba 'Agenda' não encontrada na planilha fornecida.")

    ws = wb["Agenda"]
    events: List[Dict[str, Any]] = []

    for row in range(2, ws.max_row + 1):
        dt_val = ws.cell(row, 1).value
        weekday = clean_text(ws.cell(row, 2).value)
        activity = clean_text(ws.cell(row, 3).value)
        note = clean_text(ws.cell(row, 5).value)

        if not dt_val and not activity:
            continue

        iso_date = ""
        if isinstance(dt_val, datetime):
            iso_date = dt_val.strftime("%Y-%m-%d")
        elif dt_val:
            iso_date = str(dt_val).strip()

        events.append({
            "date": iso_date,
            "weekday": weekday,
            "activity": activity,
            "notes": note
        })

    return events


def load_bloco_activities(excel_path: str) -> Dict[str, Any]:
    """
    Carrega a lista de tarefas, comissões e registros operacionais do bloco.
    Lê a aba 'ATV.' da planilha de planejamento.
    
    :param excel_path: Caminho para o arquivo .xlsx do planejamento.
    :return: Dicionário contendo tarefas operacionais e notas de produção.
    """
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Arquivo não encontrado: {excel_path}")

    wb = openpyxl.load_workbook(excel_path, data_only=True)
    if "ATV." not in wb.sheetnames:
        raise ValueError("Aba 'ATV.' não encontrada na planilha fornecida.")

    ws = wb["ATV."]
    tasks: List[Dict[str, Any]] = []
    log_notes: List[str] = []

    for row in range(3, ws.max_row + 1):
        missao = clean_text(ws.cell(row, 1).value)
        funcao = clean_text(ws.cell(row, 2).value)
        quem = clean_text(ws.cell(row, 3).value)
        status = clean_text(ws.cell(row, 4).value)

        # Se for uma linha descritiva/log de produção de Nathy/equipe
        if missao and ("nathy:" in missao.lower() or "fer do surdo" in missao.lower()):
            log_notes.append(missao)
            continue

        if missao or funcao or quem:
            tasks.append({
                "missao": missao,
                "funcao": funcao,
                "responsavel": quem,
                "status": status
            })

    return {
        "tasks": tasks,
        "log_notes": log_notes
    }


def calculate_bloco_metrics(excel_path: str) -> Dict[str, Any]:
    """
    Gera indicadores quantitativos consolidados sobre a infraestrutura e recursos do bloco.
    
    :param excel_path: Caminho para o arquivo .xlsx do planejamento.
    :return: Indicadores métricos como total de integrantes, distribuição por naipes e ensaios.
    """
    roster = load_bloco_roster(excel_path)
    schedule = load_bloco_schedule(excel_path)
    activities = load_bloco_activities(excel_path)

    # Contagem de músicos de bateria
    bateria_count = sum(len(members) for members in roster["bateria"].values())
    sopros_count = sum(len(members) for members in roster["sopros"].values())
    brincantes_count = len(roster["brincantes"])
    vocais_count = len(roster["vocais"])
    dancantes_count = len(roster["dancantes"])
    organizacao_count = len(roster["organizacao"])
    apoio_count = len(roster["apoio"])

    total_integrantes = (
        bateria_count + sopros_count + brincantes_count + 
        vocais_count + dancantes_count + len(roster["outros_instrumentos"])
    )

    rehearsals = [e for e in schedule if "ensaio" in e["activity"].lower()]
    meetings = [e for e in schedule if "reuni" in e["activity"].lower()]

    return {
        "total_musicos_e_artistas": total_integrantes,
        "detalhe_integrantes": {
            "bateria": bateria_count,
            "sopros": sopros_count,
            "vocais": vocais_count,
            "brincantes": brincantes_count,
            "dancantes": dancantes_count,
            "organizacao": organizacao_count,
            "apoio": apoio_count
        },
        "total_ensaios_agendados": len(rehearsals),
        "total_reunioes_agendadas": len(meetings),
        "total_tarefas_mapeadas": len(activities["tasks"]),
        "total_notas_operacionais": len(activities["log_notes"])
    }

