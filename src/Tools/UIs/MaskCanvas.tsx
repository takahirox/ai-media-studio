import classnames from "classnames";
import {
  createRef,
  ForwardedRef,
  forwardRef,
  RefObject,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ExportImageOptions,
  ExportImageType,
  ReactSketchCanvas,
  ReactSketchCanvasRef,
} from 'react-sketch-canvas';
import {
  DeleteForeverIcon,
  EditIcon,
  EraserIcon,
  RedoIcon,
  UndoIcon,
  VisibilityIcon,
  VisibilityOffIcon,
} from '../../Commons/Icons';
import { useImage } from "../../Use/useImage";
import {
  CustomUISchema,
  Tool,
  ToolUISchema,
} from "../Tool";

const DEFAULT_BRUSH_SIZE = 40;
const MAX_BRUSH_SIZE = 100;
const MIN_BRUSH_SIZE = 1;

const DEFAULT_ERASE_MODE = false;
const DEFAULT_INVISIBLE = false;

export type MaskCanvasProps = {
  brushSize: number;
  eraseMode: boolean;
  invisible: boolean;
};

export type MaskCanvasRef = {
  clear: () => void;
  getBlob: () => Promise<Blob>;
  redo: () => void;
  setEraseMode: (enabled: boolean) => void;
  undo: () => void;
};

