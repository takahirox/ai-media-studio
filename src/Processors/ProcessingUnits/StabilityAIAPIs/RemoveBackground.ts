import { type StabilityAIAPIProcessingUnit } from "../../ProcessingUnit";

export const REMOVE_BACKGROUND_UNIT: StabilityAIAPIProcessingUnit = {
  id: 'Remove Background',
  inputs: [
    {
      name: 'image',
      schema: {
        default: new Blob([], { type: 'image/png' }),
        type: 'image',
      },
    },
  ],
  name: 'Remove Background',
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
      name: 'width',
      schema: {
        type: 'number',
      },
    }
  ],
  processingType: "Image Edit",
  randomness: false,
  type: 'Stability AI API',
  url: 'https://api.stability.ai/v2beta/stable-image/edit/remove-background',
} as const;
