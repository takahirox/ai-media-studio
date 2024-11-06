import {
  type ProcessingConnectionConstant,
  type ProcessingConnectionRegular,
  type ProcessingUnit,
  type ProcedureProcessingUnit,
  ProcessingUnitMap,
  type RegularImageProcessingUnit,
  type RegularProcessingUnit,
  type StabilityAIAPIProcessingUnit,
} from "./ProcessingUnit";
import {
  request3D as request3DSAI,
  requestImage as requestImageSAI,
  requestVideo as requestVideoSAI,
} from "../Utils/saiAPIRequest";
import { generateUUID } from "../Utils/utils";

// TDDO: Currently the priority for this code is to just to make it work.
//       Needs to be rewritten at some point for better readability and
//       maintainability.

const INPUT_ENTRY_ID = 'Input';
const OUTPUT_ENTRY_ID = 'Output';

// TODO: Rename?
type Entry = {
  cache: {
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  },
  sources: Map<string /* input name */, {
    entry: Entry;
    name: string; /* output name of source entity */
  }>,
  targets: Map<string /* output name */, {
    entry: Entry;
    name: string; /* input name of target entity */
  }[]>
  unit: ProcessingUnit;
};

// TODO: Revisit
const CacheOfCache = new Map<string, {
  inputs: Record<string, any>,
  outputs: Record<string, any>,
}>();

export class ProcedureError extends Error {
  public readonly errors: Error[];

  constructor(errors: Error[], ...params: any) {
    super(...params);
    this.errors = errors;
  }
}

// TODO: Avoid any if possible
export const dispatch = async (
  unit: ProcessingUnit,
  inputs: Record<string, any>,
): Promise<Record<string, any>> => {
  inputs = applyDefaultInputValueIfNeeded(inputs, unit);
  switch (unit.type) {
    case 'Regular Processing':
      return await dispatchRegularProcessing(unit as RegularProcessingUnit, inputs);
    case 'Regular Image Processing':
      return await dispatchRegularImageProcessing(unit as RegularImageProcessingUnit, inputs);
    case 'Stability AI API':
      return await dispatchStabilityAIAPI(unit as StabilityAIAPIProcessingUnit, inputs);
    case 'Procedure':
      return await dispatchProcedure(unit as ProcedureProcessingUnit, inputs);
    default:
      // Just in case
      throw new Error(`Unknown Processing Unit type: ${(unit as any).type}.`);
  }
};

const applyDefaultInputValueIfNeeded = (
  inputs: Record<string, any>,
  unit: ProcessingUnit,
): Record<string, any> => {
  inputs = { ...inputs };

  for (const inputDef of unit.inputs) {
    if ('default' in inputDef.schema && inputs[inputDef.name] === undefined) {
      inputs[inputDef.name] = typeof inputDef.schema.default === 'function'
        ? inputDef.schema.default()
        : inputDef.schema.default;
    }
  }

  return inputs;
};

const dispatchRegularProcessing = async (
  unit: RegularProcessingUnit,
  inputs: Record<string, any>,
): Promise<Record<string, any>> => {
  return await unit.run(inputs);
};

const dispatchRegularImageProcessing = async (
  unit: RegularImageProcessingUnit,
  inputs: Record<string, any>,
): Promise<Record<string, any>> => {
  return await unit.run(inputs);
};

const dispatchStabilityAIAPI = async (
  unit: StabilityAIAPIProcessingUnit,
  inputs: Record<string, any>,
): Promise<Record<string, any>> => {
  // Special path. TODO: Revisit. Replace with Conditional Branch Processing Unit?
  if ('bypassIf' in unit && unit.bypassIf && unit.bypassIf(inputs)) {
    const bitmap = await createImageBitmap(inputs.image);
    return {
      height: bitmap.height,
      image: inputs.image,
      width: bitmap.width,
    };
  }

  let result: Record<string, any>;

  switch (unit.processingType) {
    case '3D Model Generation':
      result = await request3DSAI(unit.url, inputs);
      break;
    case 'Video Generation':
      result = await requestVideoSAI(unit.url, inputs);
      break;
    case 'Image Edit':
    case 'Image Generation':
      result = await requestImageSAI(unit.url, inputs);
      break;
    case 'Regular Processing':
      throw new Error(`Invalid ProcessingUnit processingType: ${unit.processingType}`);
  }
  // TODO: Error handling

  const outputs: Record<string, any> = {};

  for (const outputDef of unit.outputs) {
    if (!(outputDef.name in result)) {
      throw new Error(`Unknown name ${outputDef.name} in Stability AI image API.`);
    }
    outputs[outputDef.name] = result[outputDef.name as keyof typeof result];
  }

  return outputs;
};

// TODO: Optimize if needed
const canReachOutput = (entry: Entry): boolean => {
  if (entry.unit.id === OUTPUT_ENTRY_ID) {
    return true;
  }
  for (const targets of entry.targets.values()) {
    for (const target of targets) {
      if (target.entry.unit.id === OUTPUT_ENTRY_ID || canReachOutput(target.entry)) {
        return true;
      }
    }
  }
  return false;
};

