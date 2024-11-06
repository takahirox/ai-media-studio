import { type StabilityAIAPIImageEditProcessingUnit } from "../../ProcessingUnit";
import { generateRandomSeed } from "../../../Utils/utils";

export const OUTPAINT_UNIT: StabilityAIAPIImageEditProcessingUnit = {
  bypassIf: (params: Record<string, any>): boolean => {
    return params.down === 0 && params.left === 0 && params.right === 0 && params.up === 0;
  },
  id: 'Outpaint',
  inputs: [
    {
      name: 'creativity',
      optional: true,
      schema: {
        default: 0.5,
        max: 1.0,
        min: 0.0,
        type: 'number',
      },
    },
    {
      name: 'down',
      optional: true,
      schema: {
        default: 0,
        max: 2000,
        min: 0,
        type: 'number',
      },
    },
    {
      name: 'image',
      schema: {
        default: new Blob([], { type: 'image/png' }),
        type: 'image',
      },
    },
    {
      name: 'left',
      optional: true,
      schema: {
        default: 0,
        max: 2000,
        min: 0,
        type: 'number',
      },
    },
    {
      name: 'prompt',
      optional: true,
      schema: {
        default: '',
        maxLength: 10000,
        type: 'text',
      },
    },
    {
      name: 'right',
      optional: true,
      schema: {
        default: 0,
        max: 2000,
        min: 0,
        type: 'number',
      },
    },
    {
      name: 'seed',
      optional: true,
      schema: {
        default: () => { return generateRandomSeed() },
        type: 'random-number',
      },
    },
    {
      name: 'up',
      optional: true,
      schema: {
        default: 0,
        max: 2000,
        min: 0,
        type: 'number',
      },
    },
  ],
  name: 'Outpaint',
  outputs: [
    {
      name: 'height',
      schema: {
        type: 'number',
      },
    },
    {
      name: 'image',
      schema: {
        type: 'image',
      },
    },
    {
      name: 'seed',
      schema: {
        type: 'number',
      },
    },
    {
      name: 'width',
      schema: {
        type: 'number',
      },
    },
  ],
  processingType: "Image Edit",
  randomness: true,
  type: 'Stability AI API',
  url: 'https://api.stability.ai/v2beta/stable-image/edit/outpaint',
} as const;
