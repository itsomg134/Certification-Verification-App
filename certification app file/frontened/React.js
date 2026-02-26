// App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import './App.css';

// Login Component
const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

// Certificate Verification Component
const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyCertificate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3000/api/verify/${certificateId}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <h2>Verify Certificate</h2>
      <form onSubmit={verifyCertificate}>
        <input
          type="text"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className={`result ${result.valid ? 'valid' : 'invalid'}`}>
          <h3>Verification Result</h3>
          <p className="message">{result.message}</p>
          {result.certificate && (
            <div className="certificate-details">
              <p><strong>Certificate ID:</strong> {result.certificate.certificateId}</p>
              <p><strong>Recipient:</strong> {result.certificate.recipientName}</p>
              <p><strong>Course:</strong> {result.certificate.courseName}</p>
              <p><strong>Issue Date:</strong> {new Date(result.certificate.issueDate).toLocaleDateString()}</p>
              {result.certificate.expiryDate && (
                <p><strong>Expiry Date:</strong> {new Date(result.certificate.expiryDate).toLocaleDateString()}</p>
              )}
              <p><strong>Issuer:</strong> {result.certificate.issuer}</p>
              {result.certificate.grade && <p><strong>Grade:</strong> {result.certificate.grade}</p>}
              <p><strong>Status:</strong> <span className={`status ${result.certificate.status}`}>
                {result.certificate.status}
              </span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Dashboard Component (Protected)
const Dashboard = ({ user }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    courseName: '',
    issuer: user?.organization || '',
    grade: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/certificates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCertificate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowForm(false);
        setFormData({
          recipientName: '',
          recipientEmail: '',
          courseName: '',
          issuer: user?.organization || '',
          grade: '',
          expiryDate: ''
        });
        fetchCertificates();
      }
    } catch (error) {
      console.error('Failed to create certificate:', error);
    }
  };

  const revokeCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/certificates/${certificateId}/revoke`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchCertificates();
      }
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Certificate Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Issue New Certificate'}
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={createCertificate} className="certificate-form">
          <h3>Issue New Certificate</h3>
          <input
            type="text"
            placeholder="Recipient Name"
            value={formData.recipientName}
            onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Recipient Email"
            value={formData.recipientEmail}
            onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Course Name"
            value={formData.courseName}
            onChange={(e) => setFormData({...formData, courseName: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Issuer"
            value={formData.issuer}
            onChange={(e) => setFormData({...formData, issuer: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Grade (Optional)"
            value={formData.grade}
            onChange={(e) => setFormData({...formData, grade: e.target.value})}
          />
          <input
            type="date"
            placeholder="Expiry Date (Optional)"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
          />
          <button type="submit" className="btn-primary">Create Certificate</button>
        </form>
      )}
      
      {loading ? (
        <p>Loading certificates...</p>
      ) : (
        <div className="certificates-list">
          <h3>Recent Certificates</h3>
          <table>
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Recipient</th>
                <th>Course</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert._id}>
                  <td>{cert.certificateId}</td>
                  <td>{cert.recipientName}</td>
                  <td>{cert.courseName}</td>
                  <td>{new Date(cert.issueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${cert.status}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td>
                    {cert.status === 'active' && (
                      <button
                        onClick={() => revokeCertificate(cert.certificateId)}
                        className="btn-danger btn-small"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">CertVerify</div>
          <div className="nav-links">
            <Link to="/verify">Verify Certificate</Link>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route 
              path="/login" 
              element={
                user ? 
                <Navigate to="/dashboard" /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? 
                <Dashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route path="/" element={<Navigate to="/verify" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;