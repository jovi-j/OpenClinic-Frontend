import React, { useState } from "react";
import { ApiService } from "../services/apiService";
import type {
  TicketResponseDTO,
  TicketQueueResponseDTO,
  AttendantResponseDTO,
  PatientResponseDTO,
} from "../types/api";
import { useInterval } from "../helpers/polling";

const TicketDisplay: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [queues, setQueues] = useState<TicketQueueResponseDTO[]>([]);
  const [attendants, setAttendants] = useState<AttendantResponseDTO[]>([]);
  const [patients, setPatients] = useState<PatientResponseDTO[]>([]);

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    try {
      const [ticketsData, queuesData, attendantsData, patientsData] =
        await Promise.all([
          ApiService.listTickets(),
          ApiService.listTicketQueues(),
          ApiService.listAttendants(),
          ApiService.listPatients(),
        ]);
      setTickets(ticketsData);
      setQueues(queuesData);
      setAttendants(attendantsData);
      setPatients(patientsData);
    } catch (err) {
      console.error("Error fetching display data", err);
    }
  };

  useInterval(() => {
    fetchData();
  }, 5000);
  const today = getLocalDateString();

  // Filter logic to determine which tickets should be displayed as "Called"
  const calledTickets = tickets
    .filter((t) => {
      const queue = queues.find((q) => q.id === t.ticketQueueId);

      // Must be from today's queue
      if (queue?.date !== today) return false;

      // Show if status is explicitly one of the "CALLED" statuses
      return (
        t.status === "CALLED_BY_ATTENDANT" || t.status === "CALLED_BY_MEDIC"
      );
    })
    .reverse();

  const currentTicket = calledTickets[0];
  const historyTickets = calledTickets.slice(1, 5);

  const getTicketLocation = (ticket: TicketResponseDTO) => {
    const queue = queues.find((q) => q.id === ticket.ticketQueueId);

    // If it's a medic queue (has medicId), show Consultation Room
    if (queue?.medicId) {
      return `Room ${queue.consultationRoom || "?"}`;
    }

    // If it's a general queue, show Attendant Window
    if (ticket.attendantId) {
      const attendant = attendants.find((a) => a.id === ticket.attendantId);
      return `Window ${attendant?.ticketWindow || "?"}`;
    }

    return "Processing...";
  };

  const getPatientName = (ticket: TicketResponseDTO) => {
    if (!ticket.patientId) return null;
    const patient = patients.find((p) => p.id === ticket.patientId);
    return patient?.person?.name;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-400">OpenClinic Display</h1>
        <button onClick={onExit} className="text-gray-600 hover:text-gray-400">
          Exit
        </button>
      </div>

      <div className="flex-1 flex gap-8">
        {/* Current Ticket (Left/Main) */}
        <div className="flex-1 bg-blue-800 rounded-3xl flex flex-col items-center justify-center p-12 shadow-2xl border-4 border-blue-600 relative overflow-hidden">
          {currentTicket ? (
            <>
              <div className="absolute top-0 left-0 w-full bg-blue-700 py-4 text-center">
                <h2 className="text-4xl font-bold uppercase tracking-widest text-blue-100">
                  Now Calling
                </h2>
              </div>

              <div className="text-[12rem] font-black leading-none mb-4 tracking-tighter">
                {currentTicket.ticketNum}
              </div>

              {/* Display Patient Name if available (e.g. called by Medic) */}
              {getPatientName(currentTicket) && (
                <div className="text-4xl font-semibold mb-6 text-white bg-blue-900/50 px-8 py-2 rounded-full">
                  {getPatientName(currentTicket)}
                </div>
              )}

              <div className="text-5xl font-bold mb-12 text-blue-200">
                {currentTicket.ticketPriority === "NMT"
                  ? "Normal"
                  : currentTicket.ticketPriority === "PRT"
                    ? "Preferential"
                    : "Exam Results"}
              </div>

              <div className="bg-white text-blue-900 px-12 py-6 rounded-2xl shadow-lg">
                <div className="text-2xl font-medium uppercase tracking-wide mb-2 text-center text-gray-500">
                  Please proceed to
                </div>
                <div className="text-6xl font-bold text-center">
                  {getTicketLocation(currentTicket)}
                </div>
              </div>
            </>
          ) : (
            <div className="text-4xl text-blue-300 font-light">
              Waiting for tickets...
            </div>
          )}
        </div>

        {/* History (Right/Sidebar) */}
        <div className="w-1/3 flex flex-col gap-4">
          <h3 className="text-2xl font-semibold text-gray-400 mb-2 px-2">
            Last Called
          </h3>
          {historyTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-gray-800 rounded-xl p-6 flex justify-between items-center border border-gray-700 shadow-lg opacity-80"
            >
              <div>
                <div className="text-4xl font-bold text-white">
                  #{ticket.ticketNum}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {ticket.ticketPriority === "NMT"
                    ? "Normal"
                    : ticket.ticketPriority === "PRT"
                      ? "Preferential"
                      : "Exam Results"}
                </div>
                {getPatientName(ticket) && (
                  <div className="text-sm text-blue-300 mt-1 font-medium">
                    {getPatientName(ticket)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-blue-400">
                  {getTicketLocation(ticket)}
                </div>
              </div>
            </div>
          ))}
          {historyTickets.length === 0 && (
            <div className="text-gray-600 italic px-2">No history yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDisplay;
