import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, startAt, endAt, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/HomePage.css';
import PersonForm from './PersonForm'; 
import ProductForm from './ProductForm';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


const HomePage = () => {
    const [openPersonForm, setOpenPersonForm] = useState(false); 
    const [openProductForm, setOpenProductForm] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
    
        // Create empty array to store all results
        const results = [];
    
        // Define fields to search in 'people' collection
        const peopleFieldsToSearch = ['idLowerCase', 'nameLowerCase', 'titleLowerCase', 'surnameLowerCase'];
    
        // Search in 'people' collection
        for (let field of peopleFieldsToSearch) {
            const peopleRef = collection(db, 'people');
            const peopleQuery = query(peopleRef, orderBy(field), startAt(searchId.toLowerCase()), endAt(searchId.toLowerCase() + '\uf8ff'));
            const peopleQuerySnapshot = await getDocs(peopleQuery);
    
            peopleQuerySnapshot.forEach((doc) => {
                results.push({ ...doc.data(), type: 'person' });
            });
        }
    
        // Define fields to search in 'products' collection
        const productFieldsToSearch = ['idLowerCase', 'brandLowerCase', 'descriptionLowerCase', 'modelLowerCase'];
    
        // Search in 'products' collection
        for (let field of productFieldsToSearch) {
            const productRef = collection(db, 'products');
            const productQuery = query(productRef, orderBy(field), startAt(searchId.toLowerCase()), endAt(searchId.toLowerCase() + '\uf8ff'));
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
        setIsLoading(false);
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
    
            {isLoading ? (
                <Box display="flex" justifyContent="center" m={3}>
                    <CircularProgress />
                </Box>
            ) : searchResult && searchResult.length > 0 ? (
                <div className="results-grid">
                    {searchResult.map((result, index) => (
                        <Card className="result-card" key={index}>
                            <CardContent>
                                {result.type === 'person' ? (
                                    <div>
                                        <Typography variant="h5" component="div">Kişi</Typography>
                                        <Typography>Ad: {result.name}</Typography>
                                        <Typography>Soyad: {result.surname}</Typography>
                                        <Typography>Ünvan: {result.title}</Typography>
                                        <Typography>İşe giriş tarihi: {result.joiningDate}</Typography>
                                        <Typography>Sisteme Kayıt Tarihi: {result.registrationDate}</Typography>
                                        <Typography>Atanan Ürün Id: {result.assignedDeviceOrSoftwareId}</Typography>
                                        <Typography>Açıklama: {result.description}</Typography>
                                        <Typography>ID: {result.id}</Typography>
                                    </div>
                                ) : result.type === 'product' ? (
                                    <div>
                                        <Typography variant="h5" component="div">Ürün</Typography>
                                        <Typography>Marka: {result.brand}</Typography>
                                        <Typography>Model: {result.model}</Typography>
                                        <Typography>Açıklama: {result.description}</Typography>
                                        <Typography>Satın Alınma Tarihi: {result.purchaseDate}</Typography>
                                        <Typography>Sisteme Kayıt Tarihi: {result.registerDate}</Typography>
                                        <Typography>Fiyat: {result.price}</Typography>
                                        <Typography>Atanan Kişi Id: {result.assignedPersonId}</Typography>
                                        <Typography>ID: {result.id}</Typography>
                                    </div>
                                ) : (
                                    <div>
                                        <Typography>{result.message}</Typography>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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
    
            {/* <div className="button-qr">
                <Box m={2}>
                    <Button variant="contained" color="secondary" fullWidth className="my-button">QR Kodu Okut</Button>
                </Box>
            </div> */}
    
            <PersonForm open={openPersonForm} handleClose={handleClosePersonForm} />  
            <ProductForm open={openProductForm} handleClose={handleCloseProductForm} />
        </Container>
    );
}

export default HomePage;