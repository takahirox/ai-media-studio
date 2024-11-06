import { type Tool } from "../Tool";

export const SEARCH_AND_RECOLOR_TOOL: Tool = {
  category: 'Image Edit',
  id: 'Search and Recolor',
  name: 'Search and Recolor',
  ui: [
    {
      default: '',
      inputName: 'selectPrompt',
      mappingType: 'direct',
      maxLength: 10000,
      name: 'selectPrompt',
      // TODO: Improve wordings
      placeHolder: 'Type what you want to search',
      type: 'text',
    },
    {
      default: '',
      inputName: 'prompt',
      mappingType: 'direct',
      maxLength: 10000,
      name: 'prompt',
      // TODO: Improve wordings
      placeHolder: 'New Color',
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
      inputName: 'growMask',
      mappingType: 'direct',
      name: 'growMask',
      default: 3.0,
      max: 20.0,
      min: 0.0,
      optional: true,
      step: 0.1,
      type: 'slider',
    },
  ],
  path: '/edit/search_and_recolor',
  pid: 'Search and Recolor',
  randomness: true,
};
