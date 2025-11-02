export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {}, // disable transform (pakai native ESM)
};
