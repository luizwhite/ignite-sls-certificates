# Ignite Serverless Certificates - AWS Node.js Typescript

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/fermium (v14.19.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npm run deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn deploy` to deploy this stack to AWS

## Test your service

This template contains lambda functions triggered by HTTP requests made on the provisioned API Gateway REST API `/generateCertificate` with `POST` method, and `/verifyCertificate/{id}` with `GET` method. The request body of REST API `/generateCertificate` must be provided as `application/json`, and its body structure is tested by API Gateway against `src/functions/generateCertificate/schema.ts` JSON-Schema definition: it must contain the `id`, `name` and `grade` properties.

- requesting any other path than these mentioned above will result in API Gateway returning a `403` HTTP error code
- sending a `POST` request to `/generateCertificate` with a payload **not** containing the required properties will result in API Gateway returning a `400` HTTP error code
- sending a `POST` request to `/generateCertificate` with a payload containing the required properties will result in API Gateway returning a `201` HTTP status code with a message confirming that the certificate was generated.

> ⚠️ As is, this template, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Locally

In order to test the lambda functions locally, run the following command:

- `npm run dev` if you're using NPM
- `yarn dev` if you're using Yarn

Check the [serverless offline plugin documentation](https://www.serverless.com/plugins/serverless-offline) for more information.

> 📝 To run locally, it is needed to setup a fake `ignite-sls-offline` aws profile for dynamodb-local compatibility reasons, with same credentials informed in `src/libs/dynamodb-client.ts`

### Remotely

Copy and replace your `url` - found in Serverless `deploy` command output - and required parameters in the following `curl` command in your terminal or in Postman/Insomnia to test your newly deployed application.

```shell
curl --request POST \
  --url https://vitnyfwg46.execute-api.sa-east-1.amazonaws.com/dev/generateCertificate \
  --header 'Content-Type: application/json' \
  --data '{
	"id": "8a6acdcf-7424-44b7-96a3-2f4b55c8678f",
	"name": "Vicente Joaquim Nogueira",
	"grade": "9.00"
}'
```

> 📝 It will be necessary to configure an admin user on AWS IAM Configuration to get the necessary credentials to use with this project.

> 📝 To run remotely, it is needed to setup a real `ignite-sls` aws profile, with the credentials obtained to deploy to your AWS account stack.

> 📝 For regions other than `sa-east-1`, change the _region_ parameter at `serverless.ts`

> 📝 Adjust the name of your bucket in _AWS_BUCKET_NAME_ at `serverless.ts`

> 📝 Adjust the name of your role in `provider.iam.role` for the role you created that have access to dynamodb

> 📝 Adjust the name of your role in `role` at `/generateCertificate/index.ts` for the role you created that have both access to dynamodb and write permissions to AWS S3

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas
- `utils` - utility functions

```
.
├── src
│   ├── functions                   # Lambda configuration and source code folder
│   │   ├── generateCertificate
│   │   │   ├── handler.ts          # `generateCertificate` lambda source code
│   │   │   ├── index.ts            # `generateCertificate` lambda Serverless configuration
│   │   │   └── schema.ts           # `generateCertificate` lambda input event JSON-Schema
│   │   │
│   │   ├── verifyCertificate
│   │   │   ├── handler.ts          # `verifyCertificate` lambda source code
│   │   │   ├── index.ts            # `verifyCertificate` lambda Serverless configuration
│   │   │   └── schema.ts           # `verifyCertificate` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts                # Import/export of all lambda configurations
│   │
│   └── libs                        # Lambda shared code
│       └── apiGateway.ts           # API Gateway specific helpers
│       └── handlerResolver.ts      # Sharable library for resolving lambda handlers
│       └── lambda.ts               # Lambda middleware
│       └── dynamodb-client.ts      # Dynamodb client instance
│
├── package.json
├── serverless.ts                   # Serverless service file
├── tsconfig.json                   # Typescript compiler configuration
├── tsconfig.paths.json             # Typescript paths
```

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file
