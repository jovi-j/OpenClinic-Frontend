import type { AvailableAppointmentTimeDTO } from "../types/api";

type TimeSelectorProps = {
  avaliableSlots: AvailableAppointmentTimeDTO[];
  selectedSlotId: string | null;
  handleSlotTimeClick: (slotId: string | null) => void;
};

export default function TimeSelector({
  avaliableSlots,
  selectedSlotId,
  handleSlotTimeClick,
}: TimeSelectorProps) {
  return (
    <div className="flex-1">
      <h3 className="text-sm font-medium text-gray-700 mb-3">3. Select Time</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {avaliableSlots.map((slot: AvailableAppointmentTimeDTO) => (
          <button
            key={slot.id}
            onClick={() => handleSlotTimeClick(slot.id || null)}
            className={`py-2 px-1 text-center rounded-md text-sm font-medium border transition-all ${
              selectedSlotId === slot.id
                ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            {slot.hour?.toString().padStart(2, "0")}:
            {slot.minute?.toString().padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}
