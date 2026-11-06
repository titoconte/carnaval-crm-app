import { NextRequest, NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  obterTodosEstadosDoBanco,
  salvarEstadoNoBanco
} from '@/lib/db';
import { TAREFAS_POSTIT_INICIAIS } from '@/data/blocoData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Endpoint para leitura de todos os estados sincronizados do banco (GET /api/db/sync).
 * Retorna os estados salvos no Vercel Postgres para carregar no cliente,
 * respeitando edições e deleções feitas pelos coordenadores.
 */
export async function GET() {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      estados: {
        tarefas: TAREFAS_POSTIT_INICIAIS
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  try {
    const estados = await obterTodosEstadosDoBanco();

    // Se o banco ainda não possuir tarefas salvas, inicializa com as 11 da Ata 7
    if (!estados.tarefas) {
      estados.tarefas = TAREFAS_POSTIT_INICIAIS;
    }

    return NextResponse.json({
      configured: true,
      estados
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: true,
        error: error.message,
        estados: {
          tarefas: TAREFAS_POSTIT_INICIAIS
        }
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  }
}

/**
 * Endpoint para gravação de estados no Vercel Postgres (POST /api/db/sync).
 * Suporta salvamento unitário { key, data } ou em lote { batch: { key: data, ... } }.
 */
export async function POST(req: NextRequest) {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      message: 'Banco não configurado. Dados devem ser mantidos em LocalStorage.'
    });
  }

  try {
    const body = await req.json();

    if (body.key && body.data !== undefined) {
      const ok = await salvarEstadoNoBanco(body.key, body.data);
      return NextResponse.json({ success: ok, key: body.key });
    }

    if (body.batch && typeof body.batch === 'object') {
      const resultados: Record<string, boolean> = {};
      for (const [key, data] of Object.entries(body.batch)) {
        resultados[key] = await salvarEstadoNoBanco(key, data);
      }
      return NextResponse.json({ success: true, batchResults: resultados });
    }

    return NextResponse.json(
      { error: 'Formato inválido. Envie { key, data } ou { batch }' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
