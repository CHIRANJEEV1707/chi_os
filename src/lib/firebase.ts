import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDGhG7kWneLBilc0ZsOErYPKB3F8GsydaU",
  authDomain: "chios-e8b23.firebaseapp.com",
  projectId: "chios-e8b23",
  storageBucket: "chios-e8b23.appspot.com",
  messagingSenderId: "256036653265",
  appId: "1:256036653265:web:57507b88e372740f0a5df0"
}

const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp()

export const db = getFirestore(app)
export const auth = getAuth(app)
export default app