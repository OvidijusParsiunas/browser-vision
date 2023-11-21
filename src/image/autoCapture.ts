import {buildBody, sendRequest} from '../request/request';
import {captureScreenshot} from './screenshot';
import {updateConfig} from '../config/config';
import {Config} from '../utils/types';

const SECOND_ML = 1000;

export function setUpAutoCapture(config: Config, resultEl: HTMLTextAreaElement) {
  const startButtonEl = document.getElementById('browser-vision-auto-capture') as HTMLButtonElement;
  const frequencyEl = document.getElementById('browser-vision-auto-frequency') as HTMLInputElement;
  startButtonEl.addEventListener('click', () => toggleAutoCapture(startButtonEl, frequencyEl, config, resultEl));
}

// WORK - hotkey

// prettier-ignore
function toggleAutoCapture(startButtonEl: HTMLButtonElement, frequencyEl: HTMLInputElement,
    config: Config, resultEl: HTMLTextAreaElement) {
  if (config.isAutoActive) {
    startButtonEl.innerText = 'Active';
  } else {
    const timeout = Number.parseFloat(frequencyEl.value) * SECOND_ML;
    const processedTimeout = Math.max(timeout, SECOND_ML);
    autoCapture(processedTimeout, config, resultEl);
    startButtonEl.innerText = 'Stop';
  }
  config.isAutoActive = !config.isAutoActive;
  updateConfig(config);
}

function autoCapture(timeout: number, config: Config, resultEl: HTMLTextAreaElement) {
  setTimeout(async () => {
    await captureScreenshot(config);
    sendRequest(buildBody(config), resultEl);
    config.images = [];
    setTimeout(() => {
      updateConfig(config);
      // sendButtonEl.style.pointerEvents = '';
    });
    if (config.isAutoActive) autoCapture(timeout, config, resultEl);
  }, timeout);
}
