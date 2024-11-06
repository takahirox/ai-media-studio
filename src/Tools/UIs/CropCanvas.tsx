import classnames from "classnames";
import Cropper from "react-easy-crop";
import { RetryIcon, VisibilityIcon, VisibilityOffIcon } from "../../Commons/Icons";
import { useImage } from "../../Use/useImage";
import {
  CustomUISchema,
  Tool,
  ToolUISchema,
} from "../Tool";
import { ImageBase } from "../../state";

const DEFAULT_CROP = {
  x: 0,
  y: 0,
};
const DEFAULT_OUTSIDE_AREA = {
  down: 0,
  left: 0,
  right: 0,
  up: 0,
};
const DEFAULT_TARGET_SIZE = {
  height: 1024,
  width: 1024,
};
const DEFAULT_VISIBILITY = true;
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.2;

export type CropCanvasProps = {
  crop: {
    x: number;
    y: number;
  };
  outsideArea: {
    down: number;
    left: number;
    right: number;
    up: number;
  },
  selectedArea: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  visible: boolean;
  zoom: number;
};

export const CropCanvasUI = ({
  disabled,
  onChange,
  params,
  uiDef,
}: {
  disabled: boolean,
  onChange: (
    params: Record<string, any>,
    forcePendingQueryVisible?: boolean,
  ) => void,
  params: Record<string, any>,
  uiDef: CustomUISchema,
}): JSX.Element => {
  const props = params[uiDef.name] as CropCanvasProps;
  return (
    <div
      className='flex flex-col gap-4 items-center w-full'
    >
      <div
        className='collapse collapse-arrow'
      >
        <input
          type='checkbox'
        />
        <div
          className='collapse-title'
        >
          { /* TODO: Better wordings */ }
          Preset
        </div>
        <div
          className='collapse-content'
        >
          <div
            className='gap-4 grid grid-cols-2 w-full'
          >
            {
              [
                [768, 768],
                [1024, 1024],
                [2048, 2048],
                [4096, 4096],
                [1024, 576],
                [1920, 1080],
                [576, 1024],
                [1080, 1920],
              ].map(([width, height]) => {
                return (
                  <button
                    className={classnames(
                      'btn btn-outline btn-sm',
                      params.dimension.width === width && params.dimension.height === height ? 'btn-active' : '',
                    )}
                    disabled={disabled}
                    key={`${width}x${height}`}
                    onClick={() => {
                      onChange({ dimension: { height, width } }, false);
                    }}
                  >
                    {width}x{height}
                  </button>
                );
              })
            }
          </div>
        </div>
      </div>
      <div
        className='flex flex-col gap-4 items-center w-full'
      >
        <div
          className='flex items-center justify-between w-full'
        >
          <div>
            { /* TODO: Better wordings or explanation*/ }
            Crop Area
          </div>
          <div
            className='flex gap-2'
          >
          <button
            className='btn btn-circle btn-outline btn-sm'
            disabled={disabled}
            onClick={() => {
              onChange({
                [uiDef.name]: {
                  ...props,
                  crop: {
                    ...DEFAULT_CROP,
                  },
                  zoom: DEFAULT_ZOOM,
                },
              }, false)
            }}
          >
            <RetryIcon />
          </button>
          <button
            className='btn btn-circle btn-outline btn-sm'
            onClick={() => {
              onChange({
                [uiDef.name]: {
                  ...props,
                  visible: !props.visible,
                },
              }, false);
            }}
          >
            { props.visible ? <VisibilityOffIcon /> : <VisibilityIcon /> }
          </button>
          </div>
        </div>
        <input
          className='input input-bordered input-sm text-center w-full'
          readOnly
          type='text'
          value={
            '(' +
            `${props.selectedArea.x},` + 
            `${props.selectedArea.y}` + 
            ') - (' +
            `${props.selectedArea.x + props.selectedArea.width},` + 
            `${props.selectedArea.y + props.selectedArea.height}` + 
            ')'
          }
        />
      </div>
      <div
        className='gap-2 grid grid-cols-3 justify-items-center w-full'
      >
        <div></div>
        <div>
          <input
            className='input input-bordered input-sm text-center w-full'
            disabled={disabled}
            readOnly
            value={props.outsideArea.up}
          />
      </div>
      <div></div>
      <div>
        <input
          className='input input-bordered input-sm text-center w-full'
          disabled={disabled}
          readOnly
          value={props.outsideArea.left}
        />
      </div>
      <div>Outside</div>
      <div>
        <input
          className='input input-bordered input-sm text-center w-full'
          disabled={disabled}
          readOnly
          value={props.outsideArea.right}
        />
      </div>
      <div></div>
      <div>
        <input
          className='input input-bordered input-sm text-center w-full'
          disabled={disabled}
          readOnly
          value={props.outsideArea.down}
        />
      </div>
      <div></div>
    </div>
    </div>
  );
};

