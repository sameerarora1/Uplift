// Import the functions you need from the SDKs you need
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPdBpxwxGD23_l1Ltq1Xkt6N5KQJSjAjM",
  authDomain: "uplift-eefa0.firebaseapp.com",
  projectId: "uplift-eefa0",
  storageBucket: "uplift-eefa0.firebasestorage.app",
  messagingSenderId: "967294925123",
  appId: "1:967294925123:web:17c5ce5aaeeb5adc5f17f6",
  measurementId: "G-NPW9DE9W8D"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export { auth };

