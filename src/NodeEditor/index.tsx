import { useState } from "react";
import { Content } from "./Content";
import { Sidebar } from "./Sidebar";
import { CommonPanels } from "../Commons/CommonPanels";
import {
  type GeneratedImage,
  type GeneratedModel3D,
  type GeneratedVideo,
} from "../state";
import { dispatch } from "../Processors/Dispatcher";
import { type ProcedureProcessingUnit } from "../Processors/ProcessingUnit";
import { useImage } from "../Use/useImage";
import { useQuery } from "../Use/useQuery";
import { generateUUID, getDateTime } from "../Utils/utils";
import { toURLFromBlob } from "../Utils/utils";

export const NodeEditor = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [imageUuid, setImageUuid] = useState('');
  const [procedure, setProcedure] = useState<ProcedureProcessingUnit | null>(null);
  const { addImage } = useImage();
  const { addContent, addQuery } = useQuery();

  const onSubmit = async (): Promise<void> => {
    setLoading(true);

    const query = {
      contents: [],
      createdAt: getDateTime(),
      tool: 'Node Editor',
      params: {},
      uuid: generateUUID(),
    };
    addQuery(query);

    let content: GeneratedImage | GeneratedVideo | GeneratedModel3D;

    try {
      // TODO: Error handling
      const result = await dispatch(procedure!, {});

      const url = toURLFromBlob(result.output);

      if (procedure!.processingType === 'Image Generation') {
        content = {
          createdAt: getDateTime(),
          generatedFrom: [],
          generatedTo: [],
          height: result.height,
          query: query.uuid,
          src: url,
          type: 'image',
          uuid: generateUUID(),
          width: result.width,
        };
      } else if (procedure!.processingType === 'Video Generation') {
        content = {
          createdAt: getDateTime(),
          duration: result.duration,
          generatedFrom: [],
          generatedTo: [],
          height: result.height,
          query: query.uuid,
          src: url,
          type: 'video',
          uuid: generateUUID(),
          width: result.width,
        };
      } else if (procedure!.processingType === '3D Model Generation') {
        content = {
          createdAt: getDateTime(),
          generatedFrom: [],
          generatedTo: [],
          query: query.uuid,
          src: url,
          type: 'model3d',
          uuid: generateUUID(),
        };
      } else {
        throw new Error(`Invalid processingType: ${procedure?.processingType}`);
      }
    } catch (error) {
      console.error(error);
      // TODO: Better error handling
      content = {
        createdAt: getDateTime(),
        generatedFrom: [],
        generatedTo: [],
        height: 1,
        query: query.uuid,
        src: '',
        success: false,
        type: 'image',
        uuid: generateUUID(),
        width: 1,
      };
    }
    // TODO: Video and 3D support

    addImage(content);
    addContent(query.uuid, content.uuid);

    setImageUuid(content.uuid);
    setLoading(false);
  };

  const onReady = (ready: boolean, unit?: ProcedureProcessingUnit): void => {
    setReady(ready);
    setProcedure(ready ? unit! : null);
  };

  return (
    <CommonPanels
      main={(
        <Content
          onReady={onReady}
          processing={loading}
        />
      )}
      // TODO: Move to right side panel?
      side={(
        <Sidebar
          imageUuid={imageUuid}
          loading={loading}
          onSubmit={onSubmit}
          ready={ready}
        />
      )}
    />
  );
};
