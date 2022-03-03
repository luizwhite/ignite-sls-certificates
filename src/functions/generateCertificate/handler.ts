import { S3 } from 'aws-sdk';
import chromium from 'chrome-aws-lambda';
import { readFileSync as fsReadFileSync } from 'fs';
import { compile as hbsCompile } from 'handlebars';
import { join as pathJoin } from 'path';
import type { Browser, PDFOptions, Viewport } from 'puppeteer-core';

import type { ValidatedEventAPIGatewayProxyHandler } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { errorHandler } from '@utils/errorHandler';
import { doc } from '@libs/dynamodb-client';
import { ensureDirectoryExistence } from '@utils/ensureDirectoryExistence';

import schema from './schema';

type TemplateKeys = 'id' | 'name' | 'grade' | 'medal' | 'date';
type TemplateType = { [key in TemplateKeys]: string };

interface ILaunchOptions {
  args: string[];
  defaultViewport: Viewport;
  executablePath: string;
  headless: boolean;
  ignoreHTTPSErrors?: boolean;
}

const compile = (variables: TemplateType) => {
  const filePath = pathJoin(
    process.cwd(),
    'src',
    'templates',
    'certificate.hbs'
  );

  const html = fsReadFileSync(filePath, 'utf-8');

  return hbsCompile(html)(variables);
};

const handler: ValidatedEventAPIGatewayProxyHandler<typeof schema> = async (
  event
) => {
  const { id, name, grade } = event.body;
  console.log(event.body);

  const dateNow = new Date();
  const dateLocal = dateNow;
  dateLocal.setHours(dateLocal.getHours() - 3, 0, 0, 0);
  const date = dateLocal
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');

  try {
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
      await doc
        .put({
          TableName: 'users_certificates',
          Item: {
            id,
            name,
            grade,
            created_at: dateNow.toISOString(),
          },
        })
        .promise();
    }

    const medalPath = pathJoin(process.cwd(), 'src', 'templates', 'selo.png');
    const medal = fsReadFileSync(medalPath, 'base64');

    const variables: TemplateType = {
      id,
      name,
      grade,
      date,
      medal,
    };

    const content = compile(variables);

    let browser: Browser | null = null;
    let body: string;

    try {
      const { args, headless, defaultViewport } = chromium;
      const executablePath = await chromium.executablePath;

      const commonOptions = {
        defaultViewport,
        executablePath,
      };

      const options: ILaunchOptions = !process.env.IS_OFFLINE
        ? {
            args,
            headless,
            ignoreHTTPSErrors: true,
            ...commonOptions,
          }
        : {
            args: [],
            headless: true,
            ...commonOptions,
          };

      browser = await chromium.puppeteer.launch(options);

      const page = await browser.newPage();
      await page.setContent(content);

      const pdfOptions: PDFOptions = {
        format: 'a4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
      };

      if (!process.env.IS_OFFLINE) {
        const pdf = await page.pdf(pdfOptions);

        const s3 = new S3();
        await s3
          .putObject({
            Bucket: 'ignite-certificates-files',
            Key: `${id}.pdf`,
            Body: pdf,
            ContentType: 'application/pdf',
          })
          .promise();

        body = `${process.env.AWS_BUCKET_NAME}/${id}.pdf`;
      }

      if (process.env.IS_OFFLINE) {
        const filepath = `tmp/certificates/${id}-certificate.pdf`;
        ensureDirectoryExistence(`${process.cwd()}/${filepath}`);

        await page.pdf({
          ...pdfOptions,
          path: `./${filepath}`,
        });

        body = `file://${process.cwd()}/${filepath}`;
      }
    } catch (err) {
      return errorHandler(err);
    } finally {
      if (browser !== null) await browser.close();
    }

    return formatJSONResponse(
      {
        message: 'Certificado criado com sucesso!',
        body,
      },
      201
    );
  } catch (err) {
    return errorHandler(err);
  }
};

export const main = middyfy(handler);
