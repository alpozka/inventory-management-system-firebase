import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Grid, Paper, Typography, Dialog, DialogTitle, DialogContent, Checkbox, Button, FormControlLabel, DialogActions, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import '../styles/PeoplePage.css';

function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [onlyIds, setOnlyIds] = useState(false);
  const [fontSize, setFontSize] = useState(12);

  useEffect(() => {
    const fetchPeople = async () => {
      const peopleCollection = collection(db, 'people');
      const peopleSnapshot = await getDocs(peopleCollection);
      const peopleList = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPeople(peopleList);
      setSelectedPeople(peopleList.map(() => false));  // initialize selectedPeople with all people unselected
    };

    fetchPeople();
  }, []);

  const handlePrint = () => {
    if (selectedPeople.some((isSelected) => isSelected)) {
      const toPrint = people.filter((_, index) => selectedPeople[index]);
      let printContent = '';
      toPrint.forEach(person => {
        if (onlyIds) {
          printContent += `${person.id}\n`;
        } else {
          printContent += `ID: ${person.id}, Ad: ${person.name}, Soyad: ${person.surname}\n`;
        }
      });
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<pre style="font-size: ${fontSize}px">${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert("En az bir kişi seçmelisiniz!");
    }
  };

  return (
    <div className="people-page full-height">
      <div style={{ position: 'relative', height: '100%' }}>
      <IconButton component={Link} to="/" className="back-button" color="primary">
        <ArrowBackTwoToneIcon />
      </IconButton>
      <Button style={{position: 'absolute', top: 5, right: 20}} variant="outlined" onClick={() => setPrintDialogOpen(true)}>Yazdır</Button>
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
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)}>
        <DialogTitle>Kişileri Yazdır</DialogTitle>
        <DialogContent>
          {people.map((person, index) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedPeople[index]}
                  onChange={(event) => {
                    const newSelectedPeople = [...selectedPeople];
                    newSelectedPeople[index] = event.target.checked;
                    setSelectedPeople(newSelectedPeople);
                  }}
                />
              }
              label={`${person.name} ${person.surname} (${person.id})`}
              key={index}
            />
          ))}
          <Button variant="outlined" onClick={() => setSelectedPeople(people.map(() => true))}>Hepsini Seç</Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyIds}
                onChange={(event) => setOnlyIds(event.target.checked)}
              />
            }
            label="Sadece ID'leri yazdır"
          />
          <Box>
            <Typography variant="body1">Yazı Boyutu: </Typography>
            <input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} min={8} max={72} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint}>Yazdır</Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  );
}

export default PeoplePage;
