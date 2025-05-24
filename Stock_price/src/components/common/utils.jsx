export const API_BASE_URL = 'http://20.244.56.144/evaluation-service';

export async function fetchData(url, setError, authToken) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const response = await fetch(url, { method: 'GET', headers, mode: 'cors' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${response.statusText || errorText || 'No response body'}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    setError(`Failed to connect to the stock API at ${url}. Error details: ${error.message}`);
    return null;
  }
}

export function calculateCovariance(X, Y, n) {
  if (n === 0) return 0;
  const meanX = X.reduce((sum, val) => sum + val, 0) / n;
  const meanY = Y.reduce((sum, val) => sum + val, 0) / n;
  let sumOfProducts = 0;
  for (let i = 0; i < n; i++) {
    sumOfProducts += (X[i] - meanX) * (Y[i] - meanY);
  }
  return sumOfProducts / (n - 1);
}

export function calculateStandardDeviation(arr, n) {
  if (n === 0) return 0;
  const mean = arr.reduce((sum, val) => sum + val, 0) / n;
  const sumOfSquares = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumOfSquares / (n - 1));
}
