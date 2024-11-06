import { KeyboardEvent } from "react";
import { type AspectRatioType, AspectRatioValues } from "../../state";

export const AspectRatioSlider = ({
  aspectRatio,
  disabled,
  onChange,
  onKeyDown,
}: {
  aspectRatio: AspectRatioType,
  disabled: boolean,
  onChange: (aspectRatio: AspectRatioType) => void,
  onKeyDown?: (event: KeyboardEvent) => void,
}): JSX.Element => {
  return (
    <div
      className='flex flex-col gap-4'
    >
      <div
        className='flex justify-between'
      >
        <label>Aspect Ratio</label>
        <span
          className='border text-center rounded-md w-16'
        >
          {aspectRatio.replace(':', ' : ')}
        </span>
      </div>
      <div
        className='flex justify-between'
      >
        <span className='material-symbols-outlined'>
          crop_16_9
        </span>
        <span className='material-symbols-outlined'>
          crop_9_16
        </span>
      </div>
      <input
        // TODO: Fix color for disabled, I want to use range-neutral but it doesn't seem to be defined
        className='disabled:range-secondary range range-xs range-primary w-full'
        disabled={disabled}
        max={`${AspectRatioValues.length - 1}`}
        min='0'
        onChange={(e) => {
          // TODO: Remove cast if possible
          onChange(AspectRatioValues[Number(e.target.value)] as AspectRatioType);
        }}
        onKeyDown={(e) => {
          if (onKeyDown) {
            onKeyDown(e);
          }
        }}
        step='1'
        type='range'
        // TODO: Optimize if possible and necessary
        value={`${AspectRatioValues.indexOf(aspectRatio)}`}
      />
    </div>
  );
};
