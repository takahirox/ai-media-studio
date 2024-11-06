import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { imagesState, Media } from "../state";

// TODO: Rename to useMedia
export const useImage = () => {
  const [images, setImages] = useRecoilState(imagesState);

  // TODO: Rename to addMedia
  const addImage = useCallback((image: Media): void => {
    setImages((prev) => {
      return [
        ...prev,
        image,
      ];
    });
  }, [setImages]);

  const addGeneratedTo = useCallback((fromUuid: string, toUuid: string): void => {
    setImages((prev) => {
      return prev.map((image) => {
        if (image.uuid !== fromUuid) {
          return image;
        }
        const generatedTo = image.generatedTo.slice();
        generatedTo.push(toUuid);
        return {
          ...image,
          generatedTo,
        };
      });
    });
  }, [setImages]);

  const findImageByUuid = useCallback((uuid: string): Media | null => {
    return images.find(image => image.uuid === uuid) || null;
  }, [images]);

  return {
    addImage,
    addGeneratedTo,
    findImageByUuid,
    images,
  };
};
