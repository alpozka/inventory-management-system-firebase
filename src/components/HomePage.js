import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import PersonForm from './PersonForm'; 
import ProductForm from './ProductForm';

const HomePage = () => {
    const [openPersonForm, setOpenPersonForm] = useState(false); 
    const [openProductForm, setOpenProductForm] = useState(false);

    const handleOpenPersonForm = () => {
        setOpenPersonForm(true);
    };

    const handleClosePersonForm = () => {
        setOpenPersonForm(false);
    };

    const handleOpenProductForm = () => {
        setOpenProductForm(true);
    };

    const handleCloseProductForm = () => {
        setOpenProductForm(false);
    };
  
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
                    <Button variant="contained" color="secondary" fullWidth className="my-button" onClick={handleOpenPersonForm}>Kişi Ekle</Button>
                </Box>

                <Box m={2}>
                    <Button variant="contained" color="secondary" fullWidth className="my-button" onClick={handleOpenProductForm}>Ürün Ekle</Button>
                </Box>

                <Box m={2}>
                    <Link to="/people">  {/* Add this line */}
                        <Button variant="contained" color="secondary" fullWidth className="my-button">Kişiler</Button>
                    </Link>  {/* Add this line */}
                </Box>

                <Box m={2}>
                    <Link to="/products">  {/* Add this line */}
                        <Button variant="contained" color="secondary" fullWidth className="my-button">Ürünler</Button>
                    </Link>  {/* Add this line */}
                </Box>
            </div>

        <div className="button-qr">

        <Box m={2}>
            <Button variant="contained" color="secondary" fullWidth className="my-button">QR Kodu Okut</Button>
        </Box>

        </div>

        <PersonForm open={openPersonForm} handleClose={handleClosePersonForm} />  
            <ProductForm open={openProductForm} handleClose={handleCloseProductForm} />
    </Container>
    );
}

export default HomePage;


