import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
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
  // Set today's date in the format 'yyyy-MM-dd'
  const today = new Date().toISOString().slice(0,10);

  const [productBrand, setProductBrand] = React.useState('');
  const [productDescription, setProductDescription] = React.useState('');
  const [productPrice, setProductPrice] = React.useState('');
  const [purchaseDate, setPurchaseDate] = React.useState('');
  const [registerDate, setRegisterDate] = React.useState(today);
  const [model, setModel] = React.useState('');
  const [assignedPersonId, setAssignedPersonId] = React.useState('');
  const [isUnassigned, setIsUnassigned] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleAdd = async () => {
    // Validation
    if (productBrand === '' || registerDate === '' || model === '' || (!isUnassigned && assignedPersonId === '')) {
      setHasError(true);
      return;
    }
    setHasError(false);

    // Generate a Random ID
    const id = generateId();

    // Add to firebase
    try {
      await addDoc(collection(db, 'products'), {
        id,
        brand: productBrand,
        description: productDescription,
        price: productPrice,
        purchaseDate,
        registerDate,
        model,
        assignedPersonId: isUnassigned ? 'Unassigned' : assignedPersonId
      });
      setProductBrand('');
      setProductDescription('');
      setProductPrice('');
      setPurchaseDate('');
      setRegisterDate(today);
      setModel('');
      setAssignedPersonId('');
      setIsUnassigned(false);
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
            Lütfen ürün bilgilerini aşağıya girin. (*) işaretli alanlar zorunludur.
          </DialogContentText>
          <TextField 
            autoFocus 
            margin="dense" 
            id="brand" 
            label="Marka *" 
            type="text" 
            fullWidth 
            value={productBrand} 
            onChange={e => setProductBrand(e.target.value)}
            error={hasError && productBrand === ''}
            helperText={hasError && productBrand === '' && "Bu alanın doldurulması zorunludur."}
          />
          <TextField 
            margin="dense" 
            id="model" 
            label="Model *" 
            type="text" 
            fullWidth 
            value={model} 
            onChange={e => setModel(e.target.value)}
            error={hasError && model === ''}
            helperText={hasError && model === '' && "Bu alanın doldurulması zorunludur."}
          />
          <TextField 
            margin="dense" 
            id="description" 
            label="Ürün Açıklaması" 
            type="text" 
            fullWidth 
            value={productDescription} 
            onChange={e => setProductDescription(e.target.value)} 
          />
          <TextField 
            margin="dense" 
            id="registerDate" 
            label="Sisteme Kayıt Tarihi *" 
            type="date" 
            fullWidth 
            value={registerDate} 
            onChange={e => setRegisterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={hasError && registerDate === ''}
            helperText={hasError && registerDate === '' && "Bu alanın doldurulması zorunludur."}
          />
          <TextField 
            margin="dense" 
            id="assignedPersonId" 
            label="Atanan Kişi ID *" 
            type="text" 
            fullWidth 
            value={assignedPersonId} 
            onChange={e => setAssignedPersonId(e.target.value)}
            disabled={isUnassigned}
            error={hasError && !isUnassigned && assignedPersonId === ''}
            helperText={hasError && !isUnassigned && assignedPersonId === '' && "Bu alanın doldurulması zorunludur."}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isUnassigned}
                onChange={(e) => setIsUnassigned(e.target.checked)}
                name="unassigned"
                color="primary"
              />
            }
            label="Boşta"
          />
          <TextField 
            margin="dense" 
            id="price" 
            label="Ürün Fiyatı" 
            type="text" 
            fullWidth 
            value={productPrice} 
            onChange={e => setProductPrice(e.target.value)} 
          />
          <TextField 
            margin="dense" 
            id="purchaseDate" 
            label="Satın Alma Tarihi" 
            type="date" 
            fullWidth 
            value={purchaseDate} 
            onChange={e => setPurchaseDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
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
