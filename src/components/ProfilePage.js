import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/PeoplePage.css';

function ProfilePage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);  // Add this line

  useEffect(() => {
    const fetchPerson = async () => {
      const personDoc = doc(db, 'people', id);
      const personSnapshot = await getDoc(personDoc);
      if (personSnapshot.exists()) {
        setPerson(personSnapshot.data());
      } else {
        console.log('No such person!');
      }
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
      <p>ID: {id}</p>
    </div>
  );
}

export default ProfilePage;
