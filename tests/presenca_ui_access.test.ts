import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Suíte de testes de integração estrutural e segurança de UI para a Lista de Presença.
 * Garante que:
 * - Toda visualização e ação de lista de presença no CalendarView é estritamente restrita a isAdmin (coordenadores).
 * - O cadastro do elenco (integrantes) é utilizado como fonte para a lista de presença.
 * - O page.tsx nunca expõe presenças no sync genérico (/api/db/sync) e limpa dados ao sair do perfil coordenador.
 */
describe('Controle de Acesso Exclusivo da Coordenação na UI de Lista de Presença', () => {
  const calendarPath = path.resolve(process.cwd(), 'src/components/CalendarView.tsx');
  const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');

  it('deve restringir o botão, badges, modal de chamada e relatório de frequência exclusivamente a isAdmin no CalendarView', () => {
    const source = fs.readFileSync(calendarPath, 'utf-8');

    // Uso do elenco oficial (integrantes) nas props do CalendarView
    assert.strictEqual(
      source.includes('integrantes?: Integrante[]'),
      true,
      'CalendarView deve receber a lista de integrantes do elenco oficial'
    );

    // Restrição explícita a Ensaio e Reunião presencial + coordenador
    assert.strictEqual(
      source.includes('isAdmin && aceitaPresenca'),
      true,
      'O acesso à lista de presença no card do evento deve exigir isAdmin e evento elegível (Ensaio/Reunião)'
    );

    // Modal de lista de presença protegido por isAdmin
    assert.strictEqual(
      source.includes('isAdmin && eventoPresencaAtivo'),
      true,
      'O modal de lista de presença deve ser renderizado exclusivamente para isAdmin'
    );

    // Modal de relatório de frequência protegido por isAdmin
    assert.strictEqual(
      source.includes('isAdmin && modalRelatorioAberto'),
      true,
      'O painel/modal de relatório de frequência deve ser renderizado exclusivamente para isAdmin'
    );

    // Ações completas da coordenação: inserir, editar e excluir presença
    assert.strictEqual(
      source.includes('onSalvarPresenca'),
      true,
      'Deve suportar inserção e edição de presença'
    );
    assert.strictEqual(
      source.includes('onRemoverPresenca'),
      true,
      'Deve suportar exclusão de registro de presença'
    );
    assert.strictEqual(
      source.includes('onSalvarPresencasLote'),
      true,
      'Deve suportar marcação em lote para integrantes ativos do elenco'
    );
  });

  it('deve garantir no page.tsx que presenças sejam carregadas apenas via /api/presencas para coordenadores e nunca vazem no /api/db/sync', () => {
    const source = fs.readFileSync(pagePath, 'utf-8');

    // Carregamento dedicado na tabela fato via /api/presencas
    assert.strictEqual(
      source.includes("'/api/presencas'"),
      true,
      'page.tsx deve consumir o endpoint dedicado /api/presencas'
    );

    // Limpeza garantida quando o usuário não for coordenador
    assert.strictEqual(
      source.includes("if (!usuarioLogado || usuarioLogado.perfil !== 'coordenador')"),
      true,
      'page.tsx deve bloquear busca e limpar presenças quando o usuário não for coordenador'
    );

    // Passagem protegida de dados de presença e elenco para o CalendarView
    assert.strictEqual(
      source.includes('integrantes={isAdmin ? integrantes : []}'),
      true,
      'Elenco para lista de presença deve ser passado ao CalendarView apenas quando isAdmin'
    );
    assert.strictEqual(
      source.includes('presencas={isAdmin ? presencas : []}'),
      true,
      'Registros de presença devem ser passados ao CalendarView apenas quando isAdmin'
    );

    // Nunca enviar presenças no batch genérico de /api/db/sync (que é legível por qualquer perfil)
    const batchMatch = source.match(/batch:\s*\{[\s\S]*?\}/);
    assert.ok(batchMatch, 'Bloco batch de /api/db/sync deve existir');
    assert.strictEqual(
      batchMatch[0].includes('presencas'),
      false,
      'presencas NÃO deve ser gravado no batch público de /api/db/sync'
    );
  });
});
