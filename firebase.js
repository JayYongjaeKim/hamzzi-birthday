// Firebase import (CDN 방식)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🔥 네가 콘솔에서 받은 firebaseConfig 붙여넣기
const firebaseConfig = {
  apiKey: "AIzaSyAgCAi09y4MBUr0XlpzMw0XF3X_gx1aBvg",
  authDomain: "birthday-8d372.firebaseapp.com",
  projectId: "birthday-8d372",
  storageBucket: "birthday-8d372.firebasestorage.app",
  messagingSenderId: "624348070080",
  appId: "1:624348070080:web:d758b903704e370fd72d25"
};


// 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 🔥 전역에서 사용 가능하게 export
window.db = db;
window.fbCollection = collection;
window.fbAddDoc = addDoc;
window.fbGetDocs = getDocs;
