import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  InscritoBloco,
  atualizarStatusInscrito,
  gerarMensagemWhatsappInscricao,
  gerarLinkWhatsappInscricao
} from '../src/data/blocoData';

describe('Gestão de Inscrições do Bloco Bicharada', () => {
  const inscritoMock: InscritoBloco = {
    id: 'insc-1',
    nome: 'Carolina Mendez',
    whatsapp: '(48) 99876-5432',
    grandeGrupo: 'Bateria',
    instrumentoOuFuncao: 'Caixa',
    experiencia: 'Já toco o instrumento com facilidade',
    observacao: 'Disponível para todos os ensaios de sexta',
    dataInscricao: '2026-11-04',
    status: 'Pendente'
  };

  it('deve atualizar o status de um inscrito para Aprovado', () => {
    const listaAtualizada = atualizarStatusInscrito([inscritoMock], 'insc-1', 'Aprovado');
    assert.strictEqual(listaAtualizada[0].status, 'Aprovado');
  });

  it('deve atualizar o status de um inscrito para Recusado', () => {
    const listaAtualizada = atualizarStatusInscrito([inscritoMock], 'insc-1', 'Recusado');
    assert.strictEqual(listaAtualizada[0].status, 'Recusado');
  });

  it('deve gerar mensagem de aprovação com tom afetuoso e dados corretos', () => {
    const msg = gerarMensagemWhatsappInscricao(inscritoMock, 'Aprovado');
    assert.match(msg, /Carolina Mendez/i);
    assert.match(msg, /APROVADA/);
    assert.match(msg, /Bateria/);
    assert.match(msg, /Caixa/);
  });

  it('deve gerar mensagem de recusa respeitosa e justificada', () => {
    const msg = gerarMensagemWhatsappInscricao(inscritoMock, 'Recusado');
    assert.match(msg, /Carolina Mendez/);
    assert.match(msg, /vagas para esta função estão preenchidas/);
  });

  it('deve gerar link oficial do wa.me higienizando o telefone', () => {
    const link = gerarLinkWhatsappInscricao(inscritoMock, 'Aprovado');
    assert.match(link, /https:\/\/wa\.me\/5548998765432\?text=/);
  });
});
