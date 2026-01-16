import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { TicketQueueResponseDTO, TicketResponseDTO, TicketRequestDTO } from '../types/api';

const KioskMode: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [queues, setQueues] = useState<TicketQueueResponseDTO[]>([]);
  const [createdTicket, setCreatedTicket] = useState<TicketResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    ApiService.listTicketQueues()
      .then(data => {
        // Filter for today's queues only using local date
        const today = getLocalDateString();
        const todaysQueues = data.filter(q => q.date === today);
        setQueues(todaysQueues);
      })
      .catch(err => setError(`${err.message} (Backend: ${ApiService.getDebugUrl()})`));
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleCreateTicket = async (priority: 'NMT' | 'PRT' | 'ERT') => {
    // Find the generic queue for today (no medicId)
    const genericQueue = queues.find(q => !q.medicId);
    
    if (!genericQueue) {
      setError("No general queue available for today. Please ask an attendant to create one.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    try {
      const payload: TicketRequestDTO = {
        ticketQueueId: genericQueue.id,
        ticketPriority: priority
      };
      const ticket = await ApiService.createTicket(payload);
      setCreatedTicket(ticket);
      
      // Auto-print after a short delay to allow rendering
      setTimeout(() => {
        window.print();
      }, 500);

      // Reset after printing (simulated by timeout)
      setTimeout(() => {
        setCreatedTicket(null);
      }, 5000);
    } catch (err: any) {
      setError(`${err.message} (Backend: ${ApiService.getDebugUrl()})`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (createdTicket) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center print:p-0">
        <div className="max-w-md w-full border-4 border-black p-8 rounded-xl print:border-0">
          <h2 className="text-3xl font-bold mb-4 uppercase tracking-widest">OpenClinic</h2>
          <div className="text-xl mb-2">Ticket Number</div>
          <div className="text-8xl font-black mb-6">{createdTicket.ticketNum}</div>
          <div className="text-2xl font-bold mb-4">
            {createdTicket.ticketPriority === 'NMT' ? 'Normal' : 
             createdTicket.ticketPriority === 'PRT' ? 'Preferential' : 'Exam Results'}
          </div>
          <div className="text-sm text-gray-500 mb-8">
            {new Date().toLocaleString()}
          </div>
          <p className="text-lg font-medium">Please wait for your number to be called.</p>
        </div>
        <p className="mt-8 text-gray-400 print:hidden">Printing ticket... Screen will reset shortly.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-bold text-white text-center mb-12 shadow-sm">Welcome to OpenClinic</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button
            onClick={() => handleCreateTicket('NMT')}
            disabled={loading}
            className="h-64 bg-white rounded-3xl shadow-xl hover:scale-105 transform transition-all flex flex-col items-center justify-center group"
          >
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200">
              <span className="text-4xl">👤</span>
            </div>
            <span className="text-3xl font-bold text-gray-800">Normal</span>
          </button>

          <button
            onClick={() => handleCreateTicket('PRT')}
            disabled={loading}
            className="h-64 bg-white rounded-3xl shadow-xl hover:scale-105 transform transition-all flex flex-col items-center justify-center group"
          >
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-yellow-200">
              <span className="text-4xl">♿</span>
            </div>
            <span className="text-3xl font-bold text-gray-800">Preferential</span>
            <span className="text-sm text-gray-500 mt-2">Elderly / Pregnant / PWD</span>
          </button>

          <button
            onClick={() => handleCreateTicket('ERT')}
            disabled={loading}
            className="h-64 bg-white rounded-3xl shadow-xl hover:scale-105 transform transition-all flex flex-col items-center justify-center group"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200">
              <span className="text-4xl">📄</span>
            </div>
            <span className="text-3xl font-bold text-gray-800">Exam Results</span>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-blue-200 text-lg">Touch a button to get your ticket</p>
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4 flex gap-4">
        <button 
          onClick={toggleFullScreen}
          className="text-white/20 hover:text-white/50 text-sm border border-white/10 px-3 py-1 rounded"
        >
          ⛶ Fullscreen
        </button>
        <button 
          onClick={onExit}
          className="text-white/20 hover:text-white/50 text-sm border border-white/10 px-3 py-1 rounded"
        >
          Exit Kiosk
        </button>
      </div>
    </div>
  );
};

export default KioskMode;
