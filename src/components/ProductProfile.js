import React, { useEffect, useState } from 'react';
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
  const [editedProduct, setEditedProduct] = useState({});
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [persons, setPersons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const productCollection = collection(db, 'products');
      const q = query(productCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log(`No product found with ID: ${id}`);
        return;
      }
      querySnapshot.forEach(async (doc) => {
        const productData = doc.data();
        
        // Atanan kişiye ait bilgileri çekme
        const personCollection = collection(db, 'people');
        const personQuery = query(personCollection, where("id", "==", productData.assignedPersonId));
        const personQuerySnapshot = await getDocs(personQuery);
        personQuerySnapshot.forEach((personDoc) => {
          const personData = personDoc.data();
          productData.assignedPersonName = personData.name;
          productData.assignedPersonSurname = personData.surname;
        });
  
        setProduct(productData);
        setEditedProduct(productData);
        setDocId(doc.id);
      });
    };
  
    fetchProduct();
  }, [id]);
  

  
  
  
  

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
    setEditedProduct({
      ...editedProduct,
      assignedPersonId: id,
      assignedPersonName: `${name} ${surname}` // isim ve soyisim bilgilerini birleştiriyoruz
    });
    setPersonDialogOpen(false);
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
      assignedPersonName: editedProduct.assignedPersonName,
    };

    if (docId) {
      const docRef = doc(db, 'products', docId);
      await updateDoc(docRef, updatedProduct);
      setProduct(updatedProduct);
      setEditDialogOpen(false);
    } else {
      console.log("No document ID found");
    }
  };

  const handleDeleteProduct = async () => {
    if(window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
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
      <p>Atanan Kişi: - {product.assignedPersonName} {product.assignedPersonSurname} - ID: ( {product.assignedPersonId} )  </p>
      <p>ID: {product.id}</p>
      <Button onClick={handleOpenEditDialog}>Düzenle</Button>
      <Button onClick={handleDeleteProduct}>Ürünü Sil</Button>
      <Button onClick={goToHomePage}>Anasayfa</Button>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Ürün Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus 
            margin="dense" 
            name="brand" 
            label="Marka" 
            value={editedProduct.brand} 
            onChange={handleProductChange} 
            fullWidth 
          />
          <TextField 
            margin="dense" 
            name="model" 
            label="Model" 
            value={editedProduct.model} 
            onChange={handleProductChange} 
            fullWidth 
          />
          <TextField 
            margin="dense" 
            name="description" 
            label="Açıklama" 
            value={editedProduct.description} 
            onChange={handleProductChange} 
            fullWidth 
          />
          <TextField 
            margin="dense" 
            name="price" 
            label="Ürün Fiyatı" 
            value={editedProduct.price} 
            onChange={handleProductChange} 
            fullWidth 
          />
          <TextField 
            margin="dense" 
            name="purchaseDate" 
            label="Satın Alma Tarihi" 
            value={editedProduct.purchaseDate} 
            onChange={handleProductChange} 
            fullWidth 
          />
          <TextField 
            margin="dense" 
            name="registerDate" 
            label="Sisteme Kayıt Tarihi" 
            value={editedProduct.registerDate} 
            onChange={handleProductChange} 
            fullWidth 
          />
          <Button onClick={() => setPersonDialogOpen(true)}>Kişi Seç</Button>
          <TextField 
            margin="dense" 
            name="assignedPersonId" 
            label="Atanan Kişi ID" 
            value={editedProduct.assignedPersonId} 
            onChange={handleProductChange} 
            fullWidth 
          />
          <TextField 
            margin="dense" 
            name="id" 
            label="ID" 
            value={editedProduct.id} 
            onChange={handleProductChange} 
            fullWidth 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>İptal</Button>
          <Button onClick={handleUpdateProduct}>Güncelle</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={personDialogOpen} onClose={() => setPersonDialogOpen(false)}>
        <DialogTitle>Kişi Ata</DialogTitle>
        <DialogContent>
        {persons.map(person => (
  <Button onClick={() => handleAssignPerson(person.id, person.name, person.surname)}>{person.name} {person.surname}</Button> // isim ve soyisim bilgilerini gönderiyoruz
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
