import { defineConfig } from "cypress";

export default defineConfig({
  projectId: '5xjah3',
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:5173/",
    blockHosts: ['*.clarity.ms'],
  },
});
