import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  FATO_PRESENCA_EVENTOS_TABLE_SQL,
  listarPresencasNoBanco,
  salvarPresencaNoBanco,
  salvarPresencasEmLoteNoBanco,
  excluirPresencaNoBanco,
  validarCoordenadorNoBanco,
  resetDbPool
} from '../src/lib/db';
import { NextRequest } from 'next/server';
import {
  GET as getPresencasApi,
  POST as postPresencasApi,
  PUT as putPresencasApi,
  DELETE as deletePresencasApi
} from '../src/app/api/presencas/route';
import { RegistroPresencaEvento } from '../src/data/blocoData';

/**
 * Suíte de testes da tabela fato fato_presenca_eventos no banco de dados
 * e da autorização estrita de coordenadores na API /api/presencas.
 */
describe('Tabela Fato de Presenças no DB e API Protegida (/api/presencas)', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_URL_NON_POOLING;
    delete process.env.DATABASE_URL;
    resetDbPool();
  });

  afterEach(() => {
    process.env = { ...envBackup };
    resetDbPool();
  });

  it('deve definir DDL da tabela fato fato_presenca_eventos com chaves dimensionais e unicidade por evento e integrante', () => {
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('CREATE TABLE IF NOT EXISTS fato_presenca_eventos'));
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('evento_id VARCHAR(100) NOT NULL'));
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('integrante_id VARCHAR(100) NOT NULL'));
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('integrante_nome VARCHAR(150) NOT NULL'));
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('grande_grupo VARCHAR(100) NOT NULL'));
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('instrumento_ou_funcao VARCHAR(120) NOT NULL'));
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('status VARCHAR(30) NOT NULL'));
    assert.ok(FATO_PRESENCA_EVENTOS_TABLE_SQL.includes('UNIQUE (evento_id, integrante_id)'));
  });

  it('deve operar com fallback gracioso nas funções de banco quando POSTGRES_URL não estiver configurada', async () => {
    const registro: RegistroPresencaEvento = {
      id: 'pres-ev1-int1',
      eventoId: 'ev-1',
      integranteId: 'int-1',
      integranteNome: 'Bel Chagas',
      grandeGrupo: 'Bateria',
      instrumentoOuFuncao: 'Caixa',
      eventoData: '2027-01-15',
      eventoTipo: 'Ensaio',
      status: 'Presente',
      registradoPor: 'adminbixarada',
      registradoEm: '2027-01-15T19:30:00.000Z'
    };

    const lista = await listarPresencasNoBanco();
    assert.deepStrictEqual(lista, []);

    const salvo = await salvarPresencaNoBanco(registro);
    assert.strictEqual(salvo, false);

    const lote = await salvarPresencasEmLoteNoBanco([registro]);
    assert.strictEqual(lote, false);

    const excluido = await excluirPresencaNoBanco('ev-1', 'int-1');
    assert.strictEqual(excluido, false);
  });

  it('deve validar credenciais de coordenador mestre e rejeitar usuários inválidos ou perfil bicho', async () => {
    const coordValido = await validarCoordenadorNoBanco('adminbixarada', 'Hluz@1006');
    assert.strictEqual(coordValido, true);

    const senhaIncorreta = await validarCoordenadorNoBanco('adminbixarada', 'errada');
    assert.strictEqual(senhaIncorreta, false);

    const usuarioInexistente = await validarCoordenadorNoBanco('bicho_comum', '1234');
    assert.strictEqual(usuarioInexistente, false);
  });

  it('deve retornar 403 Forbidden em GET, POST, PUT e DELETE de /api/presencas para quem não for coordenador', async () => {
    const reqGetAnon = new NextRequest('http://localhost/api/presencas', { method: 'GET' });
    const resGetAnon = await getPresencasApi(reqGetAnon);
    assert.strictEqual(resGetAnon.status, 403);

    const reqPostNaoCoord = new NextRequest('http://localhost/api/presencas', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-coord-user': 'bicho_qualquer',
        'x-coord-pass': '1234'
      },
      body: JSON.stringify({
        registro: {
          id: 'pres-1',
          eventoId: 'ev-1',
          integranteId: 'int-1',
          integranteNome: 'Teste',
          grandeGrupo: 'Bateria',
          instrumentoOuFuncao: 'Caixa',
          eventoData: '2027-01-15',
          eventoTipo: 'Ensaio',
          status: 'Presente',
          registradoEm: '2027-01-15T19:30:00.000Z'
        }
      })
    });
    const resPost = await postPresencasApi(reqPostNaoCoord);
    assert.strictEqual(resPost.status, 403);

    const reqPutAnon = new NextRequest('http://localhost/api/presencas', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    });
    const resPut = await putPresencasApi(reqPutAnon);
    assert.strictEqual(resPut.status, 403);

    const reqDeleteAnon = new NextRequest('http://localhost/api/presencas?eventoId=ev-1&integranteId=int-1', {
      method: 'DELETE'
    });
    const resDelete = await deletePresencasApi(reqDeleteAnon);
    assert.strictEqual(resDelete.status, 403);
  });

  it('deve autorizar coordenador autenticado na API /api/presencas e rejeitar tipos de eventos não elegíveis', async () => {
    const headersCoord = {
      'content-type': 'application/json',
      'x-coord-user': 'adminbixarada',
      'x-coord-pass': 'Hluz@1006'
    };

    const reqGet = new NextRequest('http://localhost/api/presencas', {
      method: 'GET',
      headers: headersCoord
    });
    const resGet = await getPresencasApi(reqGet);
    assert.strictEqual(resGet.status, 200);
    const bodyGet = await resGet.json();
    assert.strictEqual(bodyGet.configured, false);
    assert.deepStrictEqual(bodyGet.presencas, []);

    // Tentativa de registrar presença em Desfile Oficial deve retornar 400
    const reqPostInvalido = new NextRequest('http://localhost/api/presencas', {
      method: 'POST',
      headers: headersCoord,
      body: JSON.stringify({
        registro: {
          id: 'pres-ev-desfile-int-1',
          eventoId: 'ev-desfile',
          integranteId: 'int-1',
          integranteNome: 'Bel Chagas',
          grandeGrupo: 'Bateria',
          instrumentoOuFuncao: 'Caixa',
          eventoData: '2027-02-08',
          eventoTipo: 'Desfile Oficial',
          status: 'Presente',
          registradoEm: '2027-02-08T14:30:00.000Z'
        }
      })
    });
    const resPostInvalido = await postPresencasApi(reqPostInvalido);
    assert.strictEqual(resPostInvalido.status, 400);

    // Registro válido para Ensaio é aceito (modo fallback quando DB não configurado)
    const reqPostValido = new NextRequest('http://localhost/api/presencas', {
      method: 'POST',
      headers: headersCoord,
      body: JSON.stringify({
        registro: {
          id: 'pres-ev1-int1',
          eventoId: 'ev-1',
          integranteId: 'int-1',
          integranteNome: 'Bel Chagas',
          grandeGrupo: 'Bateria',
          instrumentoOuFuncao: 'Caixa',
          eventoData: '2027-01-15',
          eventoTipo: 'Ensaio',
          status: 'Presente',
          registradoEm: '2027-01-15T19:30:00.000Z'
        }
      })
    });
    const resPostValido = await postPresencasApi(reqPostValido);
    assert.strictEqual(resPostValido.status, 200);

    // DELETE autorizado sem eventoId retorna 400
    const reqDelSemId = new NextRequest('http://localhost/api/presencas', {
      method: 'DELETE',
      headers: headersCoord
    });
    const resDelSemId = await deletePresencasApi(reqDelSemId);
    assert.strictEqual(resDelSemId.status, 400);

    // DELETE autorizado com eventoId retorna 200
    const reqDelValido = new NextRequest('http://localhost/api/presencas?eventoId=ev-1&integranteId=int-1', {
      method: 'DELETE',
      headers: headersCoord
    });
    const resDelValido = await deletePresencasApi(reqDelValido);
    assert.strictEqual(resDelValido.status, 200);
  });
});
