import { type Tool } from "../Tool";

export const CONTROL_STYLE_TOOL: Tool = {
  category: 'Image Generation',
  featured: {
    menuImage: './menu_icons/control_style.png',
  },
  id: 'Control Style',
  name: 'Control Style',
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
      name: 'aspectRatio',
      default: '1:1',
      inputName: 'aspectRatio',
      mappingType: 'direct',
      type: 'aspectRatioSlider',
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
      default: 0.5,
      inputName: 'fidelity',
      mappingType: 'direct',
      max: 1.0,
      min: 0.0,
      name: 'fidelity',
      optional: true,
      step: 0.01,
      type: 'slider',
    },
  ],
  path: '/generation/control_style',
  pid: 'Control Style',
  randomness: true,
};
