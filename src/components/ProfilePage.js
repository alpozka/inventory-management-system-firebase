import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/ProfilePage.css';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

function ProfilePage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [productData, setProductData] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedPerson, setEditedPerson] = useState({});
  const [assignProductDialogOpen, setAssignProductDialogOpen] = useState(false);
  const [removeProductDialogOpen, setRemoveProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [assignedProductIds, setAssignedProductIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [docId, setDocId] = useState(null);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAssignedProducts = async () => {
    try {
      const assignmentsDoc = await getDoc(doc(db, 'assignments', id));
      if (assignmentsDoc.exists()) {
        const assignedProductsData = assignmentsDoc.data().assigned || [];
        setAssignedProducts(assignedProductsData);
        setAssignedProductIds(assignedProductsData);
      } else {
        console.log('Assignments not found for the person');
      }
    } catch (error) {
      console.error('Error fetching assigned products: ', error);
    }
  };

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const peopleCollection = collection(db, 'people');
        const q = query(peopleCollection, where("id", "==", id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const foundPerson = doc.data();
          setPerson(foundPerson);
          setEditedPerson(foundPerson);
          setDocId(doc.id);
        } else {
          setErrorMessage('Person not found');
        }
      } catch (error) {
        console.error('Error fetching person: ', error);
      }
    };

    const fetchProductData = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const querySnapshot = await getDocs(productsCollection);
        const products = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        setProductData(products);
      } catch (error) {
        console.error('Error fetching product data: ', error);
      }
    };

    fetchPerson();
    fetchAssignedProducts();
    fetchProductData();
  }, [id]);


  if (!person) {
    return <div>Loading...</div>;
  }

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleOpenAssignProductDialog = () => {
    setAssignProductDialogOpen(true);
  };

  const handleCloseAssignProductDialog = () => {
    setAssignProductDialogOpen(false);
  };

  // const handleOpenRemoveProductDialog = () => {
  //   setRemoveProductDialogOpen(true);
  // };

  const handleCloseRemoveProductDialog = () => {
    setRemoveProductDialogOpen(false);
  };

  const handleOpenDeleteConfirmationDialog = () => {
    setDeleteConfirmationDialogOpen(true);
  };

  const handleCloseDeleteConfirmationDialog = () => {
    setDeleteConfirmationDialogOpen(false);
  };

  const handlePersonChange = (e) => {
    const value = e.target.value;
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
      joiningDate: editedPerson.joiningDate,
      registrationDate: editedPerson.registrationDate,
    };

    try {
      if (docId) {
        const docRef = doc(db, 'people', docId);
        await updateDoc(docRef, updatedPerson);
        setPerson(updatedPerson);
        setEditDialogOpen(false);
        alert('Değişiklikler kaydedildi.');
      } else {
        console.log("No document ID found");
      }
    } catch (error) {
      console.error('Error updating person: ', error);
    }
  };

  const handleDeletePerson = async () => {
    setDeleteConfirmationDialogOpen(false);
    if (docId) {
      try {
        const docRef = doc(db, 'people', docId);
        await deleteDoc(docRef);
  
        // Deleting the person from assigned list in each product
        for (const productId of assignedProductIds) {
          const assignmentsDoc = await getDoc(doc(db, 'assignments', productId));
          if (assignmentsDoc.exists()) {
            const assignedPeople = assignmentsDoc.data().assigned || [];
            const updatedAssignedPeople = assignedPeople.filter((personId) => personId !== id);
            await updateDoc(doc(db, 'assignments', productId), { assigned: updatedAssignedPeople });
          }
        }
  
        // Deleting the person's own assignment document
        const assignmentsDocRef = doc(db, 'assignments', id);
        await deleteDoc(assignmentsDocRef);
  
        alert('Silme işlemi başarıyla tamamlandı.');
        navigate("/");
      } catch (error) {
        console.error('Error deleting person: ', error);
      }
    }
  };
  

  const handleAssignProduct = async (productId) => {
    const updatedAssignedProducts = [...assignedProductIds, productId];
  
    try {
      // Update the person's assignments
      const assignmentsDocRef = doc(db, 'assignments', id);
      await updateDoc(assignmentsDocRef, { assigned: updatedAssignedProducts });
      setAssignedProductIds(updatedAssignedProducts);
      setAssignProductDialogOpen(false);
  
      // Now, update the product's assignments
      const productAssignmentsDocRef = doc(db, 'assignments', productId);
      const productAssignmentsDoc = await getDoc(productAssignmentsDocRef);
      let productAssignedPeople = [];
      if (productAssignmentsDoc.exists()) {
        productAssignedPeople = productAssignmentsDoc.data().assigned || [];
      }
      productAssignedPeople.push(id); // Add the person to the product's assigned list
      await updateDoc(productAssignmentsDocRef, { assigned: productAssignedPeople });
  
      alert('Ürün başarıyla atandı.');
      fetchAssignedProducts(); // Fetch the assigned products again after assignment
    } catch (error) {
      console.error('Error assigning product: ', error);
    }
  };
  

  const handleRemoveProduct = (productId) => {
    setRemoveProductDialogOpen(true);
    // setDeleteConfirmationDialogOpen(true);
    setSelectedProduct(productId);
  };

  const handleConfirmProductRemoval = async () => {
    try {
      const updatedAssignedProducts = assignedProductIds.filter((id) => id !== selectedProduct);
      const assignmentsDocRef = doc(db, 'assignments', id);
      await updateDoc(assignmentsDocRef, { assigned: updatedAssignedProducts });
  
      // Also remove the person ID from the assigned list in the product document in the assignments collection
      const productAssignmentsDocRef = doc(db, 'assignments', selectedProduct);
      const productAssignmentsDoc = await getDoc(productAssignmentsDocRef);
      if (productAssignmentsDoc.exists()) {
        const assignedPeople = productAssignmentsDoc.data().assigned || [];
        const updatedAssignedPeople = assignedPeople.filter((personId) => personId !== id);
        await updateDoc(productAssignmentsDocRef, { assigned: updatedAssignedPeople });
      }
  
      setAssignedProductIds(updatedAssignedProducts);
      setSelectedProduct('');
      setDeleteConfirmationDialogOpen(false);
      alert('Ürün atanması başarıyla kaldırıldı.');
      fetchAssignedProducts(); // Fetch the assigned products again after removal
      window.location.reload();
    } catch (error) {
      console.error('Error removing product assignment: ', error);
    }
  };

  const goBackToHomePage = () => {
    navigate("/");
  }

  const getProductInfo = (productId) => {
    const product = productData.find((item) => item.id === productId);
    if (product) {
      return `${product.brand} - ${product.model} (ID: ${product.id})`;
    }
    return '';
  };

  return (
    <div className="profile-container">
      <div className="person-card">
      <h2>Kişi Profili</h2>
      <p>İsim: {person.name}</p>
      <p>Soyad: {person.surname}</p>
      <p>Ünvan: {person.title}</p>
      <p>ID: {person.id}</p>
      <p>Açıklama: {person.description}</p>
      <p>İşe giriş tarihi: {person.joiningDate}</p>
      <p>Sisteme Kayıt Tarihi: {person.registrationDate}</p>

      <h3>Atanmış Ürünler</h3>
      <ul>
        {assignedProducts.map((productId) => (
          <li key={productId}>
            <Link to={`/ProductProfile/${productId}`}>
            {getProductInfo(productId)}
            </Link>
            <Button onClick={() => handleRemoveProduct(productId)}> Ürünü Sil</Button>
          </li>
        ))}
      </ul>
      </div>
      <div className="button-group">
      <Button onClick={handleOpenAssignProductDialog}>Ürün Ata</Button>
      <Button onClick={handleOpenEditDialog}>Düzenle</Button>
      <Button onClick={handleOpenDeleteConfirmationDialog}>Kişiyi Sil</Button>
      <Button variant="outlined" color="primary" onClick={goBackToHomePage}>
        Ana Sayfaya Dön
      </Button>
      </div>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="İsim"
            type="text"
            fullWidth
            value={editedPerson.name}
            onChange={handlePersonChange}
          />
          <TextField
            margin="dense"
            name="surname"
            label="Soyisim"
            type="text"
            fullWidth
            value={editedPerson.surname}
            onChange={handlePersonChange}
          />
          <TextField
            margin="dense"
            name="title"
            label="Ünvan"
            type="text"
            fullWidth
            value={editedPerson.title}
            onChange={handlePersonChange}
          />
          <TextField
            margin="dense"
            name="joiningDate"
            label="İşe Giriş Tarihi"
            type="date"
            fullWidth
            value={editedPerson.joiningDate}
            onChange={handlePersonChange}
            InputLabelProps={{ shrink: true }}
          />
            <TextField
              margin="dense"
              name="registrationDate"
              label="Kayıt Tarihi"
              type="date"
              fullWidth
              value={editedPerson.registrationDate}
              onChange={handlePersonChange}
              InputLabelProps={{ shrink: true }}
            />
          <TextField
            margin="dense"
            name="description"
            label="Açıklama"
            type="text"
            fullWidth
            value={editedPerson.description}
            onChange={handlePersonChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>İptal</Button>
          <Button onClick={handleUpdatePerson}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignProductDialogOpen} onClose={handleCloseAssignProductDialog}>
        <DialogTitle>Ürün Ata</DialogTitle>
        <DialogContent>
          {productData.map((product) => (
            <div key={product.id}>
              <Button onClick={() => handleAssignProduct(product.id)}>
                {`${product.brand} - ${product.model} (ID: ${product.id})`}
              </Button>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignProductDialog}>İptal</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeProductDialogOpen} onClose={handleCloseRemoveProductDialog}>
        <DialogTitle>Atanan Ürünü Sil</DialogTitle>
        <DialogContent>
          {assignedProducts.map((productId) => (
            <Button key={productId} onClick={() => handleRemoveProduct(productId)}>
              {getProductInfo(productId)}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveProductDialog}>İptal</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmationDialogOpen} onClose={handleCloseDeleteConfirmationDialog}>
        <DialogTitle>Kişiyi Sil</DialogTitle>
        <DialogContent>
          <p>Seçilen Kişiyi silmek istediğinize emin misiniz?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmationDialog}>Hayır</Button>
          <Button onClick={handleDeletePerson}>Evet</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={removeProductDialogOpen} onClose={handleCloseRemoveProductDialog}>
  <DialogTitle>Atanan Ürünü Sil</DialogTitle>
  <DialogContent>
    {assignedProducts.map((productId) => (
      <Button key={productId} onClick={() => handleConfirmProductRemoval(productId)}>
        {getProductInfo(productId)}
      </Button>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseRemoveProductDialog}>İptal</Button>
  </DialogActions>
</Dialog>
    </div>
  );
}

export default ProfilePage;