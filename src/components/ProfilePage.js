import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/ProfilePage.css';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, Alert } from '@mui/material';

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

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
      setSnackbarMessage(t('profilePage.fieldsCannotBeEmpty'));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
        setSnackbarMessage(t('profilePage.changesSaved'));
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
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
  
        alert(t('profilePage.deletedSuccessfully'));
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
  
      setSnackbarMessage(t('profilePage.productAssigned'));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
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
      alert(t('profilePage.productRemoved'));
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
      <div className="language-button">
      <Button onClick={() => changeLanguage('en')}>EN</Button>
      <Button onClick={() => changeLanguage('tr')}>TR</Button>
        </div>
      <div className="person-card">
      <h2>{t('profilePage.userProfile')}</h2>
      <p>{t('profilePage.name')}: {person.name}</p>
      <p>{t('profilePage.surname')}: {person.surname}</p>
      <p>{t('profilePage.title')}: {person.title}</p>
      <p>ID: {person.id}</p>
      <p>{t('profilePage.description')}: {person.description}</p>
      <p>{t('profilePage.joiningDate')}: {person.joiningDate}</p>
      <p>{t('profilePage.registerDate')}: {person.registrationDate}</p>

      <h3>{t('profilePage.assignedPerson')}</h3>
      <ul>
        {assignedProducts.map((productId) => (
          <li key={productId}>
            <Link to={`/ProductProfile/${productId}`}>
            {getProductInfo(productId)}
            </Link>
            <Button onClick={() => handleRemoveProduct(productId)}>{t('productProfile.deleteProduct')}</Button>
          </li>
        ))}
      </ul>
      </div>
      <div className="button-group">
      <Button onClick={handleOpenAssignProductDialog}>{t('profilePage.assignedProduct')}</Button>
      <Button onClick={handleOpenEditDialog}>{t('profilePage.edit')}</Button>
      <Button onClick={handleOpenDeleteConfirmationDialog}>{t('profilePage.deleteUser')}</Button>
      <Button variant="outlined" color="primary" onClick={goBackToHomePage}>
      {t('profilePage.mainPage')}
      </Button>
      </div>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>{t('profilePage.edit')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label={t('profilePage.name')}
            type="text"
            fullWidth
            value={editedPerson.name}
            onChange={handlePersonChange}
          />
          <TextField
            margin="dense"
            name="surname"
            label={t('profilePage.surname')}
            type="text"
            fullWidth
            value={editedPerson.surname}
            onChange={handlePersonChange}
          />
          <TextField
            margin="dense"
            name="title"
            label={t('profilePage.title')}
            type="text"
            fullWidth
            value={editedPerson.title}
            onChange={handlePersonChange}
          />
          <TextField
            margin="dense"
            name="joiningDate"
            label={t('profilePage.joiningDate')}
            type="date"
            fullWidth
            value={editedPerson.joiningDate}
            onChange={handlePersonChange}
            InputLabelProps={{ shrink: true }}
          />
            <TextField
              margin="dense"
              name="registrationDate"
              label={t('profilePage.registerDate')}
              type="date"
              fullWidth
              value={editedPerson.registrationDate}
              onChange={handlePersonChange}
              InputLabelProps={{ shrink: true }}
            />
          <TextField
            margin="dense"
            name="description"
            label={t('profilePage.description')}
            type="text"
            fullWidth
            value={editedPerson.description}
            onChange={handlePersonChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>{t('profilePage.cancel')}</Button>
          <Button onClick={handleUpdatePerson}>{t('profilePage.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignProductDialogOpen} onClose={handleCloseAssignProductDialog}>
        <DialogTitle>{t('profilePage.assignedProduct')}</DialogTitle>
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
          <Button onClick={handleCloseAssignProductDialog}>{t('profilePage.cancel')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeProductDialogOpen} onClose={handleCloseRemoveProductDialog}>
        <DialogTitle>{t('profilePage.deleteAssignedProduct')}</DialogTitle>
        <DialogContent>
          {assignedProducts.map((productId) => (
            <Button key={productId} onClick={() => handleRemoveProduct(productId)}>
              {getProductInfo(productId)}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveProductDialog}>{t('profilePage.cancel')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmationDialogOpen} onClose={handleCloseDeleteConfirmationDialog}>
        <DialogTitle>{t('profilePage.deleteUser')}</DialogTitle>
        <DialogContent>
          <p>{t('profilePage.deleteUserquestion')}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmationDialog}>{t('profilePage.no')}</Button>
          <Button onClick={handleDeletePerson}>{t('profilePage.yes')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={removeProductDialogOpen} onClose={handleCloseRemoveProductDialog}>
  <DialogTitle>{t('profilePage.deleteAssignedProduct')}</DialogTitle>
  <DialogContent>
    {assignedProducts.map((productId) => (
      <Button key={productId} onClick={() => handleConfirmProductRemoval(productId)}>
        {getProductInfo(productId)}
      </Button>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseRemoveProductDialog}>{t('profilePage.cancel')}</Button>
  </DialogActions>
</Dialog>
<Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
      <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </div>
  );
}

export default ProfilePage;