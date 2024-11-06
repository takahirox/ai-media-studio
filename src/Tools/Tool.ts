import { RefObject } from "react";
import { CONTROL_SKETCH_TOOL } from "./Tools/ControlSketch";
import { CONTROL_STRUCTURE_TOOL } from "./Tools/ControlStructure";
import { CONTROL_STYLE_TOOL } from "./Tools/ControlStyle";
import { ERASE_TOOL } from "./Tools/Erase";
import { IMAGE_TO_3D_TOOL } from "./Tools/ImageTo3D";
import { IMAGE_TO_VIDEO_TOOL } from "./Tools/ImageToVideo";
import { INPAINT_TOOL } from "./Tools/Inpaint";
import { REMOVE_BACKGROUND_TOOL } from "./Tools/RemoveBackground";
import { REMOVE_MAIN_OBJECT_TOOL } from "./Tools/RemoveMainObject";
import { REPLACE_BACKGROUND_TOOL } from "./Tools/ReplaceBackground";
import { REPLACE_MAIN_OBJECT_TOOL } from "./Tools/ReplaceMainObject";
import { SEARCH_AND_RECOLOR_TOOL } from "./Tools/SearchAndRecolor";
import { SEARCH_AND_REPLACE_TOOL } from "./Tools/SearchAndReplace";
import { SMART_RESIZE_TOOL } from "./Tools/SmartResize";
import { TEXT_TO_IMAGE_TOOL } from "./Tools/TextToImage";
import { MaskCanvasRef } from "./UIs/MaskCanvas";
import { AspectRatioType, Media } from "../state";

export const DEFAULT_IMAGE_COUNT = 4;
export const MAX_GENERATION_COUNT = 8;
export const MIN_GENERATION_COUNT = 1;

export type ToolCategory =
  '3D Model Generation' |
  'Image Edit' |
  'Image Generation' |
  'Image Finishing Up' |
  'Video Generation';

export type ToolUIType =
  'aspectRatioSlider' |
  'checkbox' |
  'custom' |
  'dimension' |
  'hidden' | // necessary?
  'image' |
  'mask' |
  'number-input' |
  'slider' |
  'text' |
  'text-select';

export type ToolUIMappingType =
  'custom' |
  'direct' |
  'none';

export type ToolUISchemaBase = {
  advanced?: boolean;
  default: any;
  label?: string;
  mappingType: ToolUIMappingType;
  name: string;
  optional?: boolean;
  type: ToolUIType;
};

export type DirectMappingUI = {
  inputName: string;
  mappingType: 'direct';
};

export type CustomMappingUI = {
  // TODO: Implement
  map: ({
    uiDef,
    value,
  }: {
    uiDef: ToolUISchema,
    value: any,
  }) => Record<string, any>;
  mappingType: 'custom';
};

export type NoneMappingUI = {
  mappingType: 'none';
};

export type AspectRatioSliderUISchema = ToolUISchemaBase & {
  default: AspectRatioType,
  type: 'aspectRatioSlider';
};

export type CheckboxUISchema = ToolUISchemaBase & {
  default: boolean;
  type: 'checkbox';
};

export type CustomUISchema = ToolUISchemaBase & {
  createEffectiveParam?: ({
    params,
    refs,
    tool,
    uiDef,
  }: {
    params: Record<string, any>,
    refs: Record<string, RefObject<any>>,
    tool: Tool,
    uiDef: CustomUISchema,
  }) => Promise<any>;
  createImageOverlay?: ({
    disabled,
    onChange,
    params,
    refs,
    tool,
    uiDef,
  }: {
    disabled: boolean,
    onChange: (
      params: Record<string, any>,
      forcePendingQueryVisible?: boolean,
    ) => void,
    params: Record<string, any>,
    refs: Record<string, RefObject<any>>,
    tool: Tool,
    uiDef: CustomUISchema,
  }) => JSX.Element | null;
  createSidePanelUI?: ({
    disabled,
    onChange,
    params,
    refs,
    tool,
    uiDef,
  }: {
    disabled: boolean,
    onChange: (
      params: Record<string, any>,
      forcePendingQueryVisible?: boolean,
    ) => void,
    params: Record<string, any>,
    refs: Record<string, RefObject<any>>,
    tool: Tool,
    uiDef: CustomUISchema,
  }) => JSX.Element | null;
  default: any;
  type: 'custom';
  validate?: ({
    params,
    refs,
    tool,
    uiDef,
  }: {
    params: Record<string, any>,
    refs: Record<string, RefObject<any>>,
    tool: Tool,
    uiDef: CustomUISchema,
  }) => { reasons: string[], valid: boolean };
};

