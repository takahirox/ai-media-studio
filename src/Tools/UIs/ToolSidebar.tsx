import {
  KeyboardEvent,
  RefObject,
} from "react";
import { AspectRatioSlider } from "./AspectRatioSlider";
import { ImageGenerationCountSlider } from "./ImageGenerationCountSlider";
import { NumberSlider } from "./NumberSlider";
import { ToolSelect } from "./ToolSelect";
import { useContentSelectDialog } from "../../Commons/ContentSelectDialog";
import { ImageGenerationIcon, ToolIcon } from "../../Commons/Icons";
import { useImage } from "../../Use/useImage";
import { toSpaceSeparatedPascalCase } from "../../Utils/tool";
import { Media } from "../../state";
import {
  CustomUISchema,
  DimensionUISchema,
  SliderUISchema,
  TextSelectUISchema,
  TextUISchema,
  Tool,
} from "../Tool";

const ParametersInputForm = ({
  advanced,
  image,
  onChange,
  onKeyDown,
  params,
  processing,
  refs,
  tool,
}: {
  advanced: boolean,
  image: Media | null,
  // TODO: Avoid any and exploit static type checks if possible
  onChange: (params: Record<string, any>) => void,
  onKeyDown: (e: KeyboardEvent) => Promise<void>,
  params: Record<string, any>,
  processing: boolean,
  refs: Record<string, RefObject<any>>,
  tool: Tool,
}): JSX.Element => {
  const { open: openContentSelectDialog } = useContentSelectDialog();

  return (
    <>
      {
        tool
        .ui
        .filter(uiDef => !!uiDef.advanced === advanced)
        .map((uiDef) => {
          switch (uiDef.type) {
            case 'aspectRatioSlider':
              return (
                <AspectRatioSlider
                  aspectRatio={params[uiDef.name]}
                  disabled={processing}
                  key={uiDef.name}
                  onChange={(aspectRatio) => {
                    onChange({ [uiDef.name]: aspectRatio });
                  }}
                  onKeyDown={onKeyDown}
                />
              );
            case 'checkbox':
              return (
                <div
                  className='flex gap-2 items-center'
                  key={uiDef.name}
                >
                  <label>{toSpaceSeparatedPascalCase(uiDef.name)}</label>
                  <input
                    className='checkbox'
                    disabled={processing}
                    defaultChecked={uiDef.default}
                    key={uiDef.name}
                    onChange={(e) => {
                      onChange({ [uiDef.name]: e.target.checked });
                    }}
                    type='checkbox'
                  />
                </div>
              );
            case 'custom':
              const customUISchema = (uiDef as CustomUISchema);
              return customUISchema.createSidePanelUI
                ? customUISchema.createSidePanelUI({
                    disabled: processing,
                    onChange,
                    params,
                    refs,
                    uiDef: customUISchema,
                    tool,
                  })
                : null;
            case 'dimension':
              const toEffectiveNum = (str: string, max?: number, min?: number): number | null => {
                const num = Number(str);
                if (num === null) {
                  return null;
                }
                if (min !== undefined && num < min) {
                  return null;
                }
                if (max !== undefined && num > max) {
                  return null;
                }
                return num;
              };
              // TODO: Revisit?
              return (
                <div
                  className='flex gap-2 items-center'
                  key={uiDef.name}
                >
                  <label>Width</label>
                  <input
                    className='input input-bordered input-sm text-center w-16'
                    disabled={processing}
                    onChange={(e) => {
                      e.preventDefault();
                      const schema = uiDef as DimensionUISchema;
                      const width = toEffectiveNum(e.target.value, schema.limitation?.maxWidth, schema.limitation?.minWidth);
                      if (width === null) {
                        return;
                      }
                      onChange({
                        [uiDef.name]: {
                          height: params[uiDef.name].height,
                          width,
                        }
                      });
                    }}
                    type='text'
                    value={params[uiDef.name].width}
                  />
                  <label>Height</label>
                  <input
                    className='input input-bordered input-sm text-center w-16'
                    disabled={processing}
                    onChange={(e) => {
                      e.preventDefault();
                      const schema = uiDef as DimensionUISchema;
                      const height = toEffectiveNum(e.target.value, schema.limitation?.maxHeight, schema.limitation?.minHeight);
                      if (height === null) {
                        return;
                      }
                      onChange({
                        [uiDef.name]: {
                          height,
                          width: params[uiDef.name].width,
                        }
                      });
                    }}
                    type='text'
                    value={params[uiDef.name].height}
                  />
                </div>
              );
            case 'image':
              // TODO: More elegant way
              if (tool.category !== 'Image Generation') {
                return null;
              }
              return (
                <div
                  className='flex flex-col gap-4'
                  key={uiDef.name}
                >
                  <div
                    className='flex gap-4 items-center'
                  >
                    Image
                    <button
                      className='btn btn-outline btn-sm'
                      disabled={processing}
                      onClick={() => {
                        openContentSelectDialog((uuid: string) => {
                          onChange({ image: uuid });
                        });
                      }}
                    >
                      Select
                    </button>
                  </div>
                  {image && image.type === 'image' && (
                    <img
                      className='h-auto w-full'
                      src={image?.src}
                    />
                  )}
                </div>
              );
            case 'hidden':
            case 'mask': // TODO: Fix me
              return null;
            case 'text-select':
              return (
                <div
                  className='flex items-center justify-between'
                  key={uiDef.name}
                >
                  <label>{toSpaceSeparatedPascalCase(uiDef.name)}</label>
                  <select
                    className='select select-bordered select-sm'
                    // TODO: Fix type checks
                    defaultValue={uiDef.default}
                    disabled={processing}
                    onChange={(e) => {
                      onChange({ [uiDef.name]: e.target.value });
                    }}
                  >
                    {
                      (uiDef as TextSelectUISchema).values.map((value) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {value}
                        </option>
                      ))
                    }
                  </select>
                </div>
              );
            case 'slider':
              return (
                <NumberSlider
                  disabled={processing}
                  key={uiDef.name}
                  label={toSpaceSeparatedPascalCase(uiDef.name)}
                  // TODO: Fix type check
                  max={(uiDef as SliderUISchema).max || Infinity}
                  min={(uiDef as SliderUISchema).min || 0}
                  onChange={(value: number) => {
                    onChange({ [uiDef.name]: value });
                  }}
                  step={(uiDef as SliderUISchema).step}
                  value={params[uiDef.name]}
                />
              );
            case 'text':
              return (
                <textarea
                  className='resize-none textarea textarea-bordered w-full'
                  disabled={processing}
                  key={uiDef.name}
                  onChange={(e) => {
                    onChange({ [uiDef.name]: e.target.value });
                  }}
                  onKeyDown={onKeyDown}
                  // TODO: Fix type check
                  placeholder={(uiDef as TextUISchema).placeHolder}
                  rows={3}
                  value={params[uiDef.name]}
                />
              );
            default:
              throw new Error(`Unknown tool param UI type, ${uiDef.name}: ${uiDef.type}`);
          }
        })
      }
    </>
  );
};

