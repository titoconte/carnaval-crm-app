import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getVisibleNavigationTabs } from '../src/components/Navigation';

describe('Navegação e Ordem Oficial das Páginas do Bloco Bicharada', () => {
  it('para o público (sem login), deve exibir exatamente 5 abas na ordem estrita solicitada', () => {
    const tabsPublico = getVisibleNavigationTabs(0, 'publico');
    const ids = tabsPublico.map(t => t.id);

    const ordemEsperadaPublico = [
      'inscricao',   // 1. Inscrições
      'calendario',  // 2. Calendário
      'rifa',        // 3. Rifas
      'repertorio',  // 4. Repertório
      'documentos'   // 5. Documentos
    ];

    assert.strictEqual(tabsPublico.length, 5, 'O público deve ter acesso a exatamente 5 abas');
    assert.deepStrictEqual(ids, ordemEsperadaPublico, 'A ordem do público deve ser estritamente inscrições, calendário, rifas, repertório e documentos');
  });

  it('para membros (coordenadores e bichos), deve conter exatamente as 11 abas oficiais na ordem completa', () => {
    const tabsCoord = getVisibleNavigationTabs(0, 'coordenador');
    const tabsBicho = getVisibleNavigationTabs(0, 'bicho');

    assert.strictEqual(tabsCoord.length, 11, 'Coordenadores devem visualizar 11 abas');
    assert.strictEqual(tabsBicho.length, 11, 'Bichos devem visualizar 11 abas');

    const ordemEsperadaMembros = [
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

    assert.deepStrictEqual(tabsCoord.map(t => t.id), ordemEsperadaMembros);
    assert.deepStrictEqual(tabsBicho.map(t => t.id), ordemEsperadaMembros);
  });

  it('não deve exibir a aba Letras & Cifras no menu principal de navegação', () => {
    const tabs = getVisibleNavigationTabs(0, 'coordenador');
    const temLetras = tabs.some(t => t.id === 'letras');
    assert.strictEqual(temLetras, false, 'A aba "letras" deve ter sido incorporada ao Repertório');
  });

  it('deve exibir indicador de badge numérico quando houver tarefas órfãs na aba de mural para membros', () => {
    const tabsComOrfas = getVisibleNavigationTabs(3, 'coordenador');
    const abaTarefas = tabsComOrfas.find(t => t.id === 'tarefas');
    assert.strictEqual(abaTarefas?.badge, '3 órfãs');

    const tabsSemOrfas = getVisibleNavigationTabs(0, 'coordenador');
    const abaSemOrfas = tabsSemOrfas.find(t => t.id === 'tarefas');
    assert.strictEqual(abaSemOrfas?.badge, undefined);
  });
});
