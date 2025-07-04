import { Readable } from 'node:stream';
import { type ReadableStream } from 'node:stream/web'

export function pipeFetch(fetchResponse: Response, output: any) {
  output.writeHead(fetchResponse.status, fetchResponse.headers);
  Readable.fromWeb(fetchResponse.body as ReadableStream).pipe(output);
}

export function getUpstreamHeader(apiKey: string): any {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
}