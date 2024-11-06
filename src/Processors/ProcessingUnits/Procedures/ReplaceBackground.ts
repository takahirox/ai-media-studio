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
      optional: true,
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
      id: 'Inpaint',
      pid: 'Inpaint',
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
      sourceConstantValue: [0, 0, 0, 255],
      sourceConstantType: 'rgba',
      target: 'Image Thresholding',
      targetHandle: 'maxColor',
    },
    {
      sourceConstantValue: [255, 255, 255, 255],
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
      target: 'Inpaint',
      targetHandle: 'image',
    },
    {
      source: 'Input',
      sourceHandle: 'negativePrompt',
      target: 'Inpaint',
      targetHandle: 'negativePrompt',
    },
    {
      source: 'Input',
      sourceHandle: 'prompt',
      target: 'Inpaint',
      targetHandle: 'prompt',
    },
    {
      source: 'Image Thresholding',
      sourceHandle: 'image',
      target: 'Inpaint',
      targetHandle: 'mask',
    },
    {
      source: 'Inpaint',
      sourceHandle: 'image',
      target: 'Output',
      targetHandle: 'image',
    },
    {
      source: 'Inpaint',
      sourceHandle: 'width',
      target: 'Output',
      targetHandle: 'width',
    },
    {
      source: 'Inpaint',
      sourceHandle: 'height',
      target: 'Output',
      targetHandle: 'height',
    },
  ];
  
  export const REPLACE_BACKGROUND_PROCEDURE: ProcedureProcessingUnit = {
    connections,
    id: 'Replace Background',
    inputs,
    name: 'Replace Background',
    outputs,
    processingType: 'Image Edit',
    randomness: true,
    references,
    type: 'Procedure',
  } as const;
  