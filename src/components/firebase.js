// import firebase from 'firebase';
import { initializeApp } from "firebase/app";
// import { getDatabase} from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "@firebase/auth";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyDDsyqF-TQXhMNPfhLRsETsssWm5iM6uFU",
    authDomain: "envanter-demo.firebaseapp.com",
    projectId: "envanter-demo",
    storageBucket: "envanter-demo.appspot.com",
    messagingSenderId: "178968411696",
    appId: "1:178968411696:web:bae11be4e61b657bde37f5",
    measurementId: "G-LXHLWYVDNX"
};
const app = initializeApp(firebaseConfig);


export const auth = getAuth(); 
export const storage = getStorage(app);
export const db = getFirestore(app);