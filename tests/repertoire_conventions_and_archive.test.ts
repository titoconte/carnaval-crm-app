import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MusicaRepertorio,
  ConvencaoMusical,
  criarConvencaoMusical,
  editarConvencaoMusical,
  removerConvencaoMusical,
  criarSugestaoMusica,
  editarMusicaRepertorio,
  adicionarNovoUsuario,
  UsuarioBloco,
  USUARIOS_INICIAIS
} from '../src/data/blocoData';

/**
 * Bateria de testes para as novas funcionalidades do Repertório, Convenções Musicais,
 * Autocadastro de Usuários e Tratamento de Músicas Arquivadas.
 */
describe('Repertório: Músicas Arquivadas e Convenções Musicais', () => {
  it('deve permitir definir o status da música como "Arquivada" na edição', () => {
    const musicasIniciais: MusicaRepertorio[] = [
      {
        id: 'mus-1',
        titulo: 'Música Antiga',
        artistaOriginal: 'Banda X',
        ritmo: 'Frevo',
        ordemDesfile: 1,
        votosFavoraveis: 10,
        statusCuradoria: 'Em Votação'
      }
    ];

    const atualizadas = editarMusicaRepertorio(
      musicasIniciais,
      'mus-1',
      { statusCuradoria: 'Arquivada' },
      true
    );

    assert.strictEqual(atualizadas[0].statusCuradoria, 'Arquivada');
  });

  it('deve filtrar corretamente músicas ativas vs arquivadas', () => {
    const lista: MusicaRepertorio[] = [
      {
        id: 'mus-1',
        titulo: 'Música Ativa 1',
        artistaOriginal: 'Banda 1',
        ritmo: 'Axé',
        ordemDesfile: 1,
        votosFavoraveis: 5,
        statusCuradoria: 'Confirmada'
      },
      {
        id: 'mus-2',
        titulo: 'Música Arquivada 1',
        artistaOriginal: 'Banda 2',
        ritmo: 'Samba',
        ordemDesfile: 2,
        votosFavoraveis: 2,
        statusCuradoria: 'Arquivada'
      },
      {
        id: 'mus-3',
        titulo: 'Música Legado Corte',
        artistaOriginal: 'Banda 3',
        ritmo: 'Frevo',
        ordemDesfile: 3,
        votosFavoraveis: 1,
        statusCuradoria: 'Sugerida para Corte' as any
      }
    ];

    const arquivadas = lista.filter(
      m => m.statusCuradoria === 'Arquivada' || (m.statusCuradoria as any) === 'Sugerida para Corte'
    );

    assert.strictEqual(arquivadas.length, 2);
    assert.strictEqual(arquivadas[0].titulo, 'Música Arquivada 1');
    assert.strictEqual(arquivadas[1].titulo, 'Música Legado Corte');
  });

  it('deve criar uma Convenção Musical com múltiplos vídeos e documentos', () => {
    const novaConv = criarConvencaoMusical({
      titulo: 'Paradinha do Refrão - Tropicália',
      categoria: 'Bateria',
      descricao: 'Contagem de 4 tempos na caixa, parada seca no 4. Volta com tamborim.',
      videoUrls: [
        { rotulo: 'Vídeo Tutorial', url: 'https://youtube.com/watch?v=tutorial1' },
        { rotulo: 'Ensaio Geral', url: 'https://youtube.com/watch?v=ensaio1' }
      ],
      documentoUrls: [
        { nome: 'partitura-paradinha.pdf', url: 'https://blob.vercel-storage.com/partitura.pdf' }
      ]
    });

    assert.ok(novaConv.id.startsWith('conv-'));
    assert.strictEqual(novaConv.titulo, 'Paradinha do Refrão - Tropicália');
    assert.strictEqual(novaConv.categoria, 'Bateria');
    assert.strictEqual(novaConv.videoUrls?.length, 2);
    assert.strictEqual(novaConv.documentoUrls?.length, 1);
  });

  it('deve editar uma Convenção Musical apenas se for coordenador', () => {
    const convencoes: ConvencaoMusical[] = [
      {
        id: 'conv-1',
        titulo: 'Convenção Original',
        categoria: 'Metais',
        descricao: 'Entrada na 2ª estrofe'
      }
    ];

    // Tentativa como não coordenador (isAdmin = false)
    const semPermissao = editarConvencaoMusical(
      convencoes,
      'conv-1',
      { titulo: 'Tentativa Não Autorizada' },
      false
    );
    assert.strictEqual(semPermissao[0].titulo, 'Convenção Original');

    // Tentativa como coordenador (isAdmin = true)
    const comPermissao = editarConvencaoMusical(
      convencoes,
      'conv-1',
      { titulo: 'Convenção Atualizada pelo Maestro', categoria: 'Geral' },
      true
    );
    assert.strictEqual(comPermissao[0].titulo, 'Convenção Atualizada pelo Maestro');
    assert.strictEqual(comPermissao[0].categoria, 'Geral');
  });

  it('deve remover uma Convenção Musical apenas se for coordenador', () => {
    const convencoes: ConvencaoMusical[] = [
      { id: 'conv-1', titulo: 'Conv 1' },
      { id: 'conv-2', titulo: 'Conv 2' }
    ];

    // Não coordenador
    const mantidas = removerConvencaoMusical(convencoes, 'conv-1', false);
    assert.strictEqual(mantidas.length, 2);

    // Coordenador
    const removidas = removerConvencaoMusical(convencoes, 'conv-1', true);
    assert.strictEqual(removidas.length, 1);
    assert.strictEqual(removidas[0].id, 'conv-2');
  });
});

describe('Autocadastro e Primeiro Login de Integrantes', () => {
  it('deve permitir autocadastro de um novo integrante com perfil "bicho"', () => {
    const usuarios = [...USUARIOS_INICIAIS];
    const resultado = adicionarNovoUsuario(usuarios, {
      username: 'novo.bicho',
      senha: 'bicho2027',
      perfil: 'bicho'
    });

    assert.strictEqual(resultado.sucesso, true);
    const criado = resultado.usuariosAtualizados.find(u => u.username === 'novo.bicho');
    assert.ok(criado);
    assert.strictEqual(criado?.perfil, 'bicho');
  });

  it('deve recusar username duplicado no autocadastro (case-insensitive)', () => {
    const usuarios = [...USUARIOS_INICIAIS];
    const resultado = adicionarNovoUsuario(usuarios, {
      username: 'AdminBixarada', // mesmo que adminbixarada
      senha: 'qualquersenha',
      perfil: 'bicho'
    });

    assert.strictEqual(resultado.sucesso, false);
    assert.ok(resultado.erro?.includes('já está em uso'));
  });

  it('deve validar tamanho mínimo de usuário (>=3) e senha (>=4)', () => {
    const usuarios = [...USUARIOS_INICIAIS];

    const curtoUsuario = adicionarNovoUsuario(usuarios, {
      username: 'ab',
      senha: '12345',
      perfil: 'bicho'
    });
    assert.strictEqual(curtoUsuario.sucesso, false);

    const curtaSenha = adicionarNovoUsuario(usuarios, {
      username: 'bicho_valido',
      senha: '123',
      perfil: 'bicho'
    });
    assert.strictEqual(curtaSenha.sucesso, false);
  });
});

