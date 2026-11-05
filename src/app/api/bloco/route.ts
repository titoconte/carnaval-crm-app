import { NextResponse } from 'next/server';
import { 
  INTEGRANTES_INICIAIS, 
  CALENDARIO_INICIAL, 
  TAREFAS_POSTIT_INICIAIS, 
  MACROTAREFAS_DESFILE_INICIAIS,
  REPERTORIO_INICIAL, 
  ENQUETES_WHATSAPP_INICIAIS 
} from '@/data/blocoData';

/**
 * Endpoint Serverless da Vercel (GET /api/bloco).
 * Retorna os dados consolidados do bloco com cache estático via edge CDN.
 */
export async function GET() {
  const orfas = TAREFAS_POSTIT_INICIAIS.filter(
    t => (!t.responsavel || t.responsavel === '') && !t.concluida
  ).length;

  return NextResponse.json({
    status: 'success',
    bloco: 'Bicharada',
    carnaval: 2027,
    integrantes: INTEGRANTES_INICIAIS.length,
    ensaios: CALENDARIO_INICIAL.filter(e => e.tipo === 'Ensaio').length,
    tarefasOrfas: orfas,
    macrotarefasDesfile: MACROTAREFAS_DESFILE_INICIAIS.length,
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
