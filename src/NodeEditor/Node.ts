import {
  type RegularProcessingUnit,
  ProcessingUnitMap,
} from "../Processors/ProcessingUnit";
import {
  generateUUID,
  generateRandomSeed,
  getImageSize,
  getVideoSizeAndDuration,
} from "../Utils/utils";

// TODO: Rewrite more properly

// WF prefix represents WorkFlow

export const enum WFPortType {
  Input,
  Output,
}

export const enum WFDataType {
  Float,
  Image,
  Integer,
  Media,
  Model3D,
  RGBA,
  Text,
  Video,
}

// TODO: Declare properly
export type WFImageType = {
  src: string;
}

// TODO: Declare properly
export type WFVideoType = {
  src: string;
}

export class WFBase {
  public readonly uuid: string;

  constructor() {
    this.uuid = generateUUID();
  }
}

export class WFPort extends WFBase {
  private _datatype: WFDataType;
  private _name: string;
  private _required: boolean;
  private _type: WFPortType;

  constructor(
    name: string,
    type: WFPortType,
    datatype: WFDataType,
    required: boolean=true,
  ) {
    super();
    this._datatype = datatype;
    this._name = name;
    this._required = required;
    this._type = type;
  }

  get datatype(): WFDataType {
    return this._datatype;
  }

  get name(): string {
    return this._name;
  }

  get required(): boolean {
    return this._required;
  }

  get type(): WFPortType {
    return this._type;
  }
}

type WFNodeInput = {
  datatype: WFDataType;
  required?: boolean;
};

type WFNodeOutput = {
  datatype: WFDataType;
};

export class WFNodeBase extends WFBase {
  public readonly inputDefs: Record<
    string /* port name */,
    WFNodeInput
  >;
  public readonly outputDefs: Record<
    string /* port name */,
    WFNodeOutput
  >;

  constructor({
    inputs,
    outputs,
  }: {
    inputs: Record<
      string /* port name */,
      WFNodeInput
    >,
    outputs: Record<
      string /* port name */,
      WFNodeOutput
    >,
  }) {
    super();
    this.inputDefs = Object.freeze(inputs);
    this.outputDefs = Object.freeze(outputs);
  }
}

export class WFInputNode extends WFNodeBase {
  private outputName: string;
  public readonly unit: RegularProcessingUnit;

  constructor(outputName: string, datatype: WFDataType, cacheable: boolean=false) {
    super({
      inputs: {},
      outputs: {
        [outputName]: {
          datatype,
        }
      },
    });
    this.outputName = outputName;
    this.unit = {
      cacheable,
      id: this.uuid,
      inputs: [],
      name: '',
      outputs: [],
      processingType: 'Regular Processing',
      run: async (inputs: Record<string, any>): Promise<Record<string, any>> => {
        return {
          [this.outputName]: await this.getValue(inputs),
        };
      },
      type: 'Regular Processing',
    };
  }

  public get pid(): string {
    return this.uuid;
  }

  protected async getValue(_inputs: Record<string, any>): Promise<any> {
    throw new Error('getValue() must be implemented in child class');
  }
}

export class WFOutputNode extends WFNodeBase {
  public readonly unit: RegularProcessingUnit;

  constructor() {
    super({
      inputs: {
        output: { datatype: WFDataType.Media },
      },
      outputs: {},
    });
    this.unit = {
      cacheable: false,
      id: this.uuid,
      inputs: [
        {
          name: 'output',
          schema: {
            default: new Blob(),
            type: 'image', // TODO: Video and 3D support
          },
        },
      ],
      name: '',
      outputs: [
        {
          name: 'duration',
          schema: {
            type: 'number',
          },
        },
        {
          name: 'height',
          schema: {
            type: 'number',
          },
        },
        {
          name: 'output',
          schema: {
            type: 'image', // TODO: Video and 3D support
          },
        },
        {
          name: 'width',
          schema: {
            type: 'number',
          },
        },
      ],
      processingType: 'Regular Processing',
      run: async (inputs: Record<string, any>): Promise<Record<string, any>> => {
        const output = inputs.output as Blob;

        // TODO: More proper media type detection
        // TODO: Video support
        if (output.type.startsWith('model/')) {
          return { ...inputs };
        } else if (output.type.startsWith('video/')) {
          const { duration, height, width } = await getVideoSizeAndDuration(output);
          return { ...inputs, duration, height, width };
        } else {
          const { height, width } = await getImageSize(output);
          return { ...inputs, height, width };
        }
      },
      type: 'Regular Processing',
    };
  }

