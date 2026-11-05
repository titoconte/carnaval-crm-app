import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TarefaPostIt,
  ItemChecklistTarefa,
  obterResponsavelItemChecklist,
  converterTarefaEmMacrotarefa
} from '../src/data/blocoData';

/**
 * Suíte de testes para a funcionalidade de atribuição e herança de responsáveis
 * nos itens de checklist de tarefas e macrotarefas do bloco.
 */
describe('Responsáveis por Item de Checklist (Atribuição e Fallback)', () => {
  /**
   * Testa a função obterResponsavelItemChecklist em múltiplos cenários.
   */
  describe('obterResponsavelItemChecklist', () => {
    it('deve priorizar o responsável específico do item se estiver definido', () => {
      const resp = obterResponsavelItemChecklist('João Silva', 'Maria Coordenadora');
      assert.strictEqual(resp, 'João Silva');
    });

    it('deve herdar o responsável da tarefa pai quando o item não tiver responsável', () => {
      const resp1 = obterResponsavelItemChecklist(undefined, 'Maria Coordenadora');
      const resp2 = obterResponsavelItemChecklist('', 'Maria Coordenadora');
      const resp3 = obterResponsavelItemChecklist('   ', 'Maria Coordenadora');
      
      assert.strictEqual(resp1, 'Maria Coordenadora');
      assert.strictEqual(resp2, 'Maria Coordenadora');
      assert.strictEqual(resp3, 'Maria Coordenadora');
    });

    it('deve retornar string vazia quando nenhum dos dois for fornecido', () => {
      const resp = obterResponsavelItemChecklist(undefined, undefined);
      assert.strictEqual(resp, '');
    });

    it('deve remover espaços em branco nas extremidades dos nomes', () => {
      const respComEspacos = obterResponsavelItemChecklist('  Carlos Bicho  ', '  Ana Coord  ');
      assert.strictEqual(respComEspacos, 'Carlos Bicho');
    });
  });

  /**
   * Testa a conversão de TarefaPostIt para MacrotarefaDesfile preservando responsáveis de itens.
   */
  describe('converterTarefaEmMacrotarefa com herança de responsáveis', () => {
    it('deve propagar responsáveis específicos ou herdar da tarefa pai na conversão', () => {
      const tarefa: TarefaPostIt = {
        id: 'tarefa-com-check-resp',
        titulo: 'Construção do Carro Abre-Alas',
        descricao: 'Preparar base e soldas',
        categoria: 'Cenografia',
        responsavel: 'Lucas Mestre',
        corPostIt: 'amarelo',
        urgente: true,
        concluida: false,
        checklists: [
          {
            id: 'item-1',
            texto: 'Comprar barras de ferro',
            concluido: true,
            responsavel: 'Felipe Serralheiro' // Responsável próprio
          },
          {
            id: 'item-2',
            texto: 'Pintar armação',
            concluido: false
            // Sem responsável explícito -> deve herdar 'Lucas Mestre'
          }
        ]
      };

      const macro = converterTarefaEmMacrotarefa(tarefa);

      assert.strictEqual(macro.responsavelPrincipal, 'Lucas Mestre');
      assert.strictEqual(macro.checklists.length, 2);
      
      // Item 1 mantém Felipe Serralheiro
      assert.strictEqual(macro.checklists[0].responsavel, 'Felipe Serralheiro');
      // Item 2 herdou Lucas Mestre da tarefa pai
      assert.strictEqual(macro.checklists[1].responsavel, 'Lucas Mestre');
    });

    it('deve usar "Equipe Voluntária Mobilizada" quando nem item nem tarefa tiverem responsável', () => {
      const tarefaSemResp: TarefaPostIt = {
        id: 'tarefa-sem-resp',
        titulo: 'Tarefa Coletiva',
        descricao: '',
        categoria: 'Geral',
        corPostIt: 'verde',
        urgente: false,
        concluida: false,
        checklists: [
          {
            id: 'item-sem-resp',
            texto: 'Carregar caixas de som',
            concluido: false
          }
        ]
      };

      const macro = converterTarefaEmMacrotarefa(tarefaSemResp);

      assert.strictEqual(macro.responsavelPrincipal, 'Equipe Voluntária Mobilizada');
      assert.strictEqual(macro.checklists[0].responsavel, 'Equipe Voluntária Mobilizada');
    });
  });
});
