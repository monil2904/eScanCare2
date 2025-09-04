import { 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline'

const ContactPage = () => {
  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: [
        'Main: +1 (555) 123-4567',
        'Emergency: 911',
        'Ambulance: 108'
      ]
    },
    {
      icon: MapPinIcon,
      title: 'Address',
      details: [
        '123 Medical Center Drive',
        'Healthcare City, HC 12345',
        'United States'
      ]
    },
    {
      icon: ClockIcon,
      title: 'Hours',
      details: [
        'Emergency: 24/7',
        'Outpatient: Mon-Fri 8AM-8PM',
        'Weekend: 9AM-5PM'
      ]
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: [
        'info@escan-care.com',
        'emergency@escan-care.com',
        'appointments@escan-care.com'
      ]
    }
  ]

  const departments = [
    {
      name: 'Emergency Medicine',
      phone: '+1 (555) 123-4001',
      email: 'emergency@escan-care.com',
      hours: '24/7'
    },
    {
      name: 'Cardiology',
      phone: '+1 (555) 123-4002',
      email: 'cardiology@escan-care.com',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Pediatrics',
      phone: '+1 (555) 123-4003',
      email: 'pediatrics@escan-care.com',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Orthopedics',
      phone: '+1 (555) 123-4004',
      email: 'orthopedics@escan-care.com',
      hours: 'Mon-Fri 8AM-6PM'
    }
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            We're here to help you with all your healthcare needs
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              Reach out to us for appointments, inquiries, or emergency assistance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="card text-center">
                <info.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Contacts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Department Contacts</h2>
            <p className="text-xl text-gray-600">
              Direct contact information for each medical department
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{dept.name}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-600">{dept.phone}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{dept.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hours:</span>
                    <p className="text-gray-600">{dept.hours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
            <p className="text-xl text-gray-600">
              Visit our hospital for in-person care
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">eScanCare Hospital</p>
                    <p className="text-gray-600">123 Medical Center Drive</p>
                    <p className="text-gray-600">Healthcare City, HC 12345</p>
                    <p className="text-gray-600">United States</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Main Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <ClockIcon className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Operating Hours</p>
                    <p className="text-gray-600">Emergency: 24/7</p>
                    <p className="text-gray-600">Outpatient: Mon-Fri 8AM-8PM</p>
                    <p className="text-gray-600">Weekend: 9AM-5PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Interactive map placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Information */}
      <section className="py-16 bg-danger-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-danger-900 mb-4">Emergency Information</h2>
            <p className="text-xl text-danger-700">
              For medical emergencies, call immediately
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-danger-900 mb-2">Emergency</h3>
              <p className="text-2xl font-bold text-danger-600">911</p>
              <p className="text-danger-700">For life-threatening emergencies</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-danger-900 mb-2">Ambulance</h3>
              <p className="text-2xl font-bold text-danger-600">108</p>
              <p className="text-danger-700">For medical transport</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-danger-900 mb-2">Hospital</h3>
              <p className="text-2xl font-bold text-danger-600">+1 (555) 123-4567</p>
              <p className="text-danger-700">Direct hospital line</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            <p className="text-xl text-gray-600">
              Have a question or need assistance? We'd love to hear from you.
            </p>
          </div>
          
          <div className="card">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="mt-1 input-field"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="mt-1 input-field"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 input-field"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="mt-1 input-field"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="mt-1 input-field"
                >
                  <option value="">Select a subject</option>
                  <option value="appointment">Appointment Booking</option>
                  <option value="general">General Inquiry</option>
                  <option value="billing">Billing Question</option>
                  <option value="medical">Medical Question</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="mt-1 input-field"
                  placeholder="Enter your message"
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage 