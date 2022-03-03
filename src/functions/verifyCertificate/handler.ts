import {
  ValidatedEventAPIGatewayProxyHandler,
  formatJSONResponse,
} from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { doc } from '@libs/dynamodb-client';
import { errorHandler } from '@utils/errorHandler';

interface IUserCertificate {
  id: string;
  name: string;
  grade: string;
  created_at: string;
}

const handler: ValidatedEventAPIGatewayProxyHandler<string> = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) return formatJSONResponse(undefined, 400);

    const { Items } =
      (await doc
        .query({
          TableName: 'users_certificates',
          KeyConditionExpression: 'id = :id',
          ExpressionAttributeValues: {
            ':id': id,
          },
        })
        .promise()) || {};

    if (!Items?.length) {
      return formatJSONResponse(
        { message: 'Certificado não encontrado!' },
        404
      );
    }

    const { name } = Items[0] as IUserCertificate;

    const url = !process.env.IS_OFFLINE
      ? `${process.env.AWS_BUCKET_NAME}/${id}.pdf`
      : `file://${process.cwd()}/tmp/certificates/${id}-certificate.pdf`;

    return formatJSONResponse(
      { message: 'Certificado válido!', name, url },
      200
    );
  } catch (err) {
    return errorHandler(err);
  }
};

export const main = middyfy(handler);
