import { NextRequest, NextResponse } from 'next/server';
import { uploadArquivoBlob, isBlobConfigured } from '@/lib/blob';

/**
 * Endpoint de upload de arquivos para o Vercel Blob Storage (POST /api/blob/upload).
 * Recebe FormData com campo 'file' e opcional 'pasta' ou 'nomePersonalizado'.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Nenhum arquivo enviado no campo "file".' },
        { status: 400 }
      );
    }

    const pasta = (formData.get('pasta') as string) || 'geral';
    const nomePersonalizado = formData.get('nome') as string | null;
    const nomeFinal = `${pasta}/${nomePersonalizado || file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resultado = await uploadArquivoBlob(nomeFinal, buffer, file.type);

    return NextResponse.json({
      ...resultado,
      blobAtivo: isBlobConfigured()
    });
  } catch (error: any) {
    console.error('Erro na rota de upload Blob:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: `Erro interno no upload: ${error.message}` },
      { status: 500 }
    );
  }
}