// The latest exportImage API takes optional options argument but the type definition
// doesn't seem to be have been updated yet. So we use this hack for now.
interface ReactSketchCanvasRefNew {
  exportImage: (
    imageType: ExportImageType,
    options?: ExportImageOptions
  ) => Promise<string>;
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;

export const MaskCanvasUI = ({
  disabled,
  maskCanvasRef,
  onChange,
  props,
}: {
  disabled: boolean,
  maskCanvasRef: RefObject<MaskCanvasRef>,
  onChange: (props: MaskCanvasProps) => void,
  props: MaskCanvasProps,
}): JSX.Element => {
  const {
    brushSize,
    eraseMode,
    invisible,
  } = props;

  return (
    <div
      className='flex flex-col gap-4 items-center'
    >
      <div
        className='flex flex-col gap-4 w-full'
      >
        <div
          className='flex justify-between'
        >
          <label>
            {eraseMode ? 'Eraser' : 'Brush'} Size
          </label>
          <span
            className='border rounded-md text-center w-10'
          >
            {brushSize}
          </span>
        </div>
        <input
          // TODO: Fix color
          className='disabled:range-secondary range range-xs range-primary w-full'
          disabled={disabled}
          max={MAX_BRUSH_SIZE}
          min={MIN_BRUSH_SIZE}
          onChange={(e) => {
            onChange({
              ...props,
              brushSize: Number(e.target.value),
            });
          }}
          step='1'
          type='range'
          value={brushSize}
        />
      </div>
      <div
        className='flex gap-4 justify-center w-full'
      >
        <button
          className='btn btn-circle btn-outline btn-sm'
          disabled={disabled}
          onClick={() => {
            onChange({
              ...props,
              eraseMode: !eraseMode,
            });
            maskCanvasRef?.current?.setEraseMode(!eraseMode);
          }}
        >
          {eraseMode ? <EditIcon /> : <EraserIcon /> }
        </button>
        <button
          className='btn btn-circle btn-outline btn-sm'
          disabled={disabled}
          onClick={() => {
            maskCanvasRef.current?.undo();
          }}
        >
          <UndoIcon />
        </button>
        <button
          className='btn btn-circle btn-outline btn-sm'
          disabled={disabled}
          onClick={() => {
            maskCanvasRef.current?.redo();
          }}
        >
          <RedoIcon />
        </button>
        <button
          className='btn btn-circle btn-outline btn-sm'
          disabled={disabled}
          onClick={() => {
            maskCanvasRef.current?.clear();
          }}
        >
          <DeleteForeverIcon />
        </button>
        <button
          className='btn btn-circle btn-outline btn-sm'
          disabled={disabled}
          onClick={() => {
            onChange({
              ...props,
              invisible: !invisible,
            });
          }}
        >
          {invisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </button>
      </div>
    </div>
  );
};

const CursorTracker = ({
  color,
  diameter,
  left,
  top,
}: {
  color: string;
  diameter: number;
  left: number;
  top: number;
}): JSX.Element => {
  return (
    <div
      className='fixed opacity-50 pointer-events-none rounded-full'
      // TODO: Write a comment why using style instead of className
      style={{
        backgroundColor: color,
        left: `${left - diameter / 2}px`,
        height: `${diameter}px`,
        top: `${top - diameter / 2}px`,
        width: `${diameter}px`,
      }}
    />
  );
};

export const MaskCanvas = forwardRef((
  {
    disabled,
    imageUuid,
    props,
  }: {
    disabled: boolean,
    imageUuid: string,
    props: MaskCanvasProps,
  },
  ref: ForwardedRef<MaskCanvasRef>
) => {
  const {
    brushSize,
    invisible,
  } = props;

  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [displayWidth, setDisplayWidth] = useState(1);
  const [displayHeight, setDisplayHeight] = useState(1);
  const [showCursorTracker, setShowCursorTracker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number }>({
    x: 0,
    y: 0,
  });
  const { findImageByUuid } = useImage();
  const image = findImageByUuid(imageUuid)!;

  const updateDisplaySize = () => {
    if (imageRef.current) {
      const imageEl = imageRef.current;
      const update = () => {
        // From https://stackoverflow.com/questions/52186493
        // TODO: Confirm this logic always works
        const ratio = imageEl.naturalWidth / imageEl.naturalHeight;
        let width = imageEl.height * ratio;
        let height = imageEl.height;
        if (width > imageEl.width) {
          width = imageEl.width;
          height = imageEl.width / ratio;
        }
        setDisplayWidth(width);
        setDisplayHeight(height);
      };

      // Can this hack be removed?
      if (imageEl.complete) {
        update();
      } else {
        const onLoad = () => {
          update();
          imageEl.removeEventListener('load', onLoad);
        };
        imageEl.addEventListener('load', onLoad);
      }
    } else {
      // TODO: Check if this happen and better wording or error handling if it does
      console.error('imageRef.current is null.');
    }
  };

  useLayoutEffect(() => {
    const onResize = () => {
      updateDisplaySize();
    };

    const onMouseEnter = () => {
      setShowCursorTracker(true);
    };

    const onMouseLeave = () => {
      setShowCursorTracker(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      setCursorPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    onResize();
    window.addEventListener('resize', onResize);

    divRef.current!.addEventListener('mouseenter', onMouseEnter);
    divRef.current!.addEventListener('mouseleave', onMouseLeave);
    divRef.current!.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', onResize);
      divRef.current!.removeEventListener('mouseenter', onMouseEnter);
      divRef.current!.removeEventListener('mouseleave', onMouseLeave);
      divRef.current!.removeEventListener('mousemove', onMouseMove);
    };
  }, [imageUuid])

  useImperativeHandle(
    ref,
    () => {
      return {
        clear(): void {
          canvasRef.current!.clearCanvas();
          // TODO: Rethink this
          canvasRef.current!.resetCanvas();
        },

        async getBlob(): Promise<Blob> {
          const format = 'png';
          const mimeType = `image/${format}`;
          const imgElement = imageRef.current!;

          const { naturalWidth: width, naturalHeight: height } = imgElement;
          const base64 = await (
            canvasRef.current! as ReactSketchCanvasRefNew
          ).exportImage(format, {
            width,
            height
          });

          return await new Promise<Blob>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              canvas.width = width;
              canvas.height = height;

              // In the drawing UI background color is white while stroke color is black for visibility.
              // But in the Stability AI API white seems to mean having the effect while black seems to mean
              // no effect. So inverting the color here before sending to the server.

              ctx.drawImage(img, 0, 0);
              const src = ctx.getImageData(0, 0, width, height);
              const dst = ctx.createImageData(width, height);

              for (let i = 0; i < src.data.length; i = i + 4) {
                dst.data[i] = 255 - src.data[i]; // R
                dst.data[i + 1] = 255 - src.data[i + 1]; // G
                dst.data[i + 2] = 255 - src.data[i + 2]; // B
                dst.data[i + 3] = src.data[i + 3]; // A
              }

              ctx.putImageData(dst, 0, 0);
              // What happens if another .toBlob() call happens before toBlob() going ahead completes?
              canvas.toBlob((blob) => resolve(blob!), mimeType);
            };
            img.onerror = reject;
            img.src = base64;
          });
        },

        redo(): void {
          canvasRef.current!.redo();
        },

        setEraseMode(enabled: boolean): void {
          canvasRef.current!.eraseMode(enabled);
        },

        undo(): void {
          canvasRef.current!.undo();
        },
      };
    },
    [canvasRef.current, imageRef.current]
  );

  return (
    <div
      // TODO: Write a comment about overflow-y-hidden
      className='h-full relative overflow-y-hidden'
      ref={divRef}
    >
      <img
        className='h-full object-contain w-full'
        ref={imageRef}
        src={image.src}
      />
      <ReactSketchCanvas
        // TODO: Support proper resize
        // TODO: Fix eraser performance issue
        canvasColor='white'
        className={classnames(
          'absolute active:cursor-default cursor-default left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          invisible ? 'opacity-0' : 'opacity-30',
        )}
        eraserWidth={invisible ? 0 : brushSize}
        height={`${displayHeight}px`}
        readOnly={disabled}
        ref={canvasRef}
        strokeWidth={invisible ? 0 : brushSize}
        strokeColor='black'
        width={`${displayWidth}px`}
      />
      {showCursorTracker && !props.invisible && (
        <CursorTracker
          color={props.eraseMode ? '#fff' : '#000'}
          diameter={brushSize}
          left={cursorPosition.x}
          top={cursorPosition.y}
        />
      )}
    </div>
  );
});

