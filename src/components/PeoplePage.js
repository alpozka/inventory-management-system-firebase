import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Grid, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
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
    <div className="people-page full-height">
      <div style={{ position: 'relative', height: '100%' }}>
      <IconButton component={Link} to="/" className="back-button" color="primary">
        <ArrowBackTwoToneIcon />
      </IconButton>
      <Grid container spacing={3} className="people-grid">
        {people.map((person, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link to={`/profile/${person.id}`} className="peopleCardLink">
              <Paper className="peopleCard">
                <Typography variant="h5" className="people-name">{person.name}</Typography>
                <Typography variant="body2" className="people-details">{person.surname}</Typography>
                <Typography variant="body2" className="people-details">{person.title}</Typography>
                <Typography variant="body2" className="people-details">{person.id}</Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
      </div>
    </div>
  );

}

export default PeoplePage;
