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

const PersonForm = ({ open, handleClose }) => {
  const [name, setName] = React.useState('');
  const [surname, setSurname] = React.useState('');
  const [title, setTitle] = React.useState('');

  const handleAdd = async () => {
    // Validation
    if (name === '' || surname === '' || title === '') {
      alert('Please fill out all fields');
      return;
    }

    const id = generateId();

    // Add to firebase
    try {
      await addDoc(collection(db, 'people'), {
        id,
        name,
        surname,
        title
      });
      // Reset the fields and close the dialog
      setName('');
      setSurname('');
      setTitle('');
      handleClose();
      alert('Kayıt başarılı');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Kişi Ekle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Lütfen kişi bilgilerini aşağıya girin.
          </DialogContentText>
          <TextField autoFocus margin="dense" id="name" label="Ad" type="text" fullWidth value={name} onChange={e => setName(e.target.value)} />
          <TextField margin="dense" id="surname" label="Soyad" type="text" fullWidth value={surname} onChange={e => setSurname(e.target.value)} />
          <TextField margin="dense" id="title" label="Ünvan" type="text" fullWidth value={title} onChange={e => setTitle(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleAdd}>Ekle</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PersonForm;
