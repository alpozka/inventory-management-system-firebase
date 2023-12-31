import React, { useEffect, useState } from 'react';
import { collection, getDocs} from 'firebase/firestore';
import { db } from './firebase';
import { Grid, Paper, Typography, Dialog, DialogTitle, DialogContent, Checkbox, Button, FormControlLabel, DialogActions, Box } from '@mui/material';
import '../styles/ProductPage.css';
import { IconButton, Snackbar, Alert } from '@mui/material';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


function ProductPage() {
  const [products, setProducts] = useState([]);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [onlyIds, setOnlyIds] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const { t } = useTranslation();


  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
      setSelectedProducts(productsList.map(() => false));  // initialize selectedProducts with all products unselected
    };

    fetchProducts();
  }, []);

  const handlePrint = () => {
    if (selectedProducts.some((isSelected) => isSelected)) {
      const toPrint = products.filter((_, index) => selectedProducts[index]);
      let printContent = '';
      toPrint.forEach(product => {
        if (onlyIds) {
          printContent += `${product.id}\n`;
        } else {
          printContent += `ID: ${product.id}, Marka: ${product.brand}, Model: ${product.model}, Açıklama: ${product.description}\n`;
        }
      });
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<pre style="font-size: ${fontSize}px">${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    } else {
      setSnackbarMessage(t('productPage.mustSelectProduct'));
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="product-page-full-height">
      <div style={{ position: 'relative', height: '100%' }}>
      <IconButton component={Link} to="/" className="back-button" color="primary">
        <ArrowBackTwoToneIcon />
      </IconButton>
      <Button style={{position: 'absolute', top: 5, right: 20}} variant="outlined" onClick={() => setPrintDialogOpen(true)}>{t('productPage.printButton')}</Button>
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
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)}>
        <DialogTitle>{t('productPage.dialogTitle')}</DialogTitle>
        <DialogContent>
          {products.map((product, index) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedProducts[index]}
                  onChange={(event) => {
                    const newSelectedProducts = [...selectedProducts];
                    newSelectedProducts[index] = event.target.checked;
                    setSelectedProducts(newSelectedProducts);
                  }}
                />
              }
              label={`${product.brand} ${product.model} (${product.id})`}
              key={index}
            />
          ))}
          <Button variant="outlined" onClick={() => setSelectedProducts(products.map(() => true))}>{t('productPage.selectAllButton')}</Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyIds}
                onChange={(event) => setOnlyIds(event.target.checked)}
              />
            }
            label={t('productPage.onlyPrintIDsLabel')}
          />
          <Box>
            <Typography variant="body1">{t('productPage.fontSizeLabel')}: </Typography>
            <input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} min={8} max={72} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint}>{t('productPage.printButton')}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
      <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
      </div>
    </div>
  );
}

export default ProductPage;
