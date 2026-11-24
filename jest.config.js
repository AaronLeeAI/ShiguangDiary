module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // __tests__/fixtures 下是可复用的测试替身，不当作测试用例执行
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/fixtures/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|react-native-.*)/)',
  ],
}
