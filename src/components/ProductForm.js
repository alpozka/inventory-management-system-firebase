import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { collection, addDoc } from "firebase/firestore";
import { db } from './firebase';

function generateId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
  const ProductForm = ({ open, handleClose }) => {
  const [productName, setProductName] = React.useState('');
  const [productDescription, setProductDescription] = React.useState('');
  const [productPrice, setProductPrice] = React.useState('');

  const handleAdd = async () => {
    // Validation
    if (productName === '' || productDescription === '' || productPrice === '') {
      alert('Please fill out all fields');
      return;
    }
    

    // Generate a Random ID
    const id = generateId();

    // Add to firebase
    try {
      await addDoc(collection(db, 'products'), {
        id, // Add the generated ID here
        name: productName,
        description: productDescription,
        price: productPrice
      });
      // Reset the fields and close the dialog
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      handleClose();
      alert('Product added successfully');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ürün Ekle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Lütfen ürün bilgilerini aşağıya girin.
          </DialogContentText>
          <TextField autoFocus margin="dense" id="name" label="Ürün Adı" type="text" fullWidth value={productName} onChange={e => setProductName(e.target.value)} />
          <TextField margin="dense" id="description" label="Ürün Açıklaması" type="text" fullWidth value={productDescription} onChange={e => setProductDescription(e.target.value)} />
          <TextField margin="dense" id="price" label="Ürün Fiyatı" type="text" fullWidth value={productPrice} onChange={e => setProductPrice(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleAdd}>Ekle</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProductForm;
