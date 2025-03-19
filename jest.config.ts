module.exports = {
  preset: "ts-jest",
  // testEnvironment: "jsdom",
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["./jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: `react-jsx`,
        },
      },
    ],
    "^.+\\.(js|jsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
};
