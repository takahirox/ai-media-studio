import { type RegularImageProcessingUnit } from "../../ProcessingUnit";

const run = async (inputs: Record<string, any>): Promise<Record<string, any>> => {
  const image = inputs.image as Blob;
  const width = inputs.width as number;
  const height = inputs.height as number;
  const bitmap = await createImageBitmap(image);
  if (bitmap.width === width && bitmap.height === height) {
    return {
      height,
      image,
      width,
    };
  }
    
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  context.drawImage(
    bitmap,
    0, 0, bitmap.width, bitmap.height,
    0, 0, width, height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (blob !== null) {
        resolve({
          height: height,
          image: blob,
          width: width,
        });
      } else {
        reject(new Error('Failed to create blob from image.'));
      }
    }, 'image/png'); // Respect the original image format?
  });  
};
  
export const RESIZE_IMAGE_UNIT: RegularImageProcessingUnit = {
  id: 'Resize Image',
  inputs: [
    {
      name: 'height',
      schema: {
        default: 0, // TODO: Image height?
        type: 'number',
      },
    },
    {
      name: 'image',
      schema: {
        default: new Blob([], { type: 'image/png' }),
        type: 'image',
      },
    },
    {
      name: 'width',
      schema: {
        default: 0, // TODO: Image width?
        type: 'number',
      },
    },
  ],
  name: 'Resize Image',
  outputs: [
    {
      name: 'height',
      schema: {
        type: 'number',
      },
    },
    {
      name: 'image',
      schema: {
        type: 'image',
      },
    },
    {
      name: 'width',
      schema: {
        type: 'number',
      },
    },
  ],
  processingType: "Image Edit",
  run,
  type: 'Regular Image Processing',
} as const;