  public get pid(): string {
    return this.uuid;
  }
}

const toWFDataType = (schemaType: string): WFDataType => {
  switch(schemaType) {
    case 'aspectRatio': // TODO: Fix me
    case 'text':
    case 'text-select': // TODO: Fix me
      return WFDataType.Text;
    case 'image':
    case 'mask':
      return WFDataType.Image;
    case 'model3d':
      return WFDataType.Model3D;
    case 'number':
    case 'random-number':
        return WFDataType.Float; // TODO: Integer support?
    case 'rgba':
      return WFDataType.RGBA;
    case 'video':
      return WFDataType.Video;
    default:
      throw new Error(`Unsupported schema type: ${schemaType}`);
  }
}

export class WFPUNode extends WFNodeBase {
  public readonly pid: string;

  constructor(pid: string) {
    const unit = ProcessingUnitMap[pid];
    const inputs: Record<string, WFNodeInput> = {};
    const outputs: Record<string, WFNodeOutput> = {};
    for (const input of unit.inputs) {
      inputs[input.name] = {
        datatype: toWFDataType(input.schema.type),
      };
    }
    for (const output of unit.outputs) {
      outputs[output.name] = {
        datatype: toWFDataType(output.schema.type),
      };
    }
    super({ inputs, outputs });
    this.pid = pid;
  }
}

export type WFNode =
  WFInputNode |
  WFOutputNode |
  WFPUNode;

export class WFEdge extends WFBase {
  private _source: string /* UUID */;
  private _target: string /* UUID */;

  constructor(source: string, target: string) {
    super();
    this._source = source;
    this._target = target;
  }

  get source(): string {
    return this._source;
  }

  get target(): string {
    return this._target;
  }
}

export class WFNodeManager {
  // TODO: Avoid any if possible
  private edges: Map<string /* UUID of WFEdge */, WFEdge>;
  private nodes: Map<string /* UUID of WFNode */, WFNode>;
  private nodeToPorts: Map<string /* UUID of WFNode */, string /* UUID of WFPort */ []>;
  private ports: Map<string /* UUID of WFPorts */, WFPort>;
  private portToEdges: Map<string /* UUID of WFPort */, Map<string /* UUID of connected WFPort */, string /* UUID of WFEdge */>>;
  private portToNode: Map<string /* UUID of WFPort */, string /* UUID of WFNode */>;

  constructor() {
    this.edges = new Map();
    this.nodes = new Map();
    this.nodeToPorts = new Map();
    this.ports = new Map();
    this.portToEdges = new Map();
    this.portToNode = new Map();
  }

  private getEdge(edgeUuid: string): WFEdge {
    if (!this.edges.has(edgeUuid)) {
      throw new Error(`Unknown Edge ${edgeUuid}.`);
    }
    return this.edges.get(edgeUuid)!;
  }

  private getEdgeOf(portUuidFrom: string, portUuidTo: string): WFEdge {
    if (!this.portToEdges.has(portUuidFrom)) {
      throw new Error(`Port ${portUuidFrom} is not found in portToEdges map.`);
    }
    if (!this.portToEdges.get(portUuidFrom)!.has(portUuidTo)) {
      throw new Error(`Port ${portUuidTo} is not found with Port ${portUuidFrom} in portToEdges map.`);
    }
    return this.getEdge(this.portToEdges.get(portUuidFrom)!.get(portUuidTo)!);
  }

  private getEdgesByPort(portUuid: string): WFEdge[] {
    if (!this.portToEdges.has(portUuid)) {
      throw new Error(`Port ${portUuid} is not found in portToEdges map.`);
    }
    return Array.from(this.portToEdges.get(portUuid)!.values()).map((uuid) => this.getEdge(uuid));
  }

