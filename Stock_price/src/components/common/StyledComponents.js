import { styled } from '@mui/material/styles';
import { Paper, Button, FormControl, TextField } from '@mui/material';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  backgroundColor: theme.palette.background.paper,
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 'bold',
}));

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  margin: theme.spacing(1),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
}));