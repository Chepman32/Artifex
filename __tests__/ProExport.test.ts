const mockCanvas = { clear: jest.fn(), drawImageRect: jest.fn() };
const mockImage = { width: () => 1000, height: () => 1000 };
jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Surface: {
      Make: () => ({
        getCanvas: () => mockCanvas,
        makeImageSnapshot: () => ({ encodeToBase64: () => 'encoded' }),
      }),
    },
    Color: (s: string) => s,
    XYWHRect: (x: number, y: number, width: number, height: number) => ({
      x,
      y,
      width,
      height,
    }),
    Paint: () => ({ setAntiAlias: jest.fn() }),
    Data: { fromBase64: (s: string) => s },
    Image: { MakeImageFromEncoded: () => mockImage },
  },
}));
jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  exists: jest.fn().mockResolvedValue(true),
  readFile: jest.fn().mockResolvedValue('image'),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@react-native-camera-roll/camera-roll', () => ({ CameraRoll: {} }));
jest.mock('../src/utils/textRasterizer', () => ({
  rasterizeTextElementToWatermark: jest.fn(),
}));
jest.mock('../src/services/subscriptions', () => ({
  refreshEntitlement: jest.fn().mockResolvedValue(false),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Image: { resolveAssetSource: () => ({ uri: 'file:///logo.png' }) },
}));

import { refreshEntitlement } from '../src/services/subscriptions';
import { exportCanvasToImage } from '../src/utils/imageExporter';
import { ProRequiredError } from '../src/utils/proExportPolicy';
import type { CanvasElement } from '../src/types';

const exportImage = (elements: CanvasElement[] = [], purpose?: 'thumbnail') =>
  exportCanvasToImage(
    'file:///source.png',
    { width: 2000, height: 1000 },
    elements,
    { format: 'png', quality: 100, purpose },
  );
beforeEach(() => {
  jest.clearAllMocks();
  (refreshEntitlement as jest.Mock).mockResolvedValue(false);
});

test('a free export draws the real logo last in the lower-right corner', async () => {
  await exportImage();
  expect(mockCanvas.drawImageRect).toHaveBeenCalledTimes(2);
  expect(mockCanvas.drawImageRect.mock.calls[1][2]).toEqual({
    x: 1875,
    y: 875,
    width: 100,
    height: 100,
  });
});
test('an active subscription exports without the logo', async () => {
  (refreshEntitlement as jest.Mock).mockResolvedValue(true);
  await exportImage();
  expect(mockCanvas.drawImageRect).toHaveBeenCalledTimes(1);
});
test('saved Pro artwork cannot be exported with expired access', async () => {
  await expect(
    exportImage([{ assetId: 'pro-crystal-heart' } as CanvasElement]),
  ).rejects.toBeInstanceOf(ProRequiredError);
  expect(mockCanvas.drawImageRect).not.toHaveBeenCalled();
});
test('internal project thumbnails have no branding or purchase query', async () => {
  await exportImage([], 'thumbnail');
  expect(mockCanvas.drawImageRect).toHaveBeenCalledTimes(1);
  expect(refreshEntitlement).not.toHaveBeenCalled();
});
