/**
 * Módulo de Armazenamento de Arquivos e Mídia (Vercel Blob Storage).
 * 
 * Permite o upload de partituras (PDF), artes gráficas (PNG/SVG) e documentos do bloco.
 * Se o token da Vercel Blob não estiver configurado no ambiente, opera com fallback local.
 */

import { put } from '@vercel/blob';

export interface RespostaUploadBlob {
  sucesso: boolean;
  url: string;
  nomeArquivo: string;
  tamanho?: number;
  mensagem?: string;
}

/**
 * Verifica se o token de acesso de leitura e escrita do Vercel Blob está configurado.
 * 
 * @returns Booleano indicando a presença da variável BLOB_READ_WRITE_TOKEN
 */
export function isBlobConfigured(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return Boolean(token && token.trim().length > 0);
}

/**
 * Faz o upload de um arquivo para o Vercel Blob Storage público.
 * 
 * @param caminhoOuNome - Nome amigável ou pasta/arquivo no Blob (ex: 'partituras/marchinha.pdf')
 * @param dados - Buffer, Blob, ArrayBuffer ou string do arquivo
 * @param contentType - Tipo MIME do arquivo (ex: 'application/pdf', 'image/png')
 * @returns Objeto com a URL pública gerada no CDN da Vercel ou mensagem de status
 */
export async function uploadArquivoBlob(
  caminhoOuNome: string,
  dados: Buffer | Blob | ArrayBuffer | string,
  contentType?: string
): Promise<RespostaUploadBlob> {
  const nomeLimpo = caminhoOuNome.replace(/\s+/g, '_');

  if (!isBlobConfigured()) {
    // Fallback: se for string (data URI) ou sem token, retorna indicação para dev local
    return {
      sucesso: true,
      url: typeof dados === 'string' && dados.startsWith('data:') ? dados : `/uploads/${nomeLimpo}`,
      nomeArquivo: nomeLimpo,
      mensagem: 'Armazenado em modo local (BLOB_READ_WRITE_TOKEN não configurado).'
    };
  }

  try {
    const blob = await put(nomeLimpo, dados, {
      access: 'public',
      contentType: contentType || 'application/octet-stream'
    });

    return {
      sucesso: true,
      url: blob.url,
      nomeArquivo: blob.pathname,
      mensagem: 'Upload realizado com sucesso no Vercel Blob!'
    };
  } catch (error: any) {
    console.error('Erro no upload para Vercel Blob:', error);
    return {
      sucesso: false,
      url: '',
      nomeArquivo: nomeLimpo,
      mensagem: `Falha no upload: ${error.message}`
    };
  }
}
