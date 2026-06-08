import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const IMPORT_DIR = `${RNFS.DocumentDirectoryPath}/stikaro_imports`;

const ensureImportDir = async () => {
  const exists = await RNFS.exists(IMPORT_DIR);
  if (!exists) {
    await RNFS.mkdir(IMPORT_DIR);
  }
};

const getFileExtension = (filename?: string) => {
  const match = filename?.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() || 'jpg';
};

const toFileUri = (path: string) =>
  path.startsWith('file://') ? path : `file://${path}`;

export const materializePhotoForEditing = async (
  uri: string,
  filename?: string,
) => {
  if (Platform.OS !== 'android' || !uri.startsWith('content://')) {
    return uri;
  }

  await ensureImportDir();

  const ext = getFileExtension(filename);
  const destination = `${IMPORT_DIR}/photo_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  await RNFS.copyFile(uri, destination);

  return toFileUri(destination);
};
