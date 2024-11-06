import classnames from "classnames";
import { useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { CopyIcon, ImageIcon, VariationIcon } from "../../Commons/Icons";
import { MediaComponent } from "../../Commons/MediaComponent";
import { useImage } from "../../Use/useImage";
import { useQuery } from "../../Use/useQuery";
import { DUMMY_PIXEL } from "../../Utils/utils";

export interface PendingQuery {
  contents: (string /* UUID of ImageBase */ | '')[];
  tool: string; // TODO: Enum?
  // TODO: Avoid any and exploit static type checks if possible
  params: Record<string, any>;
  visible: boolean;
}

export const GeneratedContentsViewer = ({
  onChange,
  pendingQuery,
  processing,
  thin = false,
  toolName,
}: {
  // TODO: Avoid any and exploit statis type checks if possible
  onChange: (params: Record<string, any>) => void,
  pendingQuery: PendingQuery,
  processing: boolean,
  // TODO: Rename? This var is used more than just knowing whether to be thin
  thin?: boolean, // Possible to automatically detect?
  toolName: string, // TODO: enum?
}): JSX.Element => {
  const navigate = useNavigate();
  const { queries } = useQuery();
  const { findImageByUuid } = useImage();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const highlightedImageUuid = searchParams.get('image');

  // TODO: Fix me. Currenlty moving to another tool page, scrolling again.
  useEffect(() => {
    // I don't know but this setTimeout seems to be necessary to work
    setTimeout(() => {
      const target = document.getElementById(location.hash.slice(1));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [location]);

  return (
    <div
      className='flex flex-col gap-4'
    >
      {pendingQuery.visible && (
        <div
          className='flex flex-col gap-4'
        >
          <label>{pendingQuery.params.prompt}</label>
          <div
            className={classnames(
              'gap-4 grid',
              thin ? 'grid-cols-2' : 'grid-cols-4',
            )}
          >
            {pendingQuery.contents.map((imageUuid, index) => {
              const inputImage = pendingQuery.params.image ? findImageByUuid(pendingQuery.params.image) : null;
              const image = findImageByUuid(imageUuid);

              // TODO: More elegant way
              // TODO: Fix type checks
              const aspectRatio =
                pendingQuery.params.aspectRatio
                  ? pendingQuery.params.aspectRatio.replace(':', '/')
                  : pendingQuery.params.dimension && pendingQuery.params.dimension.width && pendingQuery.params.dimension.height
                    ? `${pendingQuery.params.dimension.width} / ${pendingQuery.params.dimension.height}`
                    : inputImage && ('width' in inputImage) && ('height' in inputImage)
                      ? `${inputImage.width} / ${inputImage.height}`
                      : 'unset';

              return (
                <div
                  className='relative'
                  key={index}
                >
                  {(image && (image.src || ('success' in image && image.success === false))) ? (
                    <MediaComponent
                      className='border h-auto rounded-sm w-full'
                      key={index}
                      imgClassName='object-contain w-full'
                      media={image}
                      modelClassName='aspect-square w-full'
                      videoClassName='object-contain w-full'
                    />
                  ) : (
                    <img
                      className='border h-auto rounded-sm w-full'
                      src={DUMMY_PIXEL}
                      // TODO: Write comment about why using style here, not className
                      style={{
                        aspectRatio,
                      }}
                    />
                  )}
                  {!(image?.src) && processing && (
                    <span
                      className='absolute left-1/2 loading loading-spinner top-1/2 translate-x-[-50%] translate-y-[-50%]'
                    />
                  )}
                  {(!(image?.src)) && !processing && (
                    <ImageIcon
                      className='absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]'
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {queries.filter((query) => query.tool === toolName).slice().reverse().map((query, index) => {
        const inputImage = findImageByUuid(query.params.image);
        return (
          <div
            className='flex flex-col gap-4'
            key={index}
          >
            <div
              className='flex gap-2 items-end'
              id={`${query.uuid}`}
            >
              {inputImage && (
                <img
                  className='border cursor-pointer rounded-sm w-20'
                  onClick={() => {
                    if (thin) { // TODO: Confusing for readers?
                      onChange({ image: inputImage.uuid });
                    } else {
                      navigate(`/my_content/${inputImage.uuid}`);
                    }
                  }}
                  src={inputImage.src}
                />
              )}
              {query.params.prompt && (
                <label>{query.params.prompt}</label>
              )}
              {query.params.aspectRatio && (
                <span>- {query.params.aspectRatio}</span>
              )}
              <Link
                className={classnames({
                  'pointer-events-none': processing,
                  'cursor-pinter': processing,
                  'text-neutral': processing,
                })}
                onClick={(e) => {
                  if (processing) {
                    e.preventDefault();
                  }
                  // TODO: Implement
                }}
                to=''
              >
                <VariationIcon />
              </Link>
              <Link
                className={classnames({
                  'pointer-events-none': processing,
                  'cursor-pinter': processing,
                  'text-neutral': processing,
                })}
                to=''
                onClick={(e) => {
                  if (processing) {
                    e.preventDefault();
                    return;
                  }
                  onChange({
                    // TODO: More params including advanced params
                    aspectRatio: query.params.aspectRatio,
                    prompt: query.params.prompt,
                    image: inputImage?.uuid,
                  });
                }}
              >
                <CopyIcon />
              </Link>
            </div>
            <div
              className={classnames(
                'gap-4 grid',
                thin ? 'grid-cols-2' : 'grid-cols-4',
              )}
            >
              {query.contents.map((imageUuid, index) => {
                const image = findImageByUuid(imageUuid)!;
                return (
                  <MediaComponent
                    className={classnames(
                      'cursor-pointer h-auto rounded-sm w-full',
                      highlightedImageUuid && highlightedImageUuid === image.uuid ? 'border-2 border-accent' : 'border',
                    )}
                    key={index}
                    imgClassName='object-contain w-full'
                    media={image}
                    modelClassName='aspect-square w-full'
                    onClick={() => { 
                      if (thin) { // TODO: Confusing for readers?
                        onChange({ image: imageUuid });
                      } else {
                        navigate(`/my_content/${image.uuid}`);
                      }
                    }}
                    videoClassName='object-contain w-full'
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
