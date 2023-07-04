import React, { useEffect, useState } from 'react';
import { collection, getDocs} from 'firebase/firestore';
import { db } from './firebase';
import { Grid, Paper } from '@mui/material';
import '../styles/ProductPage.css';
import { Link } from 'react-router-dom';

function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
    };

    fetchProducts();
  }, []);

  return (
    <div className="productPage">
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Link to={`/ProductProfile/${product.id}`} className="productCardLink">
            <Paper className="productCard">
              <h2>{product.brand}</h2>
              <p>{product.model}</p>
              <p>{product.description}</p>
              <p>Atanan kişi ID:  {product.assignedPersonId}</p>
              <p>ID: {product.id}</p>
            </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default ProductPage;
