import { createContext, useEffect, useReducer, useContext } from "react";
import AuthReducer from "../context/AuthReducer";
import { createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import { auth } from "../components/firebase";
const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
};

export const AuthContext = createContext(INITIAL_STATE);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }
  function logOut() {
    return signOut(auth);
  }
  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.currentUser));
  }, [state.currentUser]);

  return (
    <AuthContext.Provider value={{ signUp, logOut, googleSignIn, currentUser: state.currentUser, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
