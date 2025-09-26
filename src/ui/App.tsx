import { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard/index";
import Init from "./components/Init";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [minTimeReached, setMinTimeReached] = useState(false);

  // Function to fetch backend role
  const fetchUserRole = async (u: any) => {
    try {
      const token = await u.getIdToken(true); // force refresh to get latest claims
      const data = await window.electron!.sendToken(token);
      if (data.success) {
        return {
          uid: data.uid,
          name: data.name,
          email: data.email,
          photoURL: data.photoURL,
          role: data.role,
        };
      }
    } catch (err) {
      console.error("Failed to fetch role:", err);
    }
    return {
      uid: u.uid,
      email: u.email,
      photoURL: u.photoURL,
      role: null,
    };
  };

  useEffect(() => {
    if (!auth) return;

    setFirebaseReady(true);

    const timer = setTimeout(() => {
      setMinTimeReached(true);
    }, 5000);

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const fullUser = await fetchUserRole(u);
        setUser(fullUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (minTimeReached && firebaseReady) {
      setLoading(false);
    }
  }, [minTimeReached, firebaseReady]);

  if (loading) return <Init />;

  return user ? <Dashboard user={user} setUser={setUser} /> : <Login setUser={setUser} />;
}
