import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Card, CardContent, Grid, Typography } from '@mui/material';
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
    <Grid container spacing={2} className="people-grid">
      {people.map((person, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Link to={`/profile/${person.id}`} className="person-grid-item-link">
            <Card className="person-card">
              <CardContent>
                <Typography variant="h5" component="div">{person.name}</Typography>
                <Typography variant="body2">{person.surname}</Typography>
                <Typography variant="body2">{person.title}</Typography>
                <Typography variant="body2">{person.id}</Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}

export default PeoplePage;
