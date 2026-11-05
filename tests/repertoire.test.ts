import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MusicaRepertorio,
  reordenarRepertorio,
  criarSugestaoMusica
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
});
