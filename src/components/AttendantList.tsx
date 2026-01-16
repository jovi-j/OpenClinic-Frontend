import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/apiService';
import { AttendantResponseDTO, AttendantRequestDTO } from '../types/api';

const AttendantList: React.FC = () => {
  const [attendants, setAttendants] = useState<AttendantResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingAttendant, setEditingAttendant] = useState<AttendantResponseDTO | null>(null);
  const [editName, setEditName] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editWindow, setEditWindow] = useState('');

  const fetchAttendants = async () => {
    setLoading(true);
    try {
      const data = await ApiService.listAttendants();
      setAttendants(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendants();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attendant? This action cannot be undone.')) return;
    try {
      await ApiService.deleteAttendant(id);
      fetchAttendants();
    } catch (err: any) {
      alert(`Error deleting attendant: ${err.message}`);
    }
  };

  const openEditModal = (attendant: AttendantResponseDTO) => {
    setEditingAttendant(attendant);
    setEditName(attendant.person?.name || '');
    setEditCpf(attendant.person?.cpf || '');
    setEditWindow(attendant.ticketWindow?.toString() || '');
    
    const dob = attendant.person?.dateOfBirth;
    if (dob) {
      const [day, month, year] = dob.split('/');
      setEditDob(`${year}-${month}-${day}`);
    } else {
      setEditDob('');
    }
  };

  const handleUpdate = async () => {
    if (!editingAttendant || !editingAttendant.id) return;

    const [year, month, day] = editDob.split('-');
    const formattedDob = `${day}/${month}/${year}`;

    const payload: AttendantRequestDTO = {
      person: {
        name: editName,
        cpf: editCpf,
        dateOfBirth: formattedDob
      },
      ticketWindow: parseInt(editWindow)
    };

    try {
      await ApiService.updateAttendant(editingAttendant.id, payload);
      setEditingAttendant(null);
      fetchAttendants();
    } catch (err: any) {
      alert(`Error updating attendant: ${err.message}`);
    }
  };

  if (loading && attendants.length === 0) return <div className="p-6 text-center text-gray-500">Loading directory...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-x-auto relative">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Window</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendants.map((attendant) => (
            <tr key={attendant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                    {attendant.person?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{attendant.person?.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{attendant.person?.cpf}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                  Window {attendant.ticketWindow}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => openEditModal(attendant)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(attendant.id!)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {attendants.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No attendants found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingAttendant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Attendant</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CPF</label>
                <input type="text" value={editCpf} onChange={e => setEditCpf(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ticket Window #</label>
                <input type="number" value={editWindow} onChange={e => setEditWindow(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingAttendant(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendantList;
