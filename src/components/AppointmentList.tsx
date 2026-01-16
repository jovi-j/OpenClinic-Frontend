import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { AppointmentResponseDTO, MedicResponseDTO, PatientResponseDTO, Page } from '../types/api';

interface AppointmentListProps {
  role: 'PATIENT' | 'MEDIC' | 'ATTENDANT';
  patientId?: string; // If provided, filter by this patient
  medicId?: string;   // If provided, filter by this medic
}

const AppointmentList: React.FC<AppointmentListProps> = ({ role, patientId, medicId }) => {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMedicId, setSelectedMedicId] = useState<string>(medicId || '');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || '');

  // Directories for filters
  const [medics, setMedics] = useState<MedicResponseDTO[]>([]);
  const [patients, setPatients] = useState<PatientResponseDTO[]>([]);

  useEffect(() => {
    // Load directories based on role
    const loadDirectories = async () => {
      try {
        // Always load directories to resolve names if needed
        const [medicsData, patientsData] = await Promise.all([
          ApiService.listMedics(),
          ApiService.listPatients()
        ]);
        setMedics(medicsData);
        setPatients(patientsData);
      } catch (err) {
        console.error("Failed to load directories", err);
      }
    };
    loadDirectories();
  }, []);

  const fetchAppointments = async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const criteria: any = {};
      if (selectedDate) criteria.date = selectedDate;
      if (selectedStatus) criteria.status = selectedStatus;
      
      // Use prop ID if available, otherwise use selected ID
      if (medicId) criteria.medicId = medicId;
      else if (selectedMedicId) criteria.medicId = selectedMedicId;

      if (patientId) criteria.patientId = patientId;
      else if (selectedPatientId) criteria.patientId = selectedPatientId;

      const data: Page<AppointmentResponseDTO> = await ApiService.searchAppointments(criteria, page, pageSize);
      setAppointments(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAppointments(0);
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await ApiService.cancelAppointment(id);
      fetchAppointments(currentPage); // Refresh current page
    } catch (err: any) {
      alert(`Error cancelling appointment: ${err.message}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchAppointments(newPage);
    }
  };

  const formatTime = (time: any) => {
    if (!time) return '';
    
    // If it's a string "HH:MM:SS"
    if (typeof time === 'string') {
      const parts = time.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
      return time;
    }
    
    // Fallback for object format if backend changes back
    if (time.hour !== undefined && time.minute !== undefined) {
      return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    }
    
    return String(time);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for timezone offset to display correct date
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString();
  };

  const getPatientName = (apt: AppointmentResponseDTO) => {
    if (apt.patientName) return apt.patientName;
    const patient = patients.find(p => p.id === apt.patientId);
    return patient?.person?.name || '-';
  };

  const getMedicName = (apt: AppointmentResponseDTO) => {
    if (apt.medicName) return apt.medicName;
    const medic = medics.find(m => m.id === apt.medicId);
    return medic?.person?.name || '-';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ATTENDED">Attended</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ABSENT PATIENT">Absent Patient</option>
          </select>
        </div>

        {/* Only show Medic filter if not logged in as Medic */}
        {!medicId && (role === 'ATTENDANT' || role === 'PATIENT') && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Medic</label>
            <select
              value={selectedMedicId}
              onChange={(e) => setSelectedMedicId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">All Medics</option>
              {medics.map(m => (
                <option key={m.id} value={m.id}>{m.person?.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Only show Patient filter if not logged in as Patient */}
        {!patientId && (role === 'ATTENDANT' || role === 'MEDIC') && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">All Patients</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.person?.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={() => fetchAppointments(0)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Filter
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading appointments...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(apt.date)} <span className="text-gray-500 ml-1 font-mono">{formatTime(apt.time)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getPatientName(apt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getMedicName(apt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        apt.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        apt.status === 'ATTENDED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {apt.status === 'SCHEDULED' && (role === 'MEDIC' || role === 'ATTENDANT') && (
                        <button
                          onClick={() => handleCancel(apt.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No appointments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{currentPage * pageSize + 1}</span> to <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> of <span className="font-medium">{totalElements}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Simple Page Indicator */}
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      Page {currentPage + 1} of {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentList;
