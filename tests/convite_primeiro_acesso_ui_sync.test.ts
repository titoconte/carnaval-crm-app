import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LoginModal from '../src/components/LoginModal';
import * as blocoData from '../src/data/blocoData';
import { USUARIOS_INICIAIS, autenticarUsuario } from '../src/data/blocoData';

/**
 * Testes de regressão para o fluxo completo do Link de Convite de Primeiro Acesso (?convite=bicho),
 * cobrindo detecção de URL, renderização do LoginModal em modo cadastro, integração no page.tsx
 * e proteção contra perda de conta recém-criada durante sincronização com o banco.
 */
describe('Regressão: Link de Criação de Conta / Primeiro Acesso (?convite=bicho)', () => {
  it('detectarAcessoConvite deve identificar ?convite=bicho e variações maiúsculas/hashes', () => {
    const detectarAcessoConvite = (blocoData as any).detectarAcessoConvite;
    assert.strictEqual(typeof detectarAcessoConvite, 'function', 'detectarAcessoConvite deve existir em blocoData');
    assert.strictEqual(detectarAcessoConvite('?convite=bicho', ''), true);
    assert.strictEqual(detectarAcessoConvite('?convite=BICHO', ''), true);
    assert.strictEqual(detectarAcessoConvite('?convite=true', ''), true);
    assert.strictEqual(detectarAcessoConvite('?cadastro=true', ''), true);
    assert.strictEqual(detectarAcessoConvite('?primeiro-acesso=true', ''), true);
    assert.strictEqual(detectarAcessoConvite('', '#primeiro-acesso'), true);
    assert.strictEqual(detectarAcessoConvite('', '#convite'), true);
    assert.strictEqual(detectarAcessoConvite('', ''), false);
    assert.strictEqual(detectarAcessoConvite('?aba=tarefas', ''), false);
  });

  it('LoginModal deve renderizar formulário de Primeiro Acesso (e não Login) quando isModoConvite=true', () => {
    const htmlConvite = renderToStaticMarkup(
      React.createElement(LoginModal, {
        isOpen: true,
        onClose: () => {},
        onLoginSuccess: () => {},
        usuarios: USUARIOS_INICIAIS,
        isModoConvite: true
      })
    );

    assert.ok(htmlConvite.includes('Primeiro Acesso'), 'Deve exibir título Primeiro Acesso');
    assert.ok(htmlConvite.includes('Convite Exclusivo'), 'Deve exibir selo Convite Exclusivo');
    assert.ok(htmlConvite.includes('Confirme a Senha'), 'Deve exibir campo de confirmação de senha');
    assert.ok(htmlConvite.includes('Concluir Cadastro'), 'Deve exibir botão de concluir cadastro');
    assert.ok(!htmlConvite.includes('Entrar no Bloco'), 'Não deve abrir pedindo login normal');
  });

  it('page.tsx deve repassar isModoConvite={modoConvite} e onCadastrarUsuario para <LoginModal />', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
    const conteudoPage = fs.readFileSync(pagePath, 'utf-8');

    const matchLoginModal = conteudoPage.match(/<LoginModal[\s\S]*?\/>/);
    assert.ok(matchLoginModal, 'Componente <LoginModal /> deve estar presente em page.tsx');

    const blocoModal = matchLoginModal[0];
    assert.ok(
      blocoModal.includes('isModoConvite={modoConvite}'),
      'page.tsx DEVE passar isModoConvite={modoConvite} ao <LoginModal /> para abrir em modo cadastro'
    );
    assert.ok(
      blocoModal.includes('onCadastrarUsuario={'),
      'page.tsx DEVE passar onCadastrarUsuario ao <LoginModal /> para persistir a nova conta'
    );
  });

  it('autocadastrarPorConvite deve criar conta bicho sanitizada, validar confirmação de senha e permitir login posterior', () => {
    const autocadastrarPorConvite = (blocoData as any).autocadastrarPorConvite;
    assert.strictEqual(typeof autocadastrarPorConvite, 'function', 'autocadastrarPorConvite deve existir em blocoData');
    const erroConfirmacao = autocadastrarPorConvite(USUARIOS_INICIAIS, {
      username: 'novo.bicho',
      senha: '1234',
      confirmarSenha: '9999'
    });
    assert.strictEqual(erroConfirmacao.sucesso, false);
    assert.ok(erroConfirmacao.erro?.includes('coincidem'));

    const sucesso = autocadastrarPorConvite(USUARIOS_INICIAIS, {
      username: '  Maria Silva  ',
      senha: '  festa2027  ',
      confirmarSenha: '  festa2027  '
    });
    assert.strictEqual(sucesso.sucesso, true);
    assert.ok(sucesso.novoUsuario);
    assert.strictEqual(sucesso.novoUsuario?.username, 'mariasilva');
    assert.strictEqual(sucesso.novoUsuario?.perfil, 'bicho');

    const autenticado = autenticarUsuario(sucesso.usuariosAtualizados, 'mariasilva', 'festa2027');
    assert.ok(autenticado, 'Usuário recém-cadastrado deve conseguir autenticar normalmente depois');
    assert.strictEqual(autenticado?.id, sucesso.novoUsuario?.id);
  });

  it('mesclarUsuariosSemPerda deve impedir que leitura concorrente do servidor apague usuário recém-cadastrado', () => {
    const autocadastrarPorConvite = (blocoData as any).autocadastrarPorConvite;
    const mesclarUsuariosSemPerda = (blocoData as any).mesclarUsuariosSemPerda;
    assert.strictEqual(typeof mesclarUsuariosSemPerda, 'function', 'mesclarUsuariosSemPerda deve existir em blocoData');

    const cadastro = autocadastrarPorConvite(USUARIOS_INICIAIS, {
      username: 'pedro.surdo',
      senha: 'carnaval',
      confirmarSenha: 'carnaval'
    });
    assert.ok(cadastro.novoUsuario);

    // Simula resposta antiga do GET /api/db/sync contendo apenas USUARIOS_INICIAIS
    const mesclados = mesclarUsuariosSemPerda(USUARIOS_INICIAIS, [cadastro.novoUsuario!]);
    assert.strictEqual(mesclados.length, USUARIOS_INICIAIS.length + 1);
    assert.ok(mesclados.some(u => u.username === 'pedro.surdo'));
  });
});
