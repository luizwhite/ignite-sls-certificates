import type { AWS } from '@serverless/typescript';

import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'verifyCertificate/{id}',
        cors: true,
      },
    },
  ],
} as AWS['functions'][0];
