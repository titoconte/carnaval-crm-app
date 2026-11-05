/**
 * Script de controle do popup da extensão Bicharada Sync.
 * Faz a interface entre o usuário e o content script no WhatsApp Web.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const badgeStatus = document.getElementById('badge-status');
  const chatNameEl = document.getElementById('chat-name');
  const msgCountEl = document.getElementById('msg-count');
  const btnSync = document.getElementById('btn-sync');
  const statusMsg = document.getElementById('status-msg');

  /**
   * Obtém a aba ativa no navegador que corresponda ao WhatsApp Web.
   * @returns {Promise<chrome.tabs.Tab|null>}
   */
  async function getWhatsAppTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab && tab.url && tab.url.includes('web.whatsapp.com')) {
      return tab;
    }
    return null;
  }

  /**
   * Atualiza a interface com as informações obtidas do content script.
   */
  async function refreshStatus() {
    const tab = await getWhatsAppTab();

    if (!tab) {
      badgeStatus.className = 'badge badge-warn';
      badgeStatus.textContent = 'WhatsApp Web não está aberto';
      chatNameEl.textContent = 'Nenhuma aba ativa';
      btnSync.disabled = true;
      return;
    }

    try {
      chrome.tabs.sendMessage(tab.id, { action: 'GET_STATUS' }, response => {
        if (chrome.runtime.lastError || !response) {
          badgeStatus.className = 'badge badge-warn';
          badgeStatus.textContent = 'Recarregue a página do WhatsApp';
          chatNameEl.textContent = 'Não sincronizado';
          btnSync.disabled = true;
          return;
        }

        chatNameEl.textContent = response.activeChat;
        msgCountEl.textContent = response.messageCount;

        if (response.isTargetGroup) {
          badgeStatus.className = 'badge badge-ok';
          badgeStatus.textContent = '✓ Grupo Bicharada Identificado';
          btnSync.disabled = response.messageCount === 0;
        } else {
          badgeStatus.className = 'badge badge-warn';
          badgeStatus.textContent = 'Abra o grupo "Bicharada"';
          btnSync.disabled = true;
        }
      });
    } catch (err) {
      badgeStatus.className = 'badge badge-warn';
      badgeStatus.textContent = 'Erro ao conectar à aba';
      console.error(err);
    }
  }

  /**
   * Manipulador do clique no botão de sincronização manual.
   */
  btnSync.addEventListener('click', async () => {
    const tab = await getWhatsAppTab();
    if (!tab) return;

    btnSync.disabled = true;
    statusMsg.style.color = '#555';
    statusMsg.textContent = 'Sincronizando com o servidor local...';

    chrome.tabs.sendMessage(tab.id, { action: 'SYNC_NOW' }, response => {
      if (chrome.runtime.lastError || !response) {
        statusMsg.style.color = '#c00';
        statusMsg.textContent = 'Erro: Verifique se o servidor local (porta 3141) está rodando.';
        btnSync.disabled = false;
        return;
      }

      if (response.success) {
        statusMsg.style.color = '#0b7042';
        statusMsg.textContent = '✓ Mensagens enviadas para o coletor com sucesso!';
      } else {
        statusMsg.style.color = '#c00';
        statusMsg.textContent = `Falha: ${response.error || response.reason || 'Erro desconhecido'}`;
      }
      btnSync.disabled = false;
    });
  });

  // Executa checagem inicial ao abrir o popup
  await refreshStatus();
});

