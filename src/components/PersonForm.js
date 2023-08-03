import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { collection, addDoc, setDoc, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        surnameLowerCase: surname.toLowerCase(),
        title,
        titleLowerCase: title.toLowerCase(),
        joiningDate,
        registrationDate,
        description,
      });
  
      // Create assignments record for this person
      await setDoc(doc(db, 'assignments', id), {
        assigned: assignedDeviceOrSoftwareId,
      });
  
      // Update each assigned product to include the person's ID
  for (let productId of assignedDeviceOrSoftwareId) {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    if (productDoc.exists()) {
      let assigned = productDoc.data().assigned || [];
      assigned.push(id); 
      await updateDoc(productRef, { assigned });
    } else {
      console.error(`Product document not found: ${productId}`);
    }

    // Check if an assignment exists for this product
    const assignmentRef = doc(db, 'assignments', productId);
    const assignmentDoc = await getDoc(assignmentRef);
    if (assignmentDoc.exists()) {
      // If an assignment exists, add the new person to the assigned list
      let assigned = assignmentDoc.data().assigned || [];
      if (!assigned.includes(id)) {
        assigned.push(id); 
        await updateDoc(assignmentRef, { assigned });
      }
    } else {
      // If no assignment exists, create a new one with the person in the assigned list
      await setDoc(assignmentRef, { assigned: [id] });
    }
  }
  
      setName('');
      setSurname('');
      setTitle('');
      setJoiningDate('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      setAssignedDeviceOrSoftwareId([]);
      setDescription('');
      handleClose();
      alert(t('profileForm.assignedSuccessfully'));
      window.location.reload();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  

  const handleAssignProduct = async (productId) => {
    setAssignedDeviceOrSoftwareId((prev) => [...prev, productId]);
    setProductDialogOpen(false);
  
    // Ürün belgesini güncelle
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    if (productDoc.exists()) {
      let assigned = productDoc.data().assigned || [];
      assigned.push(generateId()); 
      await updateDoc(productRef, { assigned });
    } else {
      console.error(`Product document not found: ${productId}`);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t('profileForm.addPerson')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
          {t('profileForm.enterPersonDetails')}
          </DialogContentText>
          <TextField autoFocus margin="dense" id="name" label={t('profileForm.name')} type="text" fullWidth value={name} onChange={e => setName(e.target.value)} error={hasError && name === ''} helperText={hasError && name === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="surname" label={t('profileForm.surname')} type="text" fullWidth value={surname} onChange={e => setSurname(e.target.value)} error={hasError && surname === ''} helperText={hasError && surname === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="title" label={t('profileForm.title')} type="text" fullWidth value={title} onChange={e => setTitle(e.target.value)} error={hasError && title === ''} helperText={hasError && title === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="joiningDate" label={t('profileForm.joiningDate')} type="date" fullWidth value={joiningDate} onChange={e => setJoiningDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" id="registrationDate" label={t('profileForm.registrationDate')} type="date" fullWidth value={registrationDate} onChange={e => setRegistrationDate(e.target.value)} InputLabelProps={{ shrink: true }} error={hasError && registrationDate === ''} helperText={hasError && registrationDate === '' && "Bu alanın doldurulması zorunludur."}/>
          <Button onClick={() => setProductDialogOpen(true)}>{t('profileForm.selectProduct')}</Button>
          <TextField
            margin="dense"
            id="assignedDeviceOrSoftwareId"
            label={t('profileForm.assignedDeviceOrSoftwareId')}
            type="text"
            fullWidth
            value={assignedDeviceOrSoftwareId.join(', ')} // Show assigned ids as a comma-separated list
            onChange={e => setAssignedDeviceOrSoftwareId(e.target.value.split(', '))} // Allow manual entry of ids as a comma-separated list
          />
          <TextField margin="dense" id="description" label={t('profileForm.description')} type="text" fullWidth value={description} onChange={e => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('profileForm.cancel')}</Button>
          <Button onClick={handleAdd}>{t('profileForm.add')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)}>
        <DialogTitle>{t('profileForm.assignProduct')}</DialogTitle>
        <DialogContent>
          {products.map(product => (
            <Button key={product.id} onClick={() => handleAssignProduct(product.id)}>{product.brand} {product.model}</Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>{t('profileForm.cancel')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PersonForm;
