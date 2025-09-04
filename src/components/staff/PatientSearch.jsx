import { EnvelopeIcon, EyeIcon, MagnifyingGlassIcon, PhoneIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const PatientSearch = ({ onPatientSelected }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchPatients();
    } else {
      setPatients([]);
    }
  }, [searchQuery]);

  const searchPatients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          date_of_birth,
          gender,
          blood_type,
          address,
          emergency_contact,
          created_at
        `)
        .eq('user_type', 'patient')
        .or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .order('full_name')
        .limit(20);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    if (onPatientSelected) {
      onPatientSelected(patient);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patients by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Search Results */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner w-6 h-6 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Searching patients...</p>
        </div>
      )}

      {!loading && patients.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Found {patients.length} patient{patients.length !== 1 ? 's' : ''}
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{patient.full_name}</h4>
                      <span className="text-sm text-gray-500">
                        ({calculateAge(patient.date_of_birth)} years)
                      </span>
                      {patient.gender && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {patient.gender}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{patient.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{patient.email}</span>
                      </div>
                    </div>
                    
                    {patient.blood_type && (
                      <div className="text-sm text-gray-600">
                        Blood Type: {patient.blood_type}
                      </div>
                    )}
                    
                    {patient.address?.street && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Address:</span> {patient.address.street}
                        {patient.address.city && `, ${patient.address.city}`}
                        {patient.address.state && `, ${patient.address.state}`}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePatientSelect(patient);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                      title="View details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Registered: {formatDate(patient.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && searchQuery.length >= 2 && patients.length === 0 && (
        <div className="text-center py-8">
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No patients found</p>
          <p className="text-sm text-gray-500">Try searching with a different term</p>
        </div>
      )}

      {searchQuery.length < 2 && (
        <div className="text-center py-8">
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Enter at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
};

export default PatientSearch; 