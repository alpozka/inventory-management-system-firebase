import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);

  useEffect(() => {
    const fetchPerson = async () => {
      const peopleCollection = collection(db, 'people');
      const q = query(peopleCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        setPerson(doc.data());
      });
    };

    fetchPerson();
  }, [id]);

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
    </div>
  );
}

export default ProfilePage;