export type DimensionUISchema = ToolUISchemaBase & {
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

export type HiddenUISchema = ToolUISchemaBase & {
  default: any; // TODO: Fix me if possible
  type: 'hidden';
};

export type ImageUISchema = ToolUISchemaBase & {
  default: string /* UUID of image */ ;
  type: 'image';
};

// TODO: More generic and elegant
export type MaskUISchema = ToolUISchemaBase & {
  default: RefObject<MaskCanvasRef>;
  getBlob: ({
    params,
    refs,
    tool,
    uiDef,
  }: {
    params: Record<string, any>,
    refs: Record<string, RefObject<any>>,
    tool: Tool,
    uiDef: MaskUISchema,
  }) => Promise<Blob>;
  type: 'mask';
};

export type NumberInputUISchema = ToolUISchemaBase & {
  default: number;
  max?: number;
  min?: number;
  type: 'number-input';
};

export type SliderUISchema = ToolUISchemaBase & {
  default: number;
  max: number;
  min: number;
  step: number;
  type: 'slider';
};

export type TextSelectUISchema = ToolUISchemaBase & {
  default: string;
  labels?: string[];
  type: 'text-select';
  values: string[];
};

export type TextUISchema = ToolUISchemaBase & {
  default: string;
  maxLength?: number;
  placeHolder: string;
  type: 'text';
};

export type ToolUISchema =
  (
    AspectRatioSliderUISchema |
    CheckboxUISchema |
    CustomUISchema |
    DimensionUISchema |
    ImageUISchema |
    MaskUISchema |
    NumberInputUISchema |
    SliderUISchema |
    TextSelectUISchema |
    TextUISchema
  ) & (
    CustomMappingUI |
    DirectMappingUI |
    NoneMappingUI
  );

export type Tool = {
  category: ToolCategory;
  // Ugh...
  customParamsValidation?: (
    tool: Tool,
    params: Record<string, any>,
  ) => { reasons: string[], valid: boolean },
  featured?: {
    menuImage: string;
  };
  displayName?: string;
  id: string;
  name: string;
  // Ugh...
  onChange?: (
    params: Record<string, any>,
    tool: Tool,
    // Ughhhhh...
    findMediaByUuid: (uuid: string) => Media | null,
  ) => Record<string, any>;
  path: string;
  pid: string /* Processing Unit ID */;
  randomness: boolean;
  ui: ToolUISchema[];
};

// TODO: Static or Dynamic type checks
// TODO: Plugin approach?
export const Tools: Tool[] = [
  // Generation
  TEXT_TO_IMAGE_TOOL,
  CONTROL_SKETCH_TOOL,
  CONTROL_STRUCTURE_TOOL,
  CONTROL_STYLE_TOOL,
  // Edit
  INPAINT_TOOL,
  ERASE_TOOL,
  REMOVE_BACKGROUND_TOOL,
  REMOVE_MAIN_OBJECT_TOOL,
  REPLACE_BACKGROUND_TOOL,
  REPLACE_MAIN_OBJECT_TOOL,
  SEARCH_AND_RECOLOR_TOOL,
  SEARCH_AND_REPLACE_TOOL,
  // Finishing Up
  SMART_RESIZE_TOOL,
  // Video,
  IMAGE_TO_VIDEO_TOOL,
  // 3D,
  IMAGE_TO_3D_TOOL,
] as const;

export const ToolMap: Record<string /* Tool ID */, Tool> =
  Object.freeze(Object.fromEntries(Tools.map(def => [def.id, def])));
