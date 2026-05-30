export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  silent: true,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      useESM: true,
      tsconfig: { module: "ESNext" },
      diagnostics: { ignoreCodes: ["TS151001"] }
    }]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts"]
};
