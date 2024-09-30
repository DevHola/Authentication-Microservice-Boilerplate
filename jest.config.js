/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  roots: ["<rootDir>/test"], // Adjust the root directory as needed
  clearMocks: true,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"], // Adjust patterns to match your test file names
  coverageProvider: "v8", // or "babel" if using Babel for coverage collection

};
