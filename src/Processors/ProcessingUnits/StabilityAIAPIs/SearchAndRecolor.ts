import { type StabilityAIAPIProcessingUnit } from "../../ProcessingUnit";
import { generateRandomSeed } from "../../../Utils/utils";

export const SEARCH_AND_RECOLOR_UNIT: StabilityAIAPIProcessingUnit = {
  id: 'Search and Recolor',
  inputs: [
    {
      name: 'growMask',
      optional: true,
      schema: {
        default: 3.0,
        max: 20.0,
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
    {
      name: 'selectPrompt',
      schema: {
        default: '',
        maxLength: 10000,
        type: 'text',
      },        
    },
  ],
  name: 'Search and Recolor',
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
  url: 'https://api.stability.ai/v2beta/stable-image/edit/search-and-recolor',
} as const;
