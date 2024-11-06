import { KeyboardEvent } from "react";
import { MAX_GENERATION_COUNT, MIN_GENERATION_COUNT } from "../Tool";

export const ImageGenerationCountSlider = ({
  disabled,
  imageCount,
  onChange,
  onKeyDown,
}: {
  disabled: boolean,
  imageCount: number,
  onChange: (count: number) => void,
  onKeyDown?: (event: KeyboardEvent) => void,
}): JSX.Element => {
  return (
    <div
      className='flex flex-col gap-4'
    >
      <div
        className='flex justify-between'
      >
        <label>Images Generated</label>
        <span
          className='border rounded-md text-center w-10'
        >
          {imageCount}
        </span>
      </div>
      <input
        // TODO: Fix color for disabled, I want to use range-neutral but it doesn't seem to be defined
        className='disabled:range-secondary range range-xs range-primary w-full'
        disabled={disabled}
        max={MAX_GENERATION_COUNT}
        min={MIN_GENERATION_COUNT}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
        onKeyDown={(e) => {
          if (onKeyDown) {
            onKeyDown(e);
          }
        }}
        step='1'
        type='range'
        value={imageCount}
      />
    </div>
  );
};