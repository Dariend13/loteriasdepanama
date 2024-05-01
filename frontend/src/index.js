import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';  // Importa SnackbarProvider aquí

const theme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#123754',
        },
    },
});

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <App />
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
);
