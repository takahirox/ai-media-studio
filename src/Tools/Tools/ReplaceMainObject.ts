import { type Tool } from "../Tool";

export const REPLACE_MAIN_OBJECT_TOOL: Tool = {
  category: 'Image Edit',
  id: 'Replace Main Object',
  name: 'Replace Main Object',
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
  path: '/edit/replace_main_object',
  pid: 'Replace Main Object',
  randomness: true,
};
