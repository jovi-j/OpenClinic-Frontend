import React, { useState, useEffect } from "react";
import { ApiService } from "../services/apiService";
import { ScheduleRequestDTO, MedicResponseDTO } from "../types/api";
import MessageDisplay from "./UI/MessageDisplay";
import { set } from "react-datepicker/dist/dist/date_utils.js";

interface CreateScheduleFormProps {
  medicId?: string; // If provided, pre-select and hide selector
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  medicId: propMedicId,
}) => {
  const [medics, setMedics] = useState<MedicResponseDTO[]>([]);
  const [medicId, setMedicId] = useState(propMedicId || "");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendanceStart, setAttendanceStart] = useState("08:00");
  const [attendanceEnd, setAttendanceEnd] = useState("17:00");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [avgTime, setAvgTime] = useState(30);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch medics if we don't have a pre-selected one (or if we want to show the name)
    // But if propMedicId is passed, we assume it's valid.
    if (!propMedicId) {
      ApiService.listMedics()
        .then(setMedics)
        .catch((err) => console.error("Failed to load medics", err));
    }
  }, [propMedicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!medicId) {
      setMessage({ type: "error", text: "Please select a medic." });
      return;
    }

    setLoading(true);

    const [attStartH, attStartM] = attendanceStart.split(":").map(Number);
    const [attEndH, attEndM] = attendanceEnd.split(":").map(Number);
    const [lunchStartH, lunchStartM] = lunchStart.split(":").map(Number);
    const [lunchEndH, lunchEndM] = lunchEnd.split(":").map(Number);

    const payload: ScheduleRequestDTO = {
      medicId,
      month,
      year,
      attendanceHourStart: attStartH,
      attendanceMinuteStart: attStartM,
      attendanceHourEnd: attEndH,
      attendanceMinuteEnd: attEndM,
      lunchHourStart: lunchStartH,
      lunchMinuteStart: lunchStartM,
      lunchHourEnd: lunchEndH,
      lunchMinuteEnd: lunchEndM,
      averageTimeForAppointment: avgTime,
    };

    try {
      await ApiService.createSchedule(payload);
      setMessage({
        type: "success",
        text: "Schedule created successfully! Appointments generated.",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  function DateStringMonthList() {
    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(year, i).toLocaleDateString("default", { month: "long" }),
    );

    return (
      <>
        {months.map((month, index) => (
          <option key={index} value={index + 1}>
            {month.charAt(0).toUpperCase() + month.slice(1)}
          </option>
        ))}
      </>
    );
  }

  function handleChangeMessage(): void {
    setMessage(null);
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!propMedicId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medic
            </label>
            <select
              value={medicId}
              onChange={(e) => setMedicId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
              required
            >
              <option value="">Select a Medic</option>
              {medics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.person?.name} ({m.crm})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
            >
              {DateStringMonthList()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              min={new Date().getFullYear()}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Start
            </label>
            <input
              type="time"
              value={attendanceStart}
              onChange={(e) => setAttendanceStart(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance End
            </label>
            <input
              type="time"
              value={attendanceEnd}
              onChange={(e) => setAttendanceEnd(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lunch Start
            </label>
            <input
              type="time"
              value={lunchStart}
              onChange={(e) => setLunchStart(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lunch End
            </label>
            <input
              type="time"
              value={lunchEnd}
              onChange={(e) => setLunchEnd(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Avg Appointment Time (min)
          </label>
          <input
            type="number"
            min="5"
            step="5"
            value={avgTime}
            onChange={(e) => setAvgTime(Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : "Create Schedule"}
        </button>
      </form>

      {message && (
        <MessageDisplay message={message} onClose={handleChangeMessage} />
      )}
    </div>
  );
};

export default CreateScheduleForm;