export const ToolSidebar = ({
  invalidParamReasons,
  imageCount,
  onChange,
  onSubmit,
  params,
  processing,
  refs,
  tool,
}: {
  imageCount: number,
  invalidParamReasons: string[],
  // TODO: Avoid any and exploit static type checks if possible
  onChange: (params: Record<string, any>) => void,
  onSubmit: () => Promise<void>,
  params: Record<string, any>,
  processing: boolean,
  refs: Record<string, RefObject<any>>,
  tool: Tool,
}): JSX.Element => {
  const { findImageByUuid } = useImage();
  const image = params.image ? findImageByUuid(params.image): null;

  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await onSubmitFunc();
    }
  };

  const onSubmitFunc = async () => {
    if (invalidParamReasons.length > 0) {
      return;
    }
    await onSubmit();
  };

  return (
    <div
      className='flex flex-col gap-8'
    >
      <div
        className='flex gap-2 items-center'
      >
        {
          tool.category === 'Image Generation'
            ? <ImageGenerationIcon />
            : <ToolIcon />
        }
        {
          // TODO: More elegant and efficient way
          tool.ui.some(uiDef => uiDef.type === 'image')
            ? <ToolSelect
                imageUuid={params.image}
                selectedTool={tool.name}
              />
            : <label>{tool.name}</label>
        }
      </div>
      <ParametersInputForm
        advanced={false}
        image={image}
        onChange={onChange}
        onKeyDown={onKeyDown}
        params={params}
        processing={processing}
        refs={refs}
        tool={tool}
      />
      {
        tool.ui.some(uiDef => uiDef.advanced && uiDef.type !== 'hidden') && (
          <div
            className='collapse collapse-arrow'
          >
            <input type='checkbox' />
            <div
              className='collapse-title'
            >
              Advanced
            </div>
            <div
              className='collapse-content flex flex-col gap-8'
            >
              <ParametersInputForm
                advanced={true}
                image={image}
                onChange={onChange}
                onKeyDown={onKeyDown}
                params={params}
                processing={processing}
                refs={refs}
                tool={tool}
              />
            </div>
          </div>
        )
      }
      {tool.randomness && (
        <ImageGenerationCountSlider
          disabled={processing}
          imageCount={imageCount}
          onChange={(count: number) => {
            onChange({ count });
          }}
          onKeyDown={onKeyDown}
        />
      )}
      <div
        className='flex gap-2 items-center'
      >
        <button
          className='btn btn-primary'
          disabled={processing || invalidParamReasons.length > 0}
          onClick={onSubmitFunc}
        >
          Go
        </button>
        { /* TODO: Show the message why the button is disabled if it is disabled? */ }
        {processing && (
          <span
            className='loading loading-spinner'
          />
        )}
      </div>
      {invalidParamReasons.length > 0 && (
        <div
          className='flex flex-col text-error'
        >
          {invalidParamReasons.map((reason, index) => (
            <span key={index}>{reason}</span>
          ))}
        </div>
      )}
    </div>
  );
};
