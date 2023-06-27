import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/HomePage.css';
import PersonForm from './PersonForm'; 
import ProductForm from './ProductForm';

const HomePage = () => {
    const [openPersonForm, setOpenPersonForm] = useState(false); 
    const [openProductForm, setOpenProductForm] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [error, setError] = useState(null);

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

    const handleSearch = async () => {
        if (searchId.length < 2) {
            setError('En az 2 karakter girin');
            return;
        }
    
        setError('');
    
        // Search in 'people' collection
        const peopleQuery = query(collection(db, 'people'), where("name", "==", searchId));
        const peopleQuerySnapshot = await getDocs(peopleQuery);
    
        const results = [];
    
        peopleQuerySnapshot.forEach((doc) => {
            results.push({ ...doc.data(), type: 'person' });
        });
    
        // Search in 'products' collection
        const productQuery = query(collection(db, 'products'), where("name", "==", searchId));
        const productQuerySnapshot = await getDocs(productQuery);
    
        productQuerySnapshot.forEach((doc) => {
            results.push({ ...doc.data(), type: 'product' });
        });
    
        if (results.length > 0) {
            setSearchResult(results);
        } else {
            console.log('No such document!');
            setSearchResult([{ type: 'error', message: 'No such document!' }]);
        }
    };
    
    
  
    return (
        <Container>
        <div className="head">
        <h1>Hoşgeldiniz!</h1>
        <p>Bu, Envanter Takip Sistemi'nin ana sayfasıdır.</p>
        </div>
        <Box display="flex" justifyContent="center">
            <TextField 
                label="Sorgulama" 
                variant="outlined" 
                style={{ width: '70%' }} 
                value={searchId} 
                onChange={e => setSearchId(e.target.value)} 
                error={!!error}
                helperText={error}
            />    
        </Box>
        <div className="button-sorgu">
        <Box m={2}>
            <Button variant="contained" color="primary" fullWidth className="my-button" onClick={handleSearch}>Sorgula</Button>
        </Box>
        </div>
    
        {searchResult && searchResult.length > 0 ? (
            <div>
                {searchResult.map((result, index) => (
                    <div key={index}>
                        {result.type === 'person' ? (
                            <div>
                                <h2>Kişi</h2>
                                <p>Ad: {result.name}</p>
                                <p>Soyad: {result.surname}</p>
                                <p>Ülke: {result.country}</p>
                            </div>
                        ) : (
                            <div>
                                <h2>Ürün</h2>
                                <p>Ad: {result.name}</p>
                                <p>Üretici: {result.manufacturer}</p>
                                <p>Fiyat: {result.price}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : null}
    
        <div className="button-group">
                <Box m={2}>
                    <Button variant="contained" color="secondary" fullWidth className="my-button" onClick={handleOpenPersonForm}>Kişi Ekle</Button>
                </Box>
    
                <Box m={2}>
                    <Button variant="contained" color="secondary" fullWidth className="my-button" onClick={handleOpenProductForm}>Ürün Ekle</Button>
                </Box>
    
                <Box m={2}>
                    <Link to="/people">
                        <Button variant="contained" color="secondary" fullWidth className="my-button">Kişiler</Button>
                    </Link>  
                </Box>
    
                <Box m={2}>
                    <Link to="/products"> 
                        <Button variant="contained" color="secondary" fullWidth className="my-button">Ürünler</Button>
                    </Link> 
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


