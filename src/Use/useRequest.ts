import { dispatch } from "../Processors/Dispatcher";
import { ProcessingUnitMap } from "../Processors/ProcessingUnit";
import {
  type GeneratedImage,
  type GeneratedModel3D,
  type GeneratedVideo,
  type Media,
  type Query,
  type UploadedImage,
} from "../state";
import { Tool } from "../Tools/Tool";
import { useImage } from "../Use/useImage";
import { useQuery } from "../Use/useQuery";
import { uploadImage as uploadImageSAI } from "../Utils/saiAPIRequest";
import { generateUUID, getDateTime, toURLFromBlob } from "../Utils/utils";

export const useRequest = () => {
  const { addContent, addQuery } = useQuery();
  const { addGeneratedTo, addImage } = useImage();

  const requestProcessingUnit = async (
    tool: Tool,
    count: number,
    params: Record<string, any>, // For recording the query
    effectiveParams: Record<string, any>,
    onGenerated?: (image: Media, index: number) => void,
  ): Promise<GeneratedImage[] | GeneratedVideo[] | GeneratedModel3D[]> => {
    const query: Query = {
      contents: new Array(count),
      createdAt: getDateTime(),
      tool: tool.name,
      params,
      uuid: generateUUID(),
    };

    const unit = ProcessingUnitMap[tool.pid];
    const pending: Promise<GeneratedImage | GeneratedVideo | GeneratedModel3D>[] = [];

    for (let i = 0; i < count; i++) {
      pending.push(new Promise(async (resolve) => {
        const result = await dispatch(unit, effectiveParams);
        let content: GeneratedImage | GeneratedVideo | GeneratedModel3D;

        if (unit.processingType === 'Image Edit' || unit.processingType === 'Image Generation') {
          const { height, image, seed, width } = result;
          const url = toURLFromBlob(image);
          content = {
            ...params,
            createdAt: getDateTime(),
            // TODO: More elegant way
            generatedFrom: params.image ? [params.image] : [],
            generatedTo: [],
            height,
            query: query.uuid,
            seed,
            src: url,
            success: url !== '',
            type: 'image',
            uuid: generateUUID(),
            width,
          };
        } else if (unit.processingType === 'Video Generation') {
          const { duration, height, seed, video, width } = result;
          const url = toURLFromBlob(video);
          content = {
            ...params,
            createdAt: getDateTime(),
            duration,
            // TODO: More elegant way
            generatedFrom: params.image ? [params.image] : [],
            generatedTo: [],
            height,
            query: query.uuid,
            seed,
            src: url,
            success: url !== '',
            type: 'video',
            uuid: generateUUID(),
            width,
          };
        } else if (unit.processingType === '3D Model Generation') {
          const { model, seed } = result;
          const url = toURLFromBlob(model);
          content = {
            ...params,
            createdAt: getDateTime(),
            // TODO: More elegant way
            generatedFrom: params.image ? [params.image] : [],
            generatedTo: [],
            query: query.uuid,
            seed,
            src: url,
            success: url !== '',
            type: 'model3d',
            uuid: generateUUID(),
          };
        } else {
          throw new Error(`Invalid ProcessingUnit processingType ${unit.processingType}`);
        }

        addImage(content);
  
        // TODO: More elegant way
        if (params.image) {
          addGeneratedTo(params.image, content.uuid);
        }
  
        query.contents[i] = content.uuid;
  
        if (onGenerated) {
          onGenerated(content, i);
        }
  
        resolve(content);
      }));
    }

    const images = await Promise.all(pending);

    addQuery(query);

    return images;
  };

  const uploadImage = async (file: File): Promise<UploadedImage> => {
    const query: Query = {
      contents: [],
      createdAt: getDateTime(),
      tool: 'User Upload',
      params: {},
      uuid: generateUUID(),
    };
    addQuery(query);

    const { height, image, width } = await uploadImageSAI(file);
    const uploadedImage: UploadedImage = {
      createdAt: getDateTime(),
      generatedFrom: [],
      generatedTo: [],
      height,
      query: query.uuid,
      src: toURLFromBlob(image),
      type: 'image',
      uuid: generateUUID(),
      width,
    };
    addImage(uploadedImage);
    addContent(query.uuid, uploadedImage.uuid);
    return uploadedImage;
  };

  return {
    requestProcessingUnit,
    uploadImage,
  };
};
