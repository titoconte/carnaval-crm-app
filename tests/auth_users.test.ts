import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  USUARIOS_INICIAIS, 
  autenticarUsuario, 
  adicionarNovoUsuario, 
  removerUsuario 
} from '../src/data/blocoData';

describe('Sistema de Autenticação e Gestão de Usuários do Bloco', () => {
  it('deve autenticar com sucesso o coordenador mestre com adminbixarada e senha Hluz@1006', () => {
    const usuario = autenticarUsuario(USUARIOS_INICIAIS, 'adminbixarada', 'Hluz@1006');
    assert.ok(usuario, 'Usuário deveria ter sido autenticado');
    assert.strictEqual(usuario?.username, 'adminbixarada');
    assert.strictEqual(usuario?.perfil, 'coordenador');
  });

  it('deve rejeitar credenciais com senha incorreta', () => {
    const usuario = autenticarUsuario(USUARIOS_INICIAIS, 'adminbixarada', 'senhaErrada');
    assert.strictEqual(usuario, null, 'Login com senha errada deve retornar null');
  });

  it('deve rejeitar login com usuário inexistente', () => {
    const usuario = autenticarUsuario(USUARIOS_INICIAIS, 'usuarioFantasma', 'Hluz@1006');
    assert.strictEqual(usuario, null, 'Login com usuário inexistente deve retornar null');
  });

  it('deve permitir adicionar um novo usuário do tipo Bicho', () => {
    const res = adicionarNovoUsuario(USUARIOS_INICIAIS, {
      username: 'bicharada_foliao',
      senha: 'bicho2027',
      perfil: 'bicho'
    });

    assert.strictEqual(res.sucesso, true);
    assert.strictEqual(res.usuariosAtualizados.length, USUARIOS_INICIAIS.length + 1);

    const novo = res.usuariosAtualizados.find(u => u.username === 'bicharada_foliao');
    assert.ok(novo);
    assert.strictEqual(novo?.perfil, 'bicho');
  });

  it('deve permitir adicionar um novo usuário do tipo Coordenador', () => {
    const res = adicionarNovoUsuario(USUARIOS_INICIAIS, {
      username: 'regina_coord',
      senha: 'carnaval_coord',
      perfil: 'coordenador'
    });

    assert.strictEqual(res.sucesso, true);
    const novo = res.usuariosAtualizados.find(u => u.username === 'regina_coord');
    assert.ok(novo);
    assert.strictEqual(novo?.perfil, 'coordenador');
  });

  it('deve impedir criação de usuário com nome já existente', () => {
    const res = adicionarNovoUsuario(USUARIOS_INICIAIS, {
      username: 'adminbixarada',
      senha: 'outraSenha123',
      perfil: 'coordenador'
    });

    assert.strictEqual(res.sucesso, false);
    assert.ok(res.erro?.includes('já está em uso'));
  });

  it('deve validar tamanho mínimo de username e senha', () => {
    const resUserCurto = adicionarNovoUsuario(USUARIOS_INICIAIS, {
      username: 'ab',
      senha: '12345',
      perfil: 'bicho'
    });
    assert.strictEqual(resUserCurto.sucesso, false);

    const resSenhaCurta = adicionarNovoUsuario(USUARIOS_INICIAIS, {
      username: 'novouser',
      senha: '12',
      perfil: 'bicho'
    });
    assert.strictEqual(resSenhaCurta.sucesso, false);
  });

  it('deve remover um usuário do sistema pelo ID', () => {
    const baseComDois = [
      ...USUARIOS_INICIAIS,
      {
        id: 'user-para-deletar',
        username: 'temporario',
        senha: 'temp123',
        perfil: 'bicho' as const,
        criadoEm: '2026-11-05'
      }
    ];

    const atualizados = removerUsuario(baseComDois, 'user-para-deletar');
    assert.strictEqual(atualizados.length, USUARIOS_INICIAIS.length);
    assert.strictEqual(atualizados.some(u => u.id === 'user-para-deletar'), false);
  });
});
