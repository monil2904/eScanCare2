# 🏥 eScanCare Hospital Management System

A modern, comprehensive hospital management system built with React, Vite, and Supabase. This application provides a complete healthcare solution with patient portals, doctor dashboards, QR code integration, and administrative tools.

## ✨ Features

### 🏠 Public Features
- **Homepage** with hospital information, mission statement, and departments
- **Emergency contact numbers** prominently displayed
- **User-friendly navigation** with responsive design
- **About, Contact, and Departments** pages

### 🔐 Authentication System
- **Multi-role authentication** (Patient, Doctor, Staff, Admin)
- **Secure login/signup** with form validation
- **Password reset** functionality
- **Session management** with Supabase Auth

### 👨‍⚕️ Doctor Portal
- **Patient lookup** via QR code scanning
- **Medical record management** with diagnoses and prescriptions
- **Appointment scheduling** and management
- **Treatment history** access
- **QR code scanner** for quick patient identification

### 👤 Patient Portal
- **Personal profile** management
- **Medical history** viewing
- **Appointment management** and scheduling
- **QR code generation** for easy identification
- **Prescription and lab report** uploads
- **Real-time notifications** for medications and schedules

### 🔍 QR Code System
- **Unique QR codes** for each patient
- **Secure database storage** with Supabase
- **Webcam/phone scanner** integration
- **Encrypted patient data** access
- **QR code regeneration** capabilities

### ⚙️ Admin Panel
- **Hospital department** management
- **Doctor and staff** administration
- **Appointment oversight**
- **Analytics and logs** viewing
- **System configuration** management

### 📱 Modern UI/UX
- **Responsive design** for all devices
- **Accessibility features** for healthcare compliance
- **Modern animations** and transitions
- **Intuitive navigation** with clear information hierarchy
- **Mobile-first approach**

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Reliable database
- **Edge Functions** - Serverless backend
- **Real-time subscriptions** - Live updates
- **Row Level Security** - Data protection

### QR Code & Scanning
- **qrcode.react** - QR code generation
- **react-qr-reader** - QR code scanning
- **WebRTC** - Camera access for scanning

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd escan-care-hospital
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the API settings
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  emergency_contact JSONB,
  address JSONB,
  user_type TEXT CHECK (user_type IN ('patient', 'doctor', 'staff', 'admin')),
  department_id UUID REFERENCES departments,
  specialization TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  head_doctor_id UUID REFERENCES profiles,
  contact_number TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient QR codes table
CREATE TABLE patient_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles ON DELETE CASCADE,
  qr_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles,
  doctor_id UUID REFERENCES profiles,
  department_id UUID REFERENCES departments,
  appointment_date TIMESTAMP WITH TIME ZONE,
  appointment_time TIME,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  type TEXT CHECK (type IN ('consultation', 'follow-up', 'emergency')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical records table
CREATE TABLE medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles,
  doctor_id UUID REFERENCES profiles,
  appointment_id UUID REFERENCES appointments,
  diagnosis TEXT,
  symptoms TEXT,
  prescription JSONB,
  lab_results JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles,
  doctor_id UUID REFERENCES profiles,
  appointment_id UUID REFERENCES appointments,
  medications JSONB,
  dosage_instructions TEXT,
  duration TEXT,
  side_effects TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab reports table
CREATE TABLE lab_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles,
  doctor_id UUID REFERENCES profiles,
  appointment_id UUID REFERENCES appointments,
  test_name TEXT,
  test_results JSONB,
  reference_range JSONB,
  status TEXT CHECK (status IN ('pending', 'completed', 'abnormal')),
  report_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  title TEXT,
  message TEXT,
  type TEXT CHECK (type IN ('appointment', 'medication', 'lab_result', 'general')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospital settings table
CREATE TABLE hospital_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_name TEXT,
  mission_statement TEXT,
  emergency_contacts JSONB,
  operating_hours JSONB,
  address JSONB,
  contact_info JSONB,
  social_media JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Add more policies as needed for your specific use case
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Loading, Emergency Banner)
│   ├── layout/         # Layout components (Navigation, Footer)
│   ├── patient/        # Patient-specific components
│   ├── doctor/         # Doctor-specific components
│   ├── admin/          # Admin-specific components
│   └── qr/            # QR code components
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── patient/       # Patient portal pages
│   ├── doctor/        # Doctor portal pages
│   └── admin/         # Admin panel pages
├── stores/            # State management (Zustand)
├── lib/               # Utility libraries (Supabase client)
└── styles/            # Global styles and Tailwind config
```

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** with Supabase Auth
- **Encrypted data transmission** with HTTPS
- **Input validation** and sanitization
- **Role-based access control** (RBAC)
- **Secure QR code generation** with unique identifiers

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop computers** (1024px+)
- **Tablets** (768px - 1023px)
- **Mobile phones** (320px - 767px)
- **Touch interfaces** with proper touch targets

## ♿ Accessibility

- **WCAG 2.1 AA compliance** for healthcare accessibility
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Focus management** for better UX

## 🚀 Deployment

### GitHub Pages (Automated)
This project is configured for automatic deployment to GitHub Pages:

1. **Set up environment variables** (Required):
   - Follow the detailed guide in [`GITHUB_ENV_SETUP.md`](./GITHUB_ENV_SETUP.md)
   - Add your Supabase credentials as GitHub repository secrets

2. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy on push to main/master branch

3. **Your site will be available at:**
   ```
   https://yourusername.github.io/eScanCare2/
   ```

4. **Manual deployment** (if needed):
   ```bash
   npm run deploy
   ```

### Vercel (Alternative)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify (Alternative)
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

### Manual Deployment
1. Build: `npm run build`
2. Upload `dist` folder to your web server
3. Configure environment variables on your server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Updates and Maintenance

- **Regular security updates** for dependencies
- **Database backups** via Supabase
- **Performance monitoring** and optimization
- **User feedback** integration
- **Feature enhancements** based on usage analytics

---

**Built with ❤️ for modern healthcare management**