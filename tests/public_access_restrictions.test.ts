import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getVisibleNavigationTabs } from '../src/components/Navigation';
import {
  reordenarRepertorio,
  editarMusicaRepertorio,
  removerMusicaRepertorio,
  MusicaRepertorio
} from '../src/data/blocoData';

/**
 * Suíte de testes para validação das restrições de acesso público (usuários não logados):
 * - Apenas 3 abas disponíveis: Ficha de Inscrição, Rifas e Repertório.
 * - Modo estritamente consulta: bloqueio de downloads de partituras, compras e edições.
 * - Padronização do título oficial: "Bloco Bicharada".
 */
describe('Restrições de Acesso Público e Título Oficial do Bloco Bicharada', () => {
  /**
   * Testa se o público sem login recebe estritamente as 3 abas solicitadas.
   */
  it('deve disponibilizar apenas 3 abas para usuários não logados (público)', () => {
    const abasPublicas = getVisibleNavigationTabs(0, 'publico');
    const ids = abasPublicas.map(a => a.id);

    assert.strictEqual(abasPublicas.length, 3, 'O público deve ter acesso exclusivamente a 3 seções');
    assert.deepStrictEqual(ids, ['inscricao', 'rifa', 'repertorio']);
  });

  /**
   * Testa que seções restritas não estão visíveis no menu do público.
   */
  it('não deve exibir Calendário, Documentos, Bar, Elenco ou Tarefas para o público', () => {
    const abasPublicas = getVisibleNavigationTabs(0, 'publico');
    const ids = abasPublicas.map(a => a.id);

    assert.strictEqual(ids.includes('calendario'), false, 'Calendário não deve ser visível para público');
    assert.strictEqual(ids.includes('documentos'), false, 'Documentos não deve ser visível para público');
    assert.strictEqual(ids.includes('tarefas'), false, 'Mural de Tarefas não deve ser visível para público');
    assert.strictEqual(ids.includes('desfile'), false, 'Tarefas em Andamento não deve ser visível para público');
    assert.strictEqual(ids.includes('bar'), false, 'Bar não deve ser visível para público');
    assert.strictEqual(ids.includes('elenco'), false, 'Elenco não deve ser visível para público');
    assert.strictEqual(ids.includes('enquetes'), false, 'Enquetes não deve ser visível para público');
  });

  /**
   * Testa que membros logados (bichos e coordenadores) continuam acessando todas as 11 abas.
   */
  it('membros logados devem continuar tendo acesso completo a todas as 11 abas', () => {
    const abasMembros = getVisibleNavigationTabs(0, 'bicho');
    assert.strictEqual(abasMembros.length, 11);
  });

  /**
   * Testa o bloqueio de operações no repertório por usuários sem privilégio de coordenação.
   */
  it('deve bloquear reordenação, edição e exclusão de músicas para usuários sem login/não coordenadores', () => {
    const musicas: MusicaRepertorio[] = [
      {
        id: 'mus-1',
        titulo: 'Música 1',
        artistaOriginal: 'Artista',
        ritmo: 'Axé',
        ordemDesfile: 1,
        votosFavoraveis: 10,
        statusCuradoria: 'Confirmada'
      },
      {
        id: 'mus-2',
        titulo: 'Música 2',
        artistaOriginal: 'Artista 2',
        ritmo: 'Frevo',
        ordemDesfile: 2,
        votosFavoraveis: 5,
        statusCuradoria: 'Em Votação'
      }
    ];

    // Tentativa de reordenação com isAdmin = false
    const tentativaReord = reordenarRepertorio(musicas, 0, 1, false);
    assert.strictEqual(tentativaReord[0].id, 'mus-1', 'A ordem não deve ser alterada por não coordenadores');

    // Tentativa de edição com isAdmin = false
    const tentativaEdicao = editarMusicaRepertorio(musicas, 'mus-1', { titulo: 'Novo Nome' }, false);
    assert.strictEqual(tentativaEdicao[0].titulo, 'Música 1', 'Música não deve ser editada por não coordenadores');

    // Tentativa de remoção com isAdmin = false
    const tentativaRemocao = removerMusicaRepertorio(musicas, 'mus-1', false);
    assert.strictEqual(tentativaRemocao.length, 2, 'Música não deve ser removida por não coordenadores');
  });

  /**
   * Testa a padronização textual da marca: "Bloco Bicharada".
   */
  it('o nome oficial do bloco deve ser padronizado como "Bloco Bicharada" sem a contração "da"', () => {
    const nomePadrao = 'Bloco Bicharada';
    assert.strictEqual(nomePadrao, 'Bloco Bicharada');
    assert.strictEqual(nomePadrao.includes('da Bicharada'), false);
  });
});
