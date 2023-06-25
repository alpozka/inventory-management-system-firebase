import React from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import '../styles/HomePage.css';

const HomePage = () => {
    return (
        <Container>

            <div className="head">
            <h1>Hoşgeldiniz!</h1>
            <p>Bu, Envanter Takip Sistemi'nin ana sayfasıdır.</p>
            </div>
            <Box display="flex" justifyContent="center">
                <TextField label="Sorgulama" variant="outlined" style={{ width: '70%' }} />
            </Box>
            <div className="button-sorgu">
            <Box m={2}>
                <Button variant="contained" color="primary" fullWidth className="my-button">Sorgula</Button>
            </Box>
            </div>

            <div className="button-group">
                <Box m={2}>
                    <Button variant="contained" color="secondary" fullWidth className="my-button">Kişi Ekle</Button>
                </Box>

                <Box m={2}>
                    <Button variant="contained" color="secondary" fullWidth className="my-button">Ürün Ekle</Button>
                </Box>
            </div>

            <div className="button-qr">

            <Box m={2}>
                <Button variant="contained" color="secondary" fullWidth className="my-button">QR Kodu Okut</Button>
            </Box>

            </div>
        </Container>
    );
}

export default HomePage;
//ashdusahduahsdu