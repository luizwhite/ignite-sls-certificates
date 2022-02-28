import type { AWS } from '@serverless/typescript';

import { handlerPath } from '@libs/handler-resolver';

// import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'hello2',
        cors: true,
        // request: {
        //   schemas: {
        //     'application/json': schema,
        //   },
        // },
      },
    },
  ],
} as AWS['functions'][0];
