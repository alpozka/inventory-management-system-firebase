// // import firebase from 'firebase';
// import { initializeApp } from "firebase/app";
// // import { getDatabase} from "firebase/database";
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "@firebase/auth";
// import { getStorage } from "firebase/storage"

// const firebaseConfig = {
//     apiKey: "AIzaSyDDsyqF-TQXhMNPfhLRsETsssWm5iM6uFU",
//     authDomain: "envanter-demo.firebaseapp.com",
//     projectId: "envanter-demo",
//     storageBucket: "envanter-demo.appspot.com",
//     messagingSenderId: "178968411696",
//     appId: "1:178968411696:web:bae11be4e61b657bde37f5",
//     measurementId: "G-LXHLWYVDNX"
// };
// const app = initializeApp(firebaseConfig);


// export const auth = getAuth(); 
// export const storage = getStorage(app);
// export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "@firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const storage = getStorage(app);
export const db = getFirestore(app);
