import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getVisibleNavigationTabs } from '../src/components/Navigation';

describe('Navegação e Fluxo de Letras & Cifras', () => {
  it('não deve exibir a aba Letras & Cifras no menu principal de navegação', () => {
    const tabs = getVisibleNavigationTabs(0);
    const temLetras = tabs.some(t => t.id === 'letras');
    assert.strictEqual(temLetras, false, 'A aba "letras" deve ter sido removida do menu');
  });

  it('deve conter as abas essenciais no menu principal', () => {
    const tabs = getVisibleNavigationTabs(0);
    const ids = tabs.map(t => t.id);
    assert.ok(ids.includes('repertorio'));
    assert.ok(ids.includes('tarefas'));
    assert.ok(ids.includes('elenco'));
    assert.ok(ids.includes('rifa'));
  });
});
