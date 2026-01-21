/** @type {import('jest').Config} */
module.exports = {
   rootDir: __dirname,
   testMatch: ["**/*.spec.ts"],
   testEnvironment: "node",
   transform: {
      "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
   },
};
