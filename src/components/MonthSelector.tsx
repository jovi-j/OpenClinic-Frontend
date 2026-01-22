import { formatMonth } from "../helpers/helpers";

export default function MonthSelector({
  avaliableMonths,
  handleMonthClick,
  selectedMonth,
}: {
  avaliableMonths: string[];
  handleMonthClick: (month: string) => void;
  selectedMonth: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        1. Select Month
      </h3>
      <div className="flex flex-wrap gap-3">
        {avaliableMonths.map((month) => (
          <button
            key={month}
            onClick={() => handleMonthClick(month)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedMonth === month
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {formatMonth(month)}
          </button>
        ))}
      </div>
    </div>
  );
}
