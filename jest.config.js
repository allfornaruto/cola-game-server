module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
	testEnvironment: "node",
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?)$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	reporters: [ "default", "jest-junit" ]
}
