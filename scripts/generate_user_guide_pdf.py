"""
Gerador do PDF de Resumo de Funcionalidades para os Primeiros Usuários do App Bloco Bicharada.
Cria um documento PDF formatado, sucinto e em linguagem acessível para leigos
na pasta docs/ contendo primeiro a listagem de todas as funcionalidades e depois a descrição de cada uma.
"""

import os
from pathlib import Path
from typing import List, Tuple
from fpdf import FPDF


def _to_latin1(text: str) -> str:
    """Converte o texto para latin-1 substituindo caracteres especiais incompatíveis com fontes padrão do FPDF."""
    replacements = {
        "—": "-",
        "–": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "•": "-",
        "…": "...",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def get_bicharada_features() -> List[Tuple[str, str, str]]:
    """Retorna a lista estruturada de funcionalidades do App do Bloco Bicharada (título, onde encontrar e descrição para leigos)."""
    return [
        (
            "1. Acesso por Perfis (Visitante, Integrante 'Bicho' e Coordenação)",
            "Botão 'Entrar' no topo ou Link de Convite de Primeiro Acesso",
            "O aplicativo adapta a tela conforme quem está usando. Visitantes externos veem 3 abas abertas "
            "(Ficha de Inscrição, Rifas e Repertório). Integrantes do bloco ('Bichos') e Coordenadores entram com "
            "seu login ou link de convite do grupo para liberar todas as 11 abas de organização do Carnaval.",
        ),
        (
            "2. Ficha de Inscrição de Novos Foliões e Aprovação",
            "Aba: Inscrições (Ficha de Inscrição)",
            "Quer desfilar ou tocar no bloco? Basta preencher nome, WhatsApp, escolher a área desejada (Bateria, "
            "Sopros, Vozes, Dança, Pernaltas ou Apoio) e o nível de experiência. A coordenação aprova ou recusa "
            "com um clique, envia mensagem automática no WhatsApp e o aprovado já entra na lista oficial do elenco.",
        ),
        (
            "3. Rifas Online com Reserva de Números e Pix",
            "Aba: Rifas",
            "Cartela digital para apoiar financeiramente o bloco. Você escolhe os números disponíveis na tela, "
            "copia a chave Pix com um toque e confirma sua reserva direto pelo WhatsApp. Também exibe os prêmios, "
            "o progresso da meta de arrecadação e permite à coordenação criar novas rifas e confirmar pagamentos.",
        ),
        (
            "4. Repertório Oficial, Votação e Convenções Musicais",
            "Aba: Repertório (Sub-abas: Músicas e Convenções)",
            "Espaço musical completo do bloco: ouça as versões das músicas no YouTube, vote nas sugestões para o "
            "Carnaval, consulte a ordem do desfile e baixe partituras ou o PDF completo. Na sub-aba 'Convenções', "
            "você assiste aos vídeos e estuda as viradas de bateria, paradas e arranjos de sopros.",
        ),
        (
            "5. Caderno Digital de Letras e Cifras",
            "Botão 'Letras & Cifras' dentro da aba Repertório",
            "Um fanzine digital de bolso para os ensaios: consulte rapidamente a letra completa, a cifra ou a "
            "partitura de cada música pelo celular, copie o texto com um clique ou envie novas cifras para o grupo.",
        ),
        (
            "6. Mural Comunitário de Tarefas ('Quero Ajudar' e 'Equipe Pronta')",
            "Aba: Mural de Tarefas",
            "Funciona como um quadro de cortiça com post-its coloridos mostrando tudo o que precisa ser feito. "
            "Qualquer integrante pode clicar em 'Quero Ajudar' para assumir uma tarefa sem dono (órfã), marcar "
            "itens concluídos na checklist com prazos e clicar em 'Equipe Pronta' quando a tarefa estiver pronta para a rua.",
        ),
        (
            "7. Calendário Oficial de Ensaios e Eventos",
            "Aba: Calendário",
            "Agenda estilo folhinha com todas as datas, horários e locais de ensaios gerais, ensaios de naipe, "
            "oficinas, reuniões e desfiles. Permite filtrar por tipo de evento para você se programar sem perder nada.",
        ),
        (
            "8. Tarefas em Andamento (Painel do Desfile)",
            "Aba: Tarefas em Andamento",
            "Quadro visual dividido em três colunas ('A Fazer', 'No Dia do Desfile' e 'Concluído na Avenida'). "
            "Serve para acompanhar o andamento das grandes frentes práticas que já têm equipe formada rumo ao desfile.",
        ),
        (
            "9. Mídia, Identidade Visual e Planejador de Instagram",
            "Aba: Mídia & Artes",
            "Guarda o Tema e Slogan do Carnaval do ano, a paleta oficial de cores do bloco (para figurinos e artes), "
            "os arquivos de logos e cartazes para baixar e um calendário de postagens do Instagram com gerador de legendas.",
        ),
        (
            "10. Livro Caixa do Bar dos Ensaios",
            "Aba: Bar dos Ensaios",
            "Presta contas de forma simples e transparente das vendas de bebidas e gastos nos ensaios. Mostra na hora "
            "quanto entrou, quanto saiu e o saldo atual em caixa para todo o grupo acompanhar.",
        ),
        (
            "11. Elenco & Naipes (Lista da Família Bicharada)",
            "Aba: Elenco & Naipes",
            "Mostra todos os integrantes ativos organizados em 3 grandes setores: Música (Bateria, Sopros, Vozes), "
            "Performance (Brincantes, Pernaltas, Dança, Alegoria) e Organização/Apoio, facilitando saber quem é de cada ala.",
        ),
        (
            "12. Mural de Enquetes do WhatsApp",
            "Aba: Enquetes WhatsApp",
            "Registra o histórico das votações feitas no grupo de WhatsApp do bloco, guardando a pergunta, a "
            "porcentagem de votos de cada opção e a decisão final aprovada coletivamente.",
        ),
        (
            "13. Central de Documentos Oficiais",
            "Aba: Documentos",
            "Biblioteca onde ficam guardados atas de reunião, editais, ofícios, planilhas e manuais do bloco. "
            "Você pode filtrar por etiquetas (tags) e baixar qualquer arquivo no celular ou computador.",
        ),
    ]


class BicharadaGuidePDF(FPDF):
    """Classe FPDF customizada com cabeçalho e rodapé padronizados para o guia do Bloco Bicharada."""

    def header(self) -> None:
        """Desenha o cabeçalho superior discretamente em todas as páginas."""
        self.set_font("Arial", "I", 9)
        self.set_text_color(110, 110, 110)
        self.cell(0, 8, _to_latin1("App Bloco Bicharada - Guia Rápido para Primeiros Usuários"), 0, 1, "R")
        self.ln(1)

    def footer(self) -> None:
        """Desenha o rodapé com numeração de página."""
        self.set_y(-14)
        self.set_font("Arial", "I", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, _to_latin1(f"Página {self.page_no()}"), 0, 0, "C")


def generate_user_guide_pdf(output_path: str = "docs/resumo_funcionalidades.pdf") -> str:
    """
    Gera o PDF na pasta docs/ contendo primeiro a listagem de todas as funcionalidades
    e depois a descrição sucinta de cada uma para os primeiros usuários do app.
    """
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    features = get_bicharada_features()

    pdf = BicharadaGuidePDF()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()

    # Título Principal
    pdf.set_font("Arial", "B", 17)
    pdf.set_text_color(180, 0, 95)
    pdf.cell(0, 10, _to_latin1("Guia de Funcionalidades - App Bloco Bicharada"), 0, 1, "L")

    # Subtítulo explicativo para leigos
    pdf.set_font("Arial", "", 10.5)
    pdf.set_text_color(55, 55, 55)
    intro_text = (
        "Bem-vindo ao aplicativo oficial do Bloco Bicharada! Este guia foi preparado para os primeiros "
        "usuários (foliões, integrantes e coordenadores) conhecerem de forma rápida e sem termos técnicos "
        "tudo o que o app faz para organizar nossos ensaios, músicas, tarefas, rifas e desfile."
    )
    pdf.multi_cell(0, 5.5, _to_latin1(intro_text))
    pdf.ln(4)

    # Linha divisória
    pdf.set_draw_color(210, 210, 210)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(4)

    # PARTE 1: LISTA DE TODAS AS FUNCIONALIDADES
    pdf.set_font("Arial", "B", 13)
    pdf.set_text_color(30, 27, 46)
    pdf.cell(0, 8, _to_latin1("Parte 1: Lista de Todas as Funcionalidades"), 0, 1, "L")

    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 5, _to_latin1("Confira abaixo todas as ferramentas disponíveis no aplicativo:"))
    pdf.ln(2.5)

    pdf.set_font("Arial", "B", 9.5)
    pdf.set_text_color(35, 35, 35)
    for title, where, _ in features:
        bullet_line = f"  - {title}  [{where}]"
        pdf.multi_cell(0, 5.5, _to_latin1(bullet_line))

    pdf.ln(5)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)

    # PARTE 2: DESCRIÇÃO DE CADA FUNCIONALIDADE
    pdf.set_font("Arial", "B", 13)
    pdf.set_text_color(30, 27, 46)
    pdf.cell(0, 8, _to_latin1("Parte 2: Descrição de Cada Funcionalidade"), 0, 1, "L")

    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(
        0,
        5,
        _to_latin1("Veja de forma simples como funciona e para que serve cada seção do app:"),
    )
    pdf.ln(3.5)

    for title, where, description in features:
        if pdf.get_y() > 248:
            pdf.add_page()

        pdf.set_font("Arial", "B", 10.5)
        pdf.set_text_color(180, 0, 95)
        pdf.multi_cell(0, 5.5, _to_latin1(title))

        pdf.set_font("Arial", "I", 9)
        pdf.set_text_color(100, 100, 100)
        pdf.multi_cell(0, 4.8, _to_latin1(f"Onde acessar: {where}"))

        pdf.set_font("Arial", "", 9.8)
        pdf.set_text_color(45, 45, 45)
        pdf.multi_cell(0, 5.0, _to_latin1(description))
        pdf.ln(2.6)

    pdf.output(str(target))
    return str(target.resolve())


if __name__ == "__main__":
    saved = generate_user_guide_pdf()
    print(f"PDF gerado com sucesso em: {saved}")
