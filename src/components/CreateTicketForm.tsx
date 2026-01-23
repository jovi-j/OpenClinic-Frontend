import React, { useState, useEffect } from "react";
import { ApiService } from "../services/apiService";
import type { TicketRequestDTO, TicketQueueResponseDTO } from "../types/api";
import TicketPriority from "../types/ticketPriority";

const CreateTicketForm: React.FC = () => {
  const [queues, setQueues] = useState<TicketQueueResponseDTO[]>([]);
  const [ticketQueueId, setTicketQueueId] = useState("");
  const [priority, setPriority] = useState<string>(TicketPriority.NMT);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    ApiService.listTicketQueues()
      .then((data) => {
        // Filter for today's queues only using local date
        const today = getLocalDateString();
        const todaysQueues = data.filter((q) => q.date === today);
        setQueues(todaysQueues);
      })
      .catch((err) => console.error("Failed to load queues", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!ticketQueueId) {
      setMessage({ type: "error", text: "Please select a ticket queue." });
      return;
    }

    setLoading(true);
    const payload: TicketRequestDTO = {
      ticketQueueId: ticketQueueId,
      ticketPriority: priority,
    };

    try {
      await ApiService.createTicket(payload);
      setMessage({ type: "success", text: "Ticket created successfully!" });
      setPriority("NMT");
    } catch (err) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        console.error("Unknown error.", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="queueId"
          >
            Ticket Queue
          </label>
          <div className="relative">
            <select
              id="queueId"
              value={ticketQueueId}
              onChange={(e) => setTicketQueueId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
              required
            >
              <option value="">Select a Queue</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.date} -{" "}
                  {q.medicId
                    ? `Medic Queue (Room ${q.consultationRoom || "N/A"})`
                    : "General Queue"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="priority"
          >
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: "NMT",
                label: "Normal",
                color:
                  "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
              },
              {
                value: "PRT",
                label: "Preferential",
                color:
                  "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
              },
              {
                value: "ERT",
                label: "Exam Results",
                color:
                  "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value)}
                className={`py-2 px-3 text-sm font-medium rounded-md border ${
                  priority === option.value
                    ? "ring-2 ring-offset-1 ring-blue-500 border-transparent shadow-sm"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                } transition-all duration-200`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : "Create Ticket"}
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

export default CreateTicketForm;
