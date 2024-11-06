import { type Tool } from "../Tool";
import { MASK_CANVAS_UI_DEFS } from "../UIs/MaskCanvas";

export const ERASE_TOOL: Tool = {
  category: 'Image Edit',
  id: 'Erase',
  name: 'Erase',
  ui: [
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
      max: 20.0,
      min: 0.0,
      step: 0.1,
      type: 'slider',
    },
  ],
  path: '/edit/erase',
  pid: 'Erase',
  randomness: true,
};
