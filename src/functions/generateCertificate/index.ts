import type { AWS } from '@serverless/typescript';

import { handlerPath } from '@libs/handler-resolver';

import schema from './schema';

/* eslint-disable no-template-curly-in-string */
export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'arn:aws:iam::957059127051:role/ignite-certificates-sa-east-1-lambdaRole-s3write-and-dynamodb',
  timeout: 30,
  events: [
    {
      http: {
        method: 'post',
        path: 'generateCertificate',
        cors: true,
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
} as AWS['functions'][0];
