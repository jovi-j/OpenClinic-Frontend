import React, { useState } from 'react';
import { ApiService } from '../services/apiService';
import type { TicketResponseDTO, TicketQueueResponseDTO, AttendantResponseDTO, MedicResponseDTO, PatientResponseDTO, TicketQueueCallNextRequestDTO } from '../types/api';
import { useInterval } from '../helpers/polling';

interface TicketListProps {
  role?: 'MEDIC' | 'ATTENDANT' | 'PATIENT' | 'KIOSK' | 'DISPLAY';
  attendantId?: string; // Passed when role is ATTENDANT
  medicId?: string;     // Passed when role is MEDIC
}

const TicketList: React.FC<TicketListProps> = ({ role, attendantId, medicId }) => {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [queues, setQueues] = useState<TicketQueueResponseDTO[]>([]);
  const [attendants, setAttendants] = useState<AttendantResponseDTO[]>([]);
  const [medics, setMedics] = useState<MedicResponseDTO[]>([]);
  const [patients, setPatients] = useState<PatientResponseDTO[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [callingQueueId, setCallingQueueId] = useState<string | null>(null);

  // Redirect Modal State
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectTicketId, setRedirectTicketId] = useState<string | null>(null);
  const [redirectMedicId, setRedirectMedicId] = useState('');
  const [redirectPatientId, setRedirectPatientId] = useState('');
  const [redirectSearchPatient, setRedirectSearchPatient] = useState('');

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ticketsData, queuesData, attendantsData, medicsData, patientsData] = await Promise.all([
        ApiService.listTickets(),
        ApiService.listTicketQueues(),
        ApiService.listAttendants(),
        ApiService.listMedics(),
        ApiService.listPatients()
      ]);

      // Filter queues for today using local date
      const today = getLocalDateString();
      const todaysQueues = queuesData.filter(q => q.date === today);

      // Filter tickets that belong to today's queues
      const todaysQueueIds = new Set(todaysQueues.map(q => q.id));
      const todaysTickets = ticketsData.filter(t => t.ticketQueueId && todaysQueueIds.has(t.ticketQueueId));

      setTickets(todaysTickets);
      setQueues(todaysQueues);
      setAttendants(attendantsData);
      setMedics(medicsData);
      setPatients(patientsData);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        console.error("An unknown error has occurred", error)
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 3000);
    return () => clearInterval(interval);
  });

  const handleCallNext = async (queueId: string, isGeneric: boolean) => {
    // Use the passed props instead of local state selectors
    if (isGeneric && role === 'ATTENDANT' && !attendantId) {
      alert('Error: No attendant ID found. Please re-login.');
      return;
    }

    if (isGeneric && role === 'MEDIC' && !medicId) {
      alert('Error: No medic ID found. Please re-login.');
      return;
    }

    setCallingQueueId(queueId);
    try {
      const payload: TicketQueueCallNextRequestDTO = {
        ticketQueueId: queueId || undefined,
        attendantId: attendantId || undefined,
        medicId: medicId || undefined,
      };
      await ApiService.callNextTicket(payload);
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) { console.error(`Error calling next ticket.`,err); }
      else { console.error("Unknown error.", error)}
    } finally {
      setCallingQueueId(null);
    }
  };

  const handleComplete = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to complete this appointment?')) return;
    try {
      await ApiService.completeTicket(ticketId);
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) { console.error(`Error completing ticket.`,err); }
      else { console.error("Unknown error.", error) }
    }
  };

  const handleUnredeemed = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to mark this ticket as unredeemed?')) return;
    try {
      await ApiService.markTicketUnredeemed(ticketId);
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) { console.error(`Error marking ticket as unredeemed.`,err); }
      else { console.error("Unknown error.", error) }
    }
  };

  const openRedirectModal = (ticketId: string) => {
    setRedirectTicketId(ticketId);
    setRedirectMedicId('');
    setRedirectPatientId('');
    setRedirectSearchPatient('');
    setShowRedirectModal(true);
  };

  const handleRedirect = async () => {
    if (!redirectTicketId || !redirectMedicId || !redirectPatientId) {
      alert('Please select both a medic and a patient.');
      return;
    }

    try {
      await ApiService.redirectTicket(redirectTicketId, {
        medicId: redirectMedicId,
        patientId: redirectPatientId
      });
      setShowRedirectModal(false);
      await fetchData();
      alert('Ticket redirected successfully!');
    } catch (err: unknown) {
     if(err instanceof Error){
      if (err.message.includes('appointment')) {
        alert('Error: This patient does not have a scheduled appointment with this medic today.');
      } else {
        alert(`Error redirecting ticket: ${err.message}`);
      }
     }
    }
  };

  const getQueueDisplayName = (queue: TicketQueueResponseDTO) => {
    if (queue.medicId) {
      const medic = medics.find(m => m.id === queue.medicId);
      return `${medic?.person?.name || 'Medic'}'s Queue (Room ${queue.consultationRoom || '?'})`;
    }
    return 'General Queue';
  };

  const filteredQueues = queues.filter(queue => {
    const isGeneric = !queue.medicId;
    if (role === 'MEDIC') return !isGeneric;
    if (role === 'ATTENDANT') return isGeneric;
    return true;
  });

  const filteredPatients = patients.filter(p =>
    p.person?.name?.toLowerCase().includes(redirectSearchPatient.toLowerCase()) ||
    p.person?.cpf?.includes(redirectSearchPatient)
  );

  if (loading && tickets.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-500 text-sm">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block max-w-md">
          <p className="font-medium">Failed to load tickets</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={() => fetchData()} className="mt-3 text-sm bg-white border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Queue Management - Only visible for MEDIC and ATTENDANT */}
      {(role === 'MEDIC' || role === 'ATTENDANT') && (
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Queue Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQueues.map(queue => {
              const isGeneric = !queue.medicId;
              // Highlight if it's THIS medic's queue
              const isMyQueue = role === 'MEDIC' && queue.medicId === medicId;

              return (
                <div key={queue.id} className={`p-3 rounded border shadow-sm flex justify-between items-center ${isMyQueue ? 'bg-purple-50 border-purple-200' : 'bg-white'}`}>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{getQueueDisplayName(queue)}</div>
                    <div className="text-xs text-gray-500">{queue.date}</div>
                  </div>
                  <button
                    onClick={() => handleCallNext(queue.id!, isGeneric)}
                    disabled={callingQueueId === queue.id}
                    className={`px-3 py-1 text-white text-xs font-medium rounded disabled:opacity-50 transition-colors ${
                      isMyQueue ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {callingQueueId === queue.id ? 'Calling...' : 'Call Next'}
                  </button>
                </div>
              );
            })}
            {filteredQueues.length === 0 && <p className="text-sm text-gray-500 italic">No active queues available for your role.</p>}
          </div>
        </div>
      )}

      {/* Ticket List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queue Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Called By</th>
              {(role === 'ATTENDANT' || role === 'MEDIC') && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => {
              const queue = queues.find(q => q.id === ticket.ticketQueueId);
              const attendant = attendants.find(a => a.id === ticket.attendantId);
              const medic = medics.find(m => m.id === ticket.medicId);
              const isGenericQueue = !queue?.medicId;

              return (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{ticket.ticketNum}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.ticketPriority === 'PRT' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.ticketPriority === 'ERT' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.ticketPriority === 'NMT' ? 'Normal' : ticket.ticketPriority === 'PRT' ? 'Preferential' : 'Exam Results'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'SERVED' ? 'bg-gray-100 text-gray-800' :
                      ticket.status === 'UNREDEEMED' ? 'bg-red-100 text-red-800' :
                      ticket.status === 'CALLED_BY_ATTENDANT' ? 'bg-orange-100 text-orange-800' :
                      ticket.status === 'CALLED_BY_MEDIC' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        ticket.status === 'SERVED' ? 'bg-gray-400' :
                        ticket.status === 'UNREDEEMED' ? 'bg-red-400' :
                        ticket.status === 'CALLED_BY_ATTENDANT' ? 'bg-orange-400' :
                        ticket.status === 'CALLED_BY_MEDIC' ? 'bg-purple-400' :
                        'bg-green-400'
                      }`}></span>
                      {ticket.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {queue ? getQueueDisplayName(queue) : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {medic ? `Medic: ${medic.person?.name}` : (attendant ? `Attendant: ${attendant.person?.name}` : '-')}
                  </td>
                  {(role === 'ATTENDANT' || role === 'MEDIC') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                      {role === 'ATTENDANT' && isGenericQueue && ticket.status !== 'UNREDEEMED' && (
                        <>
                          <button
                            onClick={() => openRedirectModal(ticket.id!)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200"
                          >
                            Redirect
                          </button>
                          <button
                            onClick={() => handleUnredeemed(ticket.id!)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md border border-red-200"
                          >
                            Unredeemed
                          </button>
                        </>
                      )}
                      {role === 'MEDIC' && !isGenericQueue && ticket.status === 'CALLED_BY_MEDIC' && (
                        <button
                          onClick={() => handleComplete(ticket.id!)}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md border border-green-200"
                        >
                          Finish
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Redirect Modal */}
      {showRedirectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Redirect Ticket to Medic</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Medic</label>
              <select
                value={redirectMedicId}
                onChange={(e) => setRedirectMedicId(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="">Select a Medic</option>
                {medics.map(m => (
                  <option key={m.id} value={m.id}>{m.person?.name} ({m.type})</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
              <input
                type="text"
                placeholder="Search patient by name or CPF..."
                value={redirectSearchPatient}
                onChange={(e) => setRedirectSearchPatient(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border mb-2"
              />
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {filteredPatients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setRedirectPatientId(p.id!)}
                    className={`p-2 cursor-pointer hover:bg-gray-100 text-sm ${redirectPatientId === p.id ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
                  >
                    {p.person?.name} (CPF: {p.person?.cpf})
                  </div>
                ))}
                {filteredPatients.length === 0 && <div className="p-2 text-gray-500 text-sm">No patients found</div>}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRedirectModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRedirect}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Confirm Redirect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
