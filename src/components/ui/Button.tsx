import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * 默认 type="button"，调用方可显式传入 type="submit"。
 * 原生按钮属性透传；只有图标时，调用方须提供可访问名称。
 */
export function Button({ children, variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'; children: ReactNode;
}) {
  return <button className={`btn btn-${variant} ${className}`} type="button" {...props}>{children}</button>;
}
