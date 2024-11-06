import { type Tool } from "../Tool";
import {
  CROP_CANVAS_UI_CANVAS_DEF,
  CROP_CANVAS_UI_DIMENTION_DEF,
  type CropCanvasProps,
} from "../UIs/CropCanvas";
import { toPascalCase } from "../../Utils/tool";

export const SMART_RESIZE_TOOL: Tool = {
  category: 'Image Finishing Up',
  id: 'Smart Resize',
  name: 'Smart Resize',
  ui: [
    {
      default: '',
      mappingType: 'direct',
      name: 'image',
      inputName: 'image',
      type: 'image',
    },
    {
      advanced: true,
      default: '',
      inputName: 'prompt',
      mappingType: 'direct',
      maxLength: 10000,
      name: 'prompt',
      optional: true,
      // TODO: Improve wordings
      placeHolder: 'Type what you want to see in expanded area',
      type: 'text',
    },
    {
      ...CROP_CANVAS_UI_DIMENTION_DEF,
      map: ({ value }) => {
        return {
          targetHeight: value.height,
          targetWidth: value.width,
        };
      },
      mappingType: 'custom',
    },
    {
      ...CROP_CANVAS_UI_CANVAS_DEF,
      map: ({ value }) => {
        return {
          cropHeight: value.selectedArea.height,
          cropWidth: value.selectedArea.width,
          cropX: value.selectedArea.x,
          cropY: value.selectedArea.y,
          down: value.outsideArea.down,
          left: value.outsideArea.left,
          right: value.outsideArea.right,
          up: value.outsideArea.up,
        };
      },
      mappingType: 'custom',
      type: 'custom',
      validate: ({ params, uiDef }) => {
        const reasons: string[] = [];
        const props = params[uiDef.name] as CropCanvasProps;
        for (const name of ['down', 'left', 'right', 'up']) {
          if (props.outsideArea[name as keyof typeof props.outsideArea] > 2000) {
            reasons.push(`${toPascalCase(name)} must be up to 2000`);
          }  
        }
        return { reasons, valid: reasons.length === 0 };
      },
    },
    {
      advanced: true,
      default: 0.5,
      inputName: 'creativity',
      mappingType: 'direct',
      max: 1.0,
      min: 0.0,
      name: 'creativity',
      optional: true,
      step: 0.01,
      type: 'slider',
    },
  ],
  path: '/finishing_up/smart_resize',
  pid: 'Smart Resize',
  randomness: true, // TODO: Depending on whether Outpaint is needed
};
