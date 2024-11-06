import classnames from "classnames";
import { atom, useRecoilValue, useRecoilState } from "recoil";
import { useRef, useState } from "react";
import { ContentViewer } from "./ContentViewer";
import { Media } from "../state";

interface ContentSelectDialogProps {
  // TODO: Better interface?
  onClose: () => void;
  onSelect: (uuid: string) => void;
  open: boolean;
}
  
export const contentSelectPropsState = atom<ContentSelectDialogProps>({
  key: 'contentSelectDialogProps',
  default: {
    onClose: () => {},
    onSelect: () => {},
    open: false,
  },
});

export const useContentSelectDialog = () => {
  const [props, setProps] = useRecoilState(contentSelectPropsState);

  const open = (onSelect: (uuid: string) => void, onClose: () => void = () => {}): void => {
    setProps((prev) => {
      return {
        ...prev,
        onClose,
        onSelect,
        open: true,
      }
    });
  };

  const close = (): void => {
    setProps((prev) => {
      return {
        ...prev,
        open: false,
      }
    });
    props.onClose();
  };

  return {
    close,
    open,
  };
};

export const ContentSelectDialog = (): JSX.Element => {
  const props = useRecoilValue(contentSelectPropsState);
  const [imageUuid, setImageUuid] = useState('');
  const { close } = useContentSelectDialog();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <dialog
      className={classnames(
        'modal',
        { 'modal-open': props.open },
      )}
      ref={dialogRef}
    >
      <div
        className='grid grid-rows-[1fr_auto] h-[80vh] min-w-[80vw] modal-box'
      >
        <ContentViewer
          filter={(media: Media) => media.type === 'image'}
          imageUuid={imageUuid}
          onChange={(uuid: string) => {
            setImageUuid(uuid);
          }}
        />
        <div
          className='flex gap-2 modal-action'
        >
          <button
            className='btn btn-outline'
            onClick={() => {
              close();
            }}
          >
            Cancel
          </button>
          <button
            className='btn btn-outline btn-primary'
            disabled={!imageUuid}
            onClick={() => {
              props.onSelect(imageUuid);
              close();
            }}
          >
            Select
          </button>
        </div>
      </div>
    </dialog>
  );
};