// TODO: More robust
const equals = (value1: any, value2: any): boolean => {
  const type1 = typeof value1;
  const type2 = typeof value2;

  if (type1 !== type2) {
    return false;
  }

  if (Array.isArray(value1) && Array.isArray(value2)) {
    const length1 = value1.length;
    const length2 = value2.length;

    if (length1 !== length2) {
      return false;
    }

    return !value1.some((v1, index) => v1 !== value2[index]);
  } else if (value1 instanceof Blob && value2 instanceof Blob) {
    return value1 === value2;
  } else if (type1 === 'string' && type2 === 'string') {
    return value1 === value2;
  } else if (type1 === 'number' && type2 === 'number') {
    return value1 === value2;
  } else if (value1 === null && value2 === null) {
    return true;
  } else if (value1 === undefined && value2 === undefined) {
    return true;
  } else if (type1 === 'object' && type2 === 'object') {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    return keys1.some(key => equals(value1[key], value2[key]));
  } else {
    return false;
  }
};

const dispatchProcedure = async (
  unit: ProcedureProcessingUnit,
  inputs: Record<string, any>,
): Promise<Record<string, any>> => {
  const dispatchQueue: Entry[] = [];
  const waitingSet: Set<Entry> = new Set();
  const inQueueSet: Set<Entry> = new Set();
  const runningSet: Set<Entry> = new Set();
  const finishedSet: Set<Entry> = new Set();

  const errors: Error[] = [];
  const entries = makeEntries(unit as ProcedureProcessingUnit, inputs);

  // For debug
  //console.log(entries);

  for (const key in entries) {
    const entry = entries[key];
    if (!canReachOutput(entry)) {
      continue;
    }
    if (entry.sources.size === 0) {
      dispatchQueue.push(entry);
      inQueueSet.add(entry);
    } else {
      waitingSet.add(entry);
    }
  }

  // For debug
  //console.log(dispatchQueue);

  // TODO: Dispatch multiple entries in parallel
  while (dispatchQueue.length > 0) {
    const entry = dispatchQueue.shift()!;

    inQueueSet.delete(entry);
    runningSet.add(entry);

    const inputs: Record<string, any> = applyDefaultInputValueIfNeeded(
      Object.fromEntries(
        [...entry.sources].map(source => [source[0], source[1].entry.cache.outputs[source[1].name]])
      ),
      entry.unit,
    );

    // For debug
    //console.log(inputs, entry.cache.inputs);

    const cacheable = entry.unit.cacheable !== false;
    const hasInputDiff: boolean = Object.keys(inputs).some(key => !equals(entry.cache.inputs[key], inputs[key]));
    const hasCache: boolean = Object.keys(entry.cache.outputs).some(key => entry.cache.outputs[key] !== undefined);
    let success: boolean = true;

    if (!cacheable || !hasCache || hasInputDiff) {
      // TODO: Error handling
      try {
        const result = await dispatch(entry.unit, inputs);

        // For debug
        // console.log(result);

        for (const key in inputs) {
          entry.cache.inputs[key] = inputs[key];
        }

        for (const key in result) {
          entry.cache.outputs[key] = result[key];
        }

      } catch (error: unknown) {
        success = false;
        // TODO: Better error handling?
        for (const key in entry.cache.outputs) {
          entry.cache.outputs[key] = undefined;
        }
        errors.push(error as Error);
        console.error(error);
      }
    }

    runningSet.delete(entry);
    finishedSet.add(entry);

    // For debug
    //console.log(entry, inputs);

    if (success) {
      for (const [_outputName, targets] of entry.targets) {
        for (const target of targets) {
          if (inQueueSet.has(target.entry) || !canReachOutput(target.entry)) {
            continue;
          }
          const ready = [...target.entry.sources].some(([_input_name, source]) => source.entry.cache.outputs[source.name] !== undefined);
          if (ready) {
            dispatchQueue.push(target.entry);
            inQueueSet.add(target.entry);
            waitingSet.delete(target.entry);
          }
        }
      }
    }
  }

  // For debug
  //console.log(entries);
  //console.log(waitingSet);
  //console.log(inQueueSet);
  //console.log(runningSet);
  //console.log(finishedSet);
  //console.log(errors);
  //console.log(entries[OUTPUT_ENTRY_ID]);

  if (errors.length > 0) {
    throw new ProcedureError(errors, errors.map(error => error.message).join('\n'));
  }

  return { ...entries[OUTPUT_ENTRY_ID].cache.outputs };
};

