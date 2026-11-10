"""
Testes unitários para o gerador de PDF de resumo de funcionalidades do App Bloco Bicharada.
"""

import os
from pathlib import Path
from scripts.generate_user_guide_pdf import get_bicharada_features, generate_user_guide_pdf


def test_get_bicharada_features_returns_complete_list():
    """Verifica se a lista de funcionalidades do Bloco Bicharada retorna todas as 13 seções com título, acesso e descrição."""
    features = get_bicharada_features()
    assert len(features) == 13
    for title, where, desc in features:
        assert title.strip() != ""
        assert where.strip() != ""
        assert desc.strip() != ""


def test_generate_user_guide_pdf_creates_valid_pdf_file(tmp_path: Path):
    """Verifica se o arquivo PDF é gerado no caminho indicado com cabeçalho %PDF válido."""
    output_file = tmp_path / "resumo_funcionalidades.pdf"
    saved_path = generate_user_guide_pdf(str(output_file))

    assert os.path.isfile(saved_path)
    assert output_file.stat().st_size > 1500

    with open(saved_path, "rb") as f:
        header = f.read(4)
    assert header == b"%PDF"
