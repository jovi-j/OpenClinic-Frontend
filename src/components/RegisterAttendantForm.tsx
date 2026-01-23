import React, { useState } from "react";
import { ApiService } from "../services/apiService";
import type { AttendantRequestDTO } from "../types/api";
import MessageDisplay, { type MessageType } from "./UI/MessageDisplay";

const RegisterAttendantForm: React.FC = () => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [dob, setDob] = useState("");
  const [ticketWindow, setTicketWindow] = useState("");
  const [message, setMessage] = useState<MessageType | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
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
        dateOfBirth: formatDate(dob),
      },
      ticketWindow: parseInt(ticketWindow),
    };

    try {
      await ApiService.createAttendant(payload);
      setMessage({
        type: "success",
        text: "Attendant registered successfully!",
      });
      setName("");
      setCpf("");
      setDob("");
      setTicketWindow("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        console.error("Unknown error.", err);
      }
    } finally {
      setLoading(false);
    }
  };

  function handleMessageChange(): void {
    setMessage(null);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Register New Attendant
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ticket Window #
          </label>
          <input
            type="number"
            value={ticketWindow}
            onChange={(e) => setTicketWindow(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Attendant"}
        </button>
      </form>
      {message && (
        <MessageDisplay message={message} onClose={handleMessageChange} />
      )}
    </div>
  );
};

export default RegisterAttendantForm;