const createSidePanelUI = ({
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
}): JSX.Element | null => {
  const maskParamDef = tool.ui.find(uiDef => uiDef.name === 'mask');

  if (!maskParamDef) {
    return null;
  }

  // Where should MaskCanvasUI be placed? As a tool icons on main image?
  return (
    <MaskCanvasUI
      disabled={disabled}
      key={uiDef.name}
      maskCanvasRef={refs[maskParamDef.name]}
      props={params[uiDef.name]}
      onChange={(props: MaskCanvasProps) => {
        onChange({ [uiDef.name]: props }, false);
      }}
    />
  );
};

const createImageOverlay = ({
  disabled,
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
}): JSX.Element | null => {
  const { findImageByUuid } = useImage();

  const imageParamDef = tool.ui.find(uiDef => uiDef.type === 'image');
  const maskParamDef = tool.ui.find(uiDef => uiDef.name === 'mask');

  if (!imageParamDef || !maskParamDef) {
    return null;
  }

  const media = findImageByUuid(params[imageParamDef.name]);

  if (!media || media.type !== 'image') {
    return null;
  }

  return (
    <MaskCanvas
      disabled={disabled}
      imageUuid={params[imageParamDef.name]}
      props={params[uiDef.name]}
      ref={refs[maskParamDef.name]}
    />
  );
};

const getBlob = async ({
  refs,
  uiDef,
}: {
  params: Record<string, any>,
  refs: Record<string, RefObject<any>>,
  tool: Tool,
  uiDef: CustomUISchema,
}): Promise<Blob> => {
  return await (refs[uiDef.name] as RefObject<MaskCanvasRef>).current!.getBlob();
};

export const MASK_CANVAS_UI_DEFS: ToolUISchema[] = [
  {
    createImageOverlay,
    createSidePanelUI,
    default: {
      brushSize: DEFAULT_BRUSH_SIZE,
      eraseMode: DEFAULT_ERASE_MODE,
      invisible: DEFAULT_INVISIBLE,
    } as MaskCanvasProps,
    mappingType: 'none',
    name: 'maskCanvas',
    type: 'custom',
    validate: (): { reasons: string[], valid: boolean } => { return { reasons: [], valid: true } },
  },
  {
    createEffectiveParam: getBlob,
    default: createRef<MaskCanvasRef>(),
    inputName: 'mask',
    mappingType: 'direct',
    name: 'mask',
    type: 'custom',
  },
];
