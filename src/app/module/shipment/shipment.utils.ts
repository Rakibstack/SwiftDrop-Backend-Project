
export const calculateDeliveryFee = (weight?: number) => {
  const baseFee = 80;

  if (!weight || weight <= 1) {
    return baseFee;
  }

  const additionalWeight = Math.ceil(weight - 1);

  return baseFee + additionalWeight * 30;
};