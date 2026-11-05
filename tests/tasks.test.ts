import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TarefaPostIt,
  calcularProgressoChecklist,
  converterTarefaEmMacrotarefa,
  ordenarTarefasPorUrgencia,
  podeAcionarEquipePronta
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

  it('deve ordenar post-its colocando os urgentes no topo da lista', () => {
    const tarefas: TarefaPostIt[] = [
      { id: '1', titulo: 'Comprar fita', descricao: '', categoria: 'Geral', urgente: false, concluida: false },
      { id: '2', titulo: 'Socorro elétrico', descricao: '', categoria: 'Geral', urgente: true, concluida: false },
      { id: '3', titulo: 'Pintar faixa', descricao: '', categoria: 'Geral', urgente: false, concluida: false },
      { id: '4', titulo: 'Alvará urgente', descricao: '', categoria: 'Geral', urgente: true, concluida: false }
    ];

    const ordenadas = ordenarTarefasPorUrgencia(tarefas);
    assert.strictEqual(ordenadas[0].urgente, true);
    assert.strictEqual(ordenadas[1].urgente, true);
    assert.strictEqual(ordenadas[2].urgente, false);
    assert.strictEqual(ordenadas[3].urgente, false);
  });

  it('deve permitir acionar equipe pronta apenas se a tarefa tiver dono atribuído', () => {
    const tarefaSemDono: TarefaPostIt = {
      id: '1',
      titulo: 'Sem dono',
      descricao: '',
      categoria: 'Geral',
      urgente: false,
      concluida: false
    };

    const tarefaADefinir: TarefaPostIt = {
      id: '2',
      titulo: 'A definir',
      descricao: '',
      categoria: 'Geral',
      responsavel: 'A Definir',
      urgente: false,
      concluida: false
    };

    const tarefaComDono: TarefaPostIt = {
      id: '3',
      titulo: 'Com dono',
      descricao: '',
      categoria: 'Geral',
      responsavel: 'Regina',
      urgente: false,
      concluida: false
    };

    assert.strictEqual(podeAcionarEquipePronta(tarefaSemDono), false);
    assert.strictEqual(podeAcionarEquipePronta(tarefaADefinir), false);
    assert.strictEqual(podeAcionarEquipePronta(tarefaComDono), true);
  });
});

