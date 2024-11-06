import {
  type ProcedureProcessingUnit,
  type ProcessingConnection,
  type ProcessingUnitInput,  
  type ProcessingUnitOutput,
  type ProcessingUnitReference,
} from "../../ProcessingUnit";
  
const inputs: ProcessingUnitInput[] = [
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
    name: 'cropHeight',
    optional: true,
    schema: {
      default: 0,
      type: 'number',
    },
  },
  {
    name: 'cropWidth',
    optional: true,
    schema: {
      default: 0,
      type: 'number',
    },
  },
  {
    name: 'cropX',
    optional: true,
    schema: {
      default: 0,
      type: 'number',
    },
  },
  {
    name: 'cropY',
    optional: true,
    schema: {
      default: 0,
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
      default: new Blob(),
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
    name: 'targetHeight',
    optional: true,
    schema: {
      default: 1024,
      max: 4096,
      min: 1,
      type: 'number',
    },
  },
  {
    name: 'targetWidth',
    optional: true,
    schema: {
      default: 1024,
      max: 4096,
      min: 1,
      type: 'number',
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
];
  
const outputs: ProcessingUnitOutput[] = [
  {
    name: 'image',
    schema: {
      type: 'image',
    },
  },
];
  
const references: ProcessingUnitReference[] = [
  {
    id: 'Crop Image',
    pid: 'Crop Image',
  },
  {
    id: 'Outpaint',
    pid: 'Outpaint',
  },
  {
    id: 'Resize Image',
    pid: 'Resize Image',
  },
];
  
const connections: ProcessingConnection[] = [
  {
    source: 'Input',
    sourceHandle: 'image',
    target: 'Crop Image',
    targetHandle: 'image',
  },
  {
    source: 'Input',
    sourceHandle: 'cropX',
    target: 'Crop Image',
    targetHandle: 'x',
  },
  {
    source: 'Input',
    sourceHandle: 'cropY',
    target: 'Crop Image',
    targetHandle: 'y',
  },
  {
    source: 'Input',
    sourceHandle: 'cropWidth',
    target: 'Crop Image',
    targetHandle: 'width',
  },
  {
    source: 'Input',
    sourceHandle: 'cropHeight',
    target: 'Crop Image',
    targetHandle: 'height',
  },
  {
    source: 'Crop Image',
    sourceHandle: 'image',
    target: 'Outpaint',
    targetHandle: 'image',
  },
  {
    source: 'Input',
    sourceHandle: 'down',
    target: 'Outpaint',
    targetHandle: 'down',
  },
  {
    source: 'Input',
    sourceHandle: 'left',
    target: 'Outpaint',
    targetHandle: 'left',
  },
  {
    source: 'Input',
    sourceHandle: 'right',
    target: 'Outpaint',
    targetHandle: 'right',
  },
  {
    source: 'Input',
    sourceHandle: 'up',
    target: 'Outpaint',
    targetHandle: 'up',
  },
  {
    source: 'Input',
    sourceHandle: 'creativity',
    target: 'Outpaint',
    targetHandle: 'creativity',
  },
  {
    source: 'Input',
    sourceHandle: 'prompt',
    target: 'Outpaint',
    targetHandle: 'prompt',
  },
  {
    source: 'Outpaint',
    sourceHandle: 'image',
    target: 'Resize Image',
    targetHandle: 'image',
  },
  {
    source: 'Input',
    sourceHandle: 'targetWidth',
    target: 'Resize Image',
    targetHandle: 'width',
  },
  {
    source: 'Input',
    sourceHandle: 'targetHeight',
    target: 'Resize Image',
    targetHandle: 'height',
  },
  {
    source: 'Resize Image',
    sourceHandle: 'image',
    target: 'Output',
    targetHandle: 'image',
  },
  {
    source: 'Resize Image',
    sourceHandle: 'width',
    target: 'Output',
    targetHandle: 'width',
  },
  {
    source: 'Resize Image',
    sourceHandle: 'height',
    target: 'Output',
    targetHandle: 'height',
  },
];
  
export const SMART_RESIZE_PROCEDURE: ProcedureProcessingUnit = {
  connections,
  id: 'Smart Resize',
  inputs,
  name: 'Smart Resize',
  outputs,
  processingType: 'Image Edit',
  randomness: true,
  references,
  type: 'Procedure',
} as const;
