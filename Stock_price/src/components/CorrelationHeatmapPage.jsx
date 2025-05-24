import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Container, Box, CircularProgress, Grid, Alert, Tooltip, Paper
} from '@mui/material';
import { StyledPaper, StyledTextField } from './common/StyledComponents';
import { API_BASE_URL, fetchData, calculateCovariance, calculateStandardDeviation } from './common/utils';

function CorrelationHeatmapPage({ authToken }) {
  const [stocks, setStocks] = useState({});
  const [minutes, setMinutes] = useState(60);
  const [correlationData, setCorrelationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockPrices, setStockPrices] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getStocks() {
      setError(null);
      const data = await fetchData(`${API_BASE_URL}/stocks`, setError, authToken);
      if (data && data.stocks) setStocks(data.stocks);
    }
    if (authToken) getStocks();
    else setError("Authentication token is missing. Please provide a valid token to fetch stock data.");
  }, [authToken]);

  const fetchAllStockPrices = useCallback(async () => {
    if (Object.keys(stocks).length === 0 || !minutes || !authToken) {
      if (!authToken) setError("Authentication token is missing.");
      return;
    }
    setLoading(true);
    setError(null);
    const newStockPrices = {};
    const tickers = Object.values(stocks);
    await Promise.all(tickers.map(async (ticker) => {
      const url = `${API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`;
      const data = await fetchData(url, setError, authToken);
      if (data && Array.isArray(data)) newStockPrices[ticker] = data;
      else if (data && data.stock) newStockPrices[ticker] = [data.stock];
    }));
    setStockPrices(newStockPrices);
    setLoading(false);
  }, [stocks, minutes, authToken]);

  useEffect(() => {
    fetchAllStockPrices();
  }, [fetchAllStockPrices]);

  useEffect(() => {
    if (Object.keys(stockPrices).length === 0 || loading) {
      setCorrelationData([]);
      return;
    }
    const tickers = Object.values(stocks);
    const newCorrelationData = [];
    for (let i = 0; i < tickers.length; i++) {
      for (let j = i; j < tickers.length; j++) {
        const ticker1 = tickers[i];
        const ticker2 = tickers[j];
        const prices1 = stockPrices[ticker1]?.map(d => d.price) || [];
        const prices2 = stockPrices[ticker2]?.map(d => d.price) || [];
        const alignedData = [];
        const map1 = new Map(stockPrices[ticker1]?.map(d => [d.lastUpdatedAt, d.price]));
        const map2 = new Map(stockPrices[ticker2]?.map(d => [d.lastUpdatedAt, d.price]));
        const allTimestamps = new Set([...map1.keys(), ...map2.keys()]);
        for (const ts of Array.from(allTimestamps).sort()) {
          if (map1.has(ts) && map2.has(ts)) {
            alignedData.push({ price1: map1.get(ts), price2: map2.get(ts) });
          }
        }
        const alignedPrices1 = alignedData.map(d => d.price1);
        const alignedPrices2 = alignedData.map(d => d.price2);
        const n = alignedPrices1.length;
        if (n > 1) {
          const cov = calculateCovariance(alignedPrices1, alignedPrices2, n);
          const stdDev1 = calculateStandardDeviation(alignedPrices1, n);
          const stdDev2 = calculateStandardDeviation(alignedPrices2, n);
          let correlation = 0;
          if (stdDev1 > 0 && stdDev2 > 0) correlation = cov / (stdDev1 * stdDev2);
          newCorrelationData.push({ x: ticker1, y: ticker2, correlation });
          if (ticker1 !== ticker2) newCorrelationData.push({ x: ticker2, y: ticker1, correlation });
        } else {
          newCorrelationData.push({ x: ticker1, y: ticker2, correlation: 0 });
          if (ticker1 !== ticker2) newCorrelationData.push({ x: ticker2, y: ticker1, correlation: 0 });
        }
      }
    }
    setCorrelationData(newCorrelationData);
  }, [stockPrices, loading, stocks]);

  const handleMinutesChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) setMinutes(value);
  };

  const getCorrelationColor = (correlation) => {
    if (correlation === undefined || isNaN(correlation)) return '#ccc';
    if (correlation > 0.75) return '#4CAF50';
    if (correlation > 0.5) return '#8BC34A';
    if (correlation > 0.25) return '#CDDC39';
    if (correlation > -0.25) return '#FFEB3B';
    if (correlation > -0.5) return '#FFC107';
    if (correlation > -0.75) return '#FF9800';
    return '#F44336';
  };

  const getStockStats = (ticker) => {
    const prices = stockPrices[ticker]?.map(d => d.price) || [];
    const n = prices.length;
    if (n === 0) return { avg: 0, stdDev: 0 };
    const avg = prices.reduce((sum, val) => sum + val, 0) / n;
    const stdDev = calculateStandardDeviation(prices, n);
    return { avg, stdDev };
  };

  const CustomHeatmapTooltip = ({ correlation, x, y }) => {
    const stock1Stats = getStockStats(x);
    const stock2Stats = getStockStats(y);
    return (
      <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Correlation between {x} and {y}:{' '}
          <Box component="span" sx={{ fontWeight: 'bold', color: getCorrelationColor(correlation) }}>
            {correlation !== undefined && !isNaN(correlation) ? correlation.toFixed(4) : 'N/A'}
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {x} - Avg: ${stock1Stats.avg.toFixed(2)}, StdDev: ${stock1Stats.stdDev.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {y} - Avg: ${stock2Stats.avg.toFixed(2)}, StdDev: ${stock2Stats.stdDev.toFixed(2)}
        </Typography>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <StyledPaper>
        <Typography variant="h5" component="h2" gutterBottom>
          Stock Correlation Heatmap
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <StyledTextField
              label="Minutes (m)"
              type="number"
              value={minutes}
              onChange={handleMinutesChange}
              fullWidth
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
        </Grid>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : correlationData.length > 0 ? (
          <Box sx={{ mt: 4, overflowX: 'auto', overflowY: 'auto', maxHeight: '600px' }}>
            <Grid container spacing={0} sx={{ minWidth: Math.max(500, Object.keys(stocks).length * 80) }}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" sx={{ pl: '80px' }}>
                  {Object.values(stocks).map((ticker) => (
                    <Tooltip
                      key={`x-label-${ticker}`}
                      title={
                        <Box>
                          <Typography variant="body2">{ticker}</Typography>
                          <Typography variant="caption">Avg: ${getStockStats(ticker).avg.toFixed(2)}</Typography>
                          <Typography variant="caption">StdDev: ${getStockStats(ticker).stdDev.toFixed(2)}</Typography>
                        </Box>
                      }
                      placement="top"
                      arrow
                    >
                      <Box
                        sx={{
                          width: 80, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', borderBottom: '1px solid #eee', borderRight: '1px solid #eee', cursor: 'pointer',
                          '&:hover': { backgroundColor: '#e0e0e0' },
                        }}
                      >
                        <Typography variant="caption">{ticker}</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Grid>
              {Object.values(stocks).map((rowTicker) => (
                <Grid item xs={12} key={`row-${rowTicker}`}>
                  <Box display="flex">
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="body2">{rowTicker}</Typography>
                          <Typography variant="caption">Avg: ${getStockStats(rowTicker).avg.toFixed(2)}</Typography>
                          <Typography variant="caption">StdDev: ${getStockStats(rowTicker).stdDev.toFixed(2)}</Typography>
                        </Box>
                      }
                      placement="left"
                      arrow
                    >
                      <Box
                        sx={{
                          width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', borderRight: '1px solid #eee', borderBottom: '1px solid #eee', cursor: 'pointer',
                          '&:hover': { backgroundColor: '#e0e0e0' },
                        }}
                      >
                        <Typography variant="caption">{rowTicker}</Typography>
                      </Box>
                    </Tooltip>
                    {Object.values(stocks).map((colTicker) => {
                      const cellData = correlationData.find(
                        (d) => d.x === rowTicker && d.y === colTicker
                      );
                      const correlationValue = cellData ? cellData.correlation : undefined;
                      const backgroundColor = getCorrelationColor(correlationValue);
                      return (
                        <Tooltip
                          key={`${rowTicker}-${colTicker}-cell`}
                          title={
                            <CustomHeatmapTooltip
                              correlation={correlationValue}
                              x={rowTicker}
                              y={colTicker}
                            />
                          }
                          placement="top"
                          arrow
                        >
                          <Box
                            sx={{
                              width: 80, height: 80, backgroundColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderBottom: '1px solid #eee', borderRight: '1px solid #eee', cursor: 'pointer',
                              '&:hover': { opacity: 0.8 },
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                              {correlationValue !== undefined && !isNaN(correlationValue)
                                ? correlationValue.toFixed(2)
                                : 'N/A'}
                            </Typography>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <Typography variant="h6" color="text.secondary">
              No data available to generate heatmap. Please adjust minutes or wait for data.
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Correlation Strength Legend
          </Typography>
          <Grid container spacing={1} justifyContent="center">
            {[
              { label: 'Strong Positive (>0.75)', color: '#4CAF50' },
              { label: 'Moderate Positive (>0.5)', color: '#8BC34A' },
              { label: 'Weak Positive (>0.25)', color: '#CDDC39' },
              { label: 'Near Zero (-0.25 to 0.25)', color: '#FFEB3B' },
              { label: 'Weak Negative (<-0.25)', color: '#FFC107' },
              { label: 'Moderate Negative (<-0.5)', color: '#FF9800' },
              { label: 'Strong Negative (<-0.75)', color: '#F44336' },
              { label: 'No Data / Invalid', color: '#ccc' },
            ].map((item) => (
              <Grid item key={item.label}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 20, height: 20, backgroundColor: item.color, borderRadius: '4px', mr: 1 }} />
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </StyledPaper>
    </Container>
  );
}

export default CorrelationHeatmapPage;