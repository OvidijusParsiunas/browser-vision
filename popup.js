document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('browser-vision-capture').addEventListener('click', captureScreenshot);
  document.getElementById('browser-vision-send').addEventListener('click', sendRequest);
});

// WORK - ability to remove the icon
let images = [];
const allImages = [];

async function captureScreenshot() {
  console.log('capturing image');
  const image = await chrome.tabs.captureVisibleTab(null, {format: 'png'});
  console.log('image captured');
  const gallery = document.getElementById('browser-vision-images');
  gallery.style.overflow = 'auto';
  gallery.style.maxHeight = '100px';
  const imageIcon = document.createElement('img');
  imageIcon.style.width = '80px';
  imageIcon.style.height = '40px';
  imageIcon.style.border = '1px solid grey';
  imageIcon.style.borderRadius = '8px';
  imageIcon.src = image;
  images.push(image);
  allImages.push(image);
  gallery.appendChild(imageIcon);
  scrollToBottom(gallery);
}

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

async function sendRequest() {
  console.log('requesting response');
  try {
    const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
      body: buildBody(),
    });
    const responseData = await result.json();
    console.log(responseData);
    const resultText = responseData.choices[0].message.content;
    const resultElement = document.getElementById('browser-vision-result');
    resultElement.value = resultText;
    images = [];
    const gallery = document.getElementById('browser-vision-images');
    gallery.replaceChildren();
  } catch (error) {
    console.error('Error:', error);
  }
}

function buildBody() {
  const body = {
    model: 'gpt-4-vision-preview',
    max_tokens: 300, // otherwise AI does not return full responses - remove when this behaviour changes
    messages: [
      {
        role: 'system',
        content: 'Tell me what you think about this image',
      },
    ],
  };
  const imageContent = images.map((image) => {
    return {type: 'image_url', image_url: {url: image}};
  });
  if (imageContent.length > 0) body.messages.push({role: 'user', content: imageContent});
  return JSON.stringify(body);
}
