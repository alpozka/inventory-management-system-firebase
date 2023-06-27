import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/PeoplePage.css';

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
      <h1>İsim: {person.name}</h1>
      <p>Soyad: {person.surname}</p>
      <p>Ünvan: {person.title}</p>
      <p>ID: {person.id}</p>
    </div>
  );
}

export default ProfilePage;
