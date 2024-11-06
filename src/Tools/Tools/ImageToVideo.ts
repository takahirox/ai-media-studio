import { type Tool } from "../Tool";

export const IMAGE_TO_VIDEO_TOOL: Tool = {
  category: 'Video Generation',
  id: 'Image to Video',
  name: 'Image to Video',
  ui: [
    {
      default: '',
      inputName: 'image',
      mappingType: 'direct', // custom?
      name: 'image',
      type: 'image',
    },
    {
      advanced: true,
      default: 1.8,
      name: 'cfgScale',
      inputName: 'cfgScale',
      mappingType: 'direct',
      max: 10.0,
      min: 0.0,
      optional: true,
      step: 0.1,
      type: 'slider',
    },
    {
      advanced: true,
      default: 127,
      name: 'motionBucketId',
      inputName: 'motionBucketId',
      mappingType: 'direct',
      max: 255,
      min: 1,
      optional: true,
      step: 1,
      type: 'slider',
    },
  ],
  path: '/video/image_to_video',
  pid: 'Image to Video',
  randomness: true,
};
