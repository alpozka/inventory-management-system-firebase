import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/ProductProfile.css';

function ProductProfile() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const productCollection = collection(db, 'products');
      const q = query(productCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        setProduct(doc.data());
      });
    };

    fetchProduct();
  }, [id]);

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
    </div>
  );
}

export default ProductProfile;