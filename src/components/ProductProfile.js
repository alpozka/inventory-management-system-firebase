import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import '../styles/ProductProfile.css';

function ProductProfile() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [docId, setDocId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ assignedPersonId: [] });
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [persons, setPersons] = useState([]);
  const navigate = useNavigate();

  const fetchProduct = useCallback(async () => {
    const productCollection = collection(db, 'products');
    const q = query(productCollection, where('id', '==', id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setProduct(doc.data());
      setDocId(doc.id);
      const productData = doc.data();
      setEditedProduct({
        ...productData,
        assignedPersonId: Array.isArray(productData.assignedPersonId)
          ? productData.assignedPersonId
          : [productData.assignedPersonId],
      });
    });
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const fetchPersons = async () => {
    const personCollection = collection(db, 'people');
    const querySnapshot = await getDocs(personCollection);
    const persons = [];
    querySnapshot.forEach((doc) => {
      persons.push(doc.data());
    });
    setPersons(persons);
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleAssignPerson = (id, name, surname) => {
    setEditedProduct(prevState => ({
      ...prevState,
      assignedPersonId: [...prevState.assignedPersonId, id],
      assignedPersonsName: `${name} ${surname}`
    }));
    setPersonDialogOpen(false);
  };

  const handleRemoveAssignedPerson = (personId) => {
    setEditedProduct(prevState => ({
      ...prevState,
      assignedPersonId: prevState.assignedPersonId.filter(id => id !== personId),
    }));
    setRemoveDialogOpen(false);
  };

  const handleOpenRemoveDialog = () => {
    setRemoveDialogOpen(true);
  };

  const handleCloseRemoveDialog = () => {
    setRemoveDialogOpen(false);
  };

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleProductChange = (e) => {
    setEditedProduct({
      ...editedProduct,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProduct = async () => {
    if (!editedProduct.brand.trim() || !editedProduct.model.trim()) {
      alert("Marka ve Model alanları boş bırakılamaz!");
      return;
    }
  
    const updatedProduct = {
      ...editedProduct,
      brandLowerCase: editedProduct.brand.toLowerCase(),
      modelLowerCase: editedProduct.model.toLowerCase(),
      assignedPersonId: editedProduct.assignedPersonId,
    };
  
    if (editedProduct.assignedPersonId.length > 0) {
      const assignedPersons = editedProduct.assignedPersonId.map((personId) => {
        const assignedPerson = persons.find((person) => person.id === personId);
        return assignedPerson ? `${assignedPerson.name} ${assignedPerson.surname}` : null;
      });
      updatedProduct.assignedPersonName = assignedPersons.filter((name) => name !== null).join(', ');
    } else {
      updatedProduct.assignedPersonName = '';
    }
  
    if (docId) {
      const docRef = doc(db, 'products', docId);
      await updateDoc(docRef, updatedProduct);
      setProduct(updatedProduct);
      setEditDialogOpen(false);
    } else {
      console.log("No document ID found");
    }
  };

  const handleDeletePerson = async (personId) => {
    if (window.confirm('Bu kişiyi silmek istediğinize emin misiniz?')) {
      const docRef = doc(db, 'people', personId);
      await deleteDoc(docRef);
      fetchPersons(); // Kişi silindikten sonra listeyi güncelliyoruz
    }
  };

  const handleDeleteProduct = async () => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      if (docId) {
        const docRef = doc(db, 'products', docId);
        await deleteDoc(docRef);
        alert('Silme işlemi başarıyla tamamlandı.');
        navigate("/home");
      }
    }
  };

  const goToHomePage = () => {
    navigate("/home");
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-profile-container">
      <h2>Ürün</h2>
      <p>Marka: {product.brand}</p>
      <p>Model: {product.model}</p>
      <p>Açıklama: {product.description}</p>
      <p>Ürün Fiyatı: {product.price}</p>
      <p>Satın Alma Tarihi: {product.purchaseDate}</p>
      <p>Sisteme Kayıt Tarihi: {product.registerDate}</p>
      <p>
        Atanan Kişi: {(Array.isArray(product.assignedPersonId) ? product.assignedPersonId : [product.assignedPersonId]).map((personId) => {
          const assignedPerson = persons.find((person) => person.id === personId);
          return assignedPerson 
            ? (
              <>
                {`${assignedPerson.name} ${assignedPerson.surname} (ID: ${personId})`}
                {/* <Button onClick={() => handleRemoveAssignedPerson(personId)}>Sil</Button> */}
              </>
            ) 
            : null;
        })}
      </p>
      <p>ID: {product.id}</p>
      <Button onClick={handleOpenEditDialog}>Düzenle</Button>
      <Button onClick={handleDeleteProduct}>Bu Ürünü Sil</Button>
      <Button onClick={goToHomePage}>Ana Sayfaya Dön</Button>
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Düzenle</DialogTitle>
        <DialogContent>
        <TextField autoFocus margin="dense" name="brand" label="Marka" type="text" fullWidth value={editedProduct.brand} onChange={handleProductChange} />
          <TextField margin="dense" name="model" label="Model" type="text" fullWidth value={editedProduct.model} onChange={handleProductChange} />
          <TextField margin="dense" name="description" label="Açıklama" type="text" fullWidth value={editedProduct.description} onChange={handleProductChange} />
          <TextField margin="dense" name="price" label="Fiyat" type="text" fullWidth value={editedProduct.price} onChange={handleProductChange} />
          <TextField margin="dense" name="purchaseDate" label="Satın Alma Tarihi" type="text" fullWidth value={editedProduct.purchaseDate} onChange={handleProductChange} />
          <TextField margin="dense" name="registerDate" label="Sisteme Kayıt Tarihi" type="text" fullWidth value={editedProduct.registerDate} onChange={handleProductChange} />
          <Button onClick={() => setPersonDialogOpen(true)}>Kişi Ata</Button>
          <Button onClick={handleOpenRemoveDialog}>Atanan Kişiyi Sil</Button>
          <TextField 
            margin="dense" 
            name="assignedPersonId" 
            label="Atanan Kişi ID" 
            value={editedProduct.assignedPersonId} 
            onChange={handleProductChange} 
            fullWidth 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>İptal</Button>
          <Button onClick={handleUpdateProduct}>Güncelle</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeDialogOpen} onClose={handleCloseRemoveDialog}>
        <DialogTitle>Atanan Kişiyi Sil</DialogTitle>
        <DialogContent>
          {(Array.isArray(editedProduct.assignedPersonId) ? editedProduct.assignedPersonId : [editedProduct.assignedPersonId]).map((personId) => {
            const assignedPerson = persons.find((person) => person.id === personId);
            return assignedPerson 
              ? (
                <Button key={personId} onClick={() => handleRemoveAssignedPerson(personId)}>
                  {`${assignedPerson.name} ${assignedPerson.surname}`}
                </Button>
              ) 
              : null;
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog}>İptal</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={personDialogOpen} onClose={() => setPersonDialogOpen(false)}>
        <DialogTitle>Kişi Ata</DialogTitle>
        <DialogContent>
          {persons.map((person) => (
            <div key={person.id}>
              <Button onClick={() => handleAssignPerson(person.id, person.name, person.surname)}>
                {`${person.name} ${person.surname}`}
              </Button>
              {/* <Button onClick={() => handleDeletePerson(person.id)}>Sil</Button> */}
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPersonDialogOpen(false)}>İptal</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProductProfile;

