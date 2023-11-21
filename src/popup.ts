import {setUpManualCapture} from './image/manualCapture';
import {setUpAutoCapture} from './image/autoCapture';
import {setUpInstruction} from './instruction';
import {setUpRequest} from './request/request';
import {processConfig} from './config/config';
import {setUpGallery} from './image/gallery';
import {setUpResult} from './result/result';

document.addEventListener('DOMContentLoaded', () => {
  const config = processConfig();
  setUpInstruction(config);
  const galleryEl = setUpGallery(config);
  setUpManualCapture(config, galleryEl);
  const resultEl = setUpResult();
  setUpRequest(config, resultEl, galleryEl);
  setUpAutoCapture(config, resultEl);
});
