import { NextRequest, NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  obterTodosEstadosDoBanco,
  salvarEstadoNoBanco
} from '@/lib/db';

/**
 * Endpoint para leitura de todos os estados sincronizados do banco (GET /api/db/sync).
 * Retorna os estados salvos no Vercel Postgres para carregar no cliente.
 */
export async function GET() {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      estados: {}
    });
  }

  try {
    const estados = await obterTodosEstadosDoBanco();
    return NextResponse.json({
      configured: true,
      estados
    });
  } catch (error: any) {
    return NextResponse.json(
      { configured: true, error: error.message, estados: {} },
      { status: 500 }
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
