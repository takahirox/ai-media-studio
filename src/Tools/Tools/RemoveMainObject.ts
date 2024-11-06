import { type Tool } from "../Tool";

export const REMOVE_MAIN_OBJECT_TOOL: Tool = {
  category: 'Image Edit',
  id: 'Remove Main Object',
  name: 'Remove Main Object',
  ui: [
    {
      default: '',
      mappingType: 'direct',
      name: 'image',
      inputName: 'image',
      type: 'image',
    },
  ],
  path: '/edit/remove_main_object',
  pid: 'Remove Main Object',
  randomness: true,
};
