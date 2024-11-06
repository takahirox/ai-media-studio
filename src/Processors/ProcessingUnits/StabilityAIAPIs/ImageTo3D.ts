import { type StabilityAIAPIProcessingUnit } from "../../ProcessingUnit";

export const IMAGE_TO_3D_UNIT: StabilityAIAPIProcessingUnit = {
  id: 'Image to 3D',
  inputs: [
    {
      name: 'foregroundRatio',
      optional: true,
      schema: {
        default: 0.85,
        max: 1.0,
        min: 0.1,
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
      name: 'remesh',
      optional: true,
      schema: {
        default: 'quad',
        type: 'text-select',
        values: ['none', 'quad', 'triangle'],
      },
    },
    {
      name: 'textureResolution',
      optional: true,
      schema: {
        default: '2048',
        type: 'text-select',
        values: ['512', '1024', '2048'],
      },
    },
    {
      name: 'vertexCount',
      optional: true,
      schema: {
        default: -1,
        max: 20000,
        min: -1,
        type: 'number',
      },
    },
  ],
  name: 'Image To 3D',
  outputs: [
    {
      name: 'model',
      schema: {
        type: 'model3d',
      },
    },
  ],
  processingType: "3D Model Generation",
  randomness: false,
  type: 'Stability AI API',
  url: 'https://api.stability.ai/v2beta/3d/stable-fast-3d',
} as const;
