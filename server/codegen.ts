import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://graphql.csesoc.app/v1/graphql',
  documents: ['src/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        documentMode: 'string',
      },
    },
  },
  pluckConfig: {
    modules: [
      {
        name: 'graphql-tag',
        identifier: 'graphql',
      },
    ],
  },
};

export default config;
