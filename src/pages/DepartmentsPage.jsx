import {
    AcademicCapIcon,
    BeakerIcon,
    ClockIcon,
    CogIcon,
    EyeIcon,
    HeartIcon,
    MapPinIcon,
    PhoneIcon,
    UserGroupIcon,
    UserIcon
} from '@heroicons/react/24/outline'

const DepartmentsPage = () => {
  const departments = [
    {
      name: 'Cardiology',
      description: 'Comprehensive heart care and cardiovascular treatments',
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      services: [
        'Heart Disease Treatment',
        'Cardiac Surgery',
        'Echocardiography',
        'Stress Testing',
        'Cardiac Rehabilitation'
      ],
      doctors: 8,
      location: 'Floor 2, Wing A',
      phone: '+1 (555) 123-4002',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Neurology',
      description: 'Expert care for brain and nervous system disorders',
      icon: AcademicCapIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      services: [
        'Stroke Treatment',
        'Epilepsy Management',
        'Multiple Sclerosis Care',
        'Neurological Surgery',
        'Neurodiagnostic Testing'
      ],
      doctors: 6,
      location: 'Floor 3, Wing B',
      phone: '+1 (555) 123-4005',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Orthopedics',
      description: 'Advanced bone and joint care and rehabilitation',
      icon: CogIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      services: [
        'Joint Replacement',
        'Sports Medicine',
        'Spine Surgery',
        'Fracture Treatment',
        'Physical Therapy'
      ],
      doctors: 10,
      location: 'Floor 1, Wing C',
      phone: '+1 (555) 123-4004',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Pediatrics',
      description: 'Specialized care for children and adolescents',
      icon: UserIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      services: [
        'Well-Child Care',
        'Vaccinations',
        'Childhood Illnesses',
        'Developmental Screening',
        'Adolescent Medicine'
      ],
      doctors: 7,
      location: 'Floor 2, Wing D',
      phone: '+1 (555) 123-4003',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Emergency Medicine',
      description: '24/7 emergency care and trauma treatment',
      icon: UserGroupIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      services: [
        'Trauma Care',
        'Critical Care',
        'Emergency Surgery',
        'Triage Services',
        'Ambulance Services'
      ],
      doctors: 12,
      location: 'Ground Floor, Emergency Wing',
      phone: '+1 (555) 123-4001',
      hours: '24/7'
    },
    {
      name: 'Oncology',
      description: 'Comprehensive cancer treatment and care',
      icon: BeakerIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      services: [
        'Chemotherapy',
        'Radiation Therapy',
        'Cancer Surgery',
        'Hematology',
        'Palliative Care'
      ],
      doctors: 9,
      location: 'Floor 4, Wing E',
      phone: '+1 (555) 123-4006',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Ophthalmology',
      description: 'Eye care and vision treatment',
      icon: EyeIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      services: [
        'Eye Surgery',
        'Vision Correction',
        'Retinal Care',
        'Glaucoma Treatment',
        'Pediatric Ophthalmology'
      ],
      doctors: 5,
      location: 'Floor 2, Wing F',
      phone: '+1 (555) 123-4007',
      hours: 'Mon-Fri 8AM-6PM'
    },
    {
      name: 'Dental Care',
      description: 'Comprehensive dental and oral health services',
      icon: CogIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      services: [
        'General Dentistry',
        'Orthodontics',
        'Oral Surgery',
        'Periodontics',
        'Pediatric Dentistry'
      ],
      doctors: 6,
      location: 'Floor 1, Wing G',
      phone: '+1 (555) 123-4008',
      hours: 'Mon-Fri 8AM-6PM'
    }
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Departments
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Specialized care across all major medical disciplines with expert healthcare professionals
          </p>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Medical Departments</h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare services for all your medical needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="card group hover:shadow-lg transition-shadow duration-300">
                <div className={`w-16 h-16 ${dept.bgColor} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <dept.icon className={`w-8 h-8 ${dept.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-gray-600 mb-4">{dept.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Doctors:</span>
                    <span className="font-medium text-gray-900">{dept.doctors}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{dept.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hours:</span>
                    <span className="font-medium text-gray-900">{dept.hours}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Services:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {dept.services.slice(0, 3).map((service, serviceIndex) => (
                      <li key={serviceIndex} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                        {service}
                      </li>
                    ))}
                    {dept.services.length > 3 && (
                      <li className="text-primary-600 font-medium">
                        +{dept.services.length - 3} more services
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{dept.phone}</span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Departments?</h2>
            <p className="text-xl text-gray-600">
              State-of-the-art facilities and expert care teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Expert Doctors',
                description: 'Board-certified specialists with years of experience',
                icon: UserGroupIcon
              },
              {
                title: 'Modern Technology',
                description: 'Latest medical equipment and diagnostic tools',
                icon: BeakerIcon
              },
              {
                title: 'Comprehensive Care',
                description: 'Full spectrum of medical services under one roof',
                icon: HeartIcon
              },
              {
                title: 'Patient-Centered',
                description: 'Personalized care plans for every patient',
                icon: UserIcon
              }
            ].map((feature, index) => (
              <div key={index} className="card text-center">
                <feature.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Contact Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Department Contacts</h2>
            <p className="text-xl text-gray-600">
              Get in touch with specific departments for appointments and inquiries
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.slice(0, 8).map((dept, index) => (
              <div key={index} className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 ${dept.bgColor} rounded-lg flex items-center justify-center`}>
                    <dept.icon className={`w-5 h-5 ${dept.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-500">{dept.location}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{dept.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{dept.hours}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{dept.location}</span>
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
          <h2 className="text-3xl font-bold mb-4">
            Ready to Schedule an Appointment?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Contact any department directly or use our online booking system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="btn-primary text-lg px-8 py-3 bg-white text-primary-600 hover:bg-gray-100"
            >
              Contact Us
            </a>
            <a
              href="/signup"
              className="btn-secondary text-lg px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-primary-600"
            >
              Book Appointment
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DepartmentsPage 