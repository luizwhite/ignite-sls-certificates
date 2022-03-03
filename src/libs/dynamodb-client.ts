import { DynamoDB } from 'aws-sdk';

const isOffline = () => {
  return process.env.IS_OFFLINE;
};

const options = isOffline()
  ? {
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'fakeMyKeyId',
      secretAccessKeyId: 'fakeSecretAccessKey',
    }
  : undefined;

export const doc = new DynamoDB.DocumentClient(options);
