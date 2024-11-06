import { REMOVE_MAIN_OBJECT_PROCEDURE } from "./ProcessingUnits/Procedures/RemoveMainObject";
import { REPLACE_BACKGROUND_PROCEDURE } from "./ProcessingUnits/Procedures/ReplaceBackground";
import { REPLACE_MAIN_OBJECT_PROCEDURE } from "./ProcessingUnits/Procedures/ReplaceMainObject";
import { SMART_RESIZE_PROCEDURE } from "./ProcessingUnits/Procedures/SmartResize";
import { CROP_IMAGE_UNIT } from "./ProcessingUnits/RegularImageProcessings/CropImage";
import { IMAGE_THRESHOLDING_UNIT } from "./ProcessingUnits/RegularImageProcessings/ImageThresholding";
import { RESIZE_IMAGE_UNIT } from "./ProcessingUnits/RegularImageProcessings/ResizeImage";
import { CONTROL_SKETCH_UNIT } from "./ProcessingUnits/StabilityAIAPIs/ControlSketch";
import { CONTROL_STRUCTURE_UNIT } from "./ProcessingUnits/StabilityAIAPIs/ControlStructure";
import { CONTROL_STYLE_UNIT } from "./ProcessingUnits/StabilityAIAPIs/ControlStyle";
import { ERASE_UNIT } from "./ProcessingUnits/StabilityAIAPIs/Erase";
import { IMAGE_TO_3D_UNIT } from "./ProcessingUnits/StabilityAIAPIs/ImageTo3D";
import { IMAGE_TO_VIDEO_UNIT } from "./ProcessingUnits/StabilityAIAPIs/ImageToVideo";
import { INPAINT_UNIT } from "./ProcessingUnits/StabilityAIAPIs/Inpaint";
import { OUTPAINT_UNIT } from "./ProcessingUnits/StabilityAIAPIs/Outpaint";
import { REMOVE_BACKGROUND_UNIT } from "./ProcessingUnits/StabilityAIAPIs/RemoveBackground";
import { SEARCH_AND_RECOLOR_UNIT } from "./ProcessingUnits/StabilityAIAPIs/SearchAndRecolor";
import { SEARCH_AND_REPLACE_UNIT } from "./ProcessingUnits/StabilityAIAPIs/SearchAndReplace";
import { TEXT_TO_IMAGE_UNIT } from "./ProcessingUnits/StabilityAIAPIs/TextToImage";
import { AspectRatioType } from "../state";

export type ProcessingUnitType =
  'Procedure' |
  'Regular Image Processing' |
  'Regular Processing' |
  'Stability AI API';

export type ProcessingType =
  '3D Model Generation' |
  'Image Edit' |
  'Image Generation' |
  'Regular Processing' |
  'Video Generation';

export type ProcessingUnitIOType =
  'aspectRatio' |
  'dimension' |
  'image' |
  'mask' |
  'model3d' |
  'number' |
  'random-number' | // TODO: Revisit?
  'rgba' |
  'text' |
  'text-select' |
  'video';

export type ProcessingUnitIOSchemaBase = {
  type: ProcessingUnitIOType;
};

export type AspectRatioInputSchema = ProcessingUnitIOSchemaBase & {
  default: AspectRatioType;
  type: 'aspectRatio';
};

export type DimensionInputSchema = ProcessingUnitIOSchemaBase & {
  default: {
    height: number;
    width: number;
  };
  limitation?: {
    maxHeight?: number;
    minHeight?: number;
    maxWidth?: number;
    minWidth?: number;
  };
  type: 'dimension';
};

export type ImageInputSchema = ProcessingUnitIOSchemaBase & {
  default: Blob;
  type: 'image';
};

export type MaskInputSchema = ProcessingUnitIOSchemaBase & {
  default: Blob;
  type: 'mask';
};

export type NumberInputSchema = ProcessingUnitIOSchemaBase & {
  default: number;
  max?: number;
  min?: number;
  type: 'number';
};

export type RandomNumberInputSchema = ProcessingUnitIOSchemaBase & {
  default: () => number;
  type: 'random-number';
};

export type RGBAInputSchema = ProcessingUnitIOSchemaBase & {
  default: [number, number, number, number];
  type: 'rgba';
};

export type TextInputSchema = ProcessingUnitIOSchemaBase & {
  default: string;
  maxLength?: number;
  type: 'text';
};

export type TextSelectInputSchema = ProcessingUnitIOSchemaBase & {
  default: string;
  type: 'text-select';
  values: string[];
};

