import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  Rifa,
  RifaVenda,
  validarVendaRifa,
  criarNovaRifa,
  registrarVendaBilhete
} from '../src/data/blocoData';

describe('Sistema de Rifas do Bloco Bicharada', () => {
  const rifaMock: Rifa = {
    id: 'rifa-test-1',
    titulo: 'Grande Rifa do Bloco',
    nomeCoordenador: 'Regina',
    quantidadeNumeros: 100,
    precoNumero: 10,
    dataLimite: '2026-11-10',
    numeroPremios: 2,
    premios: [
      { posicao: 1, descricao: 'Cesta Carnavalesca' },
      { posicao: 2, descricao: 'Camiseta Oficial' }
    ],
    chavePix: 'apoio@bicharada.org',
    telefoneContato: '5548999999999',
    dataCriacao: '2026-11-01',
    ativa: true
  };

  it('deve permitir venda dentro da data limite', () => {
    // Mesma data da data limite
    const resultado = validarVendaRifa(rifaMock, '2026-11-10');
    assert.strictEqual(resultado.permitida, true);
  });

  it('deve permitir venda exatamente 1 dia após a data limite', () => {
    // 1 dia após (11/11)
    const resultado = validarVendaRifa(rifaMock, '2026-11-11T12:00:00');
    assert.strictEqual(resultado.permitida, true);
  });

  it('deve bloquear venda quando passar mais de 1 dia da data limite', () => {
    // 2 dias após (12/11)
    const resultado = validarVendaRifa(rifaMock, '2026-11-12T00:00:01');
    assert.strictEqual(resultado.permitida, false);
    assert.match(resultado.motivo || '', /limite/i);
  });

  it('deve criar uma nova rifa com suas informações completas e inicializar as vendas', () => {
    const novaRifa = criarNovaRifa({
      titulo: 'Rifa Extra Kombi',
      nomeCoordenador: 'Tito',
      quantidadeNumeros: 50,
      precoNumero: 15,
      dataLimite: '2026-12-01',
      premios: [
        { posicao: 1, descricao: 'Isopor Gigante' }
      ]
    });

    assert.strictEqual(novaRifa.titulo, 'Rifa Extra Kombi');
    assert.strictEqual(novaRifa.quantidadeNumeros, 50);
    assert.strictEqual(novaRifa.premios.length, 1);
    assert.strictEqual(novaRifa.premios[0].descricao, 'Isopor Gigante');
  });

  it('deve registrar venda de bilhete na tabela fato respeitando o prazo', () => {
    const vendas: RifaVenda[] = [
      { id: 'v-1', rifaId: rifaMock.id, numero: 1, status: 'Disponível' }
    ];

    const resultado = registrarVendaBilhete(rifaMock, vendas, 1, {
      compradorNome: 'Malu',
      compradorWhats: '48999990000',
      dataVenda: '2026-11-05'
    });

    assert.strictEqual(resultado.sucesso, true);
    assert.strictEqual(resultado.vendasAtualizadas[0].status, 'Reservado');
    assert.strictEqual(resultado.vendasAtualizadas[0].compradorNome, 'Malu');
  });

  it('deve recusar registrar venda de bilhete se passar mais de 1 dia do prazo', () => {
    const vendas: RifaVenda[] = [
      { id: 'v-1', rifaId: rifaMock.id, numero: 1, status: 'Disponível' }
    ];

    const resultado = registrarVendaBilhete(rifaMock, vendas, 1, {
      compradorNome: 'Malu',
      compradorWhats: '48999990000',
      dataVenda: '2026-11-15' // bem depois do limite (10/11)
    });

    assert.strictEqual(resultado.sucesso, false);
    assert.strictEqual(resultado.vendasAtualizadas[0].status, 'Disponível');
  });

  it('deve suportar criação de rifa com mais de 3 prêmios dinâmicos', () => {
    const premiosLivres = [
      { posicao: 1, descricao: '1º Prêmio: Bicicleta Vintage' },
      { posicao: 2, descricao: '2º Prêmio: Cesta de Cervejas' },
      { posicao: 3, descricao: '3º Prêmio: Camiseta do Bloco' },
      { posicao: 4, descricao: '4º Prêmio: Kit Glitter & Óculos' },
      { posicao: 5, descricao: '5º Prêmio: Vale Bar de R$ 100' }
    ];

    const rifaCincoPremios = criarNovaRifa({
      titulo: 'Super Rifa 5 Prêmios',
      nomeCoordenador: 'Regina',
      quantidadeNumeros: 200,
      precoNumero: 10,
      dataLimite: '2026-12-31',
      premios: premiosLivres
    });

    assert.strictEqual(rifaCincoPremios.numeroPremios, 5);
    assert.strictEqual(rifaCincoPremios.premios.length, 5);
    assert.strictEqual(rifaCincoPremios.premios[4].descricao, '5º Prêmio: Vale Bar de R$ 100');
  });
});

