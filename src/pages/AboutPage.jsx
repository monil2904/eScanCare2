import { 
  HeartIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  LightBulbIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const AboutPage = () => {
  const values = [
    {
      title: 'Patient-Centered Care',
      description: 'Every decision we make is focused on improving patient outcomes and experiences.',
      icon: HeartIcon,
      color: 'text-red-600'
    },
    {
      title: 'Medical Excellence',
      description: 'Our team of experienced healthcare professionals provides the highest quality care.',
      icon: UserGroupIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Innovation',
      description: 'We embrace cutting-edge technology to enhance healthcare delivery.',
      icon: LightBulbIcon,
      color: 'text-yellow-600'
    },
    {
      title: 'Safety First',
      description: 'Patient safety is our top priority in everything we do.',
      icon: ShieldCheckIcon,
      color: 'text-green-600'
    }
  ]

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      specialization: 'Internal Medicine',
      experience: '15+ years'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Head of Cardiology',
      specialization: 'Cardiovascular Surgery',
      experience: '12+ years'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Pediatrics',
      specialization: 'Pediatric Care',
      experience: '10+ years'
    },
    {
      name: 'Dr. David Thompson',
      role: 'Head of Emergency Medicine',
      specialization: 'Emergency Care',
      experience: '18+ years'
    }
  ]

  const stats = [
    { number: '50+', label: 'Expert Doctors' },
    { number: '1000+', label: 'Happy Patients' },
    { number: '15+', label: 'Medical Departments' },
    { number: '24/7', label: 'Emergency Care' }
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About eScanCare
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Providing exceptional healthcare with modern technology and compassionate care since 2020
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To provide exceptional healthcare services that improve the quality of life for our patients 
                through innovative medical technology, compassionate care, and a commitment to excellence 
                in everything we do.
              </p>
              <p className="text-lg text-gray-600">
                We believe that every patient deserves access to high-quality healthcare delivered with 
                dignity, respect, and personalized attention.
              </p>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-6">
                To be the leading healthcare provider known for medical excellence, innovative technology, 
                and patient-centered care that transforms lives and communities.
              </p>
              <p className="text-lg text-gray-600">
                We envision a future where healthcare is accessible, efficient, and focused on 
                preventive care and wellness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center">
                <value.icon className={`w-12 h-12 ${value.color} mx-auto mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">
              Numbers that reflect our commitment to healthcare excellence
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

      {/* Leadership Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600">
              Meet the experienced professionals leading our healthcare mission
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-1">{member.specialization}</p>
                <p className="text-gray-500 text-sm">{member.experience} experience</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our History</h2>
            <p className="text-xl text-gray-600">
              A journey of growth and innovation in healthcare
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2020</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Foundation</h3>
              <p className="text-gray-600">
                eScanCare was founded with a vision to revolutionize healthcare through technology and compassionate care.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2022</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expansion</h3>
              <p className="text-gray-600">
                Expanded to multiple departments and introduced advanced medical technology and digital health records.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2024</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Launched QR code system and advanced patient portal for seamless healthcare experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
            <p className="text-xl text-gray-600">
              Recognition for our commitment to healthcare excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              'Best Hospital Award 2023',
              'Excellence in Patient Care',
              'Innovation in Healthcare Technology',
              'Outstanding Medical Team',
              'Community Service Award',
              'Quality Healthcare Provider'
            ].map((award, index) => (
              <div key={index} className="card text-center">
                <StarIcon className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">{award}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Healthcare Family</h2>
          <p className="text-xl mb-8 text-primary-100">
            Experience the difference that compassionate care and modern technology can make
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

export default AboutPage 