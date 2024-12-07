export const formatCurrency = (value: number): string => {
  const prefix = value < 0 ? '-' : '';
  return `${prefix}£${Math.abs(value).toFixed(2)}`;
};

export const formatMoneyInput = (input: string): string => {
  // Remove non-numeric characters
  const numericValue = input.replace(/[^0-9]/g, '').slice(0, 6);
  
  // Convert to pence amount
  const pence = parseInt(numericValue) || 0;
  
  // Convert pence to pounds with exactly 2 decimal places
  return (pence / 100).toFixed(2);
};