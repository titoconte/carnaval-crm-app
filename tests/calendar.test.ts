import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  EventoCalendario,
  adicionarEventoCalendario,
  editarEventoCalendario,
  removerEventoCalendario
} from '../src/data/blocoData';

describe('Gestão de Calendário de Ensaios & Datas da Coordenação', () => {
  const eventosIniciais: EventoCalendario[] = [
    {
      id: 'ev-1',
      data: '2027-02-08',
      diaSemana: 'Segunda',
      tipo: 'Desfile Oficial',
      local: 'Praça Oliva',
      horario: '14:30',
      observacoes: 'Desfile oficial da Bicharada'
    }
  ];

  it('deve adicionar um novo evento mantendo ordenação cronológica por data', () => {
    const atualizados = adicionarEventoCalendario(eventosIniciais, {
      data: '2027-01-15',
      diaSemana: 'Sexta',
      tipo: 'Ensaio',
      local: 'Costeira do Pirajubaé',
      horario: '19:30',
      observacoes: 'Primeiro ensaio geral do ano'
    });

    assert.strictEqual(atualizados.length, 2);
    // 2027-01-15 deve vir antes de 2027-02-08
    assert.strictEqual(atualizados[0].data, '2027-01-15');
    assert.strictEqual(atualizados[0].tipo, 'Ensaio');
    assert.strictEqual(atualizados[1].data, '2027-02-08');
  });

  it('deve editar um evento existente preservando o id e atualizando campos', () => {
    const atualizados = editarEventoCalendario(eventosIniciais, 'ev-1', {
      horario: '15:00',
      local: 'Praça Oliva & Escadaria do Rosário',
      observacoes: 'Horário ajustado com a PMF'
    });

    assert.strictEqual(atualizados.length, 1);
    assert.strictEqual(atualizados[0].id, 'ev-1');
    assert.strictEqual(atualizados[0].horario, '15:00');
    assert.strictEqual(atualizados[0].local, 'Praça Oliva & Escadaria do Rosário');
    assert.strictEqual(atualizados[0].tipo, 'Desfile Oficial');
  });

  it('deve remover um evento do calendário pelo id', () => {
    const atualizados = removerEventoCalendario(eventosIniciais, 'ev-1');
    assert.strictEqual(atualizados.length, 0);
  });
});

