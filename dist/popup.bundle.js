const DEFAULT_INSTRUCTION = 'Tell me what you think about this image';
const BROWSER_VISION_STORAGE = 'browser-vision';
// WORK - ability to remove the icon
// WORK - prevent multiple auto capture sessions
// use another storage item?????
function processConfig() {
    // remove this
    const defaultConfig = { images: [], allImages: [], instruction: DEFAULT_INSTRUCTION, isAutoActive: false };
    updateConfig(defaultConfig);
    //
    const config = localStorage.getItem(BROWSER_VISION_STORAGE);
    if (!config) {
        const defaultConfig = { images: [], allImages: [], instruction: DEFAULT_INSTRUCTION, isAutoActive: false };
        updateConfig(defaultConfig);
        return defaultConfig;
    }
    return JSON.parse(config);
}
function updateConfig(config) {
    try {
        localStorage.setItem(BROWSER_VISION_STORAGE, JSON.stringify(config));
    }
    catch (e) {
        // WORK - thrown when allImages exceeds size
        console.error(e);
        console.log('error');
    }
}

function setUpGallery(config) {
    const galleryEl = document.getElementById('browser-vision-images');
    galleryEl.style.overflow = 'auto';
    galleryEl.style.maxHeight = '100px';
    config.images.forEach((image) => {
        addImage(galleryEl, image);
    });
    return galleryEl;
}
function addImage(galleryEl, image) {
    const imageIconEl = document.createElement('img');
    imageIconEl.style.width = '80px';
    imageIconEl.style.height = '40px';
    imageIconEl.style.border = '1px solid grey';
    imageIconEl.style.borderRadius = '8px';
    imageIconEl.src = image;
    galleryEl.appendChild(imageIconEl);
}

async function captureScreenshot(config, gallery) {
    console.log('capturing image');
    const image = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    console.log('image captured');
    config.images.push(image);
    config.allImages.push(image);
    if (gallery) {
        addImage(gallery, image);
        scrollToBottom(gallery);
    }
    setTimeout(() => updateConfig(config));
}
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

function setUpManualCapture(config, galleryEl) {
    const captureButtonEl = document.getElementById('browser-vision-capture');
    captureButtonEl.addEventListener('click', () => captureScreenshot(config, galleryEl));
}

function setUpResult() {
    return document.getElementById('browser-vision-result');
}
function updateResult(resultEl, openAIResult) {
    console.log(openAIResult);
    resultEl.value = openAIResult.choices[0].message.content;
}

function setUpRequest(config, resultEl, galleryEl) {
    const sendButtonEl = document.getElementById('browser-vision-send');
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
async function sendRequest(body, resultEl, galleryEl) {
    console.log('requesting response');
    try {
        const result = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer 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',
            },
            body,
        });
        const responseData = await result.json();
        updateResult(resultEl, responseData);
        galleryEl === null || galleryEl === void 0 ? void 0 : galleryEl.replaceChildren();
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
                content: config.instruction,
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

const SECOND_ML = 1000;
function setUpAutoCapture(config, resultEl) {
    const startButtonEl = document.getElementById('browser-vision-auto-capture');
    const frequencyEl = document.getElementById('browser-vision-auto-frequency');
    startButtonEl.addEventListener('click', () => toggleAutoCapture(startButtonEl, frequencyEl, config, resultEl));
}
// WORK - hotkey
// prettier-ignore
function toggleAutoCapture(startButtonEl, frequencyEl, config, resultEl) {
    if (config.isAutoActive) {
        startButtonEl.innerText = 'Active';
    }
    else {
        const timeout = Number.parseFloat(frequencyEl.value) * SECOND_ML;
        const processedTimeout = Math.max(timeout, SECOND_ML);
        autoCapture(processedTimeout, config, resultEl);
        startButtonEl.innerText = 'Stop';
    }
    config.isAutoActive = !config.isAutoActive;
    updateConfig(config);
}
function autoCapture(timeout, config, resultEl) {
    setTimeout(async () => {
        await captureScreenshot(config);
        sendRequest(buildBody(config), resultEl);
        config.images = [];
        setTimeout(() => {
            updateConfig(config);
            // sendButtonEl.style.pointerEvents = '';
        });
        if (config.isAutoActive)
            autoCapture(timeout, config, resultEl);
    }, timeout);
}

function setUpInstruction(config) {
    const instructionEl = document.getElementById('browser-vision-instruction');
    instructionEl.addEventListener('keyup', () => change(config, instructionEl));
    instructionEl.value = config.instruction;
}
function change(config, instructionEl) {
    config.instruction = instructionEl.value;
    updateConfig(config);
}

document.addEventListener('DOMContentLoaded', () => {
    const config = processConfig();
    setUpInstruction(config);
    const galleryEl = setUpGallery(config);
    setUpManualCapture(config, galleryEl);
    const resultEl = setUpResult();
    setUpRequest(config, resultEl, galleryEl);
    setUpAutoCapture(config, resultEl);
});
