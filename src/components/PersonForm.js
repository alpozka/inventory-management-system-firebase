import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from './firebase';

function generateId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const PersonForm = ({ open, handleClose }) => {
  const [name, setName] = React.useState('');
  const [surname, setSurname] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [joiningDate, setJoiningDate] = React.useState('');
  const [registrationDate, setRegistrationDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [assignedDeviceOrSoftwareId, setAssignedDeviceOrSoftwareId] = React.useState([]);
  const [description, setDescription] = React.useState('');
  const [hasError, setHasError] = React.useState(false);
  const [productDialogOpen, setProductDialogOpen] = React.useState(false);
  const [products, setProducts] = React.useState([]);

  const fetchProducts = async () => {
    const productsCollection = collection(db, 'products');
    const querySnapshot = await getDocs(productsCollection);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push(doc.data());
    });
    setProducts(products);
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    if (name === '' || surname === '' || title === '' || registrationDate === '') {
      setHasError(true);
      return;
    }
    setHasError(false);

    const id = generateId();

    try {
      await addDoc(collection(db, 'people'), {
        id,
        idLowerCase: id.toLowerCase(),
        name,
        nameLowerCase: name.toLowerCase(),
        surname,
        surnamenameLowerCase: surname.toLowerCase(),
        title,
        titleLowerCase: title.toLowerCase(),
        joiningDate,
        registrationDate,
        assignedDeviceOrSoftwareId,
        description
      });
      setName('');
      setSurname('');
      setTitle('');
      setJoiningDate('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      setAssignedDeviceOrSoftwareId([]);
      setDescription('');
      handleClose();
      alert('Kayıt başarılı');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleAssignProduct = (id) => {
    setAssignedDeviceOrSoftwareId(prev => [...prev, id]);
    setProductDialogOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Kişi Ekle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Lütfen kişi bilgilerini aşağıya girin. (*) işaretli alanlar zorunludur.
          </DialogContentText>
          <TextField autoFocus margin="dense" id="name" label="Ad *" type="text" fullWidth value={name} onChange={e => setName(e.target.value)} error={hasError && name === ''} helperText={hasError && name === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="surname" label="Soyad *" type="text" fullWidth value={surname} onChange={e => setSurname(e.target.value)} error={hasError && surname === ''} helperText={hasError && surname === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="title" label="Ünvan *" type="text" fullWidth value={title} onChange={e => setTitle(e.target.value)} error={hasError && title === ''} helperText={hasError && title === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="joiningDate" label="İşe Giriş Tarihi" type="date" fullWidth value={joiningDate} onChange={e => setJoiningDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" id="registrationDate" label="Sisteme Kayıt Tarihi *" type="date" fullWidth value={registrationDate} onChange={e => setRegistrationDate(e.target.value)} InputLabelProps={{ shrink: true }} error={hasError && registrationDate === ''} helperText={hasError && registrationDate === '' && "Bu alanın doldurulması zorunludur."}/>
          <Button onClick={() => setProductDialogOpen(true)}>Ürün Seç</Button>
          <TextField
            margin="dense"
            id="assignedDeviceOrSoftwareId"
            label="Atanan Cihaz veya Yazılım IDsi"
            type="text"
            fullWidth
            value={assignedDeviceOrSoftwareId.join(', ')} // Show assigned ids as a comma-separated list
            onChange={e => setAssignedDeviceOrSoftwareId(e.target.value.split(', '))} // Allow manual entry of ids as a comma-separated list
          />
          <TextField margin="dense" id="description" label="Açıklama" type="text" fullWidth value={description} onChange={e => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleAdd}>Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* This is the new dialog for assigning a product */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)}>
        <DialogTitle>Ürün Ata</DialogTitle>
        <DialogContent>
          {products.map(product => (
            <Button key={product.id} onClick={() => handleAssignProduct(product.id)}>{product.brand} {product.model}</Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>İptal</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PersonForm;
