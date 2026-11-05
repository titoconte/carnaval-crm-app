import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TarefaPostIt,
  MacrotarefaDesfile,
  EnqueteWhatsApp,
  atualizarTarefaPostIt,
  removerTarefaPostIt,
  atualizarMacrotarefa,
  removerMacrotarefa,
  atualizarEnquete,
  removerEnquete
} from '../src/data/blocoData';

describe('Gestão de Edição e Deleção de Tarefas, Mural e Enquetes', () => {
  // Testes para Mural de Tarefas (Post-its)
  describe('Mural de Tarefas (Post-its)', () => {
    const listaTarefas: TarefaPostIt[] = [
      {
        id: 'post-1',
        titulo: 'Comprar confete',
        descricao: 'Comprar sacos de confete colorido',
        categoria: 'Produção',
        responsavel: 'Tito',
        corPostIt: 'rosa',
        urgente: false,
        concluida: false
      },
      {
        id: 'post-2',
        titulo: 'Revisar cordas',
        descricao: 'Checar cordas do estandarte',
        categoria: 'Apoio',
        responsavel: 'Bel',
        corPostIt: 'amarelo',
        urgente: true,
        concluida: false
      }
    ];

    it('deve atualizar os dados de uma tarefa existente', () => {
      const tarefaModificada: TarefaPostIt = {
        ...listaTarefas[0],
        titulo: 'Comprar confete e serpentina',
        urgente: true,
        dataFinal: '2027-02-05'
      };

      const resultado = atualizarTarefaPostIt(listaTarefas, tarefaModificada);
      assert.strictEqual(resultado.length, 2);
      const atualizada = resultado.find(t => t.id === 'post-1');
      assert.strictEqual(atualizada?.titulo, 'Comprar confete e serpentina');
      assert.strictEqual(atualizada?.urgente, true);
      assert.strictEqual(atualizada?.dataFinal, '2027-02-05');
    });

    it('deve remover uma tarefa existente pelo ID', () => {
      const resultado = removerTarefaPostIt(listaTarefas, 'post-1');
      assert.strictEqual(resultado.length, 1);
      assert.strictEqual(resultado[0].id, 'post-2');
    });

    it('não deve alterar a lista se o ID da tarefa não existir', () => {
      const resultado = removerTarefaPostIt(listaTarefas, 'id-inexistente');
      assert.strictEqual(resultado.length, 2);
    });
  });

  // Testes para Tarefas em Andamento (Macrotarefas do Desfile)
  describe('Tarefas em Andamento (Macrotarefas)', () => {
    const listaMacros: MacrotarefaDesfile[] = [
      {
        id: 'macro-1',
        titulo: 'Abastecimento da Kombi Cora',
        coluna: 'A Fazer',
        responsavelPrincipal: 'Tito',
        descricao: 'Levar galões de água',
        checklists: [{ id: 'c-1', texto: 'Comprar água', concluido: false }]
      },
      {
        id: 'macro-2',
        titulo: 'Montagem do Estandarte',
        coluna: 'No Dia do Desfile',
        responsavelPrincipal: 'Bel',
        checklists: [{ id: 'c-2', texto: 'Fixar haste', concluido: true }]
      }
    ];

    it('deve atualizar o título, coluna e responsável de uma macrotarefa', () => {
      const macroModificada: MacrotarefaDesfile = {
        ...listaMacros[0],
        titulo: 'Abastecimento Completo da Kombi Cora',
        coluna: 'No Dia do Desfile',
        responsavelPrincipal: 'Tito e Gabriel'
      };

      const resultado = atualizarMacrotarefa(listaMacros, macroModificada);
      assert.strictEqual(resultado.length, 2);
      const atualizada = resultado.find(m => m.id === 'macro-1');
      assert.strictEqual(atualizada?.titulo, 'Abastecimento Completo da Kombi Cora');
      assert.strictEqual(atualizada?.coluna, 'No Dia do Desfile');
      assert.strictEqual(atualizada?.responsavelPrincipal, 'Tito e Gabriel');
    });

    it('deve remover uma macrotarefa pelo ID', () => {
      const resultado = removerMacrotarefa(listaMacros, 'macro-1');
      assert.strictEqual(resultado.length, 1);
      assert.strictEqual(resultado[0].id, 'macro-2');
    });

    it('não deve alterar a lista de macrotarefas se o ID não existir', () => {
      const resultado = removerMacrotarefa(listaMacros, 'macro-inexistente');
      assert.strictEqual(resultado.length, 2);
    });
  });

  // Testes para Enquetes do WhatsApp
  describe('Enquetes do WhatsApp', () => {
    const listaEnquetes: EnqueteWhatsApp[] = [
      {
        id: 'enq-1',
        titulo: 'Cor do Estandarte',
        pergunta: 'Qual cor deve ser o fundo?',
        totalVotos: 30,
        dataEncerramento: '2026-11-01',
        opcoes: [
          { rotulo: 'Rosa Choque', votos: 20, percentual: 67 },
          { rotulo: 'Verde Bandeira', votos: 10, percentual: 33 }
        ],
        resolucaoOficial: 'Fundo Rosa Choque'
      },
      {
        id: 'enq-2',
        titulo: 'Horário do Ensaio Geral',
        pergunta: 'Que horas começamos?',
        totalVotos: 15,
        dataEncerramento: '2026-11-03',
        opcoes: [
          { rotulo: '14h', votos: 10, percentual: 67 },
          { rotulo: '16h', votos: 5, percentual: 33 }
        ]
      }
    ];

    it('deve atualizar os dados e a resolução oficial de uma enquete', () => {
      const enqueteModificada: EnqueteWhatsApp = {
        ...listaEnquetes[0],
        titulo: 'Cor Oficial do Estandarte 2027',
        resolucaoOficial: 'Definido Rosa Choque com detalhes dourados'
      };

      const resultado = atualizarEnquete(listaEnquetes, enqueteModificada);
      assert.strictEqual(resultado.length, 2);
      const atualizada = resultado.find(e => e.id === 'enq-1');
      assert.strictEqual(atualizada?.titulo, 'Cor Oficial do Estandarte 2027');
      assert.strictEqual(atualizada?.resolucaoOficial, 'Definido Rosa Choque com detalhes dourados');
    });

    it('deve remover uma enquete pelo ID', () => {
      const resultado = removerEnquete(listaEnquetes, 'enq-1');
      assert.strictEqual(resultado.length, 1);
      assert.strictEqual(resultado[0].id, 'enq-2');
    });

    it('não deve alterar a lista de enquetes se o ID não existir', () => {
      const resultado = removerEnquete(listaEnquetes, 'enq-inexistente');
      assert.strictEqual(resultado.length, 2);
    });
  });
});
