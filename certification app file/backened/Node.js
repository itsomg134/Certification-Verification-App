// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/certification_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Certification Schema
const certificationSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true, required: true },
  recipientName: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  courseName: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  expiryDate: Date,
  issuer: { type: String, required: true },
  grade: String,
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  hash: String,
  metadata: {
    duration: String,
    credits: Number,
    issuerSignature: String
  },
  createdAt: { type: Date, default: Date.now }
});

// User Schema (for admins/issuers)
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'issuer'], default: 'issuer' },
  organization: String
});

const Certification = mongoose.model('Certification', certificationSchema);
const User = mongoose.model('User', userSchema);

// Generate unique certificate ID
function generateCertificateId() {
  return 'CERT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Generate hash for certificate
function generateHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, organization } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      organization
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create new certificate (Protected)
app.post('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const certificateData = req.body;
    
    // Generate unique certificate ID
    const certificateId = generateCertificateId();
    
    // Create certificate object with hash
    const certificate = new Certification({
      ...certificateData,
      certificateId,
      hash: generateHash(certificateData)
    });
    
    await certificate.save();
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(`${req.protocol}://${req.get('host')}/verify/${certificateId}`);
    
    res.status(201).json({
      ...certificate.toObject(),
      qrCode
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify certificate by ID
app.get('/api/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certification.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Certificate not found' 
      });
    }
    
    // Check if certificate is revoked
    if (certificate.status === 'revoked') {
      return res.json({
        valid: false,
        message: 'This certificate has been revoked',
        certificate: {
          recipientName: certificate.recipientName,
          courseName: certificate.courseName,
          issueDate: certificate.issueDate,
          issuer: certificate.issuer,
          status: certificate.status
        }
      });
    }
    
    // Check if certificate is expired
    if (certificate.expiryDate && new Date() > certificate.expiryDate) {
      certificate.status = 'expired';
      await certificate.save();
    }
    
    res.json({
      valid: true,
      message: 'Certificate is valid',
      certificate: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        courseName: certificate.courseName,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        issuer: certificate.issuer,
        grade: certificate.grade,
        status: certificate.status
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all certificates (Protected)
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const certificates = await Certification.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Revoke certificate (Protected)
app.put('/api/certificates/:certificateId/revoke', authenticateToken, async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certification.findOneAndUpdate(
      { certificateId },
      { status: 'revoked' },
      { new: true }
    );
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    res.json({ message: 'Certificate revoked successfully', certificate });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate certificate PDF (Simplified - you'd need a PDF library for full implementation)
app.get('/api/certificates/:certificateId/pdf', async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certification.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    // In a real implementation, you would generate a PDF here
    // For now, we'll return the certificate data
    res.json({
      message: 'PDF generation endpoint - implement with pdfkit or similar library',
      certificate
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});