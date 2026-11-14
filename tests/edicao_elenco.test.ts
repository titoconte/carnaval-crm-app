import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  Integrante,
  atualizarIntegranteElenco,
  removerIntegranteElenco,
  obterSetorDoGrupo,
  podeEditarIntegranteElenco
} from '../src/data/blocoData';

/**
 * Suíte de testes para a funcionalidade de edição e gerenciamento de integrantes
 * do elenco oficial do Bloco Bicharada por todos os usuários do sistema.
 */
describe('Edição de Integrantes do Elenco Oficial (Todos os Usuários)', () => {
  const listaInicial: Integrante[] = [
    {
      id: 'int-1',
      nome: 'Bel Chagas',
      grandeGrupo: 'Bateria',
      instrumentoOuFuncao: 'Caixa',
      observacao: 'Disponível aos sábados',
      ativo: true
    },
    {
      id: 'int-2',
      nome: 'Tito Conte',
      grandeGrupo: 'Sopros',
      instrumentoOuFuncao: 'Trompete',
      observacao: 'Arranjos e convenções',
      ativo: true
    },
    {
      id: 'int-3',
      nome: 'Luna Flor',
      grandeGrupo: 'Brincantes & Dança',
      instrumentoOuFuncao: 'Pernalta',
      observacao: 'Pernas de pau próprias',
      ativo: true
    }
  ];

  /**
   * Verifica que tanto integrantes comuns ('bicho') quanto 'coordenador' possuem permissão de edição.
   */
  it('deve permitir edição de elenco para todos os usuários logados (bicho e coordenador)', () => {
    assert.strictEqual(podeEditarIntegranteElenco('bicho'), true, 'Usuários bicho devem poder editar o elenco');
    assert.strictEqual(podeEditarIntegranteElenco('coordenador'), true, 'Coordenadores devem poder editar o elenco');
    assert.strictEqual(podeEditarIntegranteElenco(), true, 'Valor padrão deve permitir edição para membros');
    assert.strictEqual(podeEditarIntegranteElenco('publico'), false, 'Visitantes anônimos sem login não editam o elenco');
  });

  /**
   * Verifica na estrutura de RosterView.tsx que os controles de edição não estão bloqueados por isAdmin.
   */
  it('deve disponibilizar os botões e o modal de edição para todos os usuários no RosterView', () => {
    const rosterPath = path.resolve(process.cwd(), 'src/components/RosterView.tsx');
    const source = fs.readFileSync(rosterPath, 'utf-8');

    // A edição utiliza podeEditar (habilitado tanto para bicho quanto coordenador) e não bloqueia por isAdmin
    assert.strictEqual(
      source.includes('podeEditar && integrantes.length > 0'),
      true,
      'O botão superior de Editar Integrante deve estar liberado via podeEditar'
    );
    assert.strictEqual(
      source.includes('podeEditar && modalEditar && integranteEmEdicao'),
      true,
      'O modal de edição deve abrir para todos os usuários com podeEditar'
    );
    assert.strictEqual(
      source.includes('isAdmin && modalEditar'),
      false,
      'O modal de edição não deve exigir isAdmin'
    );
    assert.strictEqual(
      source.includes('Exclusivo Coordenadores: Editar'),
      false,
      'Não deve haver rótulo restringindo a edição apenas a coordenadores'
    );

    // A remoção permanece protegida para coordenadores (isAdmin)
    assert.strictEqual(
      source.includes('isAdmin && modalRemover'),
      true,
      'A remoção em massa continua exclusiva para coordenadores'
    );
  });

  it('deve atualizar os dados de um integrante existente com sucesso', () => {
    const integranteAtualizado: Integrante = {
      id: 'int-1',
      nome: 'Bel Chagas da Silva',
      grandeGrupo: 'Bateria',
      instrumentoOuFuncao: 'Caixa e Repique',
      observacao: 'Coordenadora de Naipe',
      ativo: true
    };

    const resultado = atualizarIntegranteElenco(listaInicial, integranteAtualizado);

    assert.strictEqual(resultado.length, 3);
    const modificado = resultado.find(i => i.id === 'int-1');
    assert.strictEqual(modificado?.nome, 'Bel Chagas da Silva');
    assert.strictEqual(modificado?.instrumentoOuFuncao, 'Caixa e Repique');
    assert.strictEqual(modificado?.observacao, 'Coordenadora de Naipe');
    assert.strictEqual(modificado?.ativo, true);
  });

  it('deve preservar os outros integrantes intactos ao atualizar um específico', () => {
    const integranteAtualizado: Integrante = {
      ...listaInicial[1],
      instrumentoOuFuncao: 'Trombone de Vara'
    };

    const resultado = atualizarIntegranteElenco(listaInicial, integranteAtualizado);

    const int1 = resultado.find(i => i.id === 'int-1');
    const int2 = resultado.find(i => i.id === 'int-2');
    const int3 = resultado.find(i => i.id === 'int-3');

    assert.strictEqual(int1?.nome, 'Bel Chagas');
    assert.strictEqual(int2?.instrumentoOuFuncao, 'Trombone de Vara');
    assert.strictEqual(int3?.instrumentoOuFuncao, 'Pernalta');
  });

  it('não deve alterar a lista se o ID do integrante a atualizar não existir', () => {
    const integranteInexistente: Integrante = {
      id: 'int-inexistente-999',
      nome: 'Fantasma do Carnaval',
      grandeGrupo: 'Vozes',
      instrumentoOuFuncao: 'Puxador',
      ativo: true
    };

    const resultado = atualizarIntegranteElenco(listaInicial, integranteInexistente);

    assert.strictEqual(resultado.length, 3);
    assert.deepStrictEqual(resultado, listaInicial);
  });

  it('deve permitir trocar o naipe e setor de um integrante (ex: Música para Performance)', () => {
    const integranteMovido: Integrante = {
      ...listaInicial[0],
      grandeGrupo: 'Brincantes & Dança',
      instrumentoOuFuncao: 'Dançarina'
    };

    const setorAntigo = obterSetorDoGrupo(listaInicial[0].grandeGrupo);
    assert.strictEqual(setorAntigo, 'Música');

    const resultado = atualizarIntegranteElenco(listaInicial, integranteMovido);
    const modificado = resultado.find(i => i.id === 'int-1');

    assert.ok(modificado);
    assert.strictEqual(modificado.grandeGrupo, 'Brincantes & Dança');
    const novoSetor = obterSetorDoGrupo(modificado.grandeGrupo);
    assert.strictEqual(novoSetor, 'Performance');
  });

  it('deve permitir alterar o status de atividade do integrante (ativo: false)', () => {
    const integranteInativo: Integrante = {
      ...listaInicial[2],
      ativo: false,
      observacao: 'Licença temporária em 2027'
    };

    const resultado = atualizarIntegranteElenco(listaInicial, integranteInativo);
    const modificado = resultado.find(i => i.id === 'int-3');

    assert.strictEqual(modificado?.ativo, false);
    assert.strictEqual(modificado?.observacao, 'Licença temporária em 2027');
  });

  it('deve remover integrante sem afetar os demais integrantes', () => {
    const resultado = removerIntegranteElenco(listaInicial, 'int-2');

    assert.strictEqual(resultado.length, 2);
    assert.strictEqual(resultado.some(i => i.id === 'int-2'), false);
    assert.strictEqual(resultado.some(i => i.id === 'int-1'), true);
    assert.strictEqual(resultado.some(i => i.id === 'int-3'), true);
  });
});
