import { defineConfig } from 'orval'

export default defineConfig({
  ems: {
    input: {
      target: 'http://localhost:8080/v3/api-docs',
    },
    output: {
      mode: 'tags-split',
      target: './src/lib/api/generated/ems',
      schemas: './src/lib/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/lib/api/axios.ts',
          name: 'customInstance',
        },
      },
    },
  },
})