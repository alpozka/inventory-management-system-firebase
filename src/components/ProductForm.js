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
      alert('Ürün başarıyla eklendi');
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
        <DialogTitle>Ürün Ekle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Lütfen ürün bilgilerini aşağıya girin. (*) işaretli alanlar zorunludur.
          </DialogContentText>
          <TextField autoFocus margin="dense" id="brand" label="Marka *" type="text" fullWidth value={brand} onChange={e => setBrand(e.target.value)} error={hasError && brand === ''} helperText={hasError && brand === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="model" label="Model *" type="text" fullWidth value={model} onChange={e => setModel(e.target.value)} error={hasError && model === ''} helperText={hasError && model === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="description" label="Açıklama *" type="text" fullWidth value={description} onChange={e => setDescription(e.target.value)} error={hasError && description === ''} helperText={hasError && description === '' && "Bu alanın doldurulması zorunludur."}/>
          <TextField margin="dense" id="purchaseDate" label="Satın Alınma Tarihi" type="date" fullWidth value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" id="registrationDate" label="Sisteme Kayıt Tarihi *" type="date" fullWidth value={registrationDate} onChange={e => setRegistrationDate(e.target.value)} InputLabelProps={{ shrink: true }} error={hasError && registrationDate === ''} helperText={hasError && registrationDate === '' && "Bu alanın doldurulması zorunludur."}/>
          <Button onClick={() => setPersonDialogOpen(true)}>Kişi Seç</Button>
          <TextField
            margin="dense"
            id="assignedPersonId"
            label="Atanan Cihaz veya Yazılım IDsi"
            type="text"
            fullWidth
            value={assignedPersonId.join(', ')} 
            onChange={e => setAssignedPersonId(e.target.value.split(', '))} // Allow manual entry of ids as a comma-separated list
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleAdd}>Ekle</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={personDialogOpen} onClose={() => setPersonDialogOpen(false)}>
        <DialogTitle>Kişi Ata</DialogTitle>
        <DialogContent>
          {persons.map(person => (
            <Button key={person.id} onClick={() => handleAssignPerson(person.id)}>{person.name} {person.surname}</Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPersonDialogOpen(false)}>İptal</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductForm;
