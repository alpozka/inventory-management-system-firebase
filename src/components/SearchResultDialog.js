import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const SearchResultDialog = ({ open, handleClose, data }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
    <DialogTitle>Query Results</DialogTitle>
    <DialogContent>
        {data.map((item, index) => {
            if (item.type === 'error') {
                return <p key={index}>{item.message}</p>;
            } else {
                return (
                    <div key={index}>
                        <p>{item.name}</p>
                        <p>{item.type}</p>
                    </div>
                );
            }
        })}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleClose} color="primary">
            Close
        </Button>
    </DialogActions>
</Dialog>
  );
}

export default SearchResultDialog;
