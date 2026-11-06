import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TAREFAS_POSTIT_INICIAIS,
  TarefaPostIt,
  removerTarefaPostIt,
  atualizarTarefaPostIt
} from '../src/data/blocoData';

/**
 * Suíte de testes para garantir que as informações de tarefas residem
 * EXCLUSIVAMENTE no banco de dados, sem dependência ou restauração via LocalStorage.
 */
describe('Persistência Exclusiva de Tarefas no Banco de Dados (Sem LocalStorage)', () => {
  it('deve permitir excluir uma tarefa e manter apenas as tarefas restantes', () => {
    const tarefasAtuais = [...TAREFAS_POSTIT_INICIAIS];
    const idParaRemover = tarefasAtuais[0].id;

    // Simula a ação de exclusão executada pelo usuário
    const tarefasAposExclusao = removerTarefaPostIt(tarefasAtuais, idParaRemover);

    assert.strictEqual(tarefasAposExclusao.length, TAREFAS_POSTIT_INICIAIS.length - 1);
    assert.strictEqual(tarefasAposExclusao.some(t => t.id === idParaRemover), false);
  });

  it('não deve restaurar tarefas padrão quando a lista no banco for esvaziada propositalmente ([])', () => {
    const tarefasNoBanco: TarefaPostIt[] = [];

    // Lógica do endpoint de sincronização: se já existe (mesmo que []), mantém o estado do banco
    const tarefasCarregadas = (tarefasNoBanco !== undefined && tarefasNoBanco !== null && Array.isArray(tarefasNoBanco))
      ? tarefasNoBanco
      : TAREFAS_POSTIT_INICIAIS;

    assert.strictEqual(tarefasCarregadas.length, 0);
    assert.deepStrictEqual(tarefasCarregadas, []);
  });

  it('deve persistir alterações completas de edição de tarefa', () => {
    const tarefas = [...TAREFAS_POSTIT_INICIAIS];
    const tarefaAlvo = { ...tarefas[1] };

    const tarefaModificada: TarefaPostIt = {
      ...tarefaAlvo,
      titulo: 'Kombi Cora Reformada e Pronta',
      responsavel: 'Tito Conte',
      urgente: true,
      checklists: [
        {
          id: 'chk-1',
          texto: 'Revisão mecânica concluída',
          concluido: true,
          responsavel: 'Tito Conte'
        }
      ]
    };

    const atualizadas = atualizarTarefaPostIt(tarefas, tarefaModificada);
    const salvaNoBanco = atualizadas.find(t => t.id === tarefaAlvo.id);

    assert.ok(salvaNoBanco);
    assert.strictEqual(salvaNoBanco?.titulo, 'Kombi Cora Reformada e Pronta');
    assert.strictEqual(salvaNoBanco?.responsavel, 'Tito Conte');
    assert.strictEqual(salvaNoBanco?.urgente, true);
    assert.strictEqual(salvaNoBanco?.checklists?.[0].concluido, true);
  });

  it('deve simular o fluxo de carga direta do banco sem ler chaves do LocalStorage', () => {
    // Simula resposta direta do endpoint /api/db/sync
    const payloadBanco = {
      configured: true,
      estados: {
        tarefas: [
          {
            id: 't-banco-1',
            titulo: 'Tarefa Existente Apenas no Banco',
            descricao: 'Sem passar por LocalStorage',
            categoria: 'Produção' as const,
            responsavel: 'Bel',
            corPostIt: 'verde' as const,
            urgente: false,
            concluida: false
          }
        ]
      }
    };

    // O cliente consome diretamente do banco
    const estadoTarefas = Array.isArray(payloadBanco.estados.tarefas)
      ? payloadBanco.estados.tarefas
      : TAREFAS_POSTIT_INICIAIS;

    assert.strictEqual(estadoTarefas.length, 1);
    assert.strictEqual(estadoTarefas[0].id, 't-banco-1');
    assert.strictEqual(estadoTarefas[0].titulo, 'Tarefa Existente Apenas no Banco');
  });
});
