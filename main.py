"""
Ponto de entrada principal da aplicação Bicharada WhatsApp AI Collector.
Permite autenticar a sessão do WhatsApp, coletar mensagens e gerar relatórios de síntese executiva.
"""

import sys
import argparse

# Garante suporte UTF-8 no console do Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from collector.whatsapp_bot import WhatsAppBot
from collector.synthesizer import execute_synthesis_cycle


def run_login(bot: WhatsAppBot):
    """
    Abre o navegador visível para que o usuário realize o escaneamento do QR Code inicial.
    A sessão autenticada será gravada permanentemente na pasta configurada.
    """
    print("[Login] Abrindo o WhatsApp Web no navegador...")
    print("[Login] Por favor, escaneie o QR Code caso o seu WhatsApp ainda não esteja conectado.")
    bot.run_collection(headless=False)
    print("\n[OK] Sessao autenticada e pronta para coletas automaticas!")


def run_collection_and_synthesis(bot: WhatsAppBot, headless: bool = False):
    """
    Executa a coleta das mensagens do grupo Bicharada e emite a síntese executiva datada.
    """
    print(f"[Coleta] Iniciando extracao do grupo '{bot.group_name}'...")
    messages = bot.run_collection(headless=headless)

    print(f"\n[Sintese] Consolidando dados e gerando relatorio executivo...")
    result = execute_synthesis_cycle()

    print(f"[OK] Relatorio gerado com sucesso: {result['filename']}")
    print(f"[OK] Total de mensagens processadas nesta rodada: {result['total_messages']}")
    print(f"[OK] Arquivo salvo em: {result['filepath']}")
    return result


def main():
    """
    Processa os argumentos de linha de comando e direciona a execução do coletor.
    """
    parser = argparse.ArgumentParser(description="Coletor e Sintetizador WhatsApp (Grupo Bicharada)")
    parser.add_argument("--login", action="store_true", help="Abre o navegador para escanear o QR Code inicial.")
    parser.add_argument("--collect", action="store_true", help="Executa a coleta de mensagens e gera a síntese.")
    parser.add_argument("--headless", action="store_true", help="Executa o navegador em modo invisível (headless).")
    parser.add_argument("--group", type=str, default="Bicharada", help="Nome do grupo alvo no WhatsApp.")

    args = parser.parse_args()

    bot = WhatsAppBot(group_name=args.group)

    if args.login:
        run_login(bot)
    elif args.collect:
        run_collection_and_synthesis(bot, headless=args.headless)
    else:
        # Se nenhum argumento for passado, executa login ou coleta interativa
        print("Uso do Coletor Bicharada:")
        print("  python main.py --login       -> Para conectar seu WhatsApp (abre a tela com QR code)")
        print("  python main.py --collect     -> Para coletar as conversas e gerar o resumo executivo")
        print("  python main.py --collect --headless -> Para rodar invisível em segundo plano")


if __name__ == "__main__":
    main()

