import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  Integrante,
  agruparElencoPorMacrocategoria,
  MACROCATEGORIAS_ELENCO,
  SETORES_ELENCO,
  CATEGORIAS_POR_SETOR,
  obterSetorDoGrupo,
  obterColunasPorSetor,
  removerIntegranteElenco
} from '../src/data/blocoData';

describe('Estrutura de 3 Abas (Música, Performance e Organização) e Naipes do Elenco', () => {
  const elencoMock: Integrante[] = [
    { id: '1', nome: 'André', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
    { id: '2', nome: 'Gabriel', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
    { id: '3', nome: 'Shei', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Surdo', ativo: true },
    { id: '4', nome: 'Claudinha', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Trompete', ativo: true },
    { id: '5', nome: 'Patricia', grandeGrupo: 'Vozes', instrumentoOuFuncao: 'Voz Principal', ativo: true },
    { id: '6', nome: 'Lissa', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Estandarte', ativo: true },
    { id: '7', nome: 'Dudu', grandeGrupo: 'Carro Alegórico', instrumentoOuFuncao: 'Cenografia', ativo: true },
    { id: '8', nome: 'Tito', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Coordenação Geral', ativo: true }
  ];

  it('deve conter exatamente os 3 setores principais do elenco', () => {
    assert.strictEqual(SETORES_ELENCO.length, 3);
    const ids = SETORES_ELENCO.map(s => s.id);
    assert.ok(ids.includes('Música'));
    assert.ok(ids.includes('Performance'));
    assert.ok(ids.includes('Organização'));
  });

  it('deve mapear corretamente cada macrocategoria ao seu setor correspondente', () => {
    assert.strictEqual(obterSetorDoGrupo('Bateria'), 'Música');
    assert.strictEqual(obterSetorDoGrupo('Sopros'), 'Música');
    assert.strictEqual(obterSetorDoGrupo('Vozes'), 'Música');
    assert.strictEqual(obterSetorDoGrupo('Outros Instrumentos'), 'Música');

    assert.strictEqual(obterSetorDoGrupo('Brincantes & Dança'), 'Performance');
    assert.strictEqual(obterSetorDoGrupo('Carro Alegórico'), 'Performance');

    assert.strictEqual(obterSetorDoGrupo('Organização & Apoio'), 'Organização');
  });

  it('deve listar todas as 7 macrocategorias oficiais do bloco', () => {
    assert.strictEqual(MACROCATEGORIAS_ELENCO.length, 7);
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Bateria'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Sopros'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Vozes'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Outros Instrumentos'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Brincantes & Dança'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Carro Alegórico'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Organização & Apoio'));
  });

  it('deve retornar as colunas corretas filtradas por setor através de obterColunasPorSetor', () => {
    const colunasMusica = obterColunasPorSetor(elencoMock, 'Música');
    assert.strictEqual(colunasMusica.length, 4);
    assert.deepStrictEqual(colunasMusica.map(c => c.categoria), [
      'Bateria',
      'Sopros',
      'Vozes',
      'Outros Instrumentos'
    ]);

    const colunasPerformance = obterColunasPorSetor(elencoMock, 'Performance');
    assert.strictEqual(colunasPerformance.length, 2);
    assert.deepStrictEqual(colunasPerformance.map(c => c.categoria), [
      'Brincantes & Dança',
      'Carro Alegórico'
    ]);
    assert.strictEqual(colunasPerformance.find(c => c.categoria === 'Carro Alegórico')?.total, 1);

    const colunasOrganizacao = obterColunasPorSetor(elencoMock, 'Organização');
    assert.strictEqual(colunasOrganizacao.length, 1);
    assert.strictEqual(colunasOrganizacao[0].categoria, 'Organização & Apoio');
    assert.strictEqual(colunasOrganizacao[0].total, 1);
  });

  it('deve agrupar os integrantes por macrocategoria em colunas e instrumentos em linhas', () => {
    const colunas = agruparElencoPorMacrocategoria(elencoMock);

    assert.strictEqual(colunas['Bateria'].total, 3);
    assert.strictEqual(colunas['Bateria'].instrumentos['Caixa'].length, 2);
    assert.strictEqual(colunas['Bateria'].instrumentos['Surdo'].length, 1);

    assert.strictEqual(colunas['Sopros'].total, 1);
    assert.strictEqual(colunas['Vozes'].total, 1);
    assert.strictEqual(colunas['Brincantes & Dança'].total, 1);
    assert.strictEqual(colunas['Carro Alegórico'].total, 1);
    assert.strictEqual(colunas['Organização & Apoio'].total, 1);
    assert.strictEqual(colunas['Outros Instrumentos'].total, 0);
  });

  it('deve remover um integrante do elenco pelo ID', () => {
    const listaInicial: Integrante[] = [
      { id: '1', nome: 'André', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
      { id: '2', nome: 'Gabriel', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true }
    ];

    const atualizada = removerIntegranteElenco(listaInicial, '1');
    assert.strictEqual(atualizada.length, 1);
    assert.strictEqual(atualizada[0].id, '2');
    assert.strictEqual(atualizada[0].nome, 'Gabriel');
  });

  it('não deve alterar a lista se o ID não existir', () => {
    const listaInicial: Integrante[] = [
      { id: '1', nome: 'André', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true }
    ];

    const atualizada = removerIntegranteElenco(listaInicial, '999');
    assert.strictEqual(atualizada.length, 1);
    assert.strictEqual(atualizada[0].id, '1');
  });
});
