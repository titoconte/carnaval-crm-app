"""
Módulo de Automação do WhatsApp Web utilizando Playwright.
Gerencia a sessão persistente do navegador, localização do grupo Bicharada e extração de mensagens.
"""

import os
import sys
import time
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

# Garante suporte UTF-8 no console do Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from playwright.sync_api import sync_playwright, BrowserContext, Page
from collector.parser import (
    parse_timestamp,
    parse_author,
    filter_messages_by_date,
    deduplicate_messages
)


class WhatsAppBot:
    """
    Controlador de automação do WhatsApp Web com armazenamento de perfil persistente.
    """

    def __init__(self, user_data_dir: str = "data/whatsapp_session", group_name: str = "Bicharada"):
        """
        Inicializa as configurações de diretório de sessão e grupo alvo.
        """
        self.user_data_dir = os.path.abspath(user_data_dir)
        self.group_name = group_name
        self.raw_dir = os.path.abspath("data/bicharada/raw")
        os.makedirs(self.user_data_dir, exist_ok=True)
        os.makedirs(self.raw_dir, exist_ok=True)

    def launch_browser(self, playwright_instance, headless: bool = False) -> BrowserContext:
        """
        Inicia a instância do navegador com contexto persistente para reutilizar logins anteriores.
        """
        context = playwright_instance.chromium.launch_persistent_context(
            user_data_dir=self.user_data_dir,
            headless=headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox"
            ],
            viewport={"width": 1280, "height": 900}
        )
        return context

    def wait_for_login(self, page: Page, timeout_seconds: int = 300) -> bool:
        """
        Acessa o WhatsApp Web e aguarda o carregamento do painel principal de conversas.
        Se for o primeiro acesso, o usuário deve escanear o QR Code exibido.
        Gera screenshot do QR Code para facilitar o escaneamento na tela.
        """
        print("[WhatsAppBot] Navegando para https://web.whatsapp.com...")
        sys.stdout.flush()
        page.goto("https://web.whatsapp.com", wait_until="domcontentloaded", timeout=60000)

        print("[WhatsAppBot] Verificando sessão...")
        sys.stdout.flush()
        start = time.time()
        last_qr_capture = 0

        while time.time() - start < timeout_seconds:
            # Verifica se o painel lateral de conversas já carregou (sessão autenticada)
            if page.locator("#side").count() > 0:
                print("[WhatsAppBot] [OK] WhatsApp Web autenticado com sucesso!")
                sys.stdout.flush()
                # Remove qrcode.png temporário se existir
                qr_file = os.path.abspath("qrcode.png")
                if os.path.exists(qr_file):
                    try:
                        os.remove(qr_file)
                    except Exception:
                        pass
                return True

            # Captura ou atualiza o QR Code a cada 15 segundos se visível
            now = time.time()
            canvas = page.locator("canvas").first
            if canvas.count() > 0 and (now - last_qr_capture > 15):
                qr_path = os.path.abspath("qrcode.png")
                try:
                    canvas.screenshot(path=qr_path)
                    print(f"\n[QR CODE] Imagem atualizada salva em: {qr_path}")
                    print("Abra o WhatsApp no seu celular > Aparelhos conectados > Conectar aparelho e escaneie o código.")
                    sys.stdout.flush()
                    last_qr_capture = now
                except Exception as e:
                    print(f"[WhatsAppBot] Tentando capturar QR code: {e}")

            time.sleep(2)

        return False

    def select_group(self, page: Page) -> bool:
        """
        Localiza e seleciona o grupo alvo 'Bicharada' na interface do WhatsApp Web.
        """
        print(f"[WhatsAppBot] Procurando conversa com '{self.group_name}' na lista...")
        page.wait_for_timeout(2000)

        # 1. Tenta clique direto na conversa com o título do grupo na lista lateral
        group_locator = page.locator(f'#side span[title*="{self.group_name}" i]').first
        if group_locator.count() > 0:
            print(f"[WhatsAppBot] Chat encontrado na lista! Clicando...")
            group_locator.click()
            page.wait_for_selector("#main", timeout=15000)
            return True

        # 2. Fallback: utiliza a caixa de pesquisa do WhatsApp Web
        print(f"[WhatsAppBot] Buscando '{self.group_name}' no campo de pesquisa...")
        search_box = page.locator('#side div[contenteditable="true"]').first
        if search_box.count() > 0:
            search_box.click()
            search_box.fill(self.group_name)
            page.wait_for_timeout(1500)

            search_result = page.locator(f'#side span[title*="{self.group_name}" i]').first
            if search_result.count() > 0:
                print(f"[WhatsAppBot] Chat encontrado via busca! Abrindo...")
                search_result.click()
                page.wait_for_selector("#main", timeout=15000)
                return True

        return False

    def extract_messages_from_dom(self, page: Page, max_scroll_attempts: int = 40) -> List[Dict[str, Any]]:
        """
        Extrai todas as mensagens do dia de hoje através de rolagem automática para cima (auto-scroll).
        Supera a limitação de virtualização de DOM do WhatsApp Web acumulando mensagens em memória.
        """
        page.wait_for_selector("#main", timeout=15000)
        page.wait_for_timeout(2000)

        # Foca no container de mensagens
        page.hover("#main")

        now = datetime.now(timezone.utc)
        # Data de corte: início do dia de hoje (00:00:00)
        cutoff_date = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
        today_date = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

        all_collected_by_id = {}
        reached_yesterday = False
        consecutive_no_new_count = 0

        print("[WhatsAppBot] Iniciando varredura com rolagem automática para capturar todas as mensagens de hoje...")
        sys.stdout.flush()

        for attempt in range(1, max_scroll_attempts + 1):
            # Extrai mensagens atualmente renderizadas no DOM
            extracted_raw = page.evaluate("""() => {
                const main = document.querySelector('#main');
                if (!main) return [];

                const nodes = main.querySelectorAll('div.copyable-text[data-pre-plain-text]');
                if (nodes.length > 0) {
                    return Array.from(nodes).map((el, i) => {
                        const pre = el.getAttribute('data-pre-plain-text') || '';
                        const textEl = el.querySelector('.selectable-text') || el;
                        const parent = el.closest('[data-id]') || el;
                        return {
                            id: parent.getAttribute('data-id') || `msg-${i}`,
                            prePlainText: pre,
                            text: textEl ? textEl.innerText.trim() : ''
                        };
                    });
                }

                // Fallback para mensagens sem data-pre-plain-text
                const rows = main.querySelectorAll('div.message-in, div.message-out, div[role="row"]');
                return Array.from(rows).map((el, i) => {
                    const textEl = el.querySelector('.selectable-text') || el.querySelector('span[dir="ltr"]');
                    const timeEl = el.querySelector('span[dir="auto"]');
                    return {
                        id: el.getAttribute('data-id') || `row-${i}`,
                        prePlainText: timeEl ? timeEl.innerText.trim() : '',
                        text: textEl ? textEl.innerText.trim() : ''
                    };
                });
            }""")

            new_in_this_pass = 0
            for item in extracted_raw:
                text = (item.get("text") or "").strip()
                if not text:
                    continue

                msg_id = item.get("id")
                pre = item.get("prePlainText") or ""
                dt = parse_timestamp(pre, default_date=today_date)
                author = parse_author(pre)

                # Se encontrou mensagem anterior à data de corte, atingiu ontem
                if dt < cutoff_date:
                    reached_yesterday = True

                if msg_id not in all_collected_by_id:
                    all_collected_by_id[msg_id] = {
                        "id": msg_id,
                        "author": author,
                        "timestamp": dt.isoformat(),
                        "text": text
                    }
                    new_in_this_pass += 1

            if new_in_this_pass == 0:
                consecutive_no_new_count += 1
            else:
                consecutive_no_new_count = 0

            # Se encontrou mensagens de ontem ou se atingiu o topo do histórico (3 tentativas sem novas mensagens)
            if reached_yesterday:
                print(f"[WhatsAppBot] [Passo {attempt}] Atingiu mensagens anteriores a hoje. Encerrando rolagem.")
                break
            if consecutive_no_new_count >= 3:
                print(f"[WhatsAppBot] [Passo {attempt}] Topo da conversa alcançado.")
                break

            # Rola a tela para cima progressivamente
            page.mouse.wheel(0, -3000)
            page.evaluate("""() => {
                const pane = document.querySelector('#main div[tabindex="-1"]') || 
                             document.querySelector('#main .copyable-area > div') ||
                             document.querySelector('#main');
                if (pane) {
                    pane.scrollBy(0, -2500);
                }
            }""")
            page.wait_for_timeout(1000)

        # Filtra estritamente apenas mensagens de hoje em diante
        all_messages = list(all_collected_by_id.values())
        filtered = filter_messages_by_date(all_messages, cutoff_date)
        deduped = deduplicate_messages(filtered)

        print(f"[WhatsAppBot] [OK] Total consolidado: {len(deduped)} mensagens únicas de hoje!")
        sys.stdout.flush()
        return deduped

    def save_raw_batch(self, messages: List[Dict[str, Any]]) -> str:
        """
        Salva o lote de mensagens extraídas em um arquivo JSON na pasta data/bicharada/raw.
        """
        now = datetime.now(timezone.utc)
        timestamp_str = now.strftime("%Y%m%d_%H%M%S")
        filename = f"bicharada_{timestamp_str}.json"
        filepath = os.path.join(self.raw_dir, filename)

        payload = {
            "group": self.group_name,
            "extractedAt": now.isoformat(),
            "count": len(messages),
            "messages": messages
        }

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

        return filepath

    def run_collection(self, headless: bool = False) -> List[Dict[str, Any]]:
        """
        Fluxo completo de execução: inicia o browser, aguarda login, abre o grupo e coleta mensagens.
        """
        with sync_playwright() as p:
            context = self.launch_browser(p, headless=headless)
            page = context.pages[0] if context.pages else context.new_page()

            try:
                print(f"[WhatsAppBot] Iniciando processo no navegador...")
                is_ready = self.wait_for_login(page)
                if not is_ready:
                    raise TimeoutError("Tempo limite excedido aguardando login no WhatsApp Web.")

                print(f"[WhatsAppBot] Selecionando o grupo '{self.group_name}'...")
                selected = self.select_group(page)
                if not selected:
                    raise LookupError(f"Não foi possível encontrar ou abrir o grupo '{self.group_name}'.")

                print(f"[WhatsAppBot] Extraindo mensagens da conversa...")
                messages = self.extract_messages_from_dom(page)
                print(f"[WhatsAppBot] [OK] {len(messages)} mensagens extraidas de hoje com sucesso!")

                if messages:
                    saved_path = self.save_raw_batch(messages)
                    print(f"[WhatsAppBot] Lote salvo em: {saved_path}")

                return messages
            finally:
                context.close()
