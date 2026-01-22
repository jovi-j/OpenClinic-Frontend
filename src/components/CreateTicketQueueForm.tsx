import React, { useState, useEffect } from "react";
import { ApiService } from "../services/apiService";
import { TicketQueueRequestDTO, MedicResponseDTO } from "../types/api";

const CreateTicketQueueForm: React.FC = () => {
  const [medics, setMedics] = useState<MedicResponseDTO[]>([]);
  const [medicId, setMedicId] = useState<string>("");
  const [isMedicQueue, setIsMedicQueue] = useState(false);
  const [consultationRoom, setConsultationRoom] = useState<number | "">("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ApiService.listMedics()
      .then(setMedics)
      .catch((err) => console.error("Failed to load medics", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (isMedicQueue && !medicId) {
      setMessage({
        type: "error",
        text: "Please select a medic for a medic queue.",
      });
      return;
    }

    setLoading(true);
    const payload: TicketQueueRequestDTO = {
      medicId: isMedicQueue ? medicId : null,
      consultationRoom:
        isMedicQueue && consultationRoom ? Number(consultationRoom) : undefined,
    };

    try {
      await ApiService.createTicketQueue(payload);
      setMessage({
        type: "success",
        text: "Ticket Queue created successfully!",
      });
      setConsultationRoom("");
      setMedicId("");
    } catch (err: any) {
      let errorMsg = err.message;

      // Improve error message for duplicate queues
      if (errorMsg.includes("already exists")) {
        if (isMedicQueue) {
          errorMsg = "A queue for this medic already exists today.";
        } else {
          errorMsg = "A general queue already exists today.";
        }
      } else if (errorMsg.includes("409")) {
        // Fallback for status code check if message is generic
        if (isMedicQueue) {
          errorMsg = "A queue for this medic already exists today.";
        } else {
          errorMsg = "A general queue already exists today.";
        }
      }

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center mb-4">
          <input
            id="medicQueue"
            type="checkbox"
            checked={isMedicQueue}
            onChange={(e) => {
              setIsMedicQueue(e.target.checked);
              if (!e.target.checked) {
                setMedicId("");
                setConsultationRoom("");
              }
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="medicQueue"
            className="ml-2 block text-sm text-gray-900"
          >
            Queue for a medic?
          </label>
        </div>

        {isMedicQueue && (
          <>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="medicId"
              >
                Medic
              </label>
              <div className="relative">
                <select
                  id="medicId"
                  value={medicId}
                  onChange={(e) => setMedicId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
                  required={isMedicQueue}
                >
                  <option value="">Select a Medic</option>
                  {medics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.person?.name} ({m.crm}) - {m.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="room"
              >
                Consultation Room
              </label>
              <input
                id="room"
                type="number"
                value={consultationRoom}
                onChange={(e) =>
                  setConsultationRoom(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
                placeholder="e.g. 101"
                required={isMedicQueue}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : "Create Queue"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm flex items-start ${
            message.type === "error"
              ? "bg-red-50 text-red-800 border border-red-100"
              : "bg-green-50 text-green-800 border border-green-100"
          }`}
        >
          <span className="mr-2 text-lg">
            {message.type === "error" ? "⚠️" : "✅"}
          </span>
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default CreateTicketQueueForm;
