import classnames from "classnames";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
 } from "react";
import {
  addEdge,
  Background,
  Connection,
  Edge,
  Handle,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  reconnectEdge,
  useEdgesState,
  useHandleConnections,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {
  type ProcedureProcessingUnit,
  registerProcessingUnit,
} from "../Processors/ProcessingUnit";
import {
  WFControlSketchNode,
  WFControlStructureNode,
  WFControlStyleNode,
  WFCropImageNode,
  WFDataType,
  WFEraseNode,
  WFImageThresholdingNode,
  WFImageTo3DNode,
  WFImageToVideoNode,
  WFInpaintNode,
  WFNode,
  WFNodeManager,
  WFNumberNode,
  WFOutpaintNode,
  WFOutputNode,
  WFPortType,
  WFRemoveBackgroundNode,
  WFResizeImageNode,
  WFRGBANode,
  WFSearchAndRecolorNode,
  WFSearchAndReplaceNode,
  WFTextNode,
  WFTextToImageNode,
  WFRandomSeedGeneratorNode,
} from "./Node";
import { generateUUID } from "../Utils/utils";

class UINodeManager {
  private toWFNodeMap: Map<string /* UUID of UI Node */, string /* UUID of WFNode */>;

  constructor() {
    this.toWFNodeMap = new Map();
  }

  public add(uiNodeUuid: string, wfNodeUuid: string): UINodeManager {
    if (this.has(uiNodeUuid)) {
      throw new Error(`UI Node ${uiNodeUuid} has been already registered.`);
    }
    this.toWFNodeMap.set(uiNodeUuid, wfNodeUuid);
    return this;
  }

  public has(uiNodeUuid: string): boolean {
    return this.toWFNodeMap.has(uiNodeUuid);
  };

  public toWFNode(uiNodeUuid: string): string {
    if (!this.has(uiNodeUuid)) {
      throw new Error(`UI Node ${uiNodeUuid} is not registered.`);
    }
    return this.toWFNodeMap.get(uiNodeUuid)!;
  }

  public remove(uiNodeUuid: string): UINodeManager {
    if (!this.has(uiNodeUuid)) {
      throw new Error(`UI Node ${uiNodeUuid} is not registered.`);
    }
    this.toWFNodeMap.delete(uiNodeUuid);
    return this;
  }
}

class NodeManager {
  private uiManager: UINodeManager;
  private uiOutputNodeUuids: string[];
  private wfManager: WFNodeManager;
  private procedure: ProcedureProcessingUnit;

  constructor() {
    this.uiManager = new UINodeManager();
    this.wfManager = new WFNodeManager();
    this.uiOutputNodeUuids = [];
    this.procedure = {
      connections: [],
      id: generateUUID(),
      inputs: [],
      name: '',
      outputs: [],
      // Updated later when output is connected. Not sure if it's good design
      processingType: 'Image Generation',
      randomness: false,
      references: [],
      type: 'Procedure',
    };
  }

  public registerNode(uiNodeUuid: string, wfNode: WFNode): this {
    this.uiManager.add(uiNodeUuid, this.wfManager.registerNode(wfNode));
  
    if (wfNode instanceof WFOutputNode) {
      this.uiOutputNodeUuids.push(uiNodeUuid);
      wfNode.unit.outputs.forEach(output => {
        this.procedure.connections.push({
          source: wfNode.uuid,
          sourceHandle: output.name,
          target: 'Output',
          targetHandle: output.name,
        });
      });
    }

    if ('unit' in wfNode) {
      registerProcessingUnit(wfNode.unit);
    }

    this.procedure.references.push({
      id: wfNode.uuid,
      pid: wfNode.pid, // TODO: Fix me
    });

    return this;
  }

  public deregisterNode(uiNodeUuid: string): this {
    const wfUuid = this.uiManager.toWFNode(uiNodeUuid);
    const wfNode = this.wfManager.getNode(wfUuid);

    if (wfNode instanceof WFOutputNode) {
      this.uiOutputNodeUuids = this.uiOutputNodeUuids.filter((uuid) => uuid !== uiNodeUuid);
    }

    this.wfManager.deregisterNode(wfUuid);
    this.uiManager.remove(uiNodeUuid);

    this.procedure.references = this.procedure.references.filter((ref) => {
      return ref.id !== wfUuid;
    });

    this.procedure.connections = this.procedure.connections.filter((con) => {
      return (!('source' in con) || con.source !== wfNode.uuid) && con.target !== wfNode.uuid;
    });

    return this;
  }

  public connect(
    uiSourceNodeUuid: string,
    sourcePortName: string,
    uiTargetNodeUuid: string,
    targetPortName: string,
  ): this {
    const sourceNode = this.wfManager.getNode(this.uiManager.toWFNode(uiSourceNodeUuid));
    const targetNode = this.wfManager.getNode(this.uiManager.toWFNode(uiTargetNodeUuid));

    this.wfManager.connect(
      this.wfManager.getPortByNodeAndPortName(sourceNode.uuid, sourcePortName, WFPortType.Output).uuid,
      this.wfManager.getPortByNodeAndPortName(targetNode.uuid, targetPortName, WFPortType.Input).uuid,
    );

    this.procedure.connections.push({
      source: sourceNode.uuid,
      sourceHandle: sourcePortName,
      target: targetNode.uuid,
      targetHandle: targetPortName,
    });

    // TODO: More elengant way
    if (targetNode instanceof WFOutputNode && targetPortName === 'output') {
      // TODO: Not sure if mutable processingType is good
      switch (sourceNode.outputDefs[sourcePortName].datatype) {
        case WFDataType.Image:
          this.procedure.processingType = 'Image Generation';
          break;
        case WFDataType.Video:
          this.procedure.processingType = 'Video Generation';
          break;
        case WFDataType.Model3D:
          this.procedure.processingType = '3D Model Generation';
          break;
        default:
          // Throw error?
      }
    }

    return this;
  }

  public disconnect(
    uiSourceNodeUuid: string,
    sourcePortName: string,
    uiTargetNodeUuid: string,
    targetPortName: string,
  ): this {
    const sourceNode = this.wfManager.getNode(this.uiManager.toWFNode(uiSourceNodeUuid));
    const targetNode = this.wfManager.getNode(this.uiManager.toWFNode(uiTargetNodeUuid));

    this.wfManager.disconnect(
      this.wfManager.getPortByNodeAndPortName(sourceNode.uuid, sourcePortName, WFPortType.Output).uuid,
      this.wfManager.getPortByNodeAndPortName(targetNode.uuid, targetPortName, WFPortType.Input).uuid,
    );

    this.procedure.connections = this.procedure.connections.filter((con) => {
      return !('source' in con) ||
       con.source !== sourceNode.uuid ||
       con.sourceHandle !== sourcePortName ||
       con.target !== targetNode.uuid ||
       con.targetHandle !== targetPortName;
    });

    return this;
  }

  public getWFNode(uiNodeUuid: string): WFNode {
    const wfUuid = this.uiManager.toWFNode(uiNodeUuid);
    return this.wfManager.getNode(wfUuid);
  }

  public readyToGenerate(): boolean {
    // TODO: Optimize
    return this.uiOutputNodeUuids.some((uuid) => {
      const wfNodeUuid = this.uiManager.toWFNode(uuid);
      const port = this.wfManager.getPortByNodeAndPortName(wfNodeUuid, 'output');
      return this.wfManager.connected(port.uuid);
    });
  }

  public createProcedure(): ProcedureProcessingUnit {
    return this.procedure;
  }
}

const managerContext = createContext<NodeManager>(new NodeManager());

const ManagerProvider = ({ children }: { children: JSX.Element | JSX.Element[]}): JSX.Element => {
  const [manager] = useState<NodeManager>(new NodeManager());

  return (
    <managerContext.Provider value={manager}>
      {children}
    </managerContext.Provider>
  );
};

const processingContext = createContext<boolean>(false);
const setProcessingContext = createContext<Dispatch<SetStateAction<boolean>>>(() => {});

const ProcessingProvider = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element => {
  const [processing, setProcessing] = useState<boolean>(false);

  return (
    <processingContext.Provider value={processing}>
      <setProcessingContext.Provider value={setProcessing}>
        {children}
      </setProcessingContext.Provider>      
    </processingContext.Provider>
  );
};

const NodeEditorProvider = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element => {
  return (
    <ReactFlowProvider>
      <ManagerProvider>
        <ProcessingProvider>
          {children}
        </ProcessingProvider>
      </ManagerProvider>
    </ReactFlowProvider>
  );
};

const initialNodes: Node[] = [
  {
    data: {},
    id: generateUUID(),
    position: { x: 0, y: 200 },
    selectable: true,
    type: 'textNode',
  },
  {
    data: {},
    id: generateUUID(),
    position: { x: 300, y: 200 },
    selectable: true,
    type: 'textToImageNode',
  },
  {
    data: {},
    deletable: false,
    id: generateUUID(),
    position: { x: 600, y: 200 },
    selectable: true,
    type: 'outputNode',
  },
];

export const Content = ({
  onReady,
  processing,
}: {
  onReady: (ready: boolean, unit?: ProcedureProcessingUnit) => void,
  processing: boolean,
}): JSX.Element => {
  return (
    <NodeEditorProvider>
      <NodeEditor
        onReady={onReady}
        processing={processing}
      />
    </NodeEditorProvider>
  );
};

const NodeEditor = ({
  onReady,
  processing,
}: {
  onReady: (ready: boolean, unit?: ProcedureProcessingUnit) => void,
  processing: boolean,  
}): JSX.Element => {
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const edgeReconnectSuccessful = useRef(true);
  const manager = useContext(managerContext);
  const setProcessing = useContext(setProcessingContext);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((edges: never[]) => addEdge(connection, edges));
    },
    [setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els) as never[]);
    },
    [],
  );

  const onReconnectStart = useCallback(
    () => {
      edgeReconnectSuccessful.current = false;
    },
    [],
  );

  const onReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => (e as Edge).id !== edge.id));
      }
      edgeReconnectSuccessful.current = true;
    },
    [],
  );

  useEffect(() => {
    onReady(
      !!manager.readyToGenerate(),
      manager.createProcedure(),
    );
  }, [edges]);

  useEffect(() => {
    setProcessing(processing);
  }, [processing]);

  return (
    <div
      className='h-full relative w-full'
    >
      <NodeUI />
      <ReactFlow
        edges={edges}
        fitView
        nodes={nodes}
        nodeTypes={{
          controlSketchNode: ControlSketchNode,
          controlStructureNode: ControlStructureNode,
          controlStyleNode: ControlStyleNode,
          cropImageNode: CropImageNode,
          eraseNode: EraseNode,
          imageThresholdingNode: ImageThresholdingNode,
          imageTo3DNode: ImageTo3DNode,
          imageToVideoNode: ImageToVideoNode,
          inpaintNode: InpaintNode,
          numberNode: NumberNode,
          outpaintNode: OutpaintNode,
          outputNode: OutputNode,
          randomSeedNode: RandomSeedNode,
          removeBackgroundNode: RemoveBackgroundNode,
          rgbaNode: RGBANode,
          resizeImageNode: ResizeImageNode,
          searchAndRecolorNode: SearchAndRecolorNode,
          searchAndReplaceNode: SearchAndReplaceNode,
          textNode: TextNode,
          textToImageNode: TextToImageNode,
        }}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onReconnect={onReconnect}
        onReconnectEnd={onReconnectEnd}
        onReconnectStart={onReconnectStart}
        proOptions={{
          // Do we want to donate to ReactFlow project?
          // https://reactflow.dev/learn/troubleshooting/remove-attribution
          hideAttribution: true,
        }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

// TODO: Delete Node support
// TODO: Load/Store Node graph support
const NodeUI = (): JSX.Element => {
  const { setNodes } = useReactFlow();
  const selectRef = useRef<HTMLSelectElement>(null);
  const { getViewport } = useReactFlow();

  return (
    <div
      className='absolute flex gap-2 left-0 top-0 w-full z-[1000]'
    >
      <select
        className='select select-bordered select-xs'
        ref={selectRef}
      >
        {/* TODO: Automatically generate */}
        <option disabled>Input</option>
        <option value='numberNode'>Number</option>
        <option value='randomSeedNode'>RandomSeed</option>
        <option value='rgbaNode'>RGBA</option>
        <option value='textNode'>Text</option>
        <option disabled>Stability AI API</option>
        <option value='controlSketchNode'>Control Sketch</option>
        <option value='controlStructureNode'>Control Structure</option>
        <option value='controlStyleNode'>Control Style</option>
        <option value='eraseNode'>Erase</option>
        <option value='imageTo3DNode'>Image to 3D</option>
        <option value='imageToVideoNode'>Image to Video</option>
        <option value='inpaintNode'>Inpaint</option>
        <option value='outpaintNode'>Outpaint</option>
        <option value='removeBackgroundNode'>Remove Background</option>
        <option value='searchAndRecolorNode'>Search And Recolor</option>
        <option value='searchAndReplaceNode'>Search And Replace</option>
        <option value='textToImageNode'>Text to Image</option>
        <option disabled>Regular Image Processing</option>
        <option value='cropImageNode'>Crop Image</option>
        <option value='imageThresholdingNode'>Image Thresholding</option>
        <option value='resizeImageNode'>Resize Image</option>
      </select>
      <button
        className='btn btn-primary btn-xs'
        onClick={() => {
          const option = selectRef.current!.selectedOptions[0];
          const { x, y, zoom } = getViewport();
          setNodes(nodes => {
            return [
              ...nodes,
              {
                data: {},
                id:  generateUUID(),
                position: {
                  x: (-x + 50) / zoom,
                  y: (-y + 50) / zoom,
                },
                type: option.value,
              }
            ];
          });
        }}
      >
        Add Node
      </button>
    </div>
  );
}

// TODO: Write comment for this hack
const getTopString = (index: number): string => {
  switch(index) {
    case 0:
      return 'top-[60px]';
    case 1:
      return 'top-[90px]';
    case 2:
      return 'top-[120px]';
    case 3:
      return 'top-[150px]';
    case 4:
      return 'top-[180px]';
    case 5:
      return 'top-[210px]';
    case 6:
      return 'top-[240px]';
    case 7:
      return 'top-[270px]';
    default:
      throw new Error('Definition shortage.');
  }
};

const SourceHandle = ({
  index,
  name,
}: {
  index: number,
  name: string,
}): JSX.Element => {
  return (
    <Handle
      className={`${getTopString(index)}`}
      id={name}
      position={Position.Right}
      type='source'
    >
      <label
        className='absolute translate-x-[calc(-100%-5px)] translate-y-[-40%]'
      >
        {name}
      </label>
    </Handle>
  );
};

const TargetHandle = ({
  index,
  name,
}: {
  index: number,
  name: string,
}): JSX.Element => {
  const manager = useContext(managerContext);
  const { setEdges } = useReactFlow();

  // TODO: Revisit for simplify and optimization
  const onConnect = useCallback((connections: Connection[]) => {
    const errorConnections = new Set<string>();

    for (const connection of connections) {
      try {
        manager.connect(connection.source, connection.sourceHandle!, connection.target, connection.targetHandle!);
      } catch (error) {
        const key = [connection.source, connection.sourceHandle, connection.target, connection.targetHandle].join(':');
        errorConnections.add(key);
        console.error(error);
      }
    }

    const duplications = new Set<string>();
    setEdges((edges: Edge[]) => edges.reverse().filter((edge: Edge) => {
      const key = [edge.source, edge.sourceHandle, edge.target, edge.targetHandle].join(':');

      if (errorConnections.has(key)) {
        return false;
      }

      const targetDuplicationKey = [edge.target, edge.targetHandle].join(':');

      if (duplications.has(targetDuplicationKey)) {
        return false;
      }

      duplications.add(targetDuplicationKey);

      return true;
    }).reverse());
  }, []);

  const onDisconnect = useCallback((connections: Connection[]) => {
    for (const connection of connections) {
      try {
        manager.disconnect(connection.source, connection.sourceHandle!, connection.target, connection.targetHandle!);
      } catch (error) {
        console.error(error);
      }
    }
    // TODO: Write comment
    setEdges(edges => edges);
  }, []);

  useHandleConnections({
    id: name,
    onConnect,
    onDisconnect,
    type: 'target',
  });

  return (
    <Handle
      className={`${getTopString(index)}`}
      id={name}
      position={Position.Left}
      type='target'
    >
      <label
        className='absolute translate-x-[10px] translate-y-[-40%]'
      >
        {name}
      </label>
    </Handle>
  );
};

const BaseNode = ({
  additionalHeight=0,
  children,
  id,
  selected,
  title,
  WFNodeType,
  width='w-52'
}: {
  additionalHeight?: number,
  children?: JSX.Element | JSX.Element[],
  id: string,
  selected?: boolean,
  title: string,
  WFNodeType: new () => WFNode,
  width?: string,
}): JSX.Element => {
  const manager = useContext(managerContext);
  const [sources, setSources] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);

  useLayoutEffect(() => {
    const wfNode = new WFNodeType();
    manager.registerNode(id, wfNode);
    setSources(Object.keys(wfNode.outputDefs));
    setTargets(Object.keys(wfNode.inputDefs));
    return () => {
      manager.deregisterNode(id);
    };
  }, []);

  return (
    <div
      className={classnames(
        'card p-2',
        width,
        selected ? 'border-2' : 'border',
      )}
      // TODO: Write comment about why using style here
      style={{
        height: `${5 + additionalHeight + Math.max(sources.length, targets.length) * 2}rem`,
      }}
    >
      <div
        className='card-body relative'
      >
        <div
          className='absolute card-title font-normal left-2 text-sm top-0'
        >
          {title}
        </div>
        {children}
      </div>
      {sources.map((name, index) => (
        <SourceHandle
          index={index}
          key={index}
          name={name}
        />
      ))}
      {targets.map((name, index) => (
        <TargetHandle
          index={index}
          key={index}
          name={name}
        />
      ))}
    </div>
  );
};

// Input Node

const NumberNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  const processing = useContext(processingContext);
  const manager = useContext(managerContext);
  const [value, setValue] = useState<string>('0');

  return (
    <BaseNode
      additionalHeight={1}
      id={id}
      selected={selected}
      title='NumberNode'
      WFNodeType={WFNumberNode}
    >
      <input
        className={classnames(
          'absolute border border-base-content bottom-0 input input-xs self-center w-full',
          isNaN(Number(value)) ? 'bg-error' : '',
        )}
        disabled={processing}
        onChange={(e) => {
          const value = e.target.value;
          setValue(value);
          (manager.getWFNode(id) as WFNumberNode).set(Number(value));
        }}
        value={value}
      />
    </BaseNode>
  );
};

const RandomSeedNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='RandomSeedNode'
      WFNodeType={WFRandomSeedGeneratorNode}
    />
  );
};

const RGBANode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  const processing = useContext(processingContext);
  const manager = useContext(managerContext);
  const [rgba, setRgba] = useState<[number, number, number, number]>([0, 0, 0, 0]);

  const onChange = (index: number, value: string): boolean => {
    const effectiveValue = Number(value);
    if (isNaN(effectiveValue) || effectiveValue < 0 || effectiveValue > 255) {
      return false;
    }
    const newRgba = rgba.slice() as [number, number, number, number];
    newRgba[index] = effectiveValue;
    setRgba(newRgba);
    (manager.getWFNode(id) as WFRGBANode).set(newRgba);
    return true;
  };

  return (
    <BaseNode
      additionalHeight={8}
      id={id}
      selected={selected}
      title='RGBANode'
      WFNodeType={WFRGBANode}
    >
      <div
        className='absolute bottom-0 flex flex-col gap-2 self-center w-full'
      >
        {['R', 'G', 'B', 'A'].map((value, index) => (
          <div
            className='flex gap-2'
            key={index}
          >
            <label
              className='w-4'
            >
              {value}
            </label>
            <input
              className='border border-base-content input input-xs w-full'
              disabled={processing}
              onChange={(e) => {
                onChange(index, e.target.value)
              }}
              value={rgba[index]}
              type='text'
            />
          </div>
        ))}
      </div>
    </BaseNode>
  );
};

const TextNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  const processing = useContext(processingContext);
  const manager = useContext(managerContext);

  return (
    <BaseNode
      additionalHeight={6}
      id={id}
      selected={selected}
      title='TextNode'
      WFNodeType={WFTextNode}
    >
      <textarea
        className='absolute border border-base-content bottom-0 resize-none self-center textarea w-full'
        disabled={processing}
        onChange={(e) => {
          (manager.getWFNode(id) as WFTextNode).set(e.target.value);
        }}
        placeholder='text'
        rows={3}
      />
    </BaseNode>
  );
};

// Output Node

const OutputNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='OutputNode'
      WFNodeType={WFOutputNode}
    />
  );
};

// TODO: Automatically generate Node Definitions

// Stability AI API Node

const ControlSketchNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='ControlSketchNode'
      WFNodeType={WFControlSketchNode}
    />
  );
};

const ControlStructureNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='ControlStructureNode'
      WFNodeType={WFControlStructureNode}
    />
  );
};

const ControlStyleNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='ControlStylehNode'
      WFNodeType={WFControlStyleNode}
    />
  );
};

const EraseNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='EraseNode'
      WFNodeType={WFEraseNode}
    />
  );
};

const ImageTo3DNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='ImageTo3DNode'
      WFNodeType={WFImageTo3DNode}
    />
  );
};

const ImageToVideoNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='ImageToVideoNode'
      WFNodeType={WFImageToVideoNode}
    />
  );
};

const InpaintNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='InpaintNode'
      WFNodeType={WFInpaintNode}
    />
  );
};

const OutpaintNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='OutpaintNode'
      WFNodeType={WFOutpaintNode}
    />
  );
};

const RemoveBackgroundNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='RemoveBackgroundNode'
      WFNodeType={WFRemoveBackgroundNode}
    />
  );
};

const SearchAndRecolorNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='SearchAndRecolorNode'
      WFNodeType={WFSearchAndRecolorNode}
    />
  );
};

const SearchAndReplaceNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='SearchAndReplaceNode'
      WFNodeType={WFSearchAndReplaceNode}
    />
  );
};

const TextToImageNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='TextToImageNode'
      WFNodeType={WFTextToImageNode}
    />
  );
};

// Regular Processing Node

const CropImageNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='CropImageNode'
      WFNodeType={WFCropImageNode}
    />
  );
};

const ImageThresholdingNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='ImageThresholdingNode'
      WFNodeType={WFImageThresholdingNode}
    />
  );
};

const ResizeImageNode = ({ id, selected }: { id: string, selected?: boolean }): JSX.Element => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      title='ResizeImageNode'
      WFNodeType={WFResizeImageNode}
    />
  );
};
