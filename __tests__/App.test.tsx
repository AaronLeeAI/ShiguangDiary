/**
 * @format
 */

import 'react-native'
import React from 'react'

// Keep the App smoke test focused on top-level providers/bootstrap.
// Navigation routes are covered by integration/manual QA and require native-stack internals.
jest.mock('@navigation', () => ({
  AppNavigator: () => null,
}))

jest.mock('@store/diaryStore', () => ({
  useDiaryStore: (selector: (state: { init: () => void }) => unknown) =>
    selector({ init: jest.fn() }),
}))

import App from '../App'

// Note: import explicitly to use the types shipped with jest.
import { it } from '@jest/globals'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  renderer.create(<App />)
})
