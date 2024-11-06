import { type RegularImageProcessingUnit } from "../../ProcessingUnit";

const run = async (inputs: Record<string, any>): Promise<Record<string, any>> => {
  const image = inputs.image as Blob;
  const bitmap = await createImageBitmap(image);

  const x = inputs.x as number;
  const y = inputs.y as number;
  const width = inputs.width as number;
  const height = inputs.height as number;

  const x1 = Math.max(0, x);
  const x2 = Math.min(bitmap.width, x + width);
  const y1 = Math.max(0, y);
  const y2 = Math.min(bitmap.height, y + height);

  // No need to crop
  if (x1 === 0 && y1 === 0 && x2 === bitmap.width && y2 === bitmap.height) {
    return {
      height: bitmap.height,
      image,
      width: bitmap.width,
    };
  }
    
  const canvas = document.createElement('canvas');
  canvas.width = x2 - x1;
  canvas.height = y2 - y1;
  const context = canvas.getContext('2d')!;
  context.drawImage(
    bitmap,
    x1, y1, x2 - x1, y2 - y1,
    0, 0, x2 - x1, y2 - y1,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (blob !== null) {
        resolve({
          height: y2 - y1,
          image: blob,
          width: x2 - x1,
        });
      } else {
        reject(new Error('Failed to create blob from image.'));
      }
    }, 'image/png'); // Respect the original image format?
  });
};
  
export const CROP_IMAGE_UNIT: RegularImageProcessingUnit = {
  id: 'Crop Image',
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
    {
      name: 'x',
      schema: {
        default: 0,
        type: 'number',
      },
    },
    {
      name: 'y',
      schema: {
        default: 0,
        type: 'number',
      },
    },
  ],
  name: 'Crop Image',
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
