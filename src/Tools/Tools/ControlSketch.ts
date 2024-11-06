import { type Tool } from "../Tool";

export const CONTROL_SKETCH_TOOL: Tool = {
  category: 'Image Generation',
  featured: {
    menuImage: './menu_icons/control_sketch.png',
  },
  id: 'Control Sketch',
  name: 'Control Sketch',
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
  path: '/generation/control_sketch',
  pid: 'Control Sketch',
  randomness: true,
};
