import axios, { AxiosResponse } from "axios";
import { STABILITY_AI_API_KEY } from "../constants";
import { generateRandomSeed, getImageSize, getVideoSizeAndDuration } from "../Utils/utils";
import { toSnakeCase } from "../Utils/tool";

const OUTPUT_IMAGE_FORMAT = 'png';

type ResponseBase = {
};

type RequestImageResponseBase = ResponseBase & {
  height: number;
  image: Blob;
  width: number;
};

export type RequestImageResponse = RequestImageResponseBase & {
  seed?: number;
};
export type UploadImageResponse = RequestImageResponseBase;

export type RequestVideoResponse = ResponseBase & {
  duration: number;
  height: number;
  seed?: number;
  video: Blob;
  width: number;
};

export type Request3DResponse = ResponseBase & {
  model: Blob;
  seed?: number;
};

export const request3D = async (
  url: string,
  inputFormData: Record<string, any>,
  useRandomSeed: boolean=false,
): Promise<Request3DResponse> => {
  const formData: Record<string, any> = {};
  for (const key in inputFormData) {
    formData[toSnakeCase(key)] = inputFormData[key];
  }
  formData['seed'] = useRandomSeed ? generateRandomSeed() : formData.seed;

  // TODO: Error handling
  const response = await axios.postForm(
    url,
    axios.toFormData(formData, new FormData()),
    {
      headers: { 
        Authorization: `Bearer ${STABILITY_AI_API_KEY}`,
      },
      responseType: 'arraybuffer',
      validateStatus: undefined,
    },
  );

  if (response.status !== 200) {
    // TODO: Better error handling?
    const errorMessage = `${url} returned HTTP ${response.status} code. ${response.data.toString()}`;
    console.error(errorMessage, response);
    throw new Error(errorMessage);
  }

  const model = new Blob([new Uint8Array(response.data)], { type: `model/gltf-binary` });

  return {
    model,
  };
};

export const requestImage = async (
  url: string,
  inputFormData: Record<string, any>,
  useRandomSeed: boolean=false,
  output_format: string=OUTPUT_IMAGE_FORMAT,
): Promise<RequestImageResponse> => {
  const formData: Record<string, any> = {};
  for (const key in inputFormData) {
    formData[toSnakeCase(key)] = inputFormData[key];
  }
  formData['output_format'] = output_format;
  formData['seed'] = useRandomSeed ? generateRandomSeed() : formData.seed;

  // TODO: Error handling
  const response = await axios.postForm(
    url,
    axios.toFormData(formData, new FormData()),
    {
      headers: { 
        Authorization: `Bearer ${STABILITY_AI_API_KEY}`,
        Accept: 'image/*'
      },
      responseType: 'arraybuffer',
      validateStatus: undefined,
    },
  );

  if (response.status !== 200) {
    // TODO: Better error handling?
    const errorMessage = `${url} returned HTTP ${response.status} code. ${response.data.toString()}`;
    console.error(errorMessage, response);
    throw new Error(errorMessage);
  }

  const image = new Blob([new Uint8Array(response.data)], { type: `image/${OUTPUT_IMAGE_FORMAT}` });
  const { height, width } = await getImageSize(image);

  return {
    height,
    image,
    seed: formData.seed,
    width,
  };
};

export const requestVideo = async (
  url: string,
  inputFormData: Record<string, any>,
  useRandomSeed: boolean=false,
): Promise<RequestVideoResponse> => {
  // Special path for Image to Video API, resize to supported dimmension.
  // TODO: Ugh... Fix me
  const bitmap = await createImageBitmap(inputFormData.image!);
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 768;
  const context = canvas.getContext('2d')!;
  context.drawImage(bitmap, 0, 0, 768, 768);
  const imageBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  const formData: Record<string, any> = {};
  for (const key in inputFormData) {
    formData[toSnakeCase(key)] = inputFormData[key];
  }
  formData['seed'] = useRandomSeed ? generateRandomSeed() : formData.seed;
  formData['image'] = imageBlob;

  // TODO: Error handling
  const response = await axios.request(
    {
      data: axios.toFormData(formData, new FormData()),
      headers: { 
        Authorization: `Bearer ${STABILITY_AI_API_KEY}`,
      },
      method: 'POST',
      validateStatus: undefined,
      url,
    },
  );

  if (response.status !== 200) {
    // TODO: Better error handling?
    const errorMessage = `${url} returned HTTP ${response.status} code. ${response.data.toString()}`;
    console.error(errorMessage, response);
    throw new Error(errorMessage);
  }

  const generationId = response.data.id;

  // Thid polling is Image to Video specific
  // TODO: Error and timeout handling
  const fetchResponse = await new Promise<AxiosResponse<any, any>>((resolve, reject) => {
    const runFetch = async () => {
      const fetchResponse = await axios.request(
        {
          headers: { 
            Authorization: `Bearer ${STABILITY_AI_API_KEY}`,
            Accept: 'video/*',
          },
          method: 'GET',
          responseType: 'arraybuffer',
          validateStatus: undefined,
          url: `${url}/result/${generationId}`,
        },
      );
      if (fetchResponse.status === 200) {
        resolve(fetchResponse);
      } else if (fetchResponse.status === 202) {
        setTimeout(runFetch, 10000);
      } else {
        // TODO: Better error handling?
        const errorMessage = `${url}/result/${generationId} returned HTTP ${fetchResponse.status} code. ${fetchResponse.data.toString()}`;
        console.error(errorMessage, response);
        reject(new Error(errorMessage));
      }
    };
    runFetch();
  });

  const video = new Blob([new Uint8Array(fetchResponse.data)], { type: `video/mp4` });
  const { duration, height, width } = await getVideoSizeAndDuration(video);

  return {
    duration,
    height,
    seed: formData.seed,
    video,
    width,
  };
};

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  // Mock so far
  // TODO: Implement properly
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('load', async (e) => {
      try {
        const image = new Blob([new Uint8Array(e.target!.result as ArrayBuffer)], { type: file.type });
        const { height, width } = await getImageSize(image);
        resolve({
          image,
          height,
          width,
        });
      } catch (error) {
        reject(error);
      }
    });
    reader.addEventListener('error', reject);  
  });
};
