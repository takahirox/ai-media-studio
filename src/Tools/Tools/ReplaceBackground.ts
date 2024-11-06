import { type Tool } from "../Tool";

export const REPLACE_BACKGROUND_TOOL: Tool = {
  category: 'Image Edit',
  id: 'Replace Background',
  name: 'Replace Background',
  ui: [
    {
      default: '',
      mappingType: 'direct',
      name: 'image',
      inputName: 'image',
      type: 'image',
    },
    {
      default: '',
      inputName: 'prompt',
      mappingType: 'direct',
      name: 'prompt',
      // TODO: Improve wordings
      placeHolder: 'Type what you want to see',      
      type: 'text',
    },
    {
      advanced: true,
      default: '',
      inputName: 'negativePrompt',
      mappingType: 'direct',
      name: 'negativePrompt',
      optional: true,
      // TODO: Improve wordings
      placeHolder: 'Type what you don\'t want to see',
      type: 'text',
    },
  ],
  path: '/edit/replace_background',
  pid: 'Replace Background',
  randomness: true,
};
