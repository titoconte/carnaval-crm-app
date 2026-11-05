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

  it('deve ter a aba desfile renomeada para "Tarefas em Andamento"', () => {
    const tabs = getVisibleNavigationTabs(0);
    const abaDesfile = tabs.find(t => t.id === 'desfile');
    assert.ok(abaDesfile, 'Aba desfile deve existir');
    assert.strictEqual(abaDesfile?.label, 'Tarefas em Andamento');
  });

  it('deve incluir a aba de Documentos e conter pelo menos 10 opções no menu', () => {
    const tabs = getVisibleNavigationTabs(0);
    const abaDocumentos = tabs.find(t => t.id === 'documentos');
    assert.ok(abaDocumentos, 'Aba documentos deve existir no menu');
    assert.strictEqual(abaDocumentos?.label, 'Documentos');
    assert.ok(tabs.length >= 10, 'O menu deve conter 10 opções para exibição completa');
  });

  it('deve incluir a aba Mídia & Artes com gestão de cores e Instagram', () => {
    const tabs = getVisibleNavigationTabs(0);
    const abaMidia = tabs.find(t => t.id === 'midia');
    assert.ok(abaMidia, 'Aba midia deve existir no menu');
    assert.strictEqual(abaMidia?.label, 'Mídia & Artes');
    assert.strictEqual(tabs.length, 11, 'O menu deve conter 11 abas completas');
  });
});