  private deleteEdge(edgeUuid: string): WFNodeManager {
    if (!this.edges.has(edgeUuid)) {
      throw new Error(`Unknown Edge ${edgeUuid}.`);
    }
    this.edges.delete(edgeUuid);
    return this;
  }

  public getNode(nodeUuid: string): WFNode {
    if (!this.nodes.has(nodeUuid)) {
      throw new Error(`Unknown Node ${nodeUuid}.`);
    }
    return this.nodes.get(nodeUuid)!;
  }

  private getNodeOf(portUuid: string): WFNode {
    if (!this.portToNode.has(portUuid)) {
      throw new Error(`Port ${portUuid} is not bound to any Node.`);
    }
    return this.getNode(this.portToNode.get(portUuid)!);
  }

  private traverseNode(nodeUuid: string, callback: (nodeUuid: string) => void): void {
    // Assumes no circluar dependencies
    callback(nodeUuid);
    this.getPortsOf(nodeUuid)
      .filter((port: WFPort) => port.type === WFPortType.Output)
      .filter((port: WFPort) => this.connected(port.uuid))
      .flatMap((port: WFPort) => this.getEdgesByPort(port.uuid))
      .map((edge: WFEdge) => this.getPort(edge.target))
      .map((port: WFPort) => this.getNodeOf(port.uuid))
      .forEach((node: WFNode) => this.traverseNode(node.uuid, callback));
  }

  private getPort(portUuid: string): WFPort {
    if (!this.ports.has(portUuid)) {
      throw new Error(`Unknown Port ${portUuid}.`);
    }
    return this.ports.get(portUuid)!;
  }

  private getPortsOf(nodeUuid: string): WFPort[] {
    if (!this.nodeToPorts.has(nodeUuid)) {
      throw new Error(`Node ${nodeUuid} is not found in nodeToPorts map.`);
    }
    return this.nodeToPorts.get(nodeUuid)!.map((uuid) => this.getPort(uuid));
  }

  public getPortByNodeAndPortName(nodeUuid: string, portName: string, portType?: WFPortType): WFPort {
    // TODO: Optimize
    for (const port of this.getPortsOf(nodeUuid)) {
      if (port.name === portName && (portType === undefined || port.type === portType)) {
        return port;
      }
    }
    throw new Error(`Port is not found by Node ${nodeUuid} and Port name ${portName}.`);
  }

  public connected(portUuid: string): boolean {
    const port = this.getPort(portUuid);
    return this.portToEdges.has(port.uuid) && this.portToEdges.get(port.uuid)!.size > 0;
  }

  public registerNode(node: WFNode): string {
    if (this.nodes.has(node.uuid)) {
      throw new Error(`Node ${this.nodes.get(node.uuid)} has been already registered.`);
    }

    for (const key in node.inputDefs) {
      this.registerPort(new WFPort(
        key,
        WFPortType.Input,
        node.inputDefs[key].datatype,
        !node.inputDefs[key].required,
      ), node.uuid);
    }

    for (const key in node.outputDefs) {
      this.registerPort(new WFPort(
        key,
        WFPortType.Output,
        node.outputDefs[key].datatype,
        false,
      ), node.uuid);
    }

    this.nodes.set(node.uuid, node);
    return node.uuid;
  }

  public deregisterNode(nodeUuid: string): WFNodeManager {
    const node = this.getNode(nodeUuid);
    const ports = this.getPortsOf(node.uuid);
    ports.filter((p) => this.connected(p.uuid)).forEach((p) => {
      this.getEdgesByPort(p.uuid).forEach((edge) => {
        this.disconnect(edge.source, edge.target);
      });
    });
    ports.forEach((p) => this.deregisterPort(p.uuid));
    this.nodes.delete(node.uuid);
    return this;
  }

