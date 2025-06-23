import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://graphql.csesoc.app/v1/graphql',
  documents: ['src/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/generated/graphql/': {
      // plugins: [
      //   'typescript',
      //   'typescript-operations',
      //   'typescript-graphql-request',
      // ],
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
  },
};

export default config;
