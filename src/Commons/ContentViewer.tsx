import classnames from "classnames";
import { useEffect } from "react";
import { UploadIcon } from "./Icons";
import { MediaComponent } from "../Commons/MediaComponent"; 
import { Media } from "../state";
import { useImage } from "../Use/useImage";
import { useRequest } from "../Use/useRequest";
import { selectLocalFile } from "../Utils/utils";

export const ContentViewer = ({
  children,
  filter = (_media: Media) => { return true},
  imageUuid,
  onChange,
  side,
}: {
  children?: JSX.Element | JSX.Element[] | null,
  filter?: (media: Media) => boolean,
  imageUuid: string,
  onChange?: (uuid: string) => void,
  side?: JSX.Element, // Ugh...
}): JSX.Element => {
  const { findImageByUuid, images } = useImage();
  const { uploadImage } = useRequest();
  const image = findImageByUuid(imageUuid);

  useEffect(() => {
    const target = document.getElementById(imageUuid);
    target?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }, []);

  return (
    <div
      // TODO: Write a comment about overflow-y-hidden
      // TODO: Zoom in/out support for image
      className='gap-4 grid grid-cols-[1fr_1px_300px] grid-rows-[1fr_auto] h-full justify-items-center overflow-y-hidden'
    >
      <div
        className={classnames(
          'h-full overflow-y-hidden relative w-full',
          side ? '' : 'col-span-3',
        )}
      >
        {image && (children || (
          <MediaComponent
            imgClassName='h-full object-contain w-full'
            media={image}
            modelClassName='aspect-square h-full w-full'
            modelProps={{
              ar: true,
              'camera-controls': true,
            }}
            videoClassName='h-full object-contain w-full'
          />
        ))}
      </div>
      {side && (
        <div
          className='bg-gradient-to-b from-base-100 from-10% h-full to-90% to-base-100 via-base-content w-px'
        />
      )}
      {side && (
        <div
          className='h-full overflow-y-scroll p-4 w-full'
        >
          {side}
        </div>
      )}
      <div
        className='col-span-3 gap-8 grid grid-cols-[auto_1fr] w-full'
      >
        <div>
          <button
            className='btn btn-outline btn-primary size-20'
            onClick={async () => {
              const file = await selectLocalFile('images/*');
              // TODO: Uploading when sending generation request?
              const image = await uploadImage(file);
              if (onChange) {
                onChange(image.uuid);
              }
            }}
          >
            <UploadIcon />
          </button>
        </div>
        <div
          className='carousel w-full'
        >
          { /* TODO: Optimize if needed */
          images.filter(filter).reverse().map((image, index) => (
            <div
              className='carousel-item h-20 w-20'
              key={index}
            >
              <MediaComponent
                className={image.uuid === imageUuid ? 'border-2 border-accent' : ''}
                imgClassName='cursor-pointer h-full object-cover w-full'
                media={image}
                modelClassName='aspect-square cursor-pointer h-full w-full'
                modelProps={{
                  'auto-rotate': true,
                  'rotation-per-second': '400%',
                }}
                onClick={onChange}
                videoClassName='cursor-pointer h-full object-cover w-full'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
