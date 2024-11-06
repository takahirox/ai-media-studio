import { type StabilityAIAPIProcessingUnit } from "../../ProcessingUnit";
import { generateRandomSeed } from "../../../Utils/utils";

export const TEXT_TO_IMAGE_UNIT: StabilityAIAPIProcessingUnit = {
  id: 'Text to Image',
  inputs: [
    {
      name: 'aspectRatio',
      optional: true,
      schema: {
        default: '1:1',
        type: 'aspectRatio',
      }
    },
    {
      name: 'negativePrompt',
      optional: true,
      schema: {
        default: '',
        maxLength: 10000,
        type: 'text',
      },
    },
    {
      name: 'prompt',
      schema: {
        default: '',
        maxLength: 10000,
        type: 'text',
      }
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
  name: 'Text to Image',
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
  processingType: "Image Generation",
  randomness: true,
  type: 'Stability AI API',
  url: 'https://api.stability.ai/v2beta/stable-image/generate/sd3',
} as const;
