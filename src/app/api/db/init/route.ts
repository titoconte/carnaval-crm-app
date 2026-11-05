import { NextResponse } from 'next/server';
import { initDatabaseSchema, isDatabaseConfigured } from '@/lib/db';

/**
 * Endpoint para inicializar o esquema do banco de dados na Vercel (GET / POST).
 * Cria automaticamente as tabelas necessárias quando conectado ao Vercel Postgres / Neon.
 */
export async function GET() {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      message: 'Vercel Postgres / Neon ainda não conectado. Configure POSTGRES_URL no painel da Vercel.'
    });
  }

  const result = await initDatabaseSchema();
  return NextResponse.json({
    configured: true,
    ...result
  });
}

export async function POST() {
  return GET();
}