  private registerPort(port: WFPort, nodeUuid: string): WFNodeManager {
    if (this.ports.has(port.uuid)) {
      throw new Error(`Port ${port.uuid} has already been registered.`);
    }
    if (this.portToNode.has(port.uuid)) {
      throw new Error(`Port ${port.uuid} has already been in portToNode map.`);
    }
    if (!this.nodeToPorts.has(nodeUuid)) {
      this.nodeToPorts.set(nodeUuid, []);
    }
    if (this.nodeToPorts.get(nodeUuid)!.includes(port.uuid)) {
      throw new Error(`Port ${port.uuid} has already been in nodeToPorts map with Node ${nodeUuid}.`);
    }
    this.ports.set(port.uuid, port);
    this.portToNode.set(port.uuid, nodeUuid);
    this.nodeToPorts.get(nodeUuid)!.push(port.uuid);
    return this;
  }

  private deregisterPort(portUuid: string): WFNodeManager {
    const port = this.getPort(portUuid);
    const node = this.getNodeOf(port.uuid);
  
    if (this.connected(port.uuid)) {
      const ports = this.getPortsOf(node.uuid);
      const newPorts = ports.filter((p) => p.uuid !== port.uuid).map((p => p.uuid));
      if (newPorts.length > 0) {
        this.nodeToPorts.set(node.uuid, newPorts);
      } else {
        this.nodeToPorts.delete(node.uuid);
      }
    }

    this.portToNode.delete(port.uuid);
    this.ports.delete(port.uuid);
    return this;
  }

  private registerToPortToEdges(edgeUuid: string, portUuidFrom: string, portUuidTo: string): WFNodeManager {
    if (!this.portToEdges.has(portUuidFrom)) {
      this.portToEdges.set(portUuidFrom, new Map());
    }
    if (this.portToEdges.get(portUuidFrom)!.has(portUuidTo)) {
      throw new Error(`Port ${portUuidTo} has been already in portToEdges map with Port ${portUuidFrom}.`);
    }
    this.portToEdges.get(portUuidFrom)!.set(portUuidTo, edgeUuid);
    return this;
  }

  private deregisterFromPortToEdges(portUuidFrom: string, portUuidTo: string): WFNodeManager {
    // Check the existence of Edge
    this.portToEdges.get(portUuidFrom)!.delete(portUuidTo);
    return this;
  }

  public canConnect(sourcePortUuid: string, targetPortUuid: string): boolean {
    const sourcePort = this.getPort(sourcePortUuid);
    const targetPort = this.getPort(targetPortUuid);

    if (sourcePort.type !== WFPortType.Output) {
      return false;
    }

    if (targetPort.type !== WFPortType.Input) {
      return false;
    }

    const sourceDataType = sourcePort.datatype;
    const targetDataType = targetPort.datatype;

    if (sourceDataType === targetDataType) {
      return true;
    }

    if (targetDataType === WFDataType.Media && (
      sourceDataType === WFDataType.Image ||
      sourceDataType === WFDataType.Video ||
      sourceDataType === WFDataType.Model3D
    )) {
      return true;
    }

    // For now
    if (
      targetDataType === WFDataType.Float && sourceDataType === WFDataType.Integer ||
      targetDataType === WFDataType.Integer && sourceDataType === WFDataType.Float
    ) {
      return true;
    }

    return false;
  }

  public connect(sourcePortUuid: string, targetPortUuid: string): string {
    const sourcePort = this.getPort(sourcePortUuid);
    const targetPort = this.getPort(targetPortUuid);

    if (sourcePort.type !== WFPortType.Output) {
      throw new Error(`Source Port must be Output port. ${sourcePort}`);
    }
    if (targetPort.type !== WFPortType.Input) {
      throw new Error(`Target Port must be Input port. ${targetPort}`);
    }

    if (!this.canConnect(sourcePortUuid, targetPortUuid)) {
      throw new Error(`DataType mismatch between source and target Ports. ${sourcePort}, ${targetPort} `);
    }

    const edge = new WFEdge(sourcePort.uuid, targetPort.uuid);
    this.edges.set(edge.uuid, edge);

    this.registerToPortToEdges(edge.uuid, sourcePort.uuid, targetPort.uuid);
    this.registerToPortToEdges(edge.uuid, targetPort.uuid, sourcePort.uuid);

    return edge.uuid;
  }

