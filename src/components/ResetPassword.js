import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link  } from "react-router-dom";
import '../styles/ResetPassword.css';

const defaultTheme = createTheme();

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const resetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage("Password reset link has been sent to your email");
      })
      .catch((error) => {
        setMessage("An error occurred: " + error.message);
      });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" className="mainContainer">
        <Grid item xs={false} sm={4} md={7} className="imageContainer" />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box className="paperContainer">
            <Typography component="h1" variant="h5">
              Reset Password
            </Typography>
            <Box className="formContainer">
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={resetPassword} fullWidth variant="contained" className="submitButton">
                Reset Password
              </Button>
              <Grid container>
              <Grid item xs={12} className="goBackContainer">
        <Link to="/" variant="body2" className="goBack">
          {"Go back to Login"}
        </Link>
      </Grid>
              </Grid>
              {message && (
                <Typography variant="body2" align="center" className="message">
                  {message}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default ResetPassword;
