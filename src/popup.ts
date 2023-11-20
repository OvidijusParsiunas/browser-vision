import {Config, ImageContent} from './types';

document.addEventListener('DOMContentLoaded', function () {
  const config = processConfig();
  setUpTask(config);
  setUpCapture(config);
  setUpRequest(config);
});

const BROWSER_VISION_STORAGE = 'browser-vision';

// WORK - ability to remove the icon
// WORK - prevent multiple auto capture sessions
// use another storage item?????
function processConfig() {
  if (!localStorage.getItem(BROWSER_VISION_STORAGE)) {
    const defaultConfig: Config = {images: [], allImages: [], task: 'Tell me what you think about this image'};
    localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(defaultConfig));
    return defaultConfig;
  }
  return JSON.parse(localStorage.getItem(BROWSER_VISION_STORAGE) as string) as Config;
}

function setUpTask(config: Config) {
  const taskEl = document.getElementById('browser-vision-task') as HTMLTextAreaElement;
  taskEl.addEventListener('keyup', (event: KeyboardEvent) => changeTask(config, event));
  taskEl.value = config.task;
}

function changeTask(config: Config, event: KeyboardEvent) {
  config.task = (event.target as HTMLTextAreaElement).value;
  localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
}

function setUpCapture(config: Config) {
  const gallery = setUpGallery(config);
  const captureButton = document.getElementById('browser-vision-capture') as HTMLButtonElement;
  captureButton.addEventListener('click', () => captureScreenshot(config, gallery));
}

function setUpGallery(config: Config) {
  const gallery = document.getElementById('browser-vision-images') as HTMLElement;
  gallery.style.overflow = 'auto';
  gallery.style.maxHeight = '100px';
  config.images.forEach((image) => {
    addImage(gallery, image);
  });
  return gallery;
}

function addImage(gallery: HTMLElement, image: string) {
  const imageIcon = document.createElement('img');
  imageIcon.style.width = '80px';
  imageIcon.style.height = '40px';
  imageIcon.style.border = '1px solid grey';
  imageIcon.style.borderRadius = '8px';
  imageIcon.src = image;
  gallery.appendChild(imageIcon);
}

async function captureScreenshot(config: Config, gallery: HTMLElement) {
  console.log('capturing image');
  const image = await chrome.tabs.captureVisibleTab(null as unknown as number, {format: 'png'});
  console.log('image captured');
  config.images.push(image);
  config.allImages.push(image);
  addImage(gallery, image);
  scrollToBottom(gallery);
  setTimeout(() => {
    localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
  });
}

function scrollToBottom(element: HTMLElement) {
  element.scrollTop = element.scrollHeight;
}

function setUpRequest(config: Config) {
  const sendButton = document.getElementById('browser-vision-send') as HTMLElement;
  sendButton.addEventListener('click', () => sendRequest(config));
}

async function sendRequest(config: Config) {
  console.log('requesting response');
  try {
    const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
      body: buildBody(config),
    });
    const responseData = await result.json();
    console.log(responseData);
    const resultText = responseData.choices[0].message.content;
    const resultElement = document.getElementById('browser-vision-result') as HTMLTextAreaElement;
    resultElement.value = resultText;
    config.images = [];
    const gallery = document.getElementById('browser-vision-images') as HTMLElement;
    gallery.replaceChildren();
    setTimeout(() => {
      localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

function buildBody(config: Config) {
  const body: {model: string; max_tokens?: number; messages: {role: string; content: string | ImageContent}[]} = {
    model: 'gpt-4-vision-preview',
    max_tokens: 300, // otherwise AI does not return full responses - remove when this behaviour changes
    messages: [
      {
        role: 'system',
        content: localStorage.getItem('browser-vision-task') as string,
      },
    ],
  };
  const imageContent = config.images.map((image) => {
    return {type: 'image_url', image_url: {url: image}};
  });
  if (imageContent.length > 0) body.messages.push({role: 'user', content: imageContent});
  return JSON.stringify(body);
}
