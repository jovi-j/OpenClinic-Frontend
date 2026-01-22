import { formatDay } from "../helpers/helpers";
import type { GroupedAppointmentsDTO } from "../types/api";

export default function DaySelector({
  selectedDay,
  avaliableDates,
  handleChangeDay,
}: {
  avaliableDates: GroupedAppointmentsDTO[];
  handleChangeDay: (date: string | undefined) => void;
  selectedDay: string | undefined;
}) {
  return (
    <div className="flex-2 max-w-xl">
      <h3 className="text-sm font-medium text-gray-700 mb-3">2. Select Day</h3>
      <div className="flex flex-wrap content-start gap-3">
        {avaliableDates.map((group: GroupedAppointmentsDTO) => (
          <button
            key={group.date}
            onClick={() => handleChangeDay(group.date)}
            className={`w-16 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              selectedDay === group.date
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {formatDay(group.date!)}
          </button>
        ))}
      </div>
    </div>
  );
}
