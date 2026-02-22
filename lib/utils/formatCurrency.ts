export const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
};
