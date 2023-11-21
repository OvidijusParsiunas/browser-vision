import {OpenAIResult} from '../utils/types';

export function setUpResult() {
  return document.getElementById('browser-vision-result') as HTMLTextAreaElement;
}

export function updateResult(resultEl: HTMLTextAreaElement, openAIResult: OpenAIResult) {
  console.log(openAIResult);
  resultEl.value = openAIResult.choices[0].message.content;
}
