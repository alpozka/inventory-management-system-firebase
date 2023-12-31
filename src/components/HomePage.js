import React, { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const [openPersonForm, setOpenPersonForm] = useState(false);
  const [openProductForm, setOpenProductForm] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [persons, setPersons] = useState([]);
  const [products, setProducts] = useState([]);
  const { t, i18n } = useTranslation();



  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };
  const fetchPersons = async () => {
    const personsRef = collection(db, 'people');
    const personsSnapshot = await getDocs(personsRef);
    const personsList = personsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPersons(personsList);
  };

  const fetchProducts = async () => {
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(productsList);
  };

  useEffect(() => {
    fetchPersons();
    fetchProducts();
  }, []);

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
      setError(t);
      return;
    }

    setError(t('homepage.searchChar'));
    setIsLoading(true);

    // Create empty array to store all results
    const results = [];

    // Define fields to search in people collection
    const peopleFieldsToSearch = ['idLowerCase', 'nameLowerCase', 'titleLowerCase', 'surnameLowerCase'];

    // Search in people collection
    for (let field of peopleFieldsToSearch) {
      const peopleRef = collection(db, 'people');
      const peopleQuery = query(
        peopleRef,
        orderBy(field),
        startAt(searchId.toLowerCase()),
        endAt(searchId.toLowerCase() + '\uf8ff')
      );
      const peopleQuerySnapshot = await getDocs(peopleQuery);

      peopleQuerySnapshot.forEach((doc) => {
        const data = doc.data();
        const assignedProducts = [];
        if (Array.isArray(data.assignedDeviceOrSoftwareId)) {
          data.assignedDeviceOrSoftwareId.forEach((productId) => {
            const assignedProduct = products.find((product) => product.id === productId);
            if (assignedProduct) {
              assignedProducts.push(`${assignedProduct.brand} ${assignedProduct.model} (ID: ${productId})`);
            }
          });
        } else {
          const assignedProduct = products.find((product) => product.id === data.assignedDeviceOrSoftwareId);
          if (assignedProduct) {
            assignedProducts.push(`${assignedProduct.brand} ${assignedProduct.model} (ID: ${data.assignedDeviceOrSoftwareId})`);
          }
        }

        results.push({
          ...data,
          type: 'person',
          assignedProducts: assignedProducts.join(', ')
        });
      });
    }

    // Define fields to search in products collection
    const productFieldsToSearch = ['idLowerCase', 'brandLowerCase', 'descriptionLowerCase', 'modelLowerCase'];

    // Search in products collection
    for (let field of productFieldsToSearch) {
      const productRef = collection(db, 'products');
      const productQuery = query(
        productRef,
        orderBy(field),
        startAt(searchId.toLowerCase()),
        endAt(searchId.toLowerCase() + '\uf8ff')
      );
      const productQuerySnapshot = await getDocs(productQuery);

      productQuerySnapshot.forEach((doc) => {
        const productData = doc.data();
        const productAssignedPersons = [];
        if (Array.isArray(productData.assignedPersonId)) {
          productData.assignedPersonId.forEach((personId) => {
            const assignedPerson = persons.find((person) => person.id === personId);
            if (assignedPerson) {
              productAssignedPersons.push(`${assignedPerson.name} ${assignedPerson.surname} (ID: ${personId})`);
            }
          });
        } else {
          // If it's not an array, it's probably a single id, handle this case
          const assignedPerson = persons.find((person) => person.id === productData.assignedPersonId);
          if (assignedPerson) {
            productAssignedPersons.push(`${assignedPerson.name} ${assignedPerson.surname} (ID: ${productData.assignedPersonId})`);
          }
        }

        results.push({
          ...productData,
          type: 'product',
          assignedPersonName: productAssignedPersons.join(', ') // Here the persons are joined by comma
        });
      });
    }

    if (results.length === 0) {
      setError(t('homepage.searchError'));
    } else {
      setSearchResult(results);
    }

    setIsLoading(false);
  };

  return (
    
    <div className="containero">
    <Container>
      <div className="language-button">
      <Button onClick={() => changeLanguage('en')}>EN</Button>
      <Button onClick={() => changeLanguage('tr')}>TR</Button>
        </div>
      <div className="head">
        <h1>{t('homepage.welcome')}</h1>
        <p>{t('homepage.welcomeDescription')}</p>
      </div>
      
      <Box display="flex" justifyContent="center">
        <TextField
          label={t('homepage.searchLabel')}
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
        <Button variant="contained" color="primary" fullWidth className="my-button" onClick={handleSearch}>{t('homepage.searchButton')}</Button>
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
                    <Typography variant="h5" component="div">{t('homepage.person')}</Typography>
                    <Typography>{t('homepage.name')}: {result.name}</Typography>
                    <Typography>{t('homepage.surname')}: {result.surname}</Typography>
                    <Typography>{t('homepage.title')}: {result.title}</Typography>
                    <Typography>{t('homepage.joiningDate')}: {result.joiningDate}</Typography>
                    <Typography>{t('homepage.registrationDate')}: {result.registrationDate}</Typography>
                    <Typography>{t('homepage.assignedProducts')}: {result.assignedProducts}</Typography>
                    <Typography>ID: <Link to={`/profile/${result.id}`}>{result.id}</Link></Typography>
                  </div>
                ) : result.type === 'product' ? (
                  <div>
                    <Typography variant="h5" component="div">{t('homepage.product')}</Typography>
                    <Typography>{t('homepage.brand')}: {result.brand}</Typography>
                    <Typography>{t('homepage.model')}: {result.model}</Typography>
                    <Typography>{t('homepage.description')}: {result.description}</Typography>
                    <Typography>{t('homepage.purchaseDate')}: {result.purchaseDate}</Typography>
                    <Typography>{t('homepage.registrationDate')}: {result.registerDate}</Typography>
                    <Typography>{t('homepage.price')}: {result.price}</Typography>
                    <Typography>{t('homepage.assignedPerson')}: {result.assignedPersonName}</Typography>
                    <Typography>ID: <Link to={`/ProductProfile/${result.id}`}>{result.id}</Link></Typography>
                  </div>
                ) : (
                  <div>
                    <Typography variant="h5" component="div">{t('homepage.unknownResultType')}: {result.type}</Typography>
                    <Typography>Data: {JSON.stringify(result, null, 2)}</Typography>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="button-group">
        <Box m={2}>
        <Button variant="contained" color="secondary" fullWidth className="my-button" onClick={handleOpenPersonForm}>{t('homepage.addPersonButton')}</Button>
        </Box>

        <Box m={2}>
        <Button variant="contained" color="secondary" fullWidth className="my-button" onClick={handleOpenProductForm}>{t('homepage.addProductButton')}</Button>
        </Box>

        <Box m={2}>
          <Link to="/people">
          <Button variant="contained" color="secondary" fullWidth className="my-button">{t('homepage.peopleButton')}</Button>
          </Link>
        </Box>

        <Box m={2}>
          <Link to="/products">
          <Button variant="contained" color="secondary" fullWidth className="my-button">{t('homepage.productsButton')}</Button>
          </Link>
        </Box>
      </div>

      <PersonForm open={openPersonForm} handleClose={handleClosePersonForm} />
      <ProductForm open={openProductForm} handleClose={handleCloseProductForm} />
    </Container>
    </div>
    
  );
};

export default HomePage;
