import { formatJSONResponse } from '@libs/api-gateway';

const errorHandler = (error) => {
  console.log(error);

  const statusCode = error?.status || 400;

  return formatJSONResponse({ error }, statusCode);
};

export { errorHandler };
