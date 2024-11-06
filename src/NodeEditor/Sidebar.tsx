import { Link } from "react-router-dom";
import { ToolIcon } from "../Commons/Icons";
import { MediaComponent } from "../Commons/MediaComponent";
import { useImage } from "../Use/useImage";

export const Sidebar = ({
  imageUuid,
  loading,
  onSubmit,
  ready,
}: {
  imageUuid: string,
  loading: boolean,
  onSubmit: () => Promise<void>,
  ready: boolean,
}): JSX.Element => {
  const { findImageByUuid } = useImage();
  const image = imageUuid ? findImageByUuid(imageUuid) : null;

  return (
    <div
      className='flex flex-col gap-8'
    >
      <div
        className='flex gap-2 items-end'
      >
        <ToolIcon />
        Node Editor
      </div>
      <div
        className='flex gap-2 items-center'
      >
        <button
          className='btn btn-primary'
          disabled={loading || !ready}
          onClick={onSubmit}
        >
          Run
        </button>
        {loading && (
          <span
            className='loading loading-spinner'
          />
        )}
      </div>
      {image && (
        <Link
          to={`/my_content/${image.uuid}`}
        >
          <MediaComponent
             className='border cursor-pointer h-auto rounded-sm w-full'
             media={image}
             modelClassName='aspect-square h-auto'
             modelProps={{
              'auto-rotate': true,
              'rotation-per-second': '400%',
             }}
          />
        </Link>
      )}
    </div>
  );
};
