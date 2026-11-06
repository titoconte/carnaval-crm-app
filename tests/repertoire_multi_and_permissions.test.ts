import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MusicaRepertorio,
  ItemLetraCifra,
  criarSugestaoMusica,
  editarMusicaRepertorio,
  removerMusicaRepertorio,
  editarItemLetraCifra,
  removerItemLetraCifra
} from '../src/data/blocoData';

/**
 * Suíte de testes para repertório com múltiplos links do YouTube, múltiplos arquivos
 * e permissão restrita de edição/exclusão exclusiva para coordenadores.
 */
describe('Repertório: Múltiplos Arquivos, Links do YouTube e Permissões de Coordenação', () => {
  /**
   * Testa a criação de música com múltiplas opções de ritmos no YouTube e múltiplos arquivos.
   */
  it('deve criar sugestão de música com múltiplos links do YouTube e múltiplos arquivos anexados', () => {
    const nova = criarSugestaoMusica({
      titulo: 'Baianidade Nagô',
      artistaOriginal: 'Banda Mel',
      ritmo: 'Axé / Samba-Reggae',
      youtubeLinks: [
        { rotulo: 'Versão Axé Tradicional', url: 'https://www.youtube.com/watch?v=axe1' },
        { rotulo: 'Versão Samba-Reggae Olodum', url: 'https://www.youtube.com/watch?v=olodum2' },
        { rotulo: 'Arranjo Rápido de Rua', url: 'https://www.youtube.com/watch?v=rua3' }
      ],
      arquivos: [
        { nome: 'baianidade_metais_trompete.pdf', url: 'https://blob.vercel.com/trompete.pdf' },
        { nome: 'baianidade_cifra_harmonia.pdf', url: 'https://blob.vercel.com/harmonia.pdf' },
        { nome: 'guia_ritmica_surdo.mp3', url: 'https://blob.vercel.com/surdo.mp3' }
      ],
      ordemDesfile: 5
    });

    assert.strictEqual(nova.titulo, 'Baianidade Nagô');
    assert.strictEqual(nova.youtubeLinks?.length, 3);
    assert.strictEqual(nova.youtubeLinks?.[0].rotulo, 'Versão Axé Tradicional');
    assert.strictEqual(nova.youtubeLinks?.[1].rotulo, 'Versão Samba-Reggae Olodum');
    assert.strictEqual(nova.youtubeUrl, 'https://www.youtube.com/watch?v=axe1'); // Retrocompatibilidade

    assert.strictEqual(nova.arquivos?.length, 3);
    assert.strictEqual(nova.arquivos?.[0].nome, 'baianidade_metais_trompete.pdf');
    assert.strictEqual(nova.arquivoRepertorio, 'baianidade_metais_trompete.pdf'); // Retrocompatibilidade
    assert.strictEqual(nova.partituraUrl, 'https://blob.vercel.com/trompete.pdf'); // Retrocompatibilidade
  });

  /**
   * Testa a permissão de edição exclusiva para coordenadores (isAdmin = true).
   */
  it('deve permitir que a coordenação (isAdmin = true) edite os dados, links e arquivos da música', () => {
    const musicas: MusicaRepertorio[] = [
      {
        id: 'mus-edit-1',
        titulo: 'Faraó',
        artistaOriginal: 'Olodum',
        ritmo: 'Samba-Reggae',
        ordemDesfile: 1,
        votosFavoraveis: 10,
        statusCuradoria: 'Em Votação',
        youtubeLinks: [{ rotulo: 'Original', url: 'https://youtube.com/1' }],
        arquivos: [{ nome: 'partitura1.pdf' }]
      }
    ];

    const atualizadas = editarMusicaRepertorio(
      musicas,
      'mus-edit-1',
      {
        titulo: 'Faraó Divindade do Egito',
        statusCuradoria: 'Confirmada',
        youtubeLinks: [
          { rotulo: 'Versão 2027 Nova', url: 'https://youtube.com/2027' },
          { rotulo: 'Gravação Ensaio', url: 'https://youtube.com/ensaio' }
        ],
        arquivos: [
          { nome: 'partitura_completa_metais.pdf', url: 'https://blob/metais.pdf' }
        ]
      },
      true // isAdmin = true
    );

    assert.strictEqual(atualizadas[0].titulo, 'Faraó Divindade do Egito');
    assert.strictEqual(atualizadas[0].statusCuradoria, 'Confirmada');
    assert.strictEqual(atualizadas[0].youtubeLinks?.length, 2);
    assert.strictEqual(atualizadas[0].arquivos?.length, 1);
    assert.strictEqual(atualizadas[0].arquivos?.[0].nome, 'partitura_completa_metais.pdf');
  });

  /**
   * Testa o bloqueio de edição quando o usuário NÃO for coordenador (isAdmin = false).
   */
  it('deve BLOQUEAR a edição de músicas quando o usuário NÃO for coordenador (isAdmin = false)', () => {
    const musicas: MusicaRepertorio[] = [
      {
        id: 'mus-lock-1',
        titulo: 'Vassourinhas',
        artistaOriginal: 'Frevo Clássico',
        ritmo: 'Frevo',
        ordemDesfile: 1,
        votosFavoraveis: 15,
        statusCuradoria: 'Confirmada'
      }
    ];

    const resultadoTentativa = editarMusicaRepertorio(
      musicas,
      'mus-lock-1',
      {
        titulo: 'Tentativa de Hack do Folião',
        statusCuradoria: 'Sugerida para Corte'
      },
      false // isAdmin = false
    );

    // Nada deve ser alterado
    assert.strictEqual(resultadoTentativa[0].titulo, 'Vassourinhas');
    assert.strictEqual(resultadoTentativa[0].statusCuradoria, 'Confirmada');
  });

  /**
   * Testa a exclusão de músicas e reordenação automática pela coordenação.
   */
  it('deve permitir que o coordenador exclua músicas e recalcule a ordem de cortejo', () => {
    const musicas: MusicaRepertorio[] = [
      { id: '1', titulo: 'M1', artistaOriginal: 'A', ritmo: 'Axé', ordemDesfile: 1, votosFavoraveis: 5, statusCuradoria: 'Confirmada' },
      { id: '2', titulo: 'M2', artistaOriginal: 'B', ritmo: 'Frevo', ordemDesfile: 2, votosFavoraveis: 3, statusCuradoria: 'Em Votação' },
      { id: '3', titulo: 'M3', artistaOriginal: 'C', ritmo: 'Afoxé', ordemDesfile: 3, votosFavoraveis: 8, statusCuradoria: 'Confirmada' }
    ];

    const aposRemocao = removerMusicaRepertorio(musicas, '2', true);
    assert.strictEqual(aposRemocao.length, 2);
    assert.strictEqual(aposRemocao[0].id, '1');
    assert.strictEqual(aposRemocao[0].ordemDesfile, 1);
    assert.strictEqual(aposRemocao[1].id, '3');
    assert.strictEqual(aposRemocao[1].ordemDesfile, 2); // Reindexado
  });

  /**
   * Testa o bloqueio de exclusão de músicas por não-coordenadores.
   */
  it('deve BLOQUEAR a exclusão de músicas se não for coordenador', () => {
    const musicas: MusicaRepertorio[] = [
      { id: '1', titulo: 'M1', artistaOriginal: 'A', ritmo: 'Axé', ordemDesfile: 1, votosFavoraveis: 5, statusCuradoria: 'Confirmada' }
    ];

    const tentativa = removerMusicaRepertorio(musicas, '1', false);
    assert.strictEqual(tentativa.length, 1);
    assert.strictEqual(tentativa[0].id, '1');
  });

  /**
   * Testa a permissão de edição e exclusão de arquivos/cifras no caderno de letras.
   */
  it('deve permitir edição e exclusão de cifras no caderno apenas para coordenadores', () => {
    const itens: ItemLetraCifra[] = [
      {
        id: 'cifra-1',
        titulo: 'We Are Carnaval',
        tipo: 'Cifra',
        autorUpload: 'Fael',
        dataUpload: '2026-11-06',
        conteudoTexto: 'D G A'
      }
    ];

    // Tentativa bloqueada para não-coordenador
    const tentativaBloqueada = editarItemLetraCifra(itens, 'cifra-1', { titulo: 'Novo Nome' }, false);
    assert.strictEqual(tentativaBloqueada[0].titulo, 'We Are Carnaval');

    // Edição permitida para coordenador
    const editado = editarItemLetraCifra(itens, 'cifra-1', { titulo: 'We Are Carnaval (Metais)', conteudoTexto: 'D G A Bm' }, true);
    assert.strictEqual(editado[0].titulo, 'We Are Carnaval (Metais)');
    assert.strictEqual(editado[0].conteudoTexto, 'D G A Bm');

    // Remoção bloqueada para não-coordenador
    const remocaoBloqueada = removerItemLetraCifra(editado, 'cifra-1', false);
    assert.strictEqual(remocaoBloqueada.length, 1);

    // Remoção permitida para coordenador
    const removido = removerItemLetraCifra(editado, 'cifra-1', true);
    assert.strictEqual(removido.length, 0);
  });
});

