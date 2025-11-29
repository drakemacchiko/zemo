'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={`relative flex w-full touch-none select-none items-center ${className || ''}`}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className="absolute h-full bg-zemo-yellow" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-zemo-yellow bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zemo-yellow focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      {props.value && Array.isArray(props.value) && props.value.length > 1 && (
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-zemo-yellow bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zemo-yellow focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      )}
    </SliderPrimitive.Root>
  )
);

Slider.displayName = 'Slider';

export { Slider };
