import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Comentado porque getAnalytics puede no funcionar en todos los entornos (ej. Server-side)
// import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCXKe2QWJxPiY6jp57-17IxGUgh_Lhf89w",
  authDomain: "tuikigai-colombia.firebaseapp.com",
  projectId: "tuikigai-colombia",
  storageBucket: "tuikigai-colombia.firebasestorage.app",
  messagingSenderId: "818488227617",
  appId: "1:818488227617:web:9c8387b66a4571d3dcb060",
  measurementId: "G-QL9MPLY440"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Opcional, comentar si causa problemas

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db, collection, addDoc, serverTimestamp };

// Función auxiliar para guardar documentos, manejando errores
export const saveToFirestore = async (collectionName: string, data: object) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      timestamp: serverTimestamp() // Añade el timestamp del servidor automáticamente
    });
    console.log("Document written to", collectionName, "with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Error adding document to", collectionName, ": ", e);
    return { success: false, error: e };
  }
}; 