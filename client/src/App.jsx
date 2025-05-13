import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import TextEditor from './components/TextEditor';
import Login from './pages/Login';
import Editor from './pages/Editor';
import axios from 'axios';
import './styles/App.css'; // Add this import
import { ChakraProvider } from '@chakra-ui/react';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/me', {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to={`/docs/${uuidV4()}`} /> : <Login />} />
        <Route path="/docs/:id" element={user ? <TextEditor user={user} /> : <Navigate to="/" />} />
        <Route path="/editor" element={user ? <Editor /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
