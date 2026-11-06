import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TAREFAS_POSTIT_INICIAIS,
  TarefaPostIt,
  adicionarNovoUsuario,
  USUARIOS_INICIAIS
} from '../src/data/blocoData';

/**
 * Bateria de testes para as tarefas extraídas da Ata 7 e regras do link de convite.
 */
describe('Tarefas do Mural da Ata 7 (Recording_7)', () => {
  it('deve conter as 11 tarefas essenciais deliberadas na reunião de planejamento', () => {
    assert.strictEqual(TAREFAS_POSTIT_INICIAIS.length, 11);
  });

  it('todas as tarefas da Ata 7 devem iniciar sem responsável para preenchimento manual', () => {
    TAREFAS_POSTIT_INICIAIS.forEach((tarefa: TarefaPostIt) => {
      assert.strictEqual(
        tarefa.responsavel,
        '',
        `A tarefa "${tarefa.titulo}" deve ter responsável vazio ("") para atribuição manual`
      );
    });
  });

  it('todos os itens de checklist das tarefas devem iniciar não concluídos e sem responsável pré-atribuído', () => {
    TAREFAS_POSTIT_INICIAIS.forEach((tarefa: TarefaPostIt) => {
      assert.ok(tarefa.checklists && tarefa.checklists.length > 0, `Tarefa "${tarefa.titulo}" deve possuir itens de checklist`);
      tarefa.checklists?.forEach(item => {
        assert.strictEqual(item.concluido, false);
        assert.strictEqual(item.responsavel, '');
      });
    });
  });

  it('deve contemplar os principais eixos da Ata: Kombi Cora, Bar Fort Atacadista, CNPJ, Sopros/Contra-Canto e Rifa', () => {
    const titulos = TAREFAS_POSTIT_INICIAIS.map(t => t.titulo.toLowerCase()).join(' ');
    assert.ok(titulos.includes('kombi cora'), 'Deve conter tarefa da Kombi Cora');
    assert.ok(titulos.includes('fort atacadista') || titulos.includes('bar dos ensaios'), 'Deve conter tarefa do Bar dos Ensaios');
    assert.ok(titulos.includes('cnpj') || titulos.includes('associação'), 'Deve conter tarefa da viabilidade de CNPJ');
    assert.ok(titulos.includes('contra-canto') || titulos.includes('curadoria musical'), 'Deve conter tarefa dos arranjos/contra-canto');
    assert.ok(titulos.includes('rifa'), 'Deve conter tarefa do lançamento da rifa');
    assert.ok(titulos.includes('novos integrantes') || titulos.includes('formulário'), 'Deve conter tarefa do formulário de novos integrantes');
  });
});

describe('Fluxo do Link de Convite Privado para Primeiro Acesso', () => {
  it('deve registrar usuário com sucesso através do fluxo de autocadastro por convite', () => {
    const usuarios = [...USUARIOS_INICIAIS];
    const res = adicionarNovoUsuario(usuarios, {
      username: 'bicho.convidado',
      senha: 'carnaval2027',
      perfil: 'bicho'
    });

    assert.strictEqual(res.sucesso, true);
    assert.ok(res.usuariosAtualizados.some(u => u.username === 'bicho.convidado' && u.perfil === 'bicho'));
  });

  it('deve rejeitar senhas com menos de 4 caracteres no autocadastro', () => {
    const usuarios = [...USUARIOS_INICIAIS];
    const res = adicionarNovoUsuario(usuarios, {
      username: 'bicho.valido',
      senha: '123',
      perfil: 'bicho'
    });

    assert.strictEqual(res.sucesso, false);
    assert.ok(res.erro?.includes('no mínimo 4 caracteres'));
  });
});
