import { type Tool } from "../Tool";
import { AspectRatioType } from "../../state";

export const TEXT_TO_IMAGE_TOOL: Tool = {
  category: 'Image Generation',
  featured: {
    menuImage: './menu_icons/text_to_image.png',
  },
  id: 'Text to Image',
  name: 'Text to Image',
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
      default: '1:1' as AspectRatioType,
      inputName: 'aspectRatio',
      mappingType: 'direct',
      name: 'aspectRatio',
      type: 'aspectRatioSlider',
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
  path: '/generation/text_to_image',
  pid: 'Text to Image',
  randomness: true,
};
