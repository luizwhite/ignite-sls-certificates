import type { ValidatedEventAPIGatewayProxyHandler } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

// import schema from './schema';

const handler: ValidatedEventAPIGatewayProxyHandler<string> = async (event) => {
  return formatJSONResponse(
    {
      message: 'Hello World, welcome to the exciting Serverless world!',
      event,
    },
    201
  );
};

export const main = middyfy(handler);
