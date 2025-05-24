const BASE_URL = "http://20.244.56.144/evaluation-service";

export const fetchStocks = async () => {
  const res = await fetch(`${BASE_URL}/stocks`);
  const data = await res.json();
  return data.stocks;
};

export const fetchStockPrices = async (ticker, minutes) => {
  const res = await fetch(`${BASE_URL}/stocks/${ticker}?minutes=${minutes}`);
  const data = await res.json();
  return data;
};
