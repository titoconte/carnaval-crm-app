import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TarefaPostIt,
  calcularProgressoChecklist,
  converterTarefaEmMacrotarefa
} from '../src/data/blocoData';

describe('Mural de Tarefas e Checklists com Prazos', () => {
  const tarefaComChecklist: TarefaPostIt = {
    id: 'post-test-1',
    titulo: 'Montagem dos Adereços dos Pernaltas',
    descricao: 'Cortar fitas e preparar estrutura das pernas de pau',
    categoria: 'Fantasias',
    responsavel: 'Bel Rodrigues',
    corPostIt: 'amarelo',
    urgente: true,
    concluida: false,
    dataFinal: '2026-11-20',
    checklists: [
      { id: 'chk-1', texto: 'Comprar fitas coloridas', dataLimite: '2026-11-10', concluido: true },
      { id: 'chk-2', texto: 'Cortar em tiras de 1 metro', dataLimite: '2026-11-15', concluido: true },
      { id: 'chk-3', texto: 'Amarrar nas pernas de pau', dataLimite: '2026-11-18', concluido: false },
      { id: 'chk-4', texto: 'Revisão final de segurança', dataLimite: '2026-11-20', concluido: false }
    ]
  };

  it('deve calcular corretamente a porcentagem de conclusão da checklist (50%)', () => {
    const pct = calcularProgressoChecklist(tarefaComChecklist.checklists);
    assert.strictEqual(pct, 50);
  });

  it('deve retornar 0% quando não houver itens ou checklists vazia', () => {
    assert.strictEqual(calcularProgressoChecklist([]), 0);
    assert.strictEqual(calcularProgressoChecklist(undefined), 0);
  });

  it('deve converter uma TarefaPostIt em MacrotarefaDesfile ao acionar Equipe Pronta', () => {
    const macro = converterTarefaEmMacrotarefa(tarefaComChecklist);
    assert.strictEqual(macro.titulo, tarefaComChecklist.titulo);
    assert.strictEqual(macro.responsavelPrincipal, 'Bel Rodrigues');
    assert.strictEqual(macro.coluna, 'A Fazer');
    assert.strictEqual(macro.checklists.length, 4);
    assert.strictEqual(macro.checklists[0].texto, 'Comprar fitas coloridas (Prazo: 2026-11-10)');
  });
});
