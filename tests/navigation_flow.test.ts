import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getVisibleNavigationTabs } from '../src/components/Navigation';

describe('Navegação e Ordem Oficial das Páginas do Bloco Bicharada', () => {
  it('não deve exibir a aba Letras & Cifras no menu principal de navegação', () => {
    const tabs = getVisibleNavigationTabs(0);
    const temLetras = tabs.some(t => t.id === 'letras');
    assert.strictEqual(temLetras, false, 'A aba "letras" deve ter sido incorporada ao Repertório');
  });

  it('deve conter exatamente 11 abas no menu principal', () => {
    const tabs = getVisibleNavigationTabs(0);
    assert.strictEqual(tabs.length, 11, 'O menu deve conter exatamente 11 abas oficiais');
  });

  it('deve seguir a ordem oficial estrita solicitada pelo usuário (1 a 11)', () => {
    const tabs = getVisibleNavigationTabs(0);
    const ordemEsperada = [
      'tarefas',     // 1 mural
      'calendario',  // 2 calendário
      'desfile',     // 3 tarefas em andamento
      'repertorio',  // 4 repertório
      'rifa',        // 5 rifas
      'inscricao',   // 6 inscrições
      'midia',       // 7 mídia
      'bar',         // 8 bar
      'elenco',      // 9 elenco
      'enquetes',    // 10 enquetes
      'documentos'   // 11 documentos
    ];

    const idsAtuais = tabs.map(t => t.id);
    assert.deepStrictEqual(idsAtuais, ordemEsperada, 'A ordem das abas deve corresponder exatamente à sequência oficial de 1 a 11');
  });

  it('deve possuir as nomenclaturas oficiais adequadas para cada uma das abas', () => {
    const tabs = getVisibleNavigationTabs(0);
    const rotulos = tabs.map(t => ({ id: t.id, label: t.label }));

    assert.strictEqual(rotulos[0].label, 'Mural de Tarefas');
    assert.strictEqual(rotulos[1].label, 'Calendário');
    assert.strictEqual(rotulos[2].label, 'Tarefas em Andamento');
    assert.strictEqual(rotulos[3].label, 'Repertório');
    assert.strictEqual(rotulos[4].label, 'Rifas 🎟️');
    assert.strictEqual(rotulos[5].label, 'Inscrições');
    assert.strictEqual(rotulos[6].label, 'Mídia & Artes');
    assert.strictEqual(rotulos[7].label, 'Bar dos Ensaios');
    assert.strictEqual(rotulos[8].label, 'Elenco & Naipes');
    assert.strictEqual(rotulos[9].label, 'Enquetes WhatsApp');
    assert.strictEqual(rotulos[10].label, 'Documentos');
  });

  it('deve exibir indicador de badge numérico quando houver tarefas órfãs na aba de mural', () => {
    const tabsComOrfas = getVisibleNavigationTabs(3);
    const abaTarefas = tabsComOrfas.find(t => t.id === 'tarefas');
    assert.strictEqual(abaTarefas?.badge, '3 órfãs');

    const tabsSemOrfas = getVisibleNavigationTabs(0);
    const abaSemOrfas = tabsSemOrfas.find(t => t.id === 'tarefas');
    assert.strictEqual(abaSemOrfas?.badge, undefined);
  });
});
