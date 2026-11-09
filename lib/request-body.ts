/** Count received bytes, including chunked requests without Content-Length. */
export class RequestBodyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function readJsonObject(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new RequestBodyError('JSON-Anfrage erforderlich.', 415);
  if (Number(request.headers.get('content-length') || 0) > maxBytes) throw new RequestBodyError('Anfrage zu groß.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError('Anfrage fehlt.', 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new RequestBodyError('Anfrage zu groß.', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch { throw new RequestBodyError('Ungültige JSON-Anfrage.', 400); }
}
