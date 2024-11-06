import {
  DimensionUISchema,
  NumberInputUISchema,
  TextUISchema,
  ToolUISchema,
} from "../Tools/Tool";

export const deepCopy = <T>(data: T): T => {
  return structuredClone(data);
};

export const isParamSet = (def: ToolUISchema, value: any): boolean => {
  if (value === undefined) {
    return false;
  }
  switch (def.type) {
    case 'dimension':
      return value.width && value.height;
    case 'image':
    case 'number-input':
    case 'text':
      return !!value;
  }
  return true;
};

export const isParamValid = (def: ToolUISchema, value: any): { reasons: string[], valid: boolean } => {
  const reasons = [];
  const name = toSpaceSeparatedPascalCase(def.label || ('inputName' in def && def.inputName) || def.name);

  if (!isParamSet(def, value)) {
    if (!def.optional) {
      reasons.push(`${name} is required`);
    }
  } else {
    // TODO: Dynamic type check needed?
    switch (def.type) {
      case 'dimension':
        const dimensionSchema = def as DimensionUISchema;
        if (dimensionSchema.limitation) {
          if (dimensionSchema.limitation.maxHeight !== undefined && value.height > dimensionSchema.limitation.maxHeight) {
            reasons.push(`Height of ${name} must be equal to or less than ${dimensionSchema.limitation.maxHeight}`);
          }
          if (dimensionSchema.limitation.minHeight !== undefined && value.height < dimensionSchema.limitation.minHeight) {
            reasons.push(`Height of ${name} must be equal to or greater than ${dimensionSchema.limitation.minHeight}`);
          }
          if (dimensionSchema.limitation.maxWidth !== undefined && value.width > dimensionSchema.limitation.maxWidth) {
            reasons.push(`Width of ${name} must be equal to or less than ${dimensionSchema.limitation.maxWidth}`);
          }
          if (dimensionSchema.limitation.minWidth !== undefined && value.width < dimensionSchema.limitation.minWidth) {
            reasons.push(`Width of ${name} must be equal to or greater than ${dimensionSchema.limitation.minWidth}`);
          }
        }
        break;
      case 'number-input':
        const numberSchema = def as NumberInputUISchema;
        if (numberSchema.max !== undefined && value > numberSchema.max) {
          reasons.push(`${name} must be equal to or less than ${numberSchema.max}`);
        }
        if (numberSchema.min !== undefined && value < numberSchema.min) {
          reasons.push(`${name} must be equal to or greater than ${numberSchema.min}`);
        }
        break;
      case 'text':
        const textSchema = def as TextUISchema;
        if (textSchema.maxLength !== undefined && value.length > textSchema.maxLength) {
          reasons.push(`${name} length must be up to ${textSchema.maxLength} length`);
        }
        break;
    }
  }
  return { reasons, valid: reasons.length === 0 };
};

// TODO: What if str includes numerics?
export const separatePascalCaseWithSpace = (pascalCase: string): string => {
    return pascalCase.split(/(?=[A-Z])/).join(' ');
};
  
export const toPascalCase = (camelCase: string): string => {
  return camelCase.slice(0, 1).toUpperCase() + camelCase.slice(1);
};

// TODO: What if str includes numerics?
export const toSnakeCase = (str: string): string => {
  return str.split(/(?=[A-Z])/).join('_').toLowerCase();
};
  
export const toSpaceSeparatedPascalCase = (camelCase: string): string => {
  return separatePascalCaseWithSpace(toPascalCase(camelCase));
}

