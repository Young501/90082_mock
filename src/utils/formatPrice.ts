export const formatPrice = (price: number, currency: string = "AUD") => {
    const normalizedCurrency = currency.toUpperCase();
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price / 100);
  };    