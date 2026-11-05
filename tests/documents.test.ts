import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  DocumentoBloco,
  filtrarDocumentos,
  adicionarNovoDocumento,
  extrairTodasTagsDocumentos
} from '../src/data/blocoData';

describe('Gestão de Documentos Oficiais do Bloco', () => {
  const docsMock: DocumentoBloco[] = [
    {
      id: 'doc-1',
      titulo: 'Estatuto da Bicharada',
      descricao: 'Regimento interno',
      tags: ['Regulamento', 'Jurídico'],
      nomeArquivo: 'estatuto.pdf',
      dataUpload: '2026-10-10'
    },
    {
      id: 'doc-2',
      titulo: 'Edital do Elenco',
      descricao: 'Chamamento de foliões',
      tags: ['Edital', 'Inscrições'],
      nomeArquivo: 'edital.pdf',
      dataUpload: '2026-10-15'
    },
    {
      id: 'doc-3',
      titulo: 'Alvará Prefeitura',
      descricao: 'Autorização do desfile',
      tags: ['Prefeitura', 'Jurídico'],
      nomeArquivo: 'alvara.pdf',
      dataUpload: '2026-10-20'
    }
  ];

  it('deve extrair todas as tags únicas dos documentos', () => {
    const tags = extrairTodasTagsDocumentos(docsMock);
    assert.strictEqual(tags.length, 5);
    assert.ok(tags.includes('Regulamento'));
    assert.ok(tags.includes('Jurídico'));
    assert.ok(tags.includes('Edital'));
    assert.ok(tags.includes('Inscrições'));
    assert.ok(tags.includes('Prefeitura'));
  });

  it('deve filtrar documentos pela tag selecionada', () => {
    const filtradosJuridico = filtrarDocumentos(docsMock, 'Jurídico');
    assert.strictEqual(filtradosJuridico.length, 2);
    assert.strictEqual(filtradosJuridico[0].id, 'doc-1');
    assert.strictEqual(filtradosJuridico[1].id, 'doc-3');

    const todos = filtrarDocumentos(docsMock, 'Todas');
    assert.strictEqual(todos.length, 3);
  });

  it('deve filtrar documentos por busca textual', () => {
    const busca = filtrarDocumentos(docsMock, 'Todas', 'chamamento');
    assert.strictEqual(busca.length, 1);
    assert.strictEqual(busca[0].id, 'doc-2');
  });

  it('deve adicionar um novo documento com tags personalizadas e arquivo', () => {
    const atualizados = adicionarNovoDocumento(docsMock, {
      titulo: 'Ata da Reunião de Harmonia',
      descricao: 'Definições sobre a bateria',
      tags: ['Ata', 'Harmonia'],
      nomeArquivo: 'ata_harmonia_nov.pdf',
      tamanhoFormatado: '320 KB'
    });

    assert.strictEqual(atualizados.length, 4);
    assert.strictEqual(atualizados[0].titulo, 'Ata da Reunião de Harmonia');
    assert.deepStrictEqual(atualizados[0].tags, ['Ata', 'Harmonia']);
    assert.strictEqual(atualizados[0].nomeArquivo, 'ata_harmonia_nov.pdf');
    assert.ok(atualizados[0].id.startsWith('doc-'));
  });
});
