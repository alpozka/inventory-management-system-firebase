import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link, useNavigate } from 'react-router-dom'; // useHistory yerine useNavigate kullanılıyor.
import { collection, query, orderBy, startAt, endAt, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/HomePage.css';
import PersonForm from './PersonForm'; 
import ProductForm from './ProductForm';
import { QrReader } from 'react-qr-reader'; // 'QrReader' doğru bir şekilde içe aktarıldı.



const HomePage = () => {
    const [openPersonForm, setOpenPersonForm] = useState(false); 
    const [openProductForm, setOpenProductForm] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [error, setError] = useState(null);
    const [openQR, setOpenQR] = useState(false); // QR kod okuyucusunun durumunu kontrol eder
    const navigate = useNavigate(); // useHistory yerine useNavigate kullanılıyor.

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

    const handleScan = data => {
        if (data) {
            navigate(`/products/${data}`); // useHistory yerine useNavigate kullanılıyor.
            setOpenQR(false);
        }
    }

    const handleError = err => {
        console.error(err);
    }

    const handleOpenQRReader = () => {
        setOpenQR(true);
    }

    const handleCloseQRReader = () => {
        setOpenQR(false);
    }


    const handleSearch = async () => {
        if (searchId.length < 2) {
            setError('En az 2 karakter girin');
            return;
        }
    
        setError('');
    
        // Create empty array to store all results
        const results = [];
    
        // Define fields to search
        const fieldsToSearch = ['id', 'name', 'title', 'surname'];
    
        // Search in 'people' collection
        for (let field of fieldsToSearch) {
            const peopleRef = collection(db, 'people');
            const peopleQuery = query(peopleRef, orderBy(field), startAt(searchId), endAt(searchId + '\uf8ff'));
            const peopleQuerySnapshot = await getDocs(peopleQuery);
    
            peopleQuerySnapshot.forEach((doc) => {
                results.push({ ...doc.data(), type: 'person' });
            });
        }
    
        // Search in 'products' collection
        for (let field of fieldsToSearch) {
            const productRef = collection(db, 'products');
            const productQuery = query(productRef, orderBy(field), startAt(searchId), endAt(searchId + '\uf8ff'));
            const productQuerySnapshot = await getDocs(productQuery);
    
            productQuerySnapshot.forEach((doc) => {
                results.push({ ...doc.data(), type: 'product' });
            });
        }
    
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
                    onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSearch();
                        }
                    }}
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
                                    <p>Ünvan: {result.title}</p>
                                    <p>İşe giriş tarihi: {result.joiningDate}</p>
                                    <p>Sisteme Kayıt Tarihi: {result.registrationDate}</p>
                                    <p>Atanan Ürün Id: {result.assignedDeviceOrSoftwareId}</p>
                                    <p>Açıklama: {result.description}</p>
                                    <p>ID: {result.id}</p>
                                </div>
                            ) : result.type === 'product' ? (
                                <div>
                                    <h2>Ürün</h2>
                                    <p>Marka: {result.brand}</p>
                                    <p>Model: {result.model}</p>
                                    <p>Açıklama: {result.description}</p>
                                    <p>Satın Alınma Tarihi: {result.purchaseDate}</p>
                                    <p>Sisteme Kayıt Tarihi: {result.registerDate}</p>
                                    <p>Fiyat: {result.price}</p>
                                    <p>Atanan Kişi Id: {result.assignedPersonId}</p>
                                    <p>ID: {result.id}</p>
                                </div>
                            ) : (
                                <div>
                                    <p>{result.message}</p>
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
                <Button variant="contained" color="secondary" fullWidth className="my-button" onClick={handleOpenQRReader}>QR Kodu Okut</Button>
                </Box>
            </div>
        
            <PersonForm open={openPersonForm} handleClose={handleClosePersonForm} />  
            <ProductForm open={openProductForm} handleClose={handleCloseProductForm} />
            {openQR && (
            <div>
                <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%' }}
                />
                <Button onClick={handleCloseQRReader}>Close QR Reader</Button>
                <Button variant="contained" color="primary" onClick={handleOpenQRReader}>
  QR Kod Okuyucuyu Aç
</Button>
            </div>
        )}
        </Container>
    );
    
}

export default HomePage;


