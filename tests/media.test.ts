import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CorPaletaAnual,
  ArquivoArteMidia,
  PostInstagramPlanejado,
  adicionarCorPaleta,
  removerCorPaleta,
  adicionarArquivoArte,
  filtrarArquivosArte,
  gerarTextoLegendaInstagram,
  adicionarPostPlanejado
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
    assert.ok(atualizadas[2].id.startsWith('cor-'));
  });

  it('deve remover uma cor da paleta anual pelo ID', () => {
    const atualizadas = removerCorPaleta(coresMock, 'c1');
    assert.strictEqual(atualizadas.length, 1);
    assert.strictEqual(atualizadas[0].id, 'c2');
  });

  const artesMock: ArquivoArteMidia[] = [
    {
      id: 'a1',
      titulo: 'Logo Vetor Oficial',
      categoria: 'Logotipos',
      nomeArquivo: 'logo.svg',
      tamanhoFormatado: '120 KB',
      formatoExtensao: 'SVG',
      dataUpload: '2026-10-01'
    },
    {
      id: 'a2',
      titulo: 'Cartaz Lambe A3',
      categoria: 'Cartazes & Lambes',
      nomeArquivo: 'lambe.pdf',
      tamanhoFormatado: '2.5 MB',
      formatoExtensao: 'PDF',
      dataUpload: '2026-10-05'
    }
  ];

  it('deve cadastrar um novo arquivo de arte gráfica', () => {
    const novasArtes = adicionarArquivoArte(artesMock, {
      titulo: 'Template Reels Ensaio',
      categoria: 'Redes Sociais',
      nomeArquivo: 'template_reels.png',
      tamanhoFormatado: '800 KB',
      formatoExtensao: 'PNG',
      dimensoesOuUso: '1080x1920'
    });

    assert.strictEqual(novasArtes.length, 3);
    assert.strictEqual(novasArtes[0].titulo, 'Template Reels Ensaio');
    assert.strictEqual(novasArtes[0].formatoExtensao, 'PNG');
  });

  it('deve filtrar arquivos de arte por categoria e busca textual', () => {
    const apenasLogos = filtrarArquivosArte(artesMock, 'Logotipos');
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
});