export const CropCanvas = ({
  disabled,
  imageUuid,
  onChange,
  params,
  uiDef,
}: {
  disabled: boolean,
  imageUuid: string,
  onChange: (props: CropCanvasProps) => void,
  params: Record<string, any>,
  uiDef: CustomUISchema,
}): JSX.Element => {
  const { findImageByUuid } = useImage();
  const image = findImageByUuid(imageUuid)!;

  const props = params[uiDef.name] as CropCanvasProps;

  const updateOutsideArea = (
    selectedArea: {
      height: number,
      width: number,
      x: number,
      y: number,
    }
  ): {
    down: number,
    left: number,
    right: number,
    up: number,
  } => {
    if (!image || image.type !== 'image') {
      return {
        down: 0,
        left: 0,
        right: 0,
        up: 0,
      };
    }
    const { height, width, x, y } = selectedArea;
    return {
      down: Math.max(y + height - (image as ImageBase).height, 0),
      left: Math.max(0, -x),
      right: Math.max(x + width - (image as ImageBase).width, 0),
      up: Math.max(0, -y),
    };
  };

  return (
    <Cropper
      aspect={params.dimension.width / params.dimension.height}
      crop={props.crop}
      image={image.src}
      minZoom={MIN_ZOOM}
      objectFit='contain'
      onCropChange={(location) => {
        if (!disabled) {
          onChange({
            ...props,
            crop: {
              ...location,
            },
            outsideArea: updateOutsideArea(props.selectedArea),
          });
        }
      }}
      onCropAreaChange={(_area, pixels) => {
        onChange({
          ...props,
          outsideArea: updateOutsideArea(pixels),
          selectedArea: {
            ...pixels,
          },
        });
      }}
      onZoomChange={(zoom) => {
        if (!disabled) {
          onChange({
            ...props,
            outsideArea: updateOutsideArea(props.selectedArea),
            zoom,
          });
        }
      }}
      restrictPosition={false}
      // I don't know why but layout change via className doesn't seem to work.
      // Instead controling via style.
      style={{
        cropAreaStyle: {
          // Commenting out so far to reduce the complexity of selected area
          //transform: 'translate(-50%, -50%) scale(0.8)',
          display: props.visible ? 'unset' : 'none',
        },
      }}
      zoom={props.zoom}
    />
  );
};

const createSidePanelUI = ({
  disabled,
  onChange,
  params,
  uiDef,
}: {
  disabled: boolean,
  onChange: (
    params: Record<string, any>,
    forcePendingQueryVisible?: boolean,
  ) => void,
  params: Record<string, any>,
  uiDef: CustomUISchema,
}): JSX.Element | null => {
  return (
    <CropCanvasUI
      disabled={disabled}
      key={uiDef.name}
      onChange={onChange}
      uiDef={uiDef}
      params={params}
    />
  );
};

const createImageOverlay = ({
  disabled,
  params,
  onChange,
  tool,
  uiDef,
}: {
  disabled: boolean,
  onChange: (
    params: Record<string, any>,
    forcePendingQueryVisible?: boolean,
  ) => void,
  params: Record<string, any>,
  tool: Tool,
  uiDef: CustomUISchema,
}): JSX.Element | null => {
  const { findImageByUuid } = useImage();

  const imageParamDef = tool.ui.find(uiDef => uiDef.type === 'image');

  if (!imageParamDef) {
    return null;
  }

  const media = findImageByUuid(params[imageParamDef.name]);

  if (!media || media.type !== 'image') {
    return null;
  }

  return (
    <CropCanvas
      disabled={disabled}
      imageUuid={params[imageParamDef.name]}
      onChange={(props: CropCanvasProps) => {
        onChange({ [uiDef.name]: props }, false);
      }}
      uiDef={uiDef}
      params={params}
    />
  );
};

export const CROP_CANVAS_UI_CANVAS_DEF: ToolUISchema = {
  createImageOverlay,
  createSidePanelUI,
  mappingType: 'none',
  name: 'cropCanvas',
  default: {
    crop: DEFAULT_CROP,
    outsideArea: DEFAULT_OUTSIDE_AREA,
    selectedArea: {
      ...DEFAULT_CROP,
      ...DEFAULT_TARGET_SIZE,
    },
    visible: DEFAULT_VISIBILITY,
    zoom: DEFAULT_ZOOM,
  } as CropCanvasProps,
  type: 'custom',
};

export const CROP_CANVAS_UI_DIMENTION_DEF: ToolUISchema = {
  mappingType: 'none',
  name: 'dimension',
  default: {
    ...DEFAULT_TARGET_SIZE,
  },
  limitation: {
    maxHeight: 4096,
    minHeight: 1,
    maxWidth: 4096,
    minWidth: 1,
  },
  type: 'dimension',
};
