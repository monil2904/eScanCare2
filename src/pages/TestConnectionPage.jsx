import { useState } from 'react'
import { testDatabaseSetup } from '../lib/simple-test.js'

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    try {
      const result = await testDatabaseSetup()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Database Connection Test
          </h1>
          
          <div className="mb-6">
            <button
              onClick={runTest}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Running Test...' : 'Run Database Test'}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-2 ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ Test Passed!' : '❌ Test Failed'}
              </h2>
              
              {testResult.error && (
                <div className="text-sm">
                  <p className="font-medium text-red-700 mb-2">Error Details:</p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(testResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Troubleshooting Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Make sure you have created the <code className="bg-gray-200 px-1 rounded">.env</code> file with your Supabase credentials</li>
              <li>Run the database schema in your Supabase SQL Editor</li>
              <li>Check that all tables are created successfully</li>
              <li>Verify RLS policies are properly set up</li>
              <li>Restart the development server after making changes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 