  public disconnect(sourcePortUuid: string, targetPortUuid: string): WFNodeManager {
    if (!this.portToEdges.get(sourcePortUuid)!.has(targetPortUuid)) {
      throw new Error(`Source Port ${sourcePortUuid} is not connected to Target Port ${targetPortUuid}.`);
    }
    if (!this.portToEdges.get(targetPortUuid)!.has(sourcePortUuid)) {
      throw new Error(`Target Port ${targetPortUuid} is not connected to Source Port ${sourcePortUuid}.`);
    }

    const sourcePort = this.getPort(sourcePortUuid);
    const targetPort = this.getPort(targetPortUuid);
    const edge = this.getEdgeOf(sourcePort.uuid, targetPort.uuid);

    this.deregisterFromPortToEdges(sourcePort.uuid, targetPort.uuid);
    this.deregisterFromPortToEdges(targetPort.uuid, sourcePort.uuid);
    this.deleteEdge(edge.uuid);

    return this;
  }
}

// Input

export class WFNumberNode extends WFInputNode {
  private number: number;

  constructor() {
    super('number', WFDataType.Float);
    this.number = 0;
  }

  public set(number: number): this {
    this.number = number;
    return this;
  }

  protected async getValue(): Promise<number> {
    return this.number;
  }
}

export class WFRandomSeedGeneratorNode extends WFInputNode {
  constructor() {
    super('seed', WFDataType.Integer, true);
  }

  protected async getValue(): Promise<number> {
    return generateRandomSeed();
  }
}

export class WFRGBANode extends WFInputNode {
  private rgba: [number, number, number, number];

  constructor() {
    super('rgba', WFDataType.RGBA);
    this.rgba = [0, 0, 0, 0];
  }

  public set(rgba: [number, number, number, number]): this {
    for (let i = 0; i < 4; i++) {
      this.rgba[i] = rgba[i];
    }
    return this;
  }

  protected async getValue(): Promise<[number, number, number, number]> {
    return this.rgba;
  }
}

export class WFTextNode extends WFInputNode {
  private text: string;

  constructor() {
    super('text', WFDataType.Text);
    this.text = '';
  }

  public set(text: string): WFTextNode {
    this.text = text;
    return this;
  }

  protected async getValue(): Promise<string> {
    return this.text;
  }
}

// TODO: Automatically generate Node Definitions

// Stability AI API

export class WFControlSketchNode extends WFPUNode {
  constructor() {
    super('Control Sketch');
  }
}

export class WFControlStructureNode extends WFPUNode {
  constructor() {
    super('Control Structure');
  }
}

export class WFControlStyleNode extends WFPUNode {
  constructor() {
    super('Control Style');
  }
}

export class WFEraseNode extends WFPUNode {
  constructor() {
    super('Erase');
  }
}

export class WFImageTo3DNode extends WFPUNode {
  constructor() {
    super('Image to 3D');
  }
}

export class WFImageToVideoNode extends WFPUNode {
  constructor() {
    super('Image to Video');
  }
}

export class WFInpaintNode extends WFPUNode {
  constructor() {
    super('Inpaint');
  }
}

export class WFOutpaintNode extends WFPUNode {
  constructor() {
    super('Outpaint');
  }
}

export class WFRemoveBackgroundNode extends WFPUNode {
  constructor() {
    super('Remove Background');
  }
}

export class WFSearchAndRecolorNode extends WFPUNode {
  constructor() {
    super('Search and Recolor');
  }
}

export class WFSearchAndReplaceNode extends WFPUNode {
  constructor() {
    super('Search and Replace');
  }
}

export class WFTextToImageNode extends WFPUNode {
  constructor() {
    super('Text to Image');
  }
}

// Regular Image Processing

export class WFCropImageNode extends WFPUNode {
  constructor() {
    super('Crop Image');
  }
}

export class WFImageThresholdingNode extends WFPUNode {
  constructor() {
    super('Image Thresholding');
  }
}

export class WFResizeImageNode extends WFPUNode {
  constructor() {
    super('Resize Image');
  }
}
