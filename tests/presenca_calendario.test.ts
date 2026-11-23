import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  EventoCalendario,
  Integrante,
  RegistroPresencaEvento,
  eventoAceitaListaPresenca,
  podeGerenciarPresenca,
  registrarOuEditarPresenca,
  removerPresencaEvento,
  removerPresencasDoEvento,
  marcarTodosPresentesNoEvento,
  obterPresencasPorEvento,
  calcularResumoPresencaEvento,
  calcularResumoFrequenciaIntegrante
} from '../src/data/blocoData';

/**
 * Suíte de testes da Lista de Presença de Ensaios e Reuniões no Calendário.
 * Valida regras de negócio, uso do elenco oficial, tabela fato e acesso exclusivo para coordenadores.
 */
describe('Lista de Presença em Ensaios e Reuniões (Exclusivo Coordenação)', () => {
  const elencoMock: Integrante[] = [
    {
      id: 'int-1',
      nome: 'Bel Chagas',
      grandeGrupo: 'Bateria',
      instrumentoOuFuncao: 'Caixa',
      ativo: true
    },
    {
      id: 'int-2',
      nome: 'Tito Conte',
      grandeGrupo: 'Sopros',
      instrumentoOuFuncao: 'Trompete',
      ativo: true
    },
    {
      id: 'int-3',
      nome: 'Luna Flor',
      grandeGrupo: 'Brincantes & Dança',
      instrumentoOuFuncao: 'Pernalta',
      ativo: false
    }
  ];

  const eventoEnsaio: EventoCalendario = {
    id: 'ev-ensaio-1',
    data: '2027-01-15',
    diaSemana: 'SEX',
    tipo: 'Ensaio',
    local: 'Costeira do Pirajubaé',
    horario: '19:30'
  };

  const eventoReuniao: EventoCalendario = {
    id: 'ev-reuniao-1',
    data: '2027-01-18',
    diaSemana: 'SEG',
    tipo: 'Reunião presencial',
    local: 'Espaço Cultural Centro',
    horario: '20:00'
  };

  const eventoDesfile: EventoCalendario = {
    id: 'ev-desfile-1',
    data: '2027-02-08',
    diaSemana: 'SEG',
    tipo: 'Desfile Oficial',
    local: 'Praça Oliva',
    horario: '14:30'
  };

  const eventoOficina: EventoCalendario = {
    id: 'ev-oficina-1',
    data: '2027-01-25',
    diaSemana: 'SÁB',
    tipo: 'Oficina de Fantasias',
    local: 'Ateliê',
    horario: '14:00'
  };

  it('deve restringir acesso de visualização e gestão de presença exclusivamente para coordenadores', () => {
    assert.strictEqual(podeGerenciarPresenca('coordenador'), true);
    assert.strictEqual(podeGerenciarPresenca('bicho'), false);
    assert.strictEqual(podeGerenciarPresenca('publico'), false);
  });

  it('deve habilitar lista de presença apenas para Ensaios e Reuniões presenciais', () => {
    assert.strictEqual(eventoAceitaListaPresenca(eventoEnsaio), true);
    assert.strictEqual(eventoAceitaListaPresenca(eventoReuniao), true);
    assert.strictEqual(eventoAceitaListaPresenca(eventoDesfile), false);
    assert.strictEqual(eventoAceitaListaPresenca(eventoOficina), false);
  });

  it('deve inserir registro de presença na tabela fato usando integrante do elenco quando coordenador', () => {
    const lista = registrarOuEditarPresenca(
      [],
      eventoEnsaio,
      elencoMock[0],
      { status: 'Presente', observacao: 'Chegou no horário', registradoPor: 'adminbixarada' },
      true
    );

    assert.strictEqual(lista.length, 1);
    assert.strictEqual(lista[0].eventoId, 'ev-ensaio-1');
    assert.strictEqual(lista[0].integranteId, 'int-1');
    assert.strictEqual(lista[0].integranteNome, 'Bel Chagas');
    assert.strictEqual(lista[0].grandeGrupo, 'Bateria');
    assert.strictEqual(lista[0].instrumentoOuFuncao, 'Caixa');
    assert.strictEqual(lista[0].eventoData, '2027-01-15');
    assert.strictEqual(lista[0].eventoTipo, 'Ensaio');
    assert.strictEqual(lista[0].status, 'Presente');
    assert.strictEqual(lista[0].observacao, 'Chegou no horário');
    assert.strictEqual(lista[0].registradoPor, 'adminbixarada');
  });

  it('deve editar um registro de presença existente sem duplicar a linha para o mesmo evento e integrante', () => {
    const inicial = registrarOuEditarPresenca(
      [],
      eventoReuniao,
      elencoMock[1],
      { status: 'Presente', registradoPor: 'adminbixarada' },
      true
    );

    const editada = registrarOuEditarPresenca(
      inicial,
      eventoReuniao,
      elencoMock[1],
      { status: 'Justificada', observacao: 'Atestado médico', registradoPor: 'coord2' },
      true
    );

    assert.strictEqual(editada.length, 1);
    assert.strictEqual(editada[0].id, inicial[0].id);
    assert.strictEqual(editada[0].status, 'Justificada');
    assert.strictEqual(editada[0].observacao, 'Atestado médico');
    assert.strictEqual(editada[0].registradoPor, 'coord2');
    assert.ok(editada[0].atualizadoEm);
  });

  it('deve bloquear inserção e edição de presença para não coordenadores ou eventos não elegíveis', () => {
    const bloqueadoPerfil = registrarOuEditarPresenca(
      [],
      eventoEnsaio,
      elencoMock[0],
      { status: 'Presente' },
      false
    );
    assert.strictEqual(bloqueadoPerfil.length, 0);

    const bloqueadoTipo = registrarOuEditarPresenca(
      [],
      eventoDesfile,
      elencoMock[0],
      { status: 'Presente' },
      true
    );
    assert.strictEqual(bloqueadoTipo.length, 0);
  });

  it('deve permitir excluir registro de presença apenas para coordenadores', () => {
    let lista = registrarOuEditarPresenca([], eventoEnsaio, elencoMock[0], { status: 'Presente' }, true);
    lista = registrarOuEditarPresenca(lista, eventoEnsaio, elencoMock[1], { status: 'Falta' }, true);

    // Tentativa bloqueada para não coordenador
    const tentativaNaoCoord = removerPresencaEvento(lista, 'ev-ensaio-1', 'int-1', false);
    assert.strictEqual(tentativaNaoCoord.length, 2);

    // Exclusão autorizada para coordenador
    const aposRemocao = removerPresencaEvento(lista, 'ev-ensaio-1', 'int-1', true);
    assert.strictEqual(aposRemocao.length, 1);
    assert.strictEqual(aposRemocao[0].integranteId, 'int-2');
  });

  it('deve remover todas as presenças de um evento excluído mantendo outros eventos intactos', () => {
    let lista = registrarOuEditarPresenca([], eventoEnsaio, elencoMock[0], { status: 'Presente' }, true);
    lista = registrarOuEditarPresenca(lista, eventoReuniao, elencoMock[0], { status: 'Presente' }, true);

    const bloqueado = removerPresencasDoEvento(lista, 'ev-ensaio-1', false);
    assert.strictEqual(bloqueado.length, 2);

    const limpo = removerPresencasDoEvento(lista, 'ev-ensaio-1', true);
    assert.strictEqual(limpo.length, 1);
    assert.strictEqual(limpo[0].eventoId, 'ev-reuniao-1');
  });

  it('deve marcar todos os integrantes ativos do elenco como presentes em lote apenas para coordenadores', () => {
    const bloqueado = marcarTodosPresentesNoEvento([], eventoEnsaio, elencoMock, 'bicho1', false);
    assert.strictEqual(bloqueado.length, 0);

    const marcados = marcarTodosPresentesNoEvento([], eventoEnsaio, elencoMock, 'adminbixarada', true);
    // Apenas int-1 e int-2 estão ativos; int-3 está inativo
    assert.strictEqual(marcados.length, 2);
    assert.ok(marcados.every(p => p.status === 'Presente'));
    assert.strictEqual(marcados.some(p => p.integranteId === 'int-3'), false);
  });

  it('deve calcular corretamente o resumo de presença de um evento e a frequência por integrante', () => {
    let lista: RegistroPresencaEvento[] = [];
    lista = registrarOuEditarPresenca(lista, eventoEnsaio, elencoMock[0], { status: 'Presente' }, true);
    lista = registrarOuEditarPresenca(lista, eventoEnsaio, elencoMock[1], { status: 'Atrasado' }, true);
    lista = registrarOuEditarPresenca(lista, eventoReuniao, elencoMock[0], { status: 'Falta' }, true);

    const presencasEnsaio = obterPresencasPorEvento(lista, 'ev-ensaio-1');
    assert.strictEqual(presencasEnsaio.length, 2);

    const resumoEnsaio = calcularResumoPresencaEvento(lista, 'ev-ensaio-1', elencoMock);
    assert.strictEqual(resumoEnsaio.totalElencoAtivo, 2);
    assert.strictEqual(resumoEnsaio.registrados, 2);
    assert.strictEqual(resumoEnsaio.presentes, 1);
    assert.strictEqual(resumoEnsaio.atrasados, 1);
    assert.strictEqual(resumoEnsaio.faltas, 0);
    assert.strictEqual(resumoEnsaio.semRegistro, 0);
    assert.strictEqual(resumoEnsaio.percentualPresenca, 100);

    const freqBel = calcularResumoFrequenciaIntegrante(
      lista,
      [eventoEnsaio, eventoReuniao, eventoDesfile],
      'int-1'
    );
    assert.strictEqual(freqBel.totalEventosElegiveis, 2);
    assert.strictEqual(freqBel.presentes, 1);
    assert.strictEqual(freqBel.faltas, 1);
    assert.strictEqual(freqBel.percentualFrequencia, 50);
  });
});
