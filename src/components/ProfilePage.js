import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import '../styles/ProfilePage.css';
import { Link } from 'react-router-dom';


function ProfilePage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [docId, setDocId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedPerson, setEditedPerson] = useState({assignedDeviceOrSoftwareId: []});
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [unassignProductDialogOpen, setUnassignProductDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
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

  const fetchProducts = async () => {
    const productCollection = collection(db, 'products');
    const querySnapshot = await getDocs(productCollection);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push(doc.data());
    });
    setProducts(products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAssignProduct = (id) => {
    setEditedPerson((prevPerson) => {
      const updatedAssignedDevices = [...prevPerson.assignedDeviceOrSoftwareId, id];
      return {
        ...prevPerson,
        assignedDeviceOrSoftwareId: updatedAssignedDevices,
      };
    });
    setProductDialogOpen(false);
  };

  const handleUnassignProduct = (id) => {
    setEditedPerson((prevPerson) => {
      const updatedAssignedDevices = prevPerson.assignedDeviceOrSoftwareId.filter(deviceId => deviceId !== id);
      return {
        ...prevPerson,
        assignedDeviceOrSoftwareId: updatedAssignedDevices,
      };
    });
    setUnassignProductDialogOpen(false);
  };

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handlePersonChange = (e) => {
    const value = e.target.name === "assignedDeviceOrSoftwareId" ? e.target.value.split(',').map(item => item.trim()) : e.target.value;
    setEditedPerson({
      ...editedPerson,
      [e.target.name]: value
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
    if (window.confirm('Are you sure you want to delete this person?')) {
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
      <p>Atanan Ürünler:</p>
      <ul>
  {person.assignedDeviceOrSoftwareId.map(id => {
    const product = products.find(product => product.id === id);
    if (product) {
      return (
        <li key={id}>
          <Link to={`/ProductProfile/${id}`}>{id}</Link>
          <p>Marka: {product.brand}</p>
          <p>Model: {product.model}</p>
        </li>
      );
    }
    return null;
  })}
</ul>

<p>Açıklama: {person.description}</p>
      <p>ID: {person.id}</p>
      <Button onClick={handleOpenEditDialog}>Düzenle</Button>
      <Button onClick={handleDeletePerson}>Kişiyi Sil</Button>
      <Button onClick={goToHomePage}>Anasayfa</Button>
  
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
          <DialogTitle>Kişi Düzenle</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Ad"
              value={editedPerson.name}
              onChange={handlePersonChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="surname"
              label="Soyad"
              value={editedPerson.surname}
              onChange={handlePersonChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="title"
              label="Unvan"
              value={editedPerson.title}
              onChange={handlePersonChange}
              fullWidth
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
            <Button onClick={() => setProductDialogOpen(true)}>Atanacak Ürünü Seç</Button>
            <Button onClick={() => setUnassignProductDialogOpen(true)}>Atanan Ürünü Sil</Button>
          <TextField
            margin="dense"
            name="assignedDeviceOrSoftwareId"
            label="Atanan Ürün ID"
            value={editedPerson.assignedDeviceOrSoftwareId.join(', ')}
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
            <Button onClick={handleCloseEditDialog}>İptal</Button>
            <Button onClick={handleUpdatePerson}>Kaydet</Button>
          </DialogActions>
        </Dialog>
  
        <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)}>
          <DialogTitle>Ürün Ata</DialogTitle>
          <DialogContent>
            {products.map((product) => (
              <Button key={product.id} onClick={() => handleAssignProduct(product.id)}>
                {product.brand} {product.model}
              </Button>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductDialogOpen(false)}>İptal</Button>
          </DialogActions>
        </Dialog>
  
        <Dialog open={unassignProductDialogOpen} onClose={() => setUnassignProductDialogOpen(false)}>
          <DialogTitle>Ürün Sil</DialogTitle>
          <DialogContent>
            {editedPerson.assignedDeviceOrSoftwareId.map(id => {
              const product = products.find(product => product.id === id);
              if (product) {
                return (
                  <Button key={id} onClick={() => handleUnassignProduct(id)}>{product.brand} {product.model}</Button>
                );
              }
              return null;
            })}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnassignProductDialogOpen(false)}>İptal</Button>
          </DialogActions>
        </Dialog>
  
      </div>
    );
  }
  
  export default ProfilePage;
  