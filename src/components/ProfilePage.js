import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [docId, setDocId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedPerson, setEditedPerson] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerson = async () => {
      const peopleCollection = collection(db, 'people');
      const q = query(peopleCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setPerson(doc.data());
        setEditedPerson(doc.data());
        setDocId(doc.id);
      });
    };

    fetchPerson();
  }, [id]);

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handlePersonChange = (e) => {
    setEditedPerson({
      ...editedPerson,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdatePerson = async () => {
    if (!editedPerson.name.trim() || !editedPerson.surname.trim() || !editedPerson.title.trim()) {
      alert("İsim, Soyisim ve Unvan alanları boş bırakılamaz!");
      return;
    }

    const updatedPerson = {
      ...editedPerson,
      nameLowerCase: editedPerson.name.toLowerCase(),
      surnameLowerCase: editedPerson.surname.toLowerCase(),
      titleLowerCase: editedPerson.title.toLowerCase(),
    };

    if (docId) {
      const docRef = doc(db, 'people', docId);
      await updateDoc(docRef, updatedPerson);
      setPerson(updatedPerson);
      setEditDialogOpen(false);
    } else {
      console.log("No document ID found");
    }
  };

  const handleDeletePerson = async () => {
    if(window.confirm('Are you sure you want to delete this person?')) {
      if (docId) {
        const docRef = doc(db, 'people', docId);
        await deleteDoc(docRef);
        alert('Silme işlemi başarıyla tamamlandı.');
        navigate("/home");
      }
    }
  };

  const goToHomePage = () => {
    navigate("/home");
  };

  if (!person) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="profile-container">
      <h2>Kişi</h2>
      <p>Ad: {person.name}</p>
      <p>Soyad: {person.surname}</p>
      <p>Ünvan: {person.title}</p>
      <p>İşe giriş tarihi: {person.joiningDate}</p>
      <p>Sisteme Kayıt Tarihi: {person.registrationDate}</p>
      <p>Atanan Ürün Id: {person.assignedDeviceOrSoftwareId}</p>
      <p>Açıklama: {person.description}</p>
      <p>ID: {person.id}</p>
      <Button onClick={handleOpenEditDialog}>Düzenle</Button>
      <Button onClick={handleDeletePerson}>Kişiyi Sil</Button>
      <Button onClick={goToHomePage}>Anasayfa</Button>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Kişi Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
  <TextField 
    autoFocus 
    margin="dense" 
    name="name" 
    label="Ad" 
    value={editedPerson.name} 
    onChange={handlePersonChange} 
    fullWidth 
    error={!editedPerson.name.trim()}
    helperText={!editedPerson.name.trim() && "Ad alanı boş bırakılamaz."}
  />
  <TextField 
    margin="dense" 
    name="surname" 
    label="Soyad" 
    value={editedPerson.surname} 
    onChange={handlePersonChange} 
    fullWidth 
    error={!editedPerson.surname.trim()}
    helperText={!editedPerson.surname.trim() && "Soyad alanı boş bırakılamaz."}
  />
  <TextField 
    margin="dense" 
    name="title" 
    label="Unvan" 
    value={editedPerson.title} 
    onChange={handlePersonChange} 
    fullWidth 
    error={!editedPerson.title.trim()}
    helperText={!editedPerson.title.trim() && "Ünvan alanı boş bırakılamaz."}
  />
  <TextField 
    margin="dense" 
    name="joiningDate" 
    label="İşe Giriş Tarihi" 
    type="date" 
    value={editedPerson.joiningDate} 
    onChange={handlePersonChange} 
    fullWidth 
  />
  <TextField 
    margin="dense" 
    name="registrationDate" 
    label="Kayıt Tarihi" 
    type="date"   
    value={editedPerson.registrationDate} 
    onChange={handlePersonChange} 
    fullWidth 
    error={!editedPerson.registrationDate}
    helperText={!editedPerson.registrationDate && "Kayıt Tarihi alanı boş bırakılamaz."}
  />
  <TextField 
    margin="dense" 
    name="assignedDeviceOrSoftwareId" 
    label="Atanan Cihaz veya Yazılım ID" 
    value={editedPerson.assignedDeviceOrSoftwareId} 
    onChange={handlePersonChange} 
    fullWidth 
  />
  <TextField 
    margin="dense" 
    name="description" 
    label="Açıklama" 
    value={editedPerson.description} 
    onChange={handlePersonChange} 
    fullWidth 
  />
</DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Vazgeç</Button>
          <Button onClick={handleUpdatePerson}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProfilePage;
