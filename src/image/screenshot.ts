import {updateConfig} from '../config/config';
import {Config} from '../utils/types';
import {addImage} from './gallery';

export async function captureScreenshot(config: Config, gallery?: HTMLElement) {
  console.log('capturing image');
  const image = await chrome.tabs.captureVisibleTab(null as unknown as number, {format: 'png'});
  console.log('image captured');
  config.images.push(image);
  config.allImages.push(image);
  if (gallery) {
    addImage(gallery, image);
    scrollToBottom(gallery);
  }
  setTimeout(() => updateConfig(config));
}

function scrollToBottom(element: HTMLElement) {
  element.scrollTop = element.scrollHeight;
}
