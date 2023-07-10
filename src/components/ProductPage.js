import React, { useEffect, useState } from 'react';
import { collection, getDocs} from 'firebase/firestore';
import { db } from './firebase';
import { Grid, Paper, Typography } from '@mui/material';
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
      <Grid container spacing={3} className='product-grid'>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Link to={`/ProductProfile/${product.id}`} className="productCardLink">
            <Paper className="productCard">
                <Typography variant="h5" className="product-name">{product.brand}</Typography>
                <Typography variant="body2" className="product-details">{product.model}</Typography>
                <Typography variant="body2" className="product-details">{product.id}</Typography>
                <Typography variant="body2" className="product-details">{product.description}</Typography>
            </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default ProductPage;