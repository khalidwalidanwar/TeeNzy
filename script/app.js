import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getFirestore,setDoc , collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';
const firebaseConfig = {
    apiKey: "AIzaSyAuxTcAXtMRU7MJVRxddmM68fBLuOTaw5Q",
    authDomain: "teenzy-3f9ca.firebaseapp.com",
    projectId: "teenzy-3f9ca",
    storageBucket: "teenzy-3f9ca.firebasestorage.app",
    messagingSenderId: "992928404570",
    appId: "1:992928404570:web:925762f824baa6c42b3463",
    measurementId: "G-CYSGKWQM7G"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app, db,setDoc , collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc};