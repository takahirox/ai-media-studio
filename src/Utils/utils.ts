// TODO: Should we move this file to more appropriate place?

// 1 pixel transparent white
export const DUMMY_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// TODO: Copied from somewhere. Use a library?
export const generateUUID = (): string => {
  let d = new Date().getTime();
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0){
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

export const generateRandomSeed = (): number => {
  return Math.floor(Math.random() * 4294967295);
};

export const getDateTime = (): number => {
  return Date.now();
};

export const getImageSize = async (blob: Blob): Promise<{ height: number, width: number }> => {
  // TODO: Optimize if possible
  const bitmap = await createImageBitmap(blob);
  const { height, width } = bitmap;
  bitmap.close();
  return {
    height,
    width,
  };
};

export const getVideoSizeAndDuration = async (blob: Blob): Promise<{ duration: number, height: number, width: number }> => {
  // TODO: Optimize if possible
  const video = document.createElement('video');
  return await new Promise<{
    duration: number,
    height: number,
    width: number,
  }>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const onLoad = () => {
      URL.revokeObjectURL(url);
      video.pause();
      video.src = '';
      video.load();
      video.removeEventListener('loadedmetadata', onLoad);
      resolve({
        duration: video.duration,
        height: video.videoHeight,
        width: video.videoWidth,
      });
    };
    video.addEventListener('loadedmetadata', onLoad);
    video.addEventListener('error', reject);
    video.src = url;
    video.load();
  });
};

export const selectLocalFile = async (accept: string) => {
  // TODO: Fix me
  // Not sure if this works on all platforms
  return new Promise<File>((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', (ev) => {
      const target = ev.target as HTMLInputElement;
      if (target.files!.length > 0) {
        resolve(target.files![0]);
      } else {
        // TODO: Reject?
      }
    });
    input.addEventListener('error', reject);
    input.click();
  });
};

export const toBlobFromImageURL = async (src: string, outputFormat: string='png'): Promise<Blob> => {
  return await new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', async () => {
      // TODO: Using OffscreenCanvas would be better?
      // TODO: Creating element for every call might be inefficient?
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob !== null) {
          resolve(blob!);
        } else {
          reject(new Error('Failed to create blob from image.'));
        }
      }, `image/${outputFormat}`);
    });
    img.addEventListener('error', reject);
    img.src = src;
  });
};

export const toDateTimeString = (datetime: number): string => {
  const d = new Date(datetime);
  return `${d.getFullYear()}-` +
         `${('0' + String(d.getMonth() + 1)).slice(-2)}-` +
         `${('0' + String(d.getDate() + 1)).slice(-2)} ` +
         `${('0' + String(d.getHours())).slice(-2)}:` +
         `${('0' + String(d.getMinutes())).slice(-2)}:` +
         `${('0' + String(d.getSeconds())).slice(-2)}`;
};

export const toURLFromArrayBuffer = (buffer: ArrayBuffer, mimeType: string): string => {
  return toURLFromBlob(new Blob([new Uint8Array(buffer)], { type: mimeType }));
};

export const toURLFromBlob = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};
