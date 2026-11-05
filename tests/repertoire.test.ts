import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MusicaRepertorio,
  reordenarRepertorio,
  criarSugestaoMusica,
  obterMusicasParaDownload,
  montarTextoPartituraMusica
} from '../src/data/blocoData';

describe('Repertório do Bloco Bicharada', () => {
  const musicasMock: MusicaRepertorio[] = [
    {
      id: 'mus-1',
      titulo: 'Banho de Folhas',
      artistaOriginal: 'Luedji Luna',
      ritmo: 'Afoxé',
      ordemDesfile: 1,
      votosFavoraveis: 34,
      statusCuradoria: 'Confirmada',
      youtubeUrl: 'https://www.youtube.com/watch?v=sample1'
    },
    {
      id: 'mus-2',
      titulo: 'Ilê Pérola Negra',
      artistaOriginal: 'Daniela Mercury',
      ritmo: 'Axé',
      ordemDesfile: 2,
      votosFavoraveis: 29,
      statusCuradoria: 'Confirmada',
      youtubeUrl: 'https://www.youtube.com/watch?v=sample2'
    }
  ];

  it('deve permitir reordenar repertório quando o usuário for da coordenação (isAdmin = true)', () => {
    const reordenadas = reordenarRepertorio(musicasMock, 1, 0, true);
    assert.strictEqual(reordenadas[0].id, 'mus-2');
    assert.strictEqual(reordenadas[0].ordemDesfile, 1);
    assert.strictEqual(reordenadas[1].id, 'mus-1');
    assert.strictEqual(reordenadas[1].ordemDesfile, 2);
  });

  it('deve BLOQUEAR a reordenação quando o usuário NÃO for da coordenação (isAdmin = false)', () => {
    const naoModificadas = reordenarRepertorio(musicasMock, 1, 0, false);
    assert.strictEqual(naoModificadas[0].id, 'mus-1');
    assert.strictEqual(naoModificadas[1].id, 'mus-2');
  });

  it('deve criar sugestão de música com link do YouTube e arquivo de repertório anexado', () => {
    const nova = criarSugestaoMusica({
      titulo: 'Faraó Divindade do Egito',
      artistaOriginal: 'Olodum',
      ritmo: 'Samba-Reggae',
      youtubeUrl: 'https://www.youtube.com/watch?v=farao',
      arquivoRepertorio: 'farao_partitura_trompete.pdf',
      ordemDesfile: 3
    });

    assert.strictEqual(nova.titulo, 'Faraó Divindade do Egito');
    assert.strictEqual(nova.youtubeUrl, 'https://www.youtube.com/watch?v=farao');
    assert.strictEqual(nova.arquivoRepertorio, 'farao_partitura_trompete.pdf');
    assert.strictEqual(nova.statusCuradoria, 'Em Votação');
  });

  it('deve filtrar musicas para download por todas, confirmadas ou selecionadas', () => {
    const lista: MusicaRepertorio[] = [
      { id: '1', titulo: 'M1', artistaOriginal: 'A', ritmo: 'Frevo', ordemDesfile: 1, votosFavoraveis: 10, statusCuradoria: 'Confirmada' },
      { id: '2', titulo: 'M2', artistaOriginal: 'B', ritmo: 'Axé', ordemDesfile: 2, votosFavoraveis: 5, statusCuradoria: 'Em Votação' },
      { id: '3', titulo: 'M3', artistaOriginal: 'C', ritmo: 'Samba', ordemDesfile: 3, votosFavoraveis: 20, statusCuradoria: 'Confirmada' }
    ];

    const todas = obterMusicasParaDownload(lista, 'todas');
    assert.strictEqual(todas.length, 3);

    const confirmadas = obterMusicasParaDownload(lista, 'confirmadas');
    assert.strictEqual(confirmadas.length, 2);
    assert.strictEqual(confirmadas[0].id, '1');
    assert.strictEqual(confirmadas[1].id, '3');

    const selecionadas = obterMusicasParaDownload(lista, 'selecionadas', ['2']);
    assert.strictEqual(selecionadas.length, 1);
    assert.strictEqual(selecionadas[0].id, '2');
  });

  it('deve formatar texto de partitura para o caderno PDF corretamente', () => {
    const musica: MusicaRepertorio[] = [{
      id: '1',
      titulo: 'Banho de Folhas',
      artistaOriginal: 'Luedji Luna',
      ritmo: 'Afoxé',
      ordemDesfile: 1,
      votosFavoraveis: 10,
      statusCuradoria: 'Confirmada',
      partituraTexto: 'Tom: Em | Contra-canto compasso 8'
    }];

    const texto = montarTextoPartituraMusica(musica[0]);
    assert.match(texto, /BANHO DE FOLHAS/);
    assert.match(texto, /Contra-canto compasso 8/);
  });
});

