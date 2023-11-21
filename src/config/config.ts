import {Config} from '../utils/types';

const DEFAULT_INSTRUCTION = 'Tell me what you think about this image';
const BROWSER_VISION_STORAGE = 'browser-vision';

// WORK - ability to remove the icon
// WORK - prevent multiple auto capture sessions
// use another storage item?????
export function processConfig(): Config {
  // remove this
  const defaultConfig = {images: [], allImages: [], instruction: DEFAULT_INSTRUCTION, isAutoActive: false};
  updateConfig(defaultConfig);
  //
  const config = localStorage.getItem(BROWSER_VISION_STORAGE);
  if (!config) {
    const defaultConfig = {images: [], allImages: [], instruction: DEFAULT_INSTRUCTION, isAutoActive: false};
    updateConfig(defaultConfig);
    return defaultConfig;
  }
  return JSON.parse(config);
}

export function updateConfig(config: Config) {
  try {
    localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
  } catch (e) {
    // WORK - thrown when allImages exceeds size
    console.error(e);
    console.log('error');
  }
}
