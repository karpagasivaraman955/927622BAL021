import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Container, Box, Select, MenuItem, InputLabel,
  CircularProgress, Grid, Alert, Paper
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { StyledPaper, StyledFormControl, StyledTextField } from './common/StyledComponents';
import { API_BASE_URL, fetchData } from './common/utils';

function StockPage({ authToken }) {
  const [stocks, setStocks] = useState({});
  const [selectedTicker, setSelectedTicker] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averagePrice, setAveragePrice] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getStocks() {
      setError(null);
      const data = await fetchData(`${API_BASE_URL}/stocks`, setError, authToken);
      if (data && data.stocks) {
        setStocks(data.stocks);
        const firstTicker = Object.values(data.stocks)[0];
        if (firstTicker) setSelectedTicker(firstTicker);
      }
    }
    if (authToken) getStocks();
    else setError("Authentication token is missing. Please provide a valid token to fetch stock data.");
  }, [authToken]);

  const fetchStockPriceHistory = useCallback(async () => {
    if (!selectedTicker || !minutes || !authToken) {
      if (!authToken) setError("Authentication token is missing.");
      return;
    }
    setLoading(true);
    setError(null);
    const url = `${API_BASE_URL}/stocks/${selectedTicker}?minutes=${minutes}`;
    const data = await fetchData(url, setError, authToken);
    if (data && Array.isArray(data)) {
      const sortedData = data.sort((a, b) => new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt));
      setStockData(sortedData);
      const total = sortedData.reduce((sum, item) => sum + item.price, 0);
      setAveragePrice(sortedData.length > 0 ? total / sortedData.length : 0);
    } else if (data && data.stock) {
      setStockData([data.stock]);
      setAveragePrice(data.stock.price);
    } else {
      setStockData([]);
      setAveragePrice(0);
    }
    setLoading(false);
  }, [selectedTicker, minutes, authToken]);

  useEffect(() => {
    fetchStockPriceHistory();
  }, [fetchStockPriceHistory]);

  const handleTickerChange = (event) => setSelectedTicker(event.target.value);
  const handleMinutesChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) setMinutes(value);
  };

  const CustomRechartsTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Time: {new Date(dataPoint.lastUpdatedAt).toLocaleTimeString()}
          </Typography>
          <Typography variant="body1" color="text.primary">
            Price: ${dataPoint.price ? dataPoint.price.toFixed(2) : 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average Price: ${averagePrice.toFixed(2)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <StyledPaper>
        <Typography variant="h5" component="h2" gutterBottom>
          Stock Price Chart
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <StyledFormControl fullWidth>
              <InputLabel id="stock-select-label">Select Stock</InputLabel>
              <Select
                labelId="stock-select-label"
                id="stock-select"
                value={selectedTicker}
                label="Select Stock"
                onChange={handleTickerChange}
              >
                {Object.entries(stocks).map(([name, ticker]) => (
                  <MenuItem key={ticker} value={ticker}>
                    {name} ({ticker})
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Grid>
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
          <Grid item xs={12} md={4}>
            <Typography variant="h6" align="right">
              Current Average Price: ${averagePrice.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, height: 400 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="lastUpdatedAt"
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                  label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip content={<CustomRechartsTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Stock Price"
                />
                <Line
                  type="monotone"
                  dataKey={() => averagePrice}
                  stroke="#82ca9d"
                  dot={false}
                  strokeDasharray="5 5"
                  name="Average Price"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="h6" color="text.secondary">
                No data available for the selected stock and time frame.
              </Typography>
            </Box>
          )}
        </Box>
      </StyledPaper>
    </Container>
  );
}

export default StockPage;