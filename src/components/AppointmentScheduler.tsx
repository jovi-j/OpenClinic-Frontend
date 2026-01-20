import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../services/apiService';
import type { GroupedAppointmentsDTO, AvailableAppointmentTimeDTO, MedicResponseDTO, PatientResponseDTO } from '../types/api';

interface AppointmentSchedulerProps {
  patientId?: string; // If provided (e.g. logged in patient), pre-select and hide search
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ patientId: propPatientId }) => {
  // Data for search
  const [allMedics, setAllMedics] = useState<MedicResponseDTO[]>([]);
  const [allPatients, setAllPatients] = useState<PatientResponseDTO[]>([]);

  // Selection states
  const [medicId, setMedicId] = useState('');
  const [patientId, setPatientId] = useState(propPatientId || '');

  // Search inputs
  const [medicSearch, setMedicSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  // UI states
  const [showMedicOptions, setShowMedicOptions] = useState(false);
  const [showPatientOptions, setShowPatientOptions] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<GroupedAppointmentsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // New UI States for Month/Day selection
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Format: YYYY-MM
  const [selectedDay, setSelectedDay] = useState<string>(''); // Format: YYYY-MM-DD

  // Refs for clicking outside
  const medicWrapperRef = useRef<HTMLDivElement>(null);
  const patientWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load directories for search
    const loadDirectories = async () => {
      try {
        const [medicsData, patientsData] = await Promise.all([
          ApiService.listMedics(),
          ApiService.listPatients()
        ]);
        setAllMedics(medicsData);
        setAllPatients(patientsData);
      } catch (err) {
        console.error("Failed to load directories", err);
      }
    };
    loadDirectories();

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (medicWrapperRef.current && !medicWrapperRef.current.contains(event.target as Node)) {
        setShowMedicOptions(false);
      }
      if (patientWrapperRef.current && !patientWrapperRef.current.contains(event.target as Node)) {
        setShowPatientOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic
  const filteredMedics = allMedics.filter(m => {
    const search = medicSearch.toLowerCase();
    return m.person?.name?.toLowerCase().includes(search) ||
           m.crm?.toLowerCase().includes(search) ||
           m.type?.toLowerCase().includes(search);
  });

  const filteredPatients = allPatients.filter(p => {
    const search = patientSearch.toLowerCase();
    return p.person?.name?.toLowerCase().includes(search) ||
           p.person?.cpf?.includes(search);
  });

  const fetchAvailableSlots = async (id: string) => {
    if (!id) return;

    setLoading(true);
    setMessage(null);
    setAvailableSlots([]);
    setSelectedSlotId(null);
    setSelectedMonth('');
    setSelectedDay('');

    try {
      const data = await ApiService.getAvailableAppointmentsByMedic(id);
      setAvailableSlots(data);
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'No available slots found for this medic.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `Error fetching slots: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleMedicSelect = (medic: MedicResponseDTO) => {
    setMedicId(medic.id || '');
    setMedicSearch(medic.person?.name || '');
    setShowMedicOptions(false);
    if (medic.id) {
      fetchAvailableSlots(medic.id);
    }
  };

  const handlePatientSelect = (patient: PatientResponseDTO) => {
    setPatientId(patient.id || '');
    setPatientSearch(patient.person?.name || '');
    setShowPatientOptions(false);
  };

  const handleSchedule = async () => {
    if (!selectedSlotId || !patientId) {
      setMessage({ type: 'error', text: 'Please select a slot and a Patient' });
      return;
    }

    try {
      const result = await ApiService.scheduleAppointment({
        patientId,
        appointmentId: selectedSlotId
      });

      const date = new Date(`${result.date}T${result.hour?.toString().padStart(2, '0')}:${result.minute?.toString().padStart(2, '0')}:00`);
      const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

      setMessage({
        type: 'success',
        text: `Appointment scheduled successfully for ${formattedDate} at ${formattedTime}`
      });
      // Refresh slots
      if (medicId) fetchAvailableSlots(medicId);
      setSelectedSlotId(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: `Error scheduling appointment: ${err.message}` });
    }
  };

  // Helper to get available months (current + next 2)
  const getAvailableMonths = () => {
    const months = new Set<string>();
    const today = new Date();
    const limit = new Date();
    limit.setMonth(today.getMonth() + 3); // Current + 2 next months (approx)

    availableSlots.forEach(group => {
      if (!group.date) return;
      const date = new Date(group.date);
      if (date >= today && date < limit) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort();
  };

  // Helper to get days for selected month
  const getDaysForMonth = () => {
    if (!selectedMonth) return [];
    return availableSlots.filter(group => group.date?.startsWith(selectedMonth));
  };

  // Helper to get slots for selected day
  const getSlotsForDay = () => {
    if (!selectedDay) return [];
    const dayGroup = availableSlots.find(group => group.date === selectedDay);
    return dayGroup?.appointments || [];
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    // Adjust for timezone offset to show correct day
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Medic Search */}
        <div className="flex-1 relative" ref={medicWrapperRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Find Medic</label>
          <div className="relative">
            <input
              type="text"
              value={medicSearch}
              onChange={(e) => {
                setMedicSearch(e.target.value);
                setMedicId('');
                setShowMedicOptions(true);
                setAvailableSlots([]);
                setSelectedMonth('');
                setSelectedDay('');
              }}
              onFocus={() => setShowMedicOptions(true)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              placeholder="Search by Name, CRM or Specialty..."
            />
            {loading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {showMedicOptions && medicSearch && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredMedics.length > 0 ? (
                filteredMedics.map((medic) => (
                  <div
                    key={medic.id}
                    onClick={() => handleMedicSelect(medic)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                  >
                    <div className="flex items-center">
                      <span className="font-medium block truncate">{medic.person?.name}</span>
                      <span className="text-gray-500 ml-2 text-xs">({medic.type}) - CRM: {medic.crm}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">
                  No medics found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Patient Search (Hidden if patientId is provided via props) */}
        {!propPatientId && (
          <div className="flex-1 relative" ref={patientWrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Find Patient</label>
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setPatientId('');
                setShowPatientOptions(true);
              }}
              onFocus={() => setShowPatientOptions(true)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              placeholder="Search by Name or CPF..."
            />

            {showPatientOptions && patientSearch && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                    >
                      <div className="flex items-center">
                        <span className="font-medium block truncate">{patient.person?.name}</span>
                        <span className="text-gray-500 ml-2 text-xs">CPF: {patient.person?.cpf}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">
                    No patients found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-start ${
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' :
          'bg-blue-50 text-blue-800 border border-blue-100'
        }`}>
          <span className="mr-2 text-lg">
            {message.type === 'error' ? '⚠️' : message.type === 'success' ? '✅' : 'ℹ️'}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Step 1: Select Month */}
      {availableSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">1. Select Month</h3>
          <div className="flex flex-wrap gap-3">
            {getAvailableMonths().map(month => (
              <button
                key={month}
                onClick={() => {
                  setSelectedMonth(month);
                  setSelectedDay('');
                  setSelectedSlotId(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMonth === month
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {formatMonth(month)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Day */}
      {selectedMonth && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">2. Select Day</h3>
          <div className="flex flex-wrap gap-3">
            {getDaysForMonth().map(group => (
              <button
                key={group.date}
                onClick={() => {
                  setSelectedDay(group.date!);
                  setSelectedSlotId(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  selectedDay === group.date
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {formatDay(group.date!)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Time Slot */}
      {selectedDay && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">3. Select Time</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {getSlotsForDay().map((slot: AvailableAppointmentTimeDTO) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id || null)}
                className={`py-2 px-1 text-center rounded-md text-sm font-medium border transition-all ${
                  selectedSlotId === slot.id
                    ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {slot.hour?.toString().padStart(2, '0')}:{slot.minute?.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSlotId && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSchedule}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Confirm Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;
