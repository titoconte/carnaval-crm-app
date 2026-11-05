import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CorPaletaAnual,
  ArquivoArteMidia,
  PostInstagramPlanejado,
  TemaAnoBloco,
  TEMA_ANO_INICIAL,
  adicionarCorPaleta,
  removerCorPaleta,
  adicionarArquivoArte,
  filtrarArquivosArte,
  gerarTextoLegendaInstagram,
  adicionarPostPlanejado,
  atualizarTemaAno
} from '../src/data/blocoData';

describe('Gestão de Mídia, Cores do Ano e Instagram', () => {
  const coresMock: CorPaletaAnual[] = [
    { id: 'c1', ano: 2027, nome: 'Rosa Choque', hex: '#E6007E', descricaoUso: 'Estandarte' },
    { id: 'c2', ano: 2027, nome: 'Verde Menta', hex: '#00D287', descricaoUso: 'Bateria' }
  ];

  it('deve adicionar uma nova cor à paleta anual', () => {
    const atualizadas = adicionarCorPaleta(coresMock, {
      ano: 2027,
      nome: 'Azul Turquesa',
      hex: '#00B4D8',
      descricaoUso: 'Ala dos Pernaltas'
    });

    assert.strictEqual(atualizadas.length, 3);
    assert.strictEqual(atualizadas[2].nome, 'Azul Turquesa');
    assert.strictEqual(atualizadas[2].hex, '#00B4D8');
  });

  it('deve remover uma cor da paleta anual pelo ID', () => {
    const atualizadas = removerCorPaleta(coresMock, 'c1');
    assert.strictEqual(atualizadas.length, 1);
    assert.strictEqual(atualizadas[0].id, 'c2');
  });

  it('deve cadastrar um novo arquivo de arte gráfica', () => {
    const artes: ArquivoArteMidia[] = [];
    const atualizadas = adicionarArquivoArte(artes, {
      titulo: 'Logo Vetorial 2027',
      categoria: 'Logotipos',
      nomeArquivo: 'logo_bicharada_2027.svg',
      formatoExtensao: 'SVG',
      tamanhoAproximado: '1.2 MB',
      dimensoesOuUso: 'Vetor escalável'
    });

    assert.strictEqual(atualizadas.length, 1);
    assert.strictEqual(atualizadas[0].titulo, 'Logo Vetorial 2027');
    assert.strictEqual(atualizadas[0].categoria, 'Logotipos');
    assert.strictEqual(atualizadas[0].formatoExtensao, 'SVG');
    assert.ok(atualizadas[0].id.startsWith('arte-'));
  });

  it('deve filtrar arquivos de arte por categoria e busca textual', () => {
    const artesMock: ArquivoArteMidia[] = [
      {
        id: 'a1',
        titulo: 'Logo Principal',
        categoria: 'Logotipos',
        nomeArquivo: 'logo.png',
        formatoExtensao: 'PNG',
        dataUpload: '2026-11-01'
      },
      {
        id: 'a2',
        titulo: 'Lambe-lambe Formato A3',
        categoria: 'Cartazes & Lambes',
        nomeArquivo: 'lambe.pdf',
        formatoExtensao: 'PDF',
        dataUpload: '2026-11-02'
      }
    ];

    const apenasLogos = filtrarArquivosArte(artesMock, 'Logotipos', '');
    assert.strictEqual(apenasLogos.length, 1);
    assert.strictEqual(apenasLogos[0].id, 'a1');

    const busca = filtrarArquivosArte(artesMock, 'Todas', 'lambe');
    assert.strictEqual(busca.length, 1);
    assert.strictEqual(busca[0].id, 'a2');
  });

  it('deve gerar texto formatado da legenda do Instagram com hashtags e call-to-action', () => {
    const postMock: PostInstagramPlanejado = {
      id: 'p1',
      titulo: 'Ensaio Aberto',
      tipo: 'Feed',
      legenda: 'Sexta-feira tem ensaio geral na Costeira!',
      hashtags: ['Bicharada2027', 'CarnavalFloripa'],
      dataProgramada: '2026-11-06 19:00',
      status: 'Pronto para Postar'
    };

    const texto = gerarTextoLegendaInstagram(postMock, '@bicharadafloripa');
    assert.match(texto, /Sexta-feira tem ensaio geral/);
    assert.match(texto, /@bicharadafloripa/);
    assert.match(texto, /#Bicharada2027/);
    assert.match(texto, /#CarnavalFloripa/);
  });

  it('deve adicionar um novo post planejado à grade do Instagram', () => {
    const posts: PostInstagramPlanejado[] = [];
    const atualizados = adicionarPostPlanejado(posts, {
      titulo: 'Oficina de Fantasias',
      tipo: 'Stories',
      legenda: 'Venha criar adereços sustentáveis!',
      hashtags: ['OficinaBicharada'],
      dataProgramada: '2026-11-23 19:00',
      status: 'Planejado'
    });

    assert.strictEqual(atualizados.length, 1);
    assert.strictEqual(atualizados[0].titulo, 'Oficina de Fantasias');
    assert.strictEqual(atualizados[0].tipo, 'Stories');
  });

  it('deve carregar o tema do ano inicial com título, fantasia e descrição de cores', () => {
    assert.strictEqual(TEMA_ANO_INICIAL.ano, 2027);
    assert.strictEqual(TEMA_ANO_INICIAL.titulo, 'Solta pelos Ares 🪽');
    assert.ok(TEMA_ANO_INICIAL.fantasia.includes('asas'));
    assert.ok(TEMA_ANO_INICIAL.descricaoCores.includes('#FF007A'));
  });

  it('deve atualizar o tema do ano dinamicamente mantendo integridade dos dados', () => {
    const temaAtualizado = atualizarTemaAno(TEMA_ANO_INICIAL, {
      titulo: 'Metamorfose Selvagem 🦋',
      fantasia: 'Fantasias de casulos abrindo e borboletas gigantes.',
      descricaoCores: 'Amarelo ouro (#FBBF24) e Roxo Profundo (#581C87).'
    });

    assert.strictEqual(temaAtualizado.titulo, 'Metamorfose Selvagem 🦋');
    assert.strictEqual(temaAtualizado.fantasia, 'Fantasias de casulos abrindo e borboletas gigantes.');
    assert.strictEqual(temaAtualizado.descricaoCores, 'Amarelo ouro (#FBBF24) e Roxo Profundo (#581C87).');
    assert.strictEqual(temaAtualizado.ano, 2027);
    assert.ok(temaAtualizado.dataAtualizacao);
  });
});
