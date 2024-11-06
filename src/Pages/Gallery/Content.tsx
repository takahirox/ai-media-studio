import { useNavigate } from "react-router-dom";
import { MediaComponent } from "../../Commons/MediaComponent";
import { useImage } from "../../Use/useImage";

export const Content = (): JSX.Element => {
  const { images } = useImage();
  const navigate = useNavigate();

  return (
    <div
      className='gap-2 grid grid-cols-3 items-end'
    >
      { /* TODO: Optimize if needed. Using slice and reverse every rendering is inefficient */
      images.slice().reverse().map((image, index) => (
        <MediaComponent
          className='border cursor-pointer rounded-md w-full'
          imgClassName='h-auto'
          key={index}
          media={image}
          modelClassName='aspect-square h-auto'
          modelProps={{
            'auto-rotate': true,
            'rotation-per-second': '400%',
          }}
          onClick={() => {
            navigate(`/my_content/${image.uuid}`);
          }}
          videoClassName='h-auto'
        />
      ))}
    </div>
  );
};
