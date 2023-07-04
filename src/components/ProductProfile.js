import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import '../styles/ProductProfile.css';
import  QRCode  from 'react-qr-code';

function ProductProfile() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [docId, setDocId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [qrDialogOpen, setQRDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const productCollection = collection(db, 'products');
      const q = query(productCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setProduct(doc.data());
        setEditedProduct(doc.data());
        setDocId(doc.id);
      }); 
    };

    fetchProduct();
  }, [id]);

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
    if (!editedProduct.brand.trim() || !editedProduct.model.trim() || !editedProduct.price.trim()) {
      alert("Marka, Model ve Fiyat alanları boş bırakılamaz!");
      return;
    }
  
    if (docId) {
      const docRef = doc(db, 'products', docId);
      await updateDoc(docRef, editedProduct);
      setProduct(editedProduct);
      setEditDialogOpen(false);
    } else {
      console.log("No document ID found");
    }
  };

  const handleDeleteProduct = async () => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      if (docId) {
        const docRef = doc(db, 'products', docId);
        await deleteDoc(docRef);
      }
    }
  };

  const handleOpenQRDialog = () => {
    setQRDialogOpen(true);
  };

  const handleCloseQRDialog = () => {
    setQRDialogOpen(false);
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
      <p>Atanan Kişi Id: {product.assignedPersonId}</p>
      <p>ID: {product.id}</p>
      <Button onClick={handleOpenEditDialog}>Düzenle</Button>
      <Button onClick={handleDeleteProduct}>Ürünü Sil</Button>
      <Button onClick={handleOpenQRDialog}>QR Kodu Göster</Button>
  
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
    error={!editedProduct.brand.trim()}
    helperText={!editedProduct.brand.trim() && "Marka alanı boş bırakılamaz."}
  />
  <TextField 
    margin="dense" 
    name="model" 
    label="Model" 
    value={editedProduct.model} 
    onChange={handleProductChange} 
    fullWidth 
    error={!editedProduct.model.trim()}
    helperText={!editedProduct.model.trim() && "Model alanı boş bırakılamaz."}
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
    error={!editedProduct.price.trim()}
    helperText={!editedProduct.price.trim() && "Ürün Fiyatı alanı boş bırakılamaz."}
  />
  <TextField 
    margin="dense" 
    name="purchaseDate" 
    label="Satın Alma Tarihi" 
    type="date" 
    value={editedProduct.purchaseDate} 
    onChange={handleProductChange} 
    fullWidth 
  />
  <TextField 
    margin="dense" 
    name="registerDate" 
    label="Kayıt Tarihi" 
    type="date" 
    value={editedProduct.registerDate} 
    onChange={handleProductChange} 
    fullWidth 
  />
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
          <Button onClick={handleCloseEditDialog}>Vazgeç</Button>
          <Button onClick={handleUpdateProduct}>Kaydet</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={qrDialogOpen} onClose={handleCloseQRDialog}>
      <DialogTitle>Ürün QR Kodu</DialogTitle>
      <DialogContent>
        <QRCode value={product.id} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseQRDialog}>Kapat</Button>
      </DialogActions>
    </Dialog>
    </div>
  );
}

export default ProductProfile;
