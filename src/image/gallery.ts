import {Config} from '../utils/types';

export function setUpGallery(config: Config) {
  const galleryEl = document.getElementById('browser-vision-images') as HTMLElement;
  galleryEl.style.overflow = 'auto';
  galleryEl.style.maxHeight = '100px';
  config.images.forEach((image) => {
    addImage(galleryEl, image);
  });
  return galleryEl;
}

export function addImage(galleryEl: HTMLElement, image: string) {
  const imageIconEl = document.createElement('img');
  imageIconEl.style.width = '80px';
  imageIconEl.style.height = '40px';
  imageIconEl.style.border = '1px solid grey';
  imageIconEl.style.borderRadius = '8px';
  imageIconEl.src = image;
  galleryEl.appendChild(imageIconEl);
}
