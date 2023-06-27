import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Grid, Paper } from '@mui/material';
import '../styles/ProductPage.css';

function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = await getDocs(collection(db, 'products'));
      setProducts(productsCollection.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchProducts();
  }, []);

  return (
    <div className="productPage">
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Paper className="productCard">
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>{product.price}</p>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default ProductPage;
