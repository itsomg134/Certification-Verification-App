# Certification Verification System

A secure and scalable web application for issuing, managing, and verifying digital certificates with QR code integration and blockchain-ready architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![React](https://img.shields.io/badge/react-v18+-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)

##  Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

##  Features

### For Certificate Issuers
- **Secure Authentication**: JWT-based login system with role-based access control
- **Certificate Management**: Create, view, and revoke certificates
- **Bulk Operations**: Import/export certificates via CSV
- **QR Code Generation**: Automatic QR codes for each certificate
- **Email Notifications**: Send certificates directly to recipients
- **Audit Logs**: Track all actions with timestamp and user info

### For Certificate Holders
- **Instant Verification**: Verify certificates using unique ID or QR code
- **Digital Wallet**: Store certificates in personal digital wallet
- **Shareable Links**: Generate shareable verification links
- **PDF Export**: Download certificates as PDF
- **Blockchain Verification**: Optional blockchain-based verification

### Public Features
- **Public Verification Portal**: Anyone can verify certificates
- **Real-time Status**: Check if certificates are active, revoked, or expired
- **Mobile Responsive**: Works seamlessly on all devices
- **Multi-language Support**: English, Spanish, French, German

##  Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM library
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **QRCode** - QR code generation
- **NodeMailer** - Email service
- **Winston** - Logging
- **Jest** - Testing

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Query** - State management
- **React Hook Form** - Form handling
- **Recharts** - Analytics dashboard

### DevOps & Tools
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

##  System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React Frontend│────▶│   Node.js API   │────▶│    MongoDB      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   QR Scanner    │     │  Email Service  │     │   File Storage  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

##  Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn
- Git

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/certification-verification-system.git
cd certification-verification-system
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**
```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Frontend (.env)
cp frontend/.env.example frontend/.env
```

5. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local installation
mongod
```

6. **Run the application**
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm start
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

##  Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/certification_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Blockchain (Optional)
BLOCKCHAIN_ENABLED=false
WEB3_PROVIDER=https://mainnet.infura.io/v3/your-project-id

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_QR_SCANNER_ENABLED=true
REACT_APP_DEFAULT_LANG=en
```

##  Usage

### Creating an Admin Account

1. Register via API:
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"securepass","organization":"My Org"}'
```

2. Or use the registration form at `/register`

### Issuing a Certificate

1. **Login** to the dashboard
2. Click **"Issue New Certificate"**
3. Fill in the certificate details:
   - Recipient Name
   - Recipient Email
   - Course Name
   - Grade (optional)
   - Expiry Date (optional)
4. Click **"Create Certificate"**
5. Download QR code or send via email

### Verifying a Certificate

**Method 1: Using Certificate ID**
- Visit `/verify` and enter the certificate ID
- Or use API: `GET /api/verify/{certificateId}`

**Method 2: Using QR Code**
- Scan the QR code on the certificate
- Automatically redirects to verification page

**Method 3: Bulk Verification**
- Upload CSV file with certificate IDs
- Get instant verification results

##  API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Register new user | No |
| POST | `/api/login` | User login | No |
| POST | `/api/logout` | User logout | Yes |
| GET | `/api/profile` | Get user profile | Yes |

### Certificate Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/verify/:id` | Verify certificate | No |
| GET | `/api/certificates` | Get all certificates | Yes |
| POST | `/api/certificates` | Create certificate | Yes |
| PUT | `/api/certificates/:id` | Update certificate | Yes |
| DELETE | `/api/certificates/:id` | Delete certificate | Yes (Admin) |
| POST | `/api/certificates/bulk` | Bulk create certificates | Yes |
| GET | `/api/certificates/:id/pdf` | Download PDF | Yes |
| GET | `/api/certificates/:id/qr` | Get QR code | Yes |

### Example API Calls

```javascript
// Verify certificate
fetch('http://localhost:5000/api/verify/CERT-123ABC')
  .then(response => response.json())
  .then(data => console.log(data));

// Create certificate (authenticated)
fetch('http://localhost:5000/api/certificates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    recipientName: 'John Doe',
    recipientEmail: 'john@example.com',
    courseName: 'Advanced JavaScript',
    issuer: 'Tech Academy'
  })
});
```

##  Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Short-lived with refresh mechanism
- **Rate Limiting**: Prevent brute force attacks
- **CORS Protection**: Configured for specific origins
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Token-based
- **SQL Injection Prevention**: MongoDB sanitization
- **HTTPS Enforcement**: In production
- **Audit Logging**: All critical actions logged
- **2FA Support**: Optional two-factor authentication

##  Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Certificate Verification
![Verification](https://via.placeholder.com/800x400?text=Verification+Screenshot)

### Certificate Creation
![Create Certificate](https://via.placeholder.com/800x400?text=Create+Certificate+Screenshot)

##  Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commits

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Team

- **Project Lead**: [Your Name](https://github.com/yourusername)
- **Backend Developer**: [Contributor Name](https://github.com/contributor)
- **Frontend Developer**: [Contributor Name](https://github.com/contributor)

## Contact

Om Gedam

GitHub: @itsomg134

Email: omgedam123098@gmail.com

Twitter (X): @omgedam

LinkedIn: Om Gedam

Portfolio: https://ogworks.lovable.app

## Roadmap

- [x] Basic CRUD operations
- [x] QR code generation
- [x] Email notifications
- [ ] Blockchain integration
- [ ] Mobile app (React Native)
- [ ] AI-powered fraud detection
- [ ] Integration with major LMS platforms
- [ ] White-label solution
- [ ] API marketplace
