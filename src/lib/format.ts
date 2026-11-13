export const compact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
export const dollars = (value: number) => `$${value.toFixed(2)}`;
export const milliseconds = (value: number) =>
  `${value.toLocaleString('en-US')} ms`;
