'use client';

import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; 
import {ReactNode} from 'react';

const theme = createTheme();

export default function MUIProvider({children}: {children: ReactNode}) {
    return(
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
    