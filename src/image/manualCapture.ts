import {captureScreenshot} from './screenshot';
import {Config} from '../utils/types';

export function setUpManualCapture(config: Config, galleryEl: HTMLElement) {
  const captureButtonEl = document.getElementById('browser-vision-capture') as HTMLButtonElement;
  captureButtonEl.addEventListener('click', () => captureScreenshot(config, galleryEl));
}