export type ProcessingUnitInputSchema =
  AspectRatioInputSchema |
  DimensionInputSchema |
  ImageInputSchema |
  MaskInputSchema |
  NumberInputSchema |
  RandomNumberInputSchema |
  RGBAInputSchema |
  TextInputSchema |
  TextSelectInputSchema;

export type ProcessingUnitIO = {
  name: string;
};
  
export type ProcessingUnitInput = ProcessingUnitIO & {
  optional?: boolean;
  schema: ProcessingUnitInputSchema;
};

export type ProcessingUnitOutput = ProcessingUnitIO & {
  schema: ProcessingUnitIOSchemaBase;
};

export type ProcessingUnitReference = {
  // Note: 'Input and Output are reserved IDs. TODO: Static or Dynamic check to ensure they are not used
  id: string;
  pid: string /* ID of ProcessingUnit */;
};

export type ProcessingConnectionBase = {
  target: string /* ID of ProcessingUnitReference */;
  targetHandle: string;
};

export type ProcessingConnectionConstant = ProcessingConnectionBase & {
  sourceConstantType: ProcessingUnitIOType;
  sourceConstantValue: any;
};

export type ProcessingConnectionRegular = ProcessingConnectionBase & {
  source: string /* ID of ProcessingUnitReference */;
  sourceHandle: string;
};

export type ProcessingConnection =
  ProcessingConnectionConstant |
  ProcessingConnectionRegular;

export type ProcessingUnitBase = {
  cacheable?: boolean; // Default is true
  id: string;
  inputs: ProcessingUnitInput[];
  name: string;
  outputs: ProcessingUnitOutput[];
  processingType: ProcessingType;
  type: ProcessingUnitType;
};

export type ProcedureProcessingUnit = ProcessingUnitBase & {
  connections: ProcessingConnection[];
  randomness: boolean;
  references: ProcessingUnitReference[];
  type: 'Procedure';
};

export type RegularImageProcessingUnit = ProcessingUnitBase & {
  // TODO: Allow static type checking if possible
  run: (inputs: Record<string, any>) => Promise<Record<string, any>>;
  type: 'Regular Image Processing';
};

export type RegularProcessingUnit = ProcessingUnitBase & {
  // TODO: Allow static type checking if possible
  run: (inputs: Record<string, any>) => Promise<Record<string, any>>;
  type: 'Regular Processing';
};

export type StabilityAIAPIProcessingUnitBase = ProcessingUnitBase & {
  randomness: boolean;
  url: string;
  type: 'Stability AI API';
};

// Ugh... Bad design. TODO: Replace with Conditional Branch Processing Unit?
export type StabilityAIAPIImageEditProcessingUnit = StabilityAIAPIProcessingUnitBase & {
  processingType: 'Image Edit';
  bypassIf?: (params: Record<string, any>) => boolean;
};

export type StabilityAIAPIProcessingUnit =
  StabilityAIAPIProcessingUnitBase |
  StabilityAIAPIImageEditProcessingUnit;

export type ProcessingUnit =
  ProcedureProcessingUnit |
  RegularImageProcessingUnit |
  RegularProcessingUnit |
  StabilityAIAPIProcessingUnit;

// TODO: Static or Dynamic type checks
// TODO: Plugin approach?
export const ProcessingUnits: ProcessingUnit[] = [
  CONTROL_SKETCH_UNIT,
  CONTROL_STRUCTURE_UNIT,
  CONTROL_STYLE_UNIT,
  CROP_IMAGE_UNIT,
  ERASE_UNIT,
  IMAGE_TO_3D_UNIT,
  IMAGE_TO_VIDEO_UNIT,
  IMAGE_THRESHOLDING_UNIT,
  INPAINT_UNIT,
  OUTPAINT_UNIT,
  REMOVE_BACKGROUND_UNIT,
  REMOVE_MAIN_OBJECT_PROCEDURE,
  REPLACE_BACKGROUND_PROCEDURE,
  REPLACE_MAIN_OBJECT_PROCEDURE,
  RESIZE_IMAGE_UNIT,
  SEARCH_AND_RECOLOR_UNIT,
  SEARCH_AND_REPLACE_UNIT,
  SMART_RESIZE_PROCEDURE,
  TEXT_TO_IMAGE_UNIT,
];

export const ProcessingUnitMap: Record<string /* Processing Unit ID */, ProcessingUnit> =
  Object.fromEntries(ProcessingUnits.map(def => [def.id, def]));

export const registerProcessingUnit = (unit: ProcessingUnit): void => {
  ProcessingUnits.push(unit);
  ProcessingUnitMap[unit.id] = unit;
};