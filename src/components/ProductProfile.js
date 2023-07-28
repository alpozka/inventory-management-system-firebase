import React, { useEffect, useState} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, query, updateDoc, where, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import '../styles/ProductProfile.css';

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
  const navigate = useNavigate();

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

  const handleUpdateProduct = async () => {
    if (!editedProduct.brand.trim() || !editedProduct.model.trim() || !editedProduct.description.trim()) {
      alert("Marka, Model ve Açıklama alanları boş bırakılamaz!");
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
        alert('Değişiklikler kaydedildi.');
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
  
        alert('Silme işlemi başarıyla tamamlandı.');
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
  
      alert('Kişi başarıyla atandı.');
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
      alert('Kişi atanması başarıyla kaldırıldı.');
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
    if (product) {
      return `${person.name} - ${person.surname} (ID: ${person.id})`;
    }
    return '';
  };

  return (
    <div className="product-container">
      <div className="product-card">
        <h2>Ürün</h2>
        <p>Marka: {product.brand}</p>
        <p>Model: {product.model}</p>
        <p>Açıklama: {product.description}</p>
        <p>Ürün Fiyatı: {product.price}</p>
        <p>Satın Alma Tarihi: {product.purchaseDate}</p>
        <p>Sisteme Kayıt Tarihi: {product.registerDate}</p>
        <p>Atanan Kişi:</p>
        <ul>
        {assignedPersons.map((personId) => (
          <li key={personId}>
            <Link to={`/profile/${personId}`}>
            {getPersonInfo(personId)}
            </Link>
            <Button onClick={() => handleRemovePerson(personId)}> Kişiyi Sil</Button>
          </li>
        ))}
      </ul>
        <p>ID: {product.id}</p>
      </div>
      <div className="button-group">
        <Button onClick={handleOpenAssignPersonDialog}>Kişi Ata</Button>
        <Button onClick={handleOpenEditDialog} className="edit-button">
          Düzenle
        </Button>
        <Button onClick={handleOpenDeleteConfirmationDialog} className="delete-button">
          Bu Ürünü Sil
        </Button>
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
            name="brand"
            label="Marka"
            type="text"
            fullWidth
            value={editedProduct.brand}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="model"
            label="Model"
            type="text"
            fullWidth
            value={editedProduct.model}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Açıklama"
            type="text"
            fullWidth
            value={editedProduct.description}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Ürün Fiyatı"
            type="text"
            fullWidth
            value={editedProduct.price}
            onChange={handleProductChange}
          />
          <TextField
            margin="dense"
            name="purchaseDate"
            label="Satın Alınma Tarihi"
            type="date"
            fullWidth
            value={editedProduct.purchaseDate}
            onChange={handleProductChange}
            InputLabelProps={{ shrink: true }}
          />
            <TextField
              margin="dense"
              name="registerDate"
              label="Kayıt Tarihi"
              type="date"
              fullWidth
              value={editedProduct.registerDate}
              onChange={handleProductChange}
              InputLabelProps={{ shrink: true }}
            />
        </DialogContent>
        <DialogActions>
        <Button onClick={handleCloseEditDialog}>İptal</Button>
          <Button onClick={handleUpdateProduct}>Kaydet</Button>
        </DialogActions>
      </Dialog>
       <Dialog open={assignPersonDialogOpen} onClose={handleCloseAssignPersonDialog}>
        <DialogTitle>Kişi Ata</DialogTitle>
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
          <Button onClick={handleCloseAssignPersonDialog}>İptal</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={removePersonDialogOpen} onClose={handleCloseRemovePersonDialog}>
        <DialogTitle>Atanan Kişiyi Sil</DialogTitle>
        <DialogContent>
          {assignedPersons.map((personId) => (
            <Button key={personId} onClick={() => handleRemovePerson(personId)}>
              {getPersonInfo(personId)}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemovePersonDialog}>İptal</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirmationDialogOpen} onClose={handleCloseDeleteConfirmationDialog}>
        <DialogTitle>Ürünü Sil</DialogTitle>
        <DialogContent>
          <p>Seçilen Ürünü silmek istediğinize emin misiniz?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmationDialog}>Hayır</Button>
          <Button onClick={handleDeleteProduct}>Evet</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={removePersonDialogOpen} onClose={handleCloseRemovePersonDialog}>
  <DialogTitle>Atanan Kişiyi Sil</DialogTitle>
  <DialogContent>
    {assignedPersons.map((personId) => (
      <Button key={personId} onClick={() => handleConfirmPersonRemoval(personId)}>
        {getPersonInfo(personId)}
      </Button>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseRemovePersonDialog}>İptal</Button>
  </DialogActions>
</Dialog>
    </div>
  );
}
export default ProductProfile