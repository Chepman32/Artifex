import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('../src/components/modals/BottomSheet', () => {
  return {
    BottomSheet: ({ visible, children }: any) => (visible ? children : null),
  };
});

jest.mock('@react-native-camera-roll/camera-roll', () => {
  return {
    CameraRoll: {
      save: jest.fn().mockResolvedValue(undefined),
    },
  };
});

jest.mock('../src/utils/imageExporter', () => {
  return {
    exportCanvasToImage: jest.fn().mockResolvedValue({
      filepath: '/tmp/stikaro_export.png',
      format: 'png',
      mime: 'image/png',
    }),
  };
});

jest.mock('../src/stores/editorStore', () => {
  return {
    useEditorStore: () => ({
      canvasElements: [],
      sourceImagePath: 'file:///tmp/source.jpg',
      sourceImageDimensions: { width: 1000, height: 1000 },
      canvasSize: { width: 500, height: 500 },
      appliedFilter: null,
    }),
  };
});

jest.mock('../src/hooks/useTranslation', () => {
  return {
    useTranslation: () => ({
      common: {
        error: 'Error',
        ok: 'OK',
      },
      export: {
        saveToDevice: 'Save on device',
        shareOnInstagram: 'Share on Instagram',
        shareOnX: 'Share on X',
        savedToPhotos: 'Saved to Photos',
        savedToPhotosDesc: 'Saved',
        viewInGallery: 'View in gallery',
        noImageToExport: 'No image to export',
        failedToExport: 'Failed to export image',
        failedToSave: 'Failed to save image to Photos',
        couldNotShareInstagram: 'Could not share on Instagram.',
        couldNotShareX: 'Could not share on X.',
      },
    }),
  };
});

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Alert: {
      alert: jest.fn(),
    },
  };
});

import { exportCanvasToImage } from '../src/utils/imageExporter';
import { ExportModal } from '../src/components/modals/ExportModal';

describe('ExportModal watermarking', () => {
  it('passes addWatermark=true when exporting', async () => {
    const { getByText } = render(
      <ExportModal
        visible
        onClose={() => undefined}
        canvasDimensions={{ width: 500, height: 500 }}
      />,
    );

    fireEvent.press(getByText('Save on device'));

    await waitFor(() => {
      expect(exportCanvasToImage).toHaveBeenCalled();
    });

    const call = (exportCanvasToImage as jest.Mock).mock.calls[0];
    const options = call[3];

    expect(options).toEqual(
      expect.objectContaining({
        addWatermark: true,
      }),
    );
  });
});
