import { type StabilityAIAPIProcessingUnit } from "../../ProcessingUnit";
import { generateRandomSeed } from "../../../Utils/utils";

export const CONTROL_STYLE_UNIT: StabilityAIAPIProcessingUnit = {
  id: 'Control Style',
  inputs: [
    {
      name: 'aspectRatio',
      schema: {
        default: '1:1',
        type: 'aspectRatio',
      },
    },
    {
      name: 'fidelity',
      optional: true,
      schema: {
        default: 0.5,
        max: 1.0,
        min: 0.0,
        type: 'number',
      },
    },
    {
      name: 'image',
      schema: {
        default: new Blob(),
        type: 'image',
      },
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
  name: 'Control Style',
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
  url: 'https://api.stability.ai/v2beta/stable-image/control/style',
} as const;
