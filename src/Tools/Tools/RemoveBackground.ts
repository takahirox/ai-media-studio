import { type Tool } from "../Tool";

export const REMOVE_BACKGROUND_TOOL: Tool = {
  category: 'Image Edit',
  featured: {
    menuImage: './menu_icons/remove_background.png',
  },
  id: 'Remove Background',
  name: 'Remove Background',
  ui: [
    {
      default: '',
      inputName: 'image',
      mappingType: 'direct', // custom?
      name: 'image',
      type: 'image',
    },
  ],
  path: '/edit/remove_background',
  pid: 'Remove Background',
  randomness: false,
};
