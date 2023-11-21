import {updateConfig} from './config/config';
import {Config} from './utils/types';

export function setUpInstruction(config: Config) {
  const instructionEl = document.getElementById('browser-vision-instruction') as HTMLTextAreaElement;
  instructionEl.addEventListener('keyup', () => change(config, instructionEl));
  instructionEl.value = config.instruction;
}

function change(config: Config, instructionEl: HTMLTextAreaElement) {
  config.instruction = instructionEl.value;
  updateConfig(config);
}
