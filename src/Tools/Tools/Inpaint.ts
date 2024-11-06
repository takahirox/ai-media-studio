import { type Tool } from "../Tool";
import { MASK_CANVAS_UI_DEFS } from "../UIs/MaskCanvas";

export const INPAINT_TOOL: Tool = {
  category: 'Image Edit',
  featured: {
    menuImage: './menu_icons/inpaint.png',
  },
  id: 'Inpaint',
  name: 'Inpaint',
  ui: [
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
      default: '',
      inputName: 'image',
      mappingType: 'direct', // custom?
      name: 'image',
      type: 'image',
    },
    ...MASK_CANVAS_UI_DEFS,
    {
      advanced: true,
      inputName: 'growMask',
      mappingType: 'direct',
      name: 'growMask',
      optional: true,
      default: 5.0,
      max: 100.0,
      min: 0.0,
      step: 0.1,
      type: 'slider',
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
  path: '/edit/inpaint',
  pid: 'Inpaint',
  randomness: true,
};
