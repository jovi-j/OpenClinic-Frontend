import React, { useState } from "react";
import { ApiService } from "../services/apiService";
import type { PatientRequestDTO } from "../types/api";
import type { MessageType } from "./UI/MessageDisplay";
import MessageDisplay from "./UI/MessageDisplay";

const RegisterPatientForm: React.FC = () => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [dob, setDob] = useState("");
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

    const payload: PatientRequestDTO = {
      person: {
        name,
        cpf,
        dateOfBirth: formatDate(dob),
      },
    };

    try {
      await ApiService.createPatient(payload);
      setMessage({ type: "success", text: "Patient registered successfully!" });
      setName("");
      setCpf("");
      setDob("");
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
        Register New Patient
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Patient"}
        </button>
      </form>
      {message && (
        <MessageDisplay message={message} onClose={handleMessageChange} />
      )}
    </div>
  );
};

export default RegisterPatientForm;
