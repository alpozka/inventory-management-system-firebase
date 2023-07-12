import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Grid, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import '../styles/PeoplePage.css';

function PeoplePage() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const fetchPeople = async () => {
      const peopleCollection = collection(db, 'people');
      const peopleSnapshot = await getDocs(peopleCollection);
      const peopleList = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPeople(peopleList);
    };

    fetchPeople();
  }, []);

  return (
    <div className="product-page full-height">
      <Grid container spacing={3} className="product-grid">
        {people.map((person, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link to={`/profile/${person.id}`} className="productCardLink">
              <Paper className="productCard">
                <Typography variant="h5" className="product-name">{person.name}</Typography>
                <Typography variant="body2" className="product-details">{person.surname}</Typography>
                <Typography variant="body2" className="product-details">{person.title}</Typography>
                <Typography variant="body2" className="product-details">{person.id}</Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </div>
  );

}

export default PeoplePage;
