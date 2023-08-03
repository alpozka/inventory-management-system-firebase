import React, { useEffect, useState} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, Alert } from '@mui/material';
import '../styles/ProductProfile.css';
import { useTranslation } from 'react-i18next';

function ProductProfile() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [personData, setPersonData] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [assignPersonDialogOpen, setAssignPersonDialogOpen] = useState(false);
  const [removePersonDialogOpen, setRemovePersonDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [assignedPersonIds, setAssignedPersonIds] = useState([]);
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

  const fetchAssignedPersons = async () => {
    try {
      const assignmentsDoc = await getDoc(doc(db, 'assignments', id)); 
      if (assignmentsDoc.exists()) { 
        const assignedPersonsData = assignmentsDoc.data().assigned || []; 
        setAssignedPersons(assignedPersonsData); 
        setAssignedPersonIds(assignedPersonsData); 
      } else {
        console.log('Assignments not found for the product'); 
      }
    } catch (error) {
      console.error('Error fetching assigned persons: ', error); 
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productCollection = collection(db, 'products');
        const q = query(productCollection, where("id", "==", id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const foundProduct = doc.data();
          setProduct(foundProduct);
          setEditedProduct(foundProduct);
          setDocId(doc.id);
        } else {
          setErrorMessage('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product: ', error);
      }
    };

    const fetchPersonData = async () => {
      try {
        const personsCollection = collection(db, 'people');
        const querySnapshot = await getDocs(personsCollection);
        const persons = [];
        querySnapshot.forEach((doc) => {
          persons.push({ id: doc.id, ...doc.data() });
        });
        setPersonData(persons);
      } catch (error) {
        console.error('Error fetching person data: ', error);
      }
    };

    fetchProduct();
    fetchAssignedPersons();
    fetchPersonData();
  }, [id]);


  if (!product) {
    return <div>Loading...</div>;
  }

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };
  const handleOpenAssignPersonDialog = () => {
    setAssignPersonDialogOpen(true);
  };

  const handleCloseAssignPersonDialog = () => {
    setAssignPersonDialogOpen(false);
  };

  // const handleOpenRemovePersonDialog = () => {
  //   setRemovePersonDialogOpen(true);
  // };

  const handleCloseRemovePersonDialog = () => {
    setRemovePersonDialogOpen(false);
  };
  const handleOpenDeleteConfirmationDialog = () => {
    setDeleteConfirmationDialogOpen(true);
  };

  const handleCloseDeleteConfirmationDialog = () => {
    setDeleteConfirmationDialogOpen(false);
  };

  const handleProductChange = (e) => {
    const value = e.target.value;
    setEditedProduct({
      ...editedProduct,
      [e.target.name]: value
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleUpdateProduct = async () => {
    if (!editedProduct.brand.trim() || !editedProduct.model.trim() || !editedProduct.description.trim()) {
      setSnackbarMessage(t('productProfile.fieldsCannotBeEmpty'));
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const updatedProduct = {
      ...editedProduct,
      brandLowerCase: editedProduct.brand.toLowerCase(),
      modelLowerCase: editedProduct.model.toLowerCase(),
      registrationDate: editedProduct.registrationDate,
    };

    try {
      if (docId) {
        const docRef = doc(db, 'products', docId);
        await updateDoc(docRef, updatedProduct);
        setProduct(updatedProduct);
        setEditDialogOpen(false);
        setSnackbarMessage(t('productProfile.changesSaved'));
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        console.log("No document ID found");
      }
    } catch (error) {
      console.error('Error updating product: ', error);
    }
  };

  const handleDeleteProduct = async () => {
    setDeleteConfirmationDialogOpen(false);
    if (docId) {
      try {
        const docRef = doc(db, 'products', docId);
        await deleteDoc(docRef);
  
        // Deleting the person from assigned list in each product
        for (const personId of assignedPersonIds) {
          const assignmentsDoc = await getDoc(doc(db, 'assignments', personId));
          if (assignmentsDoc.exists()) {
            const assignedProduct = assignmentsDoc.data().assigned || [];
            const updatedAssignedProduct = assignedProduct.filter((productId) => productId !== id);
            await updateDoc(doc(db, 'assignments', personId), { assigned: updatedAssignedProduct });
          }
        }
  
        // Deleting the person's own assignment document
        const assignmentsDocRef = doc(db, 'assignments', id);
        await deleteDoc(assignmentsDocRef);
  
        alert(t('productProfile.productRemoved'));
        navigate("/");
      } catch (error) {
        console.error('Error deleting product: ', error);
      }
    }
  };

  const handleAssignPerson = async (personId) => {
    const updatedAssignedPersons = [...assignedPersonIds, personId];
  
    try {
      const assignmentsDocRef = doc(db, 'assignments', id);
      await updateDoc(assignmentsDocRef, { assigned: updatedAssignedPersons });
      setAssignedPersonIds(updatedAssignedPersons);
      setAssignPersonDialogOpen(false);

      const personAssignmentsDocRef = doc(db, 'assignments', personId);
      const personAssignmentsDoc = await getDoc(personAssignmentsDocRef);
      let personAssignedProduct = [];
      if (personAssignmentsDoc.exists()) {
        personAssignedProduct = personAssignmentsDoc.data().assigned || [];
      }
      personAssignedProduct.push(id); // Add the person to the product's assigned list
      await updateDoc(personAssignmentsDocRef, { assigned: personAssignedProduct });
  
      setSnackbarMessage(t('productProfile.personAssigned'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchAssignedPersons(); // Fetch the assigned products again after assignment
    } catch (error) {
      console.error('Error assigning person: ', error);
    }
  };
  

  const handleRemovePerson = (personId) => {
    setRemovePersonDialogOpen(true);
    setSelectedPerson(personId);
  };

  const handleConfirmPersonRemoval = async () => {
    try {
      const updatedAssignedPersons = assignedPersonIds.filter((id) => id !== selectedPerson);
      const assignmentsDocRef = doc(db, 'assignments', id);
      await updateDoc(assignmentsDocRef, { assigned: updatedAssignedPersons });
  
      // Also remove the person ID from the assigned list in the product document in the assignments collection
      const personAssignmentsDocRef = doc(db, 'assignments', selectedPerson);
      const personAssignmentsDoc = await getDoc(personAssignmentsDocRef);
      if (personAssignmentsDoc.exists()) {
        const assignedProduct = personAssignmentsDoc.data().assigned || [];
        const updatedAssignedProduct = assignedProduct.filter((productId) => productId !== id);
        await updateDoc(personAssignmentsDocRef, { assigned: updatedAssignedProduct });
      }
  
      setAssignedPersonIds(updatedAssignedPersons);
      setSelectedPerson('');
      setDeleteConfirmationDialogOpen(false);
      alert(t('productProfile.personRemoved'));
      fetchAssignedPersons(); // Fetch the assigned products again after removal
      window.location.reload();
    } catch (error) {
      console.error('Error removing person assignment: ', error);
    }
  };

  const goBackToHomePage = () => {
    navigate("/");
  }

  const getPersonInfo = (personId) => {
    const person = personData.find((item) => item.id === personId);
    if (person && person.name && person.surname && person.id) {
      return `${person.name} - ${person.surname} (ID: ${person.id})`;
    }
    return '';
  };
  return (
    <div className="product-container">
      <div className="language-button">
      <Button onClick={() => changeLanguage('en')}>EN</Button>
      <Button onClick={() => changeLanguage('tr')}>TR</Button>
        </div>
      <div className="product-card">
        <h2>{t('productProfile.product')}</h2>
        <p>{t('productProfile.brand')}: {product.brand}</p>
        <p>{t('productProfile.model')}: {product.model}</p>
        <p>{t('productProfile.description')}: {product.description}</p>
        <p>{t('productProfile.price')}: {product.price}</p>
        <p>{t('productProfile.purchaseDate')}: {product.purchaseDate}</p>
        <p>{t('productProfile.registerDate')}: {product.registerDate}</p>
        <p>{t('productProfile.assignedPerson')}:</p>
        <ul>
        {assignedPersons.map((personId) => (
          <li key={personId}>
            <Link to={`/profile/${personId}`}>
            {getPersonInfo(personId)}
            </Link>
            <Button onClick={() => handleRemovePerson(personId)}>{t('productProfile.deleteUser')}</Button>
          </li>
        ))}
      </ul>
        <p>ID: {product.id}</p>
      </div>
      <div className="button-group">
        <Button onClick={handleOpenAssignPersonDialog}>{t('productProfile.assignedUser')}</Button>
        <Button onClick={handleOpenEditDialog} className="edit-button">
        {t('productProfile.edit')}
        </Button>
        <Button onClick={handleOpenDeleteConfirmationDialog} className="delete-button">
        {t('productProfile.deleteProduct')}
        </Button>
        <Button variant="outlined" color="primary" onClick={goBackToHomePage}>
        {t('productProfile.mainPage')}
      </Button>
      </div>       
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>{t('productProfile.edit')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="brand"
            label={t('productProfile.brand')}
            type="text"
            fullWidth
            value={editedProduct.brand}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="model"
            label={t('productProfile.model')}
            type="text"
            fullWidth
            value={editedProduct.model}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="description"
            label={t('productProfile.description')}
            type="text"
            fullWidth
            value={editedProduct.description}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="price"
            label={t('productProfile.price')}
            type="text"
            fullWidth
            value={editedProduct.price}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="purchaseDate"
            label={t('productProfile.purchaseDate')}
            type="date"
            fullWidth
            value={editedProduct.purchaseDate}
            onChange={handleProductChange}
            InputLabelProps={{ shrink: true }}
          />
            <TextField
              margin="dense"
              name="registerDate"
              label={t('productProfile.registerDate')}
              type="date"
              fullWidth
              value={editedProduct.registerDate}
              onChange={handleProductChange}
              InputLabelProps={{ shrink: true }}
            />
        </DialogContent>
        <DialogActions>
        <Button onClick={handleCloseEditDialog}>{t('productProfile.cancel')}</Button>
          <Button onClick={handleUpdateProduct}>{t('productProfile.save')}</Button>
        </DialogActions>
      </Dialog>
       <Dialog open={assignPersonDialogOpen} onClose={handleCloseAssignPersonDialog}>
        <DialogTitle>{t('productProfile.assignedUser')}</DialogTitle>
        <DialogContent>
          {personData.map((person) => (
            <div key={person.id}>
              <Button onClick={() => handleAssignPerson(person.id)}>
                {`${person.name} - ${person.surname} (ID: ${person.id})`}
              </Button>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignPersonDialog}>{t('productProfile.cancel')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={removePersonDialogOpen} onClose={handleCloseRemovePersonDialog}>
        <DialogTitle>{t('productProfile.deleteAssignedPerson')}</DialogTitle>
        <DialogContent>
          {assignedPersons.map((personId) => (
            <Button key={personId} onClick={() => handleRemovePerson(personId)}>
              {getPersonInfo(personId)}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemovePersonDialog}>{t('productProfile.cancel')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirmationDialogOpen} onClose={handleCloseDeleteConfirmationDialog}>
        <DialogTitle>{t('productProfile.deleteProduct')}</DialogTitle>
        <DialogContent>
          <p>{t('productProfile.deleteProductquestion')}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmationDialog}>{t('productProfile.no')}</Button>
          <Button onClick={handleDeleteProduct}>{t('productProfile.yes')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={removePersonDialogOpen} onClose={handleCloseRemovePersonDialog}>
  <DialogTitle>{t('productProfile.deleteAssignedPerson')}</DialogTitle>
  <DialogContent>
    {assignedPersons.map((personId) => (
      <Button key={personId} onClick={() => handleConfirmPersonRemoval(personId)}>
        {getPersonInfo(personId)}
      </Button>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseRemovePersonDialog}>{t('productProfile.cancel')}</Button>
  </DialogActions>
</Dialog>
<Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
export default ProductProfile