import { NextRequest, NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  listarPresencasNoBanco,
  salvarPresencaNoBanco,
  salvarPresencasEmLoteNoBanco,
  excluirPresencaNoBanco,
  validarCoordenadorNoBanco
} from '@/lib/db';
import {
  RegistroPresencaEvento,
  StatusPresenca,
  eventoAceitaListaPresenca
} from '@/data/blocoData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

const STATUS_VALIDOS: StatusPresenca[] = ['Presente', 'Falta', 'Justificada', 'Atrasado'];

/**
 * Extrai e valida as credenciais de coordenador nos cabeçalhos HTTP da requisição.
 * Garante controle de acesso estrito no servidor (apenas coordenadores podem ver ou alterar presenças).
 * 
 * @param req - Requisição HTTP recebida pelo endpoint
 * @returns Verdadeiro se autenticado como coordenador, falso caso contrário
 */
async function verificarAutorizacaoCoordenador(req: NextRequest): Promise<boolean> {
  const user = req.headers.get('x-coord-user');
  const pass = req.headers.get('x-coord-pass');
  return validarCoordenadorNoBanco(user, pass);
}

/**
 * Valida estruturalmente um registro de presença antes de gravá-lo na tabela fato.
 * Verifica campos obrigatórios, tipo elegível (Ensaio ou Reunião presencial) e status permitido.
 * 
 * @param registro - Objeto candidato a RegistroPresencaEvento
 * @returns Mensagem de erro se inválido ou null se válido
 */
function validarRegistroPresenca(registro: Partial<RegistroPresencaEvento>): string | null {
  if (!registro || typeof registro !== 'object') {
    return 'Registro de presença inválido.';
  }
  if (!registro.eventoId || !registro.integranteId || !registro.integranteNome) {
    return 'Campos obrigatórios ausentes: eventoId, integranteId e integranteNome.';
  }
  if (!registro.eventoTipo || !eventoAceitaListaPresenca({ tipo: registro.eventoTipo })) {
    return 'Lista de presença permitida apenas para Ensaios e Reuniões presenciais.';
  }
  if (!registro.status || !STATUS_VALIDOS.includes(registro.status)) {
    return 'Status de presença inválido. Use: Presente, Falta, Justificada ou Atrasado.';
  }
  return null;
}

/**
 * Endpoint GET /api/presencas — Lista os registros da tabela fato fato_presenca_eventos.
 * Acesso estritamente exclusivo para coordenadores autenticados.
 */
export async function GET(req: NextRequest) {
  const autorizado = await verificarAutorizacaoCoordenador(req);
  if (!autorizado) {
    return NextResponse.json(
      { error: 'Acesso negado. A lista de presença é exclusiva para coordenadores.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json(
      { configured: false, presencas: [] },
      { headers: NO_STORE_HEADERS }
    );
  }

  try {
    const eventoId = req.nextUrl.searchParams.get('eventoId') || undefined;
    const presencas = await listarPresencasNoBanco(eventoId);

    return NextResponse.json(
      { configured: true, presencas },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { configured: true, error: error.message, presencas: [] },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * Endpoint POST /api/presencas — Insere ou atualiza um registro (ou lote) na tabela fato fato_presenca_eventos.
 * Acesso estritamente exclusivo para coordenadores autenticados.
 */
export async function POST(req: NextRequest) {
  const autorizado = await verificarAutorizacaoCoordenador(req);
  if (!autorizado) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas coordenadores podem registrar presenças.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const body = await req.json();

    // Suporte a gravação em lote (ex: marcar todos os integrantes ativos como presentes)
    if (Array.isArray(body.registros)) {
      if (body.registros.length === 0) {
        return NextResponse.json(
          { error: 'Lista de registros vazia.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }

      for (const item of body.registros) {
        const erro = validarRegistroPresenca(item);
        if (erro) {
          return NextResponse.json({ error: erro }, { status: 400, headers: NO_STORE_HEADERS });
        }
      }

      const configured = isDatabaseConfigured();
      if (!configured) {
        return NextResponse.json(
          { configured: false, success: true, count: body.registros.length },
          { headers: NO_STORE_HEADERS }
        );
      }

      const ok = await salvarPresencasEmLoteNoBanco(body.registros);
      return NextResponse.json(
        { configured: true, success: ok, count: body.registros.length },
        { status: ok ? 200 : 500, headers: NO_STORE_HEADERS }
      );
    }

    // Gravação unitária
    const registro: RegistroPresencaEvento = body.registro || body;
    const erroValidacao = validarRegistroPresenca(registro);
    if (erroValidacao) {
      return NextResponse.json(
        { error: erroValidacao },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const configured = isDatabaseConfigured();
    if (!configured) {
      return NextResponse.json(
        { configured: false, success: true, registro },
        { headers: NO_STORE_HEADERS }
      );
    }

    const ok = await salvarPresencaNoBanco(registro);
    return NextResponse.json(
      { configured: true, success: ok, registro },
      { status: ok ? 200 : 500, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao processar registro de presença.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * Endpoint PUT /api/presencas — Edita um registro existente na tabela fato fato_presenca_eventos.
 * Acesso estritamente exclusivo para coordenadores autenticados.
 */
export async function PUT(req: NextRequest) {
  return POST(req);
}

/**
 * Endpoint DELETE /api/presencas — Exclui um registro individual (eventoId + integranteId)
 * ou todos os registros vinculados a um evento (eventoId) da tabela fato fato_presenca_eventos.
 * Acesso estritamente exclusivo para coordenadores autenticados.
 */
export async function DELETE(req: NextRequest) {
  const autorizado = await verificarAutorizacaoCoordenador(req);
  if (!autorizado) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas coordenadores podem excluir presenças.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  try {
    let eventoId = req.nextUrl.searchParams.get('eventoId') || '';
    let integranteId = req.nextUrl.searchParams.get('integranteId') || undefined;

    if (!eventoId) {
      try {
        const body = await req.json();
        eventoId = body?.eventoId || '';
        integranteId = body?.integranteId || undefined;
      } catch {
        // Sem corpo JSON
      }
    }

    if (!eventoId) {
      return NextResponse.json(
        { error: 'Informe o parâmetro eventoId para excluir registros de presença.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const configured = isDatabaseConfigured();
    if (!configured) {
      return NextResponse.json(
        { configured: false, success: true, eventoId, integranteId },
        { headers: NO_STORE_HEADERS }
      );
    }

    const ok = await excluirPresencaNoBanco(eventoId, integranteId);
    return NextResponse.json(
      { configured: true, success: ok, eventoId, integranteId },
      { status: ok ? 200 : 500, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir registro de presença.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
