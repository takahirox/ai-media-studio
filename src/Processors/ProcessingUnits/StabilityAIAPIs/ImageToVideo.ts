import { type StabilityAIAPIProcessingUnit } from "../../ProcessingUnit";
import { generateRandomSeed } from "../../../Utils/utils";

export const IMAGE_TO_VIDEO_UNIT: StabilityAIAPIProcessingUnit = {
  id: 'Image to Video',
  inputs: [
    {
      name: 'image',
      schema: {
        default: new Blob(),
        type: 'image',
        // TODO: Allow only supported dimentions or resize
      },
    },
    {
      name: 'cfgScale',
      schema: {
        default: 1.8,
        max: 10.0,
        min: 0.0,
        type: 'number',
      },
    },
    {
      name: 'motionBucketId',
      schema: {
        default: 127,
        max: 255,
        min: 1,
        type: 'number'
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
  name: 'Image To Video',
  outputs: [
    {
      name: 'duration',
      schema: {
        type: 'number',
      }
    },
    {
      name: 'height',
      schema: {
        type: 'number',
      }
    },
    {
      name: 'video',
      schema: {
        type: 'video',
      },
    },
    {
      name: 'width',
      schema: {
        type: 'number',
      }
    },
  ],
  processingType: "Video Generation",
  randomness: true,
  type: 'Stability AI API',
  url: 'https://api.stability.ai/v2beta/image-to-video',
} as const;
