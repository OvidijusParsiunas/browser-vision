import {Config} from '../utils/types';

export class RequestQueue {
  private readonly _config: Config;
  private readonly _resultEl: HTMLTextAreaElement;
  private readonly _galleryEl: HTMLElement;
  // requests:

  constructor(config: Config, resultEl: HTMLTextAreaElement, galleryEl: HTMLElement) {
    this._config = config;
    this._resultEl = resultEl;
    this._galleryEl = galleryEl;
  }
}
