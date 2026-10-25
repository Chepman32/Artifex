/** App shell smoke test; native interactions are covered by Maestro. */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { startSubscriptions } from '../src/services/subscriptions';

const mockStopSubscriptions = jest.fn();
jest.mock('react-native-reanimated', () => ({}));
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: require('react-native').View,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: require('react-native').View,
}));
jest.mock('../src/navigation/AppNavigator', () => {
  const { View } = require('react-native');
  return () => <View testID="app-navigator" />;
});
jest.mock('../src/stores/appStore', () => ({
  useAppStore: (selector: any) => selector({ preferences: { theme: 'dark' } }),
}));
jest.mock('../src/services/subscriptions', () => ({
  startSubscriptions: jest.fn(() => mockStopSubscriptions),
}));

test('renders navigation and starts and cleans up billing reconciliation', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer!.root.findByProps({ testID: 'app-navigator' })).toBeTruthy();
  expect(startSubscriptions).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () => renderer!.unmount());
  expect(mockStopSubscriptions).toHaveBeenCalledTimes(1);
});
