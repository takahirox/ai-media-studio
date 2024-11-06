import { type Tool } from "../Tool";

export const CONTROL_STRUCTURE_TOOL: Tool = {
  category: 'Image Generation',
  id: 'Control Structure',
  name: 'Control Structure',
  ui: [
    {
      default: '',
      inputName: 'prompt',
      mappingType: 'direct',
      maxLength: 10000,
      name: 'prompt',
      // TODO: Improve wordings
      placeHolder: 'Type what you want to see',
      type: 'text',
    },
    {
      default: '',
      inputName: 'image',
      mappingType: 'direct',
      name: 'image',
      type: 'image',
    },
    {
      advanced: true,
      default: '',
      inputName: 'negativePrompt',
      mappingType: 'direct',
      maxLength: 10000,
      name: 'negativePrompt',
      optional: true,
      // TODO: Improve wordings
      placeHolder: 'Type what you don\'t want to see',
      type: 'text',
    },
    {
      advanced: true,
      inputName: 'controlStrength',
      mappingType: 'direct',
      name: 'controlStrength',
      default: 0.7,
      max: 1.0,
      min: 0.0,
      optional: true,
      step: 0.01,
      type: 'slider',
    },
  ],
  path: '/generation/control_structure',
  pid: 'Control Structure',
  randomness: true,
};
