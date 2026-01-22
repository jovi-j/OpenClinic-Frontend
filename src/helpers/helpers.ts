import type { GroupedAppointmentsDTO } from "../types/api";

export const getDaysForMonth = ({
  availableSlots,
  selectedMonth,
}: {
  availableSlots: GroupedAppointmentsDTO[];
  selectedMonth: string;
}) => {
  if (!selectedMonth) return [];
  return availableSlots.filter((group) =>
    group.date?.startsWith(selectedMonth),
  );
};

export const getSlotsForDay = ({
  availableSlots,
  selectedDay,
}: {
  availableSlots: GroupedAppointmentsDTO[];
  selectedDay: string;
}) => {
  if (!selectedDay) return [];
  const dayGroup = availableSlots.find((group) => group.date === selectedDay);
  return dayGroup?.appointments || [];
};

export const formatMonth = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

export const formatDay = (dateString: string) => {
  const date = new Date(dateString);
  // Adjust for timezone offset to show correct day
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString(undefined, { day: "numeric" });
};

export function unwrap<T>(result: PromiseSettledResult<T[]>): T[] {
  return result.status === "fulfilled" ? result.value : [];
}
