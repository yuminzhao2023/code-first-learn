import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ children, variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'; children: ReactNode;
}) {
  return <button className={`btn btn-${variant} ${className}`} type="button" {...props}>{children}</button>;
}
