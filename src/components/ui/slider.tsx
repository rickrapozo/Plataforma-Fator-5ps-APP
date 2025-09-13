import React from 'react';
import { cn } from '../../utils/cn';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  orientation?: 'horizontal' | 'vertical';
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    className, 
    value, 
    defaultValue = [0], 
    onValueChange, 
    max = 100, 
    min = 0, 
    step = 1, 
    orientation = 'horizontal',
    disabled = false,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value || internalValue;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(event.target.value)];
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <div
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          orientation === 'vertical' && 'h-full flex-col',
          className
        )}
      >
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'relative h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary outline-none disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110',
            orientation === 'vertical' && 'h-full w-2 writing-mode-bt'
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };