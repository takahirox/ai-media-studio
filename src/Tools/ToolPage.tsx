import {
  RefObject,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { ProcessingUnitMap } from "../Processors/ProcessingUnit";
import {
  CustomUISchema,
  Tool,
  ToolUISchema,
} from "./Tool";
import { GeneratedContentsViewer, type PendingQuery } from "./UIs/GeneratedContentsViewer";
import { ToolSidebar } from "./UIs/ToolSidebar";
import { CommonPanels } from "../Commons/CommonPanels";
import { ContentViewer } from "../Commons/ContentViewer";
import { Media } from "../state";
import { DEFAULT_IMAGE_COUNT } from "../Tools/Tool";
import { useImage } from "../Use/useImage";
import { useRequest } from "../Use/useRequest";
import { deepCopy, isParamValid } from "../Utils/tool";
import { toBlobFromImageURL } from "../Utils/utils";

// TODO: More elegant way
const isRefObject = (data: any): boolean => {
  if (!data) {
    return false;
  }
  if (typeof data !== 'object') {
    return false;
  }
  const keys = Object.keys(data);
  return keys.length === 1 && keys[0] === 'current';
};

// TODO: Simplify and more readable if possible
export const ToolPage = ({
  tool,
}: {
  tool: Tool,
}): JSX.Element => {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(false);
  const unit = ProcessingUnitMap[tool.pid];
  const [imageCount, setImageCount] = useState('randomness' in unit && unit.randomness ? DEFAULT_IMAGE_COUNT : 1);

  // TODO: Write comment about why Refs are managed separately from params
  const refs = useRef<Record<string, RefObject<any>>>(
    // TODO: More elegant way
    Object.fromEntries(
      tool
      .ui
      .filter(uiDef => isRefObject(uiDef.default))
      .map(uiDef => [uiDef.name, deepCopy(uiDef.default)])
    )
  );
  
  // TODO: Avoid any and exploit type checks if possible
  const [params, setParams] = useState<Record<string, any>>(() => {
    // TODO: More elegant way
    return Object.fromEntries(
      tool
      .ui
      .map(uiDef => {
        let value: any = uiDef.default;
        if (uiDef.type === 'image') {
          value = uuid;
        } else if (refs.current[uiDef.name] !== undefined) {
          value = refs.current[uiDef.name!];
        }
        return [uiDef.name, deepCopy(value)];
      })
    );
  });

  const [pendingQuery, setPendingQuery] = useState<PendingQuery>({
    contents: new Array(imageCount).fill(''),
    params: params,
    tool: tool.name,
    visible: true,
  });

  const { findImageByUuid } = useImage();
  const { requestProcessingUnit } = useRequest();

  const getParamErrorMessages = (params: Record<string, any>): string[] => {
    const reasons: string[] = [];

    tool.ui.forEach((uiDef: ToolUISchema) => {
      (
        (uiDef.type === 'custom' && uiDef.validate)
          ? uiDef.validate({ params, refs: refs.current, tool, uiDef })
          : isParamValid(uiDef, params[uiDef.name])
      ).reasons.forEach(reason => {
        reasons.push(reason);
      })
    });

    if (tool.customParamsValidation) {
      tool.customParamsValidation(tool, params).reasons.forEach(reason => {
        reasons.push(reason);
      })
    }

    // TODO: More elegant way
    tool
    .ui
    .filter(uiDef => uiDef.type === 'image')
    .forEach(paramDef => {
      const media = findImageByUuid(params[paramDef.name]);
      if (media && media.type !== 'image') {
        reasons.push(`Selected Media must be Image.`);
      }
      if (media && 'success' in media && media.success === false) {
        reasons.push(`Selected Media is broken.`);
      }
    });

    return reasons;
  };

  const [invalidParamReasons, setInvalidParamReasons] = useState<string[]>(() => getParamErrorMessages(params));

  const makeEffectiveParams = async (): Promise<Record<string, any>> => {
    const effectiveParams: Record<string, any> = {};
    const pending =
      tool
      .ui
      .filter(uiDef => uiDef.mappingType !== 'none') // TODO: custom support
      .map(async (uiDef) => {
        let value = params[uiDef.name];

        if (uiDef.type === 'image') {
          // TODO: use custom?
          value = await toBlobFromImageURL(findImageByUuid(value)!.src);
        } else if (uiDef.type === 'custom' && uiDef.createEffectiveParam) {
          value = await uiDef.createEffectiveParam({
            params,
            refs: refs.current,
            tool,
            uiDef,
          });
        }

        if (uiDef.mappingType === 'direct') {
          effectiveParams[uiDef.inputName] = value;
        } else if (uiDef.mappingType === 'custom') {
          const customMappedValues = uiDef.map({ uiDef, value });
          for (const key in customMappedValues) {
            effectiveParams[key] = customMappedValues[key];
          }
        } else {
          throw Error(`Unknown mappingType: ${(uiDef as any).mappingType}`);
        }
      });
    await Promise.all(pending);
    return effectiveParams;
  };

  const onSubmit = async (): Promise<void> => {
    setLoading(true);

    setPendingQuery((prev) => {
      return {
        ...prev,
        visible: true,
      };
    });

    const effectiveParams = await makeEffectiveParams();

    await requestProcessingUnit(
      tool,
      imageCount,
      params,
      effectiveParams,
      (image: Media, index: number) => {
        setPendingQuery((prev: PendingQuery) => {
          prev.contents[index] = image.uuid;
          return prev;
        });
      },
    );

    setPendingQuery((prev) => {
      return {
        ...prev,
        contents: pendingQuery.contents.slice().fill(''),
        visible: false, // Hide until next user action
      };
    });

    setLoading(false);
  };

  // TODO: Rename count to imageCount?
  const onChange = (
    { count, ...p }: Partial<{ count: number } & Record<string, any>>,
    forcePendingQueryVisible: boolean = true,
  ): void => {
    if (count !== undefined) {
      setImageCount(count);
    }
    let newParams = {
      ...params,
      ...p,
    };

    if (tool.onChange) {
      newParams = tool.onChange(newParams, tool, findImageByUuid);
    }

    setParams(newParams);
    setPendingQuery((prev: PendingQuery) => {
      return {
        ...prev,
        contents: count !== undefined && prev.contents.length !== count
          ? new Array(count).fill('')
          : prev.contents,
        params: newParams,
        visible: forcePendingQueryVisible ? true : prev.visible,
      };
    });
    setInvalidParamReasons(getParamErrorMessages(newParams));
  };

  // Assumes up to one param def for each, TODO: Fix me
  const imageParamDef = tool.ui.find(uiDef => uiDef.type === 'image');

  // TODO: Optimize
  const imageOverlays =
    tool.category === 'Image Generation'
      ? []
      : tool
        .ui
        .filter(uiDef => uiDef.type === 'custom')
        .map(uiDef => {
          const customUISchema = uiDef as CustomUISchema;
          return customUISchema.createImageOverlay
            ? customUISchema.createImageOverlay({
                disabled: loading,
                onChange,
                tool,
                params,
                refs: refs.current,
                uiDef: customUISchema,
              })
            : null;
        })
        .filter(el => el);

  return (
    <CommonPanels
      main={
        tool.category === 'Image Generation'
          ? <GeneratedContentsViewer
              onChange={(params) => onChange(params, false)}
              pendingQuery={pendingQuery}
              processing={loading}
              toolName={tool.name}
            />
          : imageParamDef
            ? (
              <ContentViewer
                imageUuid={params[imageParamDef.name]}
                onChange={(uuid: string) => {
                  onChange({ [imageParamDef.name]: uuid }, false);
                }}
                side={(<GeneratedContentsViewer
                  onChange={(params) => onChange(params, false)}
                  pendingQuery={pendingQuery}
                  processing={loading}
                  thin
                  toolName={tool.name}
                />)}
              >
                {
                  imageOverlays.length > 0
                    ? imageOverlays[0]
                    : null
                }
              </ContentViewer>
            )
            : <></> // Error handling?
      }
      side={(<ToolSidebar
        imageCount={imageCount}
        invalidParamReasons={invalidParamReasons}
        onChange={onChange}
        onSubmit={onSubmit}
        params={params}
        processing={loading}
        refs={refs.current}
        tool={tool}
      />)}
    />
  );
};
