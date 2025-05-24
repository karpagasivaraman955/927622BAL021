import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Alert } from '@mui/material';
import { StyledButton } from './components/common/StyledComponents.js';
import StockPage from './components/StockPage.jsx';
import CorrelationHeatmapPage from './components/CorrelationHeatmapPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('stock');
  const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDYzOTI2LCJpYXQiOjE3NDgwNjM2MjYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImYzZGM1Y2ZiLTUwZjctNDY3My1iOTYyLTgwMjRlZDQ5ODg3MSIsInN1YiI6ImthcnBhZ2FzaXZhcmFtYW45NTVAZ21haWwuY29tIn0sImVtYWlsIjoia2FycGFnYXNpdmFyYW1hbjk1NUBnbWFpbC5jb20iLCJuYW1lIjoia2FycGFnYSBzaXZhcmFtYW4gZCBzIiwicm9sbE5vIjoiOTI3NjIyYmFsMDIxIiwiYWNjZXNzQ29kZSI6IndoZVFVeSIsImNsaWVudElEIjoiZjNkYzVjZmItNTBmNy00NjczLWI5NjItODAyNGVkNDk4ODcxIiwiY2xpZW50U2VjcmV0IjoianFBZFFjeE5KV2J0ZWV1YyJ9.qeOEBwvQ6V9hDJ0J_e5NS7ZfCx18R-5GdALnuRyxhEg";
  const renderPage = () => (
    <>
      {!ACCESS_TOKEN && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          **Warning:** No authentication token provided or the token is empty. Please update the `ACCESS_TOKEN` variable in `src/App.js` with a valid token to fetch data from the API.
        </Alert>
      )}
      {currentPage === 'stock'
        ? <StockPage authToken={ACCESS_TOKEN} />
        : <CorrelationHeatmapPage authToken={ACCESS_TOKEN} />}
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock Price Aggregation
          </Typography>
          <StyledButton color="inherit" onClick={() => setCurrentPage('stock')}>
            Stock Page
          </StyledButton>
          <StyledButton color="inherit" onClick={() => setCurrentPage('heatmap')}>
            Correlation Heatmap
          </StyledButton>
        </Toolbar>
      </AppBar>
      {renderPage()}
    </Box>
  );
}