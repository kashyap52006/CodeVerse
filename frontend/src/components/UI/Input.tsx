// Input will be completed in Prompt 7
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      className="block w-full rounded border px-3 py-2 text-sm focus:outline-none"
      {...props}
    />
  )
);

Input.displayName = 'Input';
