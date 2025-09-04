import {
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    HeartIcon,
    MapPinIcon,
    PhoneIcon,
    StarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const departments = [
    {
      name: 'Cardiology',
      description: 'Comprehensive heart care and cardiovascular treatments',
      icon: HeartIcon,
      color: 'text-red-600'
    },
    {
      name: 'Neurology',
      description: 'Expert care for brain and nervous system disorders',
      icon: UserGroupIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Orthopedics',
      description: 'Advanced bone and joint care and rehabilitation',
      icon: UserGroupIcon,
      color: 'text-green-600'
    },
    {
      name: 'Pediatrics',
      description: 'Specialized care for children and adolescents',
      icon: UserGroupIcon,
      color: 'text-purple-600'
    },
    {
      name: 'Emergency Medicine',
      description: '24/7 emergency care and trauma treatment',
      icon: UserGroupIcon,
      color: 'text-orange-600'
    },
    {
      name: 'Oncology',
      description: 'Comprehensive cancer treatment and care',
      icon: UserGroupIcon,
      color: 'text-pink-600'
    }
  ]

  const features = [
    {
      title: 'Modern Technology',
      description: 'State-of-the-art medical equipment and digital health records',
      icon: CheckCircleIcon
    },
    {
      title: 'Expert Doctors',
      description: 'Experienced healthcare professionals with specialized training',
      icon: CheckCircleIcon
    },
    {
      title: '24/7 Emergency Care',
      description: 'Round-the-clock emergency services and critical care',
      icon: CheckCircleIcon
    },
    {
      title: 'Patient-Centered Care',
      description: 'Personalized treatment plans and compassionate care',
      icon: CheckCircleIcon
    }
  ]

  const stats = [
    { number: '50+', label: 'Expert Doctors' },
    { number: '1000+', label: 'Happy Patients' },
    { number: '24/7', label: 'Emergency Care' },
    { number: '15+', label: 'Medical Departments' }
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
              Welcome to eScanCare
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Providing exceptional healthcare with modern technology and compassionate care
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="btn-primary text-lg px-8 py-3 bg-white text-primary-600 hover:bg-gray-100"
              >
                Book Appointment
              </Link>
              <Link
                to="/departments"
                className="btn-secondary text-lg px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-primary-600"
              >
                Our Departments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To provide exceptional healthcare services that improve the quality of life for our patients 
              through innovative medical technology, compassionate care, and a commitment to excellence 
              in everything we do.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose eScanCare?
            </h2>
            <p className="text-xl text-gray-600">
              We combine medical excellence with cutting-edge technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <feature.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Departments
            </h2>
            <p className="text-xl text-gray-600">
              Specialized care across all major medical disciplines
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.slice(0, 6).map((dept, index) => (
              <div key={index} className="card group hover:shadow-lg transition-shadow duration-300">
                <dept.icon className={`w-12 h-12 ${dept.color} mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-gray-600 mb-4">{dept.description}</p>
                <Link
                  to="/departments"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group-hover:translate-x-1 transition-transform duration-200"
                >
                  Learn more
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/departments"
              className="btn-primary text-lg px-8 py-3"
            >
              View All Departments
            </Link>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're here to help you with all your healthcare needs. 
                Contact us for appointments, inquiries, or emergency assistance.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <PhoneIcon className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <MapPinIcon className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">123 Medical Center Dr, Healthcare City, HC 12345</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <ClockIcon className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Hours</p>
                    <p className="text-gray-600">24/7 Emergency Care • Mon-Fri: 8AM-8PM</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Map placeholder - Hospital location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from our satisfied patients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The care I received at eScanCare was exceptional. The doctors were knowledgeable 
                  and the staff was very caring. Highly recommend!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    JD
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">Patient</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of patients who trust eScanCare for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="btn-primary text-lg px-8 py-3 bg-white text-primary-600 hover:bg-gray-100"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-lg px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-primary-600"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage 