import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TarefaPostIt,
  calcularProgressoChecklist,
  converterTarefaEmMacrotarefa,
  ordenarTarefasPorUrgencia,
  podeAcionarEquipePronta,
  formatarDataBrasileira
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

  it('deve formatar data no padrão brasileiro DD/MM/AAAA', () => {
    assert.strictEqual(formatarDataBrasileira('2027-02-08'), '08/02/2027');
    assert.strictEqual(formatarDataBrasileira('2027-01-15'), '15/01/2027');
    assert.strictEqual(formatarDataBrasileira(''), '');
    assert.strictEqual(formatarDataBrasileira(undefined), '');
  });

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

  it('deve ordenar post-its colocando os urgentes no topo da lista e depois por data', () => {
    const tarefas: TarefaPostIt[] = [
      { id: '1', titulo: 'Comprar fita', descricao: '', categoria: 'Geral', urgente: false, concluida: false, dataFinal: '2027-02-01' },
      { id: '2', titulo: 'Socorro elétrico tardio', descricao: '', categoria: 'Geral', urgente: true, concluida: false, dataFinal: '2027-01-20' },
      { id: '3', titulo: 'Socorro elétrico urgente cedo', descricao: '', categoria: 'Geral', urgente: true, concluida: false, dataFinal: '2027-01-10' },
      { id: '4', titulo: 'Pintar faixa cedo', descricao: '', categoria: 'Geral', urgente: false, concluida: false, dataFinal: '2027-01-15' },
      { id: '5', titulo: 'Urgente sem data', descricao: '', categoria: 'Geral', urgente: true, concluida: false },
      { id: '6', titulo: 'Não urgente sem data', descricao: '', categoria: 'Geral', urgente: false, concluida: false }
    ];

    const ordenadas = ordenarTarefasPorUrgencia(tarefas);

    // Primeiro grupo: Urgentes (ordenados por data e depois sem data)
    assert.strictEqual(ordenadas[0].id, '3', 'Urgente com data mais cedo (10/01) deve ser o 1º');
    assert.strictEqual(ordenadas[1].id, '2', 'Urgente com data posterior (20/01) deve ser o 2º');
    assert.strictEqual(ordenadas[2].id, '5', 'Urgente sem data deve ser o 3º');

    // Segundo grupo: Não urgentes (ordenados por data e depois sem data)
    assert.strictEqual(ordenadas[3].id, '4', 'Não urgente com data mais cedo (15/01) deve vir antes');
    assert.strictEqual(ordenadas[4].id, '1', 'Não urgente com data posterior (01/02) deve vir depois');
    assert.strictEqual(ordenadas[5].id, '6', 'Não urgente sem data deve vir por último');
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

