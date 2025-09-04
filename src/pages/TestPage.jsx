import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TestPage = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      
      // Test basic connection
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .limit(1)

      if (error) {
        console.error('Connection error:', error)
        setConnectionStatus('❌ Connection failed')
        toast.error('Failed to connect to database')
        return
      }

      setConnectionStatus('✅ Connected successfully')
      toast.success('Database connection successful!')

      // Test departments table
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .limit(5)

      if (!deptError && deptData) {
        setDepartments(deptData)
      }

    } catch (error) {
      console.error('Test error:', error)
      setConnectionStatus('❌ Connection failed')
      toast.error('Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        toast.success('Auth session found')
      } else {
        toast.info('No active session')
      }
    } catch (error) {
      toast.error('Auth test failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          eScanCare Hospital - Connection Test
        </h1>

        <div className="space-y-6">
          {/* Connection Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Database Connection
            </h2>
            <p className="text-gray-600">
              Status: <span className="font-medium">{connectionStatus}</span>
            </p>
            {loading && (
              <div className="mt-2">
                <div className="spinner w-4 h-4"></div>
                <span className="ml-2 text-sm text-gray-500">Testing connection...</span>
              </div>
            )}
          </div>

          {/* Test Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="btn-primary"
            >
              Test Connection
            </button>
            <button
              onClick={testAuth}
              className="btn-secondary"
            >
              Test Auth
            </button>
          </div>

          {/* Departments Test */}
          {departments.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ✅ Database Tables Working
              </h3>
              <p className="text-green-700 mb-3">
                Found {departments.length} departments in database
              </p>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <div key={dept.id} className="text-sm text-green-600">
                    • {dept.name} - {dept.location}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📋 Setup Checklist
            </h3>
            <ul className="space-y-1 text-blue-700">
              <li>✅ Environment variables configured</li>
              <li>✅ Database schema created</li>
              <li>✅ Dependencies installed</li>
              <li>✅ Development server running</li>
              <li>✅ Supabase connection working</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              🚀 Next Steps
            </h3>
            <ul className="space-y-1 text-yellow-700">
              <li>• Create test accounts for different user types</li>
              <li>• Test the QR code generation and scanning</li>
              <li>• Explore the patient and doctor portals</li>
              <li>• Customize the hospital branding</li>
              <li>• Add real hospital data</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex space-x-4">
            <a
              href="/"
              className="btn-primary"
            >
              Go to Homepage
            </a>
            <a
              href="/signup"
              className="btn-secondary"
            >
              Create Test Account
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage 