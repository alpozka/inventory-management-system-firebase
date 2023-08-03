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

const ProductForm = ({ open, handleClose }) => {
  const [brand, setBrand] = React.useState('');
  const [model, setModel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [purchaseDate, setPurchaseDate] = React.useState('');
  const [registrationDate, setRegistrationDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [assignedPersonId, setAssignedPersonId] = React.useState([]);
  const [price, setPrice] = React.useState('');
  const [hasError, setHasError] = React.useState(false);
  const [personDialogOpen, setPersonDialogOpen] = React.useState(false);
  const [persons, setPersons] = React.useState([]);
  const { t } = useTranslation();

  const fetchPersons = async () => {
    const personsCollection = collection(db, 'people');
    const querySnapshot = await getDocs(personsCollection);
    const persons = [];
    querySnapshot.forEach((doc) => {
      persons.push(doc.data());
    });
    setPersons(persons);
  };

  React.useEffect(() => {
    fetchPersons();
  }, []);

  const handleAdd = async () => {
    if (brand === '' || model === '' || description === '') {
      setHasError(true);
      return;
    }
    setHasError(false);
  
    const id = generateId();
  
    try {
      await addDoc(collection(db, 'products'), {
        id,
        idLowerCase: id.toLowerCase(),
        brand,
        brandLowerCase: brand.toLowerCase(),
        model,
        modelLowerCase: model.toLowerCase(),
        price,
        purchaseDate,
        registrationDate,
        description,
      });
      await setDoc(doc(db, 'assignments', id), {
        assigned: assignedPersonId,
      });
  for (let personId of assignedPersonId) {
    const personRef = doc(db, 'people', personId);
    const personDoc = await getDoc(personRef);
    if (personDoc.exists()) {
      let assigned = personDoc.data().assigned || [];
      assigned.push(id); 
      await updateDoc(personRef, { assigned });
    } else {
      console.error(`Person document not found: ${personId}`);
    }
    
    const assignmentRef = doc(db, 'assignments', personId);
    const assignmentDoc = await getDoc(assignmentRef);
    if (assignmentDoc.exists()) {
      let assigned = assignmentDoc.data().assigned || [];
      if (!assigned.includes(id)) {
        assigned.push(id); 
        await updateDoc(assignmentRef, { assigned });
      }
    } else {
      await setDoc(assignmentRef, { assigned: [id] });
    }
  }
  
      setBrand('');
      setModel('');
      setDescription('');
      setPurchaseDate('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      setAssignedPersonId([]);
      setPrice('');
      handleClose();
      alert(t('productForm.assignedSuccessfully'));
      window.location.reload();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  

  const handleAssignPerson = async (personId) => {
    setAssignedPersonId((prev) => [...prev, personId]);
    setPersonDialogOpen(false);
    const personRef = doc(db, 'people', personId);
    const personDoc = await getDoc(personRef);
    if (personDoc.exists()) {
      let assigned = personDoc.data().assigned || [];
      assigned.push(generateId()); 
      await updateDoc(personRef, { assigned });
    } else {
      console.error(`Person document not found: ${personId}`);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t('productForm.addProduct')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('productForm.enterProductDetails')}
          </DialogContentText>
          <TextField autoFocus margin="dense" id="brand" label={t('productForm.brand')} type="text" fullWidth value={brand} onChange={e => setBrand(e.target.value)} error={hasError && brand === ''} helperText={hasError && brand === '' && t('productForm.brandError')}/>
          <TextField margin="dense" id="model" label={t('productForm.model')} type="text" fullWidth value={model} onChange={e => setModel(e.target.value)} error={hasError && model === ''} helperText={hasError && model === '' && t('productForm.modelError')}/>
          <TextField margin="dense" id="description" label={t('productForm.description')} type="text" fullWidth value={description} onChange={e => setDescription(e.target.value)} error={hasError && description === ''} helperText={hasError && description === '' && t('productForm.descriptionError')}/>
          <TextField margin="dense" id="purchaseDate" label={t('productForm.purchaseDate')} type="date" fullWidth value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" id="registrationDate" label={t('productForm.registrationDate')} type="date" fullWidth value={registrationDate} onChange={e => setRegistrationDate(e.target.value)} InputLabelProps={{ shrink: true }} error={hasError && registrationDate === ''} helperText={hasError && registrationDate === '' && t('productForm.registrationDateError')}/>
          <Button onClick={() => setPersonDialogOpen(true)}>{t('productForm.selectPerson')}</Button>
          <TextField
            margin="dense"
            id="assignedPersonId"
            label={t('productForm.assignedDeviceOrSoftwareId')}
            type="text"
            fullWidth
            value={assignedPersonId.join(', ')} 
            onChange={e => setAssignedPersonId(e.target.value.split(', '))} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('productForm.cancel')}</Button>
          <Button onClick={handleAdd}>{t('productForm.add')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={personDialogOpen} onClose={() => setPersonDialogOpen(false)}>
        <DialogTitle>{t('productForm.assignPerson')}</DialogTitle>
        <DialogContent>
          {persons.map(person => (
            <Button key={person.id} onClick={() => handleAssignPerson(person.id)}>{person.name} {person.surname}</Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPersonDialogOpen(false)}>{t('productForm.cancel')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductForm;
