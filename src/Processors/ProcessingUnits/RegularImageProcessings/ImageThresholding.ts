import { type RegularImageProcessingUnit } from "../../ProcessingUnit";

const run = async (inputs: Record<string, any>): Promise<Record<string, any>> => {
  const image = inputs.image as Blob;
  const maxColor = inputs.maxColor as number[]; // Declare RGBA color type
  const minColor = inputs.minColor as number[];
  const threshold = inputs.threshold as number[];

  const bitmap = await createImageBitmap(image);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(bitmap, 0, 0);
  const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);

  for (let y = 0; y < bitmap.height; y++) {
    for (let x = 0; x < bitmap.width; x++) {
      const offset = (y * bitmap.width + x) * 4;
      let exceed = true;
      for (let i = 0; i < 4; i++) {
        if (imageData.data[offset + i] < threshold[i]) {
          exceed = false;
          break;
        }
      }
      const newColor = exceed ? maxColor : minColor;
      for (let i = 0; i < 4; i++) {
        imageData.data[offset + i] = newColor[i] >= 0 ? newColor[i] : imageData.data[offset + i];
      }
    }
  }

  context.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob !== null) {
        resolve({
          height: bitmap.height,
          image: blob,
          width: bitmap.width,
        })
      } else {
        reject(new Error(`failed`));
      }
    }, 'image/png'); // Respect the original image format?  
  });
};

export const IMAGE_THRESHOLDING_UNIT: RegularImageProcessingUnit = {
  id: 'Image Thresholding',
  inputs: [
    {
      name: 'image',
      schema: {
        default: new Blob([], { type: 'image/png' }),
        type: 'image',
      },
    },
    {
      name: 'maxColor',
      schema: {
        default: [255, 255, 255, 255],
        type: 'rgba',
      },
    },
    {
      name: 'minColor',
      schema: {
        default: [0, 0, 0, 255],
        type: 'rgba',
      },
    },
    {
      name: 'threshold',
      schema: {
        default: [0, 0, 0, 255],
        type: 'rgba',
      },
    },
  ],
  name: 'Image Thresholding',
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