// TODO: Clean up
const makeEntries = (
  unit: ProcedureProcessingUnit,
  inputs: Record<string, any>,
): Record<string, Entry> => {
  const entries: Record<string, Entry> = {};

  entries[INPUT_ENTRY_ID] = {
    cache: {
      inputs: {},
      outputs: Object.fromEntries(unit.inputs.map(def => {
        return [def.name, undefined];
      })),
    },
    sources: new Map(),
    targets: new Map(),
    unit: {
      id: INPUT_ENTRY_ID,
      inputs: [],
      name: 'Input',
      outputs: unit.inputs.map(def => {
        return {
          name: def.name,
          schema: {
            type: def.schema.type,
          },
        };
      }),
      processingType: 'Regular Processing',
      run: async (_: Record<string, any>): Promise<Record<string, any>> => {
        return Object.fromEntries(unit.inputs.map(def => {
          return [def.name, inputs[def.name]];
        }));
      },
      type: 'Regular Processing',
    } as RegularProcessingUnit,
  };

  entries[OUTPUT_ENTRY_ID] = {
    cache: {
      inputs: Object.fromEntries(unit.outputs.map(def => {
        return [def.name, undefined];
      })),
      outputs: Object.fromEntries(unit.outputs.map(def => {
        return [def.name, undefined];
      })),
    },
    sources: new Map(),
    targets: new Map(),
    unit: {
      id: OUTPUT_ENTRY_ID,
      inputs: unit.outputs.map(def => {
        return {
          name: def.name,
          schema: {
            default: '', // Dummy. Fix me if needed
            type: def.schema.type,
          },
        };
      }),
      name: 'Output',
      outputs: [],
      processingType: 'Regular Processing',
      run: async (inputs: Record<string, any>): Promise<Record<string, any>> => {
        return { ...inputs };
      },
      type: 'Regular Processing',
    } as RegularProcessingUnit,
  };

  for (const reference of unit.references) {
    if (!(reference.pid in ProcessingUnitMap)) {
      throw new Error(`Unknown Processing Unit ID: ${reference.pid}`);
    }

    if (reference.id in entries) {
      throw new Error(`Duplicated ProcessingUnitReference ID: ${reference.id}`);
    }

    if (!CacheOfCache.has(reference.id)) {
      const cache: {
        inputs: Record<string, any>,
        outputs: Record<string, any>,
      } = {
        inputs: {},
        outputs: {},
      };

      for (const input of unit.inputs) {
        cache.inputs[input.name] = undefined;
      }

      for (const output of unit.outputs) {
        cache.outputs[output.name] = undefined;
      }

      CacheOfCache.set(reference.id, cache);
    }

    const referredUnit = ProcessingUnitMap[reference.pid];

    entries[reference.id] = {
      cache: CacheOfCache.get(reference.id)!,
      sources: new Map(),
      targets: new Map(),
      unit: referredUnit,
    };
  }

  for (const c of unit.connections) {
    let sourceEntryId: string;
    let sourceHandleName: string;

    if ('source' in c) {
      const connection = c as ProcessingConnectionRegular;
      sourceEntryId = connection.source;
      sourceHandleName = connection.sourceHandle;
    } else {
      const connection = c as ProcessingConnectionConstant;
      sourceEntryId = generateUUID();
      sourceHandleName = 'output';

      entries[sourceEntryId] = {
        cache: {
          inputs: {},
          outputs: {
            [sourceHandleName]: undefined,
          },
        },
        sources: new Map(),
        targets: new Map(),
        unit: {
          id: `Constant Unit for ${c.target}.${c.targetHandle}`, // Fix me if needed
          inputs: [],
          name: `Constant Unit for ${c.target}.${c.targetHandle}`,
          outputs: [{
            name: sourceHandleName,
            schema: {
              type: connection.sourceConstantType,
            },
          }],
          processingType: 'Regular Processing',
          run: async (_: Record<string, any>): Promise<Record<string, any>> => {
            return {
              [sourceHandleName]: connection.sourceConstantValue,
            };
          },
          type: 'Regular Processing',
        } as RegularProcessingUnit,
      };
    }

    if (!(sourceEntryId in entries)) {
      throw new Error(`Unknown source ProcessingUnitReference ID: ${sourceEntryId}`);
    }

    if (!(c.target in entries)) {
      throw new Error(`Unknown target ProcessingUnitReference ID: ${c.target}`);
    }

    const sourceEntry = entries[sourceEntryId];
    const targetEntry = entries[c.target];

    if (!sourceEntry.targets.has(sourceHandleName)) {
      sourceEntry.targets.set(sourceHandleName, []);
    }

    if (
      sourceEntry
      .targets
      .get(sourceHandleName)!
      .some(target => target.entry === targetEntry && target.name === c.targetHandle)
    ) {
      throw new Error(`Duplicated target for ${sourceHandleName}`);
    }

    sourceEntry.targets.get(sourceHandleName)!.push({
      entry: targetEntry,
      name: c.targetHandle,
    });

    if (targetEntry.sources.has(c.targetHandle)) {
      throw new Error(`Duplicated source for ${c.targetHandle}`);
    }

    targetEntry.sources.set(c.targetHandle, {
      entry: sourceEntry,
      name: sourceHandleName,
    });
  }

  return entries;
};
