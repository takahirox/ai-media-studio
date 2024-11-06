import { type StabilityAIAPIProcessingUnit } from "../../ProcessingUnit";
import { generateRandomSeed } from "../../../Utils/utils";

export const ERASE_UNIT: StabilityAIAPIProcessingUnit = {
  id: 'Erase',
  inputs: [
    {
      name: 'growMask',
      optional: true,
      schema: {
        default: 5.0,
        max: 20.0,
        min: 0.0,
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
      name: 'mask',
      schema: {
        default: new Blob([], { type: 'image/png' }),
        type: 'mask',
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
  ],
  name: 'Erase',
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
  url: 'https://api.stability.ai/v2beta/stable-image/edit/erase',
} as const;
