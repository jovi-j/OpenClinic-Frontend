import React, { useState } from 'react';
import { ApiService } from '../services/apiService';
import { AttendantRequestDTO } from '../types/api';

const RegisterAttendantForm: React.FC = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [dob, setDob] = useState('');
  const [ticketWindow, setTicketWindow] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload: AttendantRequestDTO = {
      person: {
        name,
        cpf,
        dateOfBirth: formatDate(dob)
      },
      ticketWindow: parseInt(ticketWindow)
    };

    try {
      await ApiService.createAttendant(payload);
      setMessage({ type: 'success', text: 'Attendant registered successfully!' });
      setName('');
      setCpf('');
      setDob('');
      setTicketWindow('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Register New Attendant</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CPF</label>
          <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ticket Window #</label>
          <input type="number" value={ticketWindow} onChange={e => setTicketWindow(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register Attendant'}
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default RegisterAttendantForm;
