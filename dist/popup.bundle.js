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
        const defaultConfig = { images: [], allImages: [], task: 'Tell me what you think about this image' };
        localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(defaultConfig));
        return defaultConfig;
    }
    return JSON.parse(localStorage.getItem(BROWSER_VISION_STORAGE));
}
function setUpTask(config) {
    const taskEl = document.getElementById('browser-vision-task');
    taskEl.addEventListener('keyup', (event) => changeTask(config, event));
    taskEl.value = config.task;
}
function changeTask(config, event) {
    config.task = event.target.value;
    localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
}
function setUpCapture(config) {
    const gallery = setUpGallery(config);
    const captureButton = document.getElementById('browser-vision-capture');
    captureButton.addEventListener('click', () => captureScreenshot(config, gallery));
}
function setUpGallery(config) {
    const gallery = document.getElementById('browser-vision-images');
    gallery.style.overflow = 'auto';
    gallery.style.maxHeight = '100px';
    config.images.forEach((image) => {
        addImage(gallery, image);
    });
    return gallery;
}
function addImage(gallery, image) {
    const imageIcon = document.createElement('img');
    imageIcon.style.width = '80px';
    imageIcon.style.height = '40px';
    imageIcon.style.border = '1px solid grey';
    imageIcon.style.borderRadius = '8px';
    imageIcon.src = image;
    gallery.appendChild(imageIcon);
}
async function captureScreenshot(config, gallery) {
    console.log('capturing image');
    const image = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    console.log('image captured');
    config.images.push(image);
    config.allImages.push(image);
    addImage(gallery, image);
    scrollToBottom(gallery);
    setTimeout(() => {
        localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
    });
}
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}
function setUpRequest(config) {
    const sendButton = document.getElementById('browser-vision-send');
    sendButton.addEventListener('click', () => sendRequest(config));
}
async function sendRequest(config) {
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
        const resultElement = document.getElementById('browser-vision-result');
        resultElement.value = resultText;
        config.images = [];
        const gallery = document.getElementById('browser-vision-images');
        gallery.replaceChildren();
        setTimeout(() => {
            localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
}
function buildBody(config) {
    const body = {
        model: 'gpt-4-vision-preview',
        max_tokens: 300,
        messages: [
            {
                role: 'system',
                content: localStorage.getItem('browser-vision-task'),
            },
        ],
    };
    const imageContent = config.images.map((image) => {
        return { type: 'image_url', image_url: { url: image } };
    });
    if (imageContent.length > 0)
        body.messages.push({ role: 'user', content: imageContent });
    return JSON.stringify(body);
}
