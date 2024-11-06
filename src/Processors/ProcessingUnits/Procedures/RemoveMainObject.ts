import {
  type ProcedureProcessingUnit,
  type ProcessingConnection,
  type ProcessingUnitInput,  
  type ProcessingUnitOutput,
  type ProcessingUnitReference,
} from "../../ProcessingUnit";

const inputs: ProcessingUnitInput[] = [
  {
    name: 'image',
    schema: {
      default: new Blob([], { type: 'image/png' }),
      type: 'image',
    },
  },
  {
    name: 'seed',
    optional: true,
    schema: {
      default: 0,
      type: 'number',
    },
  },
];

const outputs: ProcessingUnitOutput[] = [
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
];

const references: ProcessingUnitReference[] = [
  {
    id: 'Erase',
    pid: 'Erase',
  },
  {
    id: 'Image Thresholding',
    pid: 'Image Thresholding',
  },
  {
    id: 'Remove Background',
    pid: 'Remove Background',
  },
];

const connections: ProcessingConnection[] = [
  {
    source: 'Input',
    sourceHandle: 'image',
    target: 'Remove Background',
    targetHandle: 'image',
  },
  {
    source: 'Remove Background',
    sourceHandle: 'image',
    target: 'Image Thresholding',
    targetHandle: 'image',
  },
  {
    sourceConstantValue: [255, 255, 255, 255],
    sourceConstantType: 'rgba',
    target: 'Image Thresholding',
    targetHandle: 'maxColor',
  },
  {
    sourceConstantValue: [0, 0, 0, 255],
    sourceConstantType: 'rgba',
    target: 'Image Thresholding',
    targetHandle: 'minColor',
  },
  {
    sourceConstantValue: [-1, -1, -1, 254],
    sourceConstantType: 'rgba',
    target: 'Image Thresholding',
    targetHandle: 'threshold',
  },
  {
    source: 'Input',
    sourceHandle: 'image',
    target: 'Erase',
    targetHandle: 'image',
  },
  {
    source: 'Image Thresholding',
    sourceHandle: 'image',
    target: 'Erase',
    targetHandle: 'mask',
  },
  {
    source: 'Erase',
    sourceHandle: 'image',
    target: 'Output',
    targetHandle: 'image',
  },
  {
    source: 'Erase',
    sourceHandle: 'width',
    target: 'Output',
    targetHandle: 'width',
  },
  {
    source: 'Erase',
    sourceHandle: 'height',
    target: 'Output',
    targetHandle: 'height',
  },
];

export const REMOVE_MAIN_OBJECT_PROCEDURE: ProcedureProcessingUnit = {
  connections,
  id: 'Remove Main Object',
  inputs,
  name: 'Remove Main Object',
  outputs,
  processingType: 'Image Edit',
  randomness: true,
  references,
  type: 'Procedure',
} as const;
