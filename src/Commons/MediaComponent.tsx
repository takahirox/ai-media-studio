import classnames from "classnames";
import '@google/model-viewer';
import { ErrorIcon } from "../Commons/Icons";
import { Media } from "../state";
import { DUMMY_PIXEL } from "../Utils/utils";

export const MediaComponent = ({
  className,
  imgClassName,
  imgProps = {},
  media,
  modelClassName,
  modelProps = {},
  onClick,
  videoClassName,
  videoProps,
}: {
  className?: string,
  imgClassName?: string,
  // TODO: More properly
  imgProps?: Record<string, any>,
  media: Media,
  modelClassName?: string,
  // TODO: More properly
  modelProps?: Record<string, any>,
  onClick?: (mediaUuid: string) => void,
  videoClassName?: string,
  // TODO: More properly
  videoProps?: Record<string, any>,
}): JSX.Element => {
  // TODO: Zoom in/out support
  // TODO: Fix type checks
  return (
    <>
      {media.success === false && (
        <div
          // Don't know if this always works
          className={classnames(className, imgClassName, 'border relative')}
        >
          <img
            className={classnames(className, imgClassName)}
            height={1024 /* TODO: Fix me */}
            onClick={() => {
              if (onClick) {
                onClick(media.uuid);
              }
            }}
            src={DUMMY_PIXEL}
            width={1024 /* TODO: Fix me */}
            {...imgProps}
          />
          <ErrorIcon
            className='absolute left-1/2 pointer-events-none text-error top-1/2 translate-x-[-50%] translate-y-[-50%]'
          />
        </div>
      )}
      {media.type === 'image' && media.success !== false && (
        <img
          className={classnames(className, imgClassName)}
          onClick={() => {
            if (onClick) {
              onClick(media.uuid);
            }
          }}
          src={media.src}
          {...imgProps}
        />
      )}
      {media.type === 'video' && media.success !== false && (
        <video
          autoPlay
          className={classnames(className, videoClassName)}
          loop
          muted
          onClick={() => {
            if (onClick) {
              onClick(media.uuid);
            }
          }}
          src={media.src}
          {...videoProps}
        />
      )}
      {media.type === 'model3d' && media.success !== false && (
        <model-viewer
          class={classnames(className, modelClassName)}
          loading='eager'
          max-camera-orbit='auto auto 300%'
          onClick={() => {
            if (onClick) {
              onClick(media.uuid);
            }
          }}
          orientation='0 0 180deg'
          src={media.src}
          style={{
            '--progress-bar-height': '0px',
          }}
          {...modelProps}
        />
      )}
    </>
  );
};