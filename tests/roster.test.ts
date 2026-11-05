import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  Integrante,
  agruparElencoPorMacrocategoria,
  MACROCATEGORIAS_ELENCO
} from '../src/data/blocoData';

describe('Estrutura de Colunas do Elenco e Naipes', () => {
  const elencoMock: Integrante[] = [
    { id: '1', nome: 'André', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
    { id: '2', nome: 'Gabriel', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
    { id: '3', nome: 'Shei', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Surdo', ativo: true },
    { id: '4', nome: 'Claudinha', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Trompete', ativo: true },
    { id: '5', nome: 'Patricia', grandeGrupo: 'Vozes', instrumentoOuFuncao: 'Voz Principal', ativo: true },
    { id: '6', nome: 'Lissa', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Estandarte', ativo: true }
  ];

  it('deve listar todas as 6 macrocategorias oficiais do bloco', () => {
    assert.strictEqual(MACROCATEGORIAS_ELENCO.length, 6);
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Bateria'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Sopros'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Vozes'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Outros Instrumentos'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Brincantes & Dança'));
    assert.ok(MACROCATEGORIAS_ELENCO.includes('Organização & Apoio'));
  });

  it('deve agrupar os integrantes por macrocategoria em colunas e instrumentos em linhas', () => {
    const colunas = agruparElencoPorMacrocategoria(elencoMock);

    assert.strictEqual(colunas['Bateria'].total, 3);
    assert.strictEqual(colunas['Bateria'].instrumentos['Caixa'].length, 2);
    assert.strictEqual(colunas['Bateria'].instrumentos['Surdo'].length, 1);

    assert.strictEqual(colunas['Sopros'].total, 1);
    assert.strictEqual(colunas['Vozes'].total, 1);
    assert.strictEqual(colunas['Brincantes & Dança'].total, 1);
    assert.strictEqual(colunas['Outros Instrumentos'].total, 0);
  });
});
