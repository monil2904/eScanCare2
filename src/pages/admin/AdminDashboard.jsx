import {
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    UserPlusIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('whitelist')
  const [whitelistEntries, setWhitelistEntries] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  // Form states
  const [addForm, setAddForm] = useState({
    email: '',
    user_type: 'doctor',
    full_name: '',
    phone: '',
    department_id: '',
    specialization: '',
  })

  const [approveForm, setApproveForm] = useState({
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchWhitelistEntries()
    fetchDepartments()
  }, [])

  const fetchWhitelistEntries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('whitelist_admin_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWhitelistEntries(data || [])
    } catch (error) {
      console.error('Error fetching whitelist entries:', error)
      toast.error('Failed to fetch whitelist entries')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('add-whitelist-user', {
        body: addForm
      })

      if (error) throw error

      if (data.error) {
        throw new Error(data.error)
      }

      toast.success('User added to whitelist successfully!')
      setShowAddForm(false)
      setAddForm({
        email: '',
        user_type: 'doctor',
        full_name: '',
        phone: '',
        department_id: '',
        specialization: '',
      })
      fetchWhitelistEntries()
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error(error.message || 'Failed to add user to whitelist')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (e) => {
    e.preventDefault()
    
    if (approveForm.password !== approveForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('approve-whitelist-user', {
        body: {
          whitelist_id: selectedEntry.id,
          action: 'approve',
          password: approveForm.password
        }
      })

      if (error) throw error

      if (data.error) {
        throw new Error(data.error)
      }

      toast.success('User approved and account created successfully!')
      setShowApproveForm(false)
      setSelectedEntry(null)
      setApproveForm({ password: '', confirmPassword: '' })
      fetchWhitelistEntries()
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error(error.message || 'Failed to approve user')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectUser = async (entryId) => {
    if (!confirm('Are you sure you want to reject this user?')) return

    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('approve-whitelist-user', {
        body: {
          whitelist_id: entryId,
          action: 'reject'
        }
      })

      if (error) throw error

      if (data.error) {
        throw new Error(data.error)
      }

      toast.success('User rejected successfully!')
      fetchWhitelistEntries()
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast.error(error.message || 'Failed to reject user')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />
      case 'approved': return <CheckCircleIcon className="w-4 h-4" />
      case 'rejected': return <XCircleIcon className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, departments, and system settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('whitelist')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'whitelist'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserGroupIcon className="w-5 h-5 inline mr-2" />
            User Whitelist
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'departments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
            Departments
          </button>
        </nav>
      </div>

      {/* Whitelist Tab */}
      {activeTab === 'whitelist' && (
        <div className="space-y-6">
          {/* Add User Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">User Whitelist Management</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Add User to Whitelist
            </button>
          </div>

          {/* Whitelist Entries Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : whitelistEntries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No whitelist entries found
                      </td>
                    </tr>
                  ) : (
                    whitelistEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.full_name}
                            </div>
                            <div className="text-sm text-gray-500">{entry.email}</div>
                            {entry.phone && (
                              <div className="text-sm text-gray-500">{entry.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {entry.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.department_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(entry.status)}`}>
                            {getStatusIcon(entry.status)}
                            <span className="ml-1">{entry.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {entry.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedEntry(entry)
                                  setShowApproveForm(true)
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectUser(entry.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add User to Whitelist</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Type</label>
                  <select
                    value={addForm.user_type}
                    onChange={(e) => setAddForm({ ...addForm, user_type: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    value={addForm.department_id}
                    onChange={(e) => setAddForm({ ...addForm, department_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                {addForm.user_type === 'doctor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specialization</label>
                      <input
                        type="text"
                        value={addForm.specialization}
                        onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approve User Modal */}
      {showApproveForm && selectedEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Approve User: {selectedEntry.full_name}
              </h3>
              <form onSubmit={handleApproveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Set Password</label>
                  <input
                    type="password"
                    required
                    value={approveForm.password}
                    onChange={(e) => setApproveForm({ ...approveForm, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter password for the user"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={approveForm.confirmPassword}
                    onChange={(e) => setApproveForm({ ...approveForm, confirmPassword: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirm password"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApproveForm(false)
                      setSelectedEntry(null)
                      setApproveForm({ password: '', confirmPassword: '' })
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Approving...' : 'Approve & Create Account'}
                  </button>
                </div>
              </form>
            </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default AdminDashboard

