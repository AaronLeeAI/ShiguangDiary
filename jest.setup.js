/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup'

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  const insets = { top: 0, right: 0, bottom: 0, left: 0 }
  const frame = { x: 0, y: 0, width: 390, height: 844 }
  const SafeAreaInsetsContext = React.createContext(insets)
  const SafeAreaFrameContext = React.createContext(frame)
  return {
    SafeAreaProvider: ({ children }) =>
      React.createElement(
        SafeAreaFrameContext.Provider,
        { value: frame },
        React.createElement(SafeAreaInsetsContext.Provider, { value: insets }, children),
      ),
    SafeAreaView: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    initialWindowMetrics: { insets, frame },
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
  }
})

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp/shiguang-test-docs',
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => undefined),
  writeFile: jest.fn(async () => undefined),
  readFile: jest.fn(async () => '{}'),
  copyFile: jest.fn(async () => undefined),
  unlink: jest.fn(async () => undefined),
  readDir: jest.fn(async () => []),
  stat: jest.fn(async () => ({ size: 0 })),
}))

jest.mock('react-native-mmkv', () => {
  const stores = new Map()
  class MMKV {
    getString(key) {
      return stores.get(key)
    }
    set(key, value) {
      stores.set(key, String(value))
    }
    delete(key) {
      stores.delete(key)
    }
  }
  return { MMKV }
})

jest.mock('react-native-sqlite-storage', () => {
  const db = {
    executeSql: jest.fn(async () => [[], { rows: { length: 0, item: () => null, raw: () => [] } }]),
    transaction: jest.fn(callback => callback({ executeSql: jest.fn() })),
    close: jest.fn(async () => undefined),
  }
  return {
    __esModule: true,
    default: {
      enablePromise: jest.fn(),
      openDatabase: jest.fn(async () => db),
    },
    enablePromise: jest.fn(),
    openDatabase: jest.fn(async () => db),
  }
})

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  default: { trigger: jest.fn() },
}))

const ReactNative = require('react-native')
ReactNative.BackHandler.addEventListener = jest.fn(() => ({ remove: jest.fn() }))
ReactNative.BackHandler.removeEventListener = jest.fn()
