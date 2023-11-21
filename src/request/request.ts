import {Config, OpenAIBody} from '../utils/types';
import {updateConfig} from '../config/config';
import {updateResult} from '../result/result';

export function setUpRequest(config: Config, resultEl: HTMLTextAreaElement, galleryEl: HTMLElement) {
  const sendButtonEl = document.getElementById('browser-vision-send') as HTMLElement;
  sendButtonEl.addEventListener('click', async () => {
    sendButtonEl.style.pointerEvents = 'none';
    await sendRequest(buildBody(config), resultEl, galleryEl);
    config.images = [];
    setTimeout(() => {
      updateConfig(config);
      sendButtonEl.style.pointerEvents = '';
    });
  });
}

export async function sendRequest(body: string, resultEl: HTMLTextAreaElement, galleryEl?: HTMLElement) {
  console.log('requesting response');
  try {
    const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
      body,
    });
    const responseData = await result.json();
    updateResult(resultEl, responseData);
    galleryEl?.replaceChildren();
  } catch (error) {
    console.error('Error:', error);
  }
}

export function buildBody(config: Config) {
  const body: OpenAIBody = {
    model: 'gpt-4-vision-preview',
    max_tokens: 300, // otherwise AI does not return full responses - remove when this behaviour changes
    messages: [
      {
        role: 'system',
        content: config.instruction,
      },
    ],
  };
  const imageContent = config.images.map((image) => {
    return {type: 'image_url', image_url: {url: image}};
  });
  if (imageContent.length > 0) body.messages.push({role: 'user', content: imageContent});
  return JSON.stringify(body);
}
