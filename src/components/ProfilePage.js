import React from 'react';
import { useParams } from 'react-router-dom';

function ProfilePage() {
  // Kişinin ID'sini URL'den alır.
  const { id } = useParams();

  // ID'yi kullanarak kişi hakkında bilgi alınır.
  // Gerçekte, bu bilgi bir API'den veya global durumdan gelir.
  const person = 'Ali';  // Örnek kişi

  return (
    <div>
      <h1>Profil: {person}</h1>
      <p>ID: {id}</p>
      {/* Diğer profil bilgileri */}
    </div>
  );
}

export default ProfilePage;
