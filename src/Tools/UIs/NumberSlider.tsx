import { KeyboardEvent } from "react";

export const NumberSlider = ({
  disabled,
  label,
  max,
  min,
  onChange,
  onKeyDown,
  step,
  value,
}: {
  disabled: boolean,
  label: string,
  max: number,
  min: number,
  onChange: (value: number) => void,
  onKeyDown?: (event: KeyboardEvent) => void,
  step: number,
  value: number,
}): JSX.Element => {
  return (
    <div
      className='flex flex-col gap-4'
    >
      <div
        className='flex justify-between'
      >
        <label>{label}</label>
        <span
          className='border text-center rounded-md w-16'
        >
          {value}
        </span>
      </div>
      <input
        // TODO: Fix color for disabled, I want to use range-neutral but it doesn't seem to be defined
        className='disabled:range-secondary range range-xs range-primary w-full'
        disabled={disabled}
        max={max}
        min={min}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
        onKeyDown={(e) => {
          if (onKeyDown) {
            onKeyDown(e);
          }
        }}
        step={step}
        type='range'
        value={value}
      />
    </div>
  );
};
