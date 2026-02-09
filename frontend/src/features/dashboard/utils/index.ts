// Export your feature-specific utility functions here

import type { DateRangeFilter } from "../types";

export const getFilterRange = (filter: DateRangeFilter) => {
  const today = new Date();

  let startDate: Date;

  switch (filter) {
    case "last_7_days":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      break;
    case "last_14_days":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 13);
      break;
    case "month_to_date":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "last_30_days":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      break;
    case "last_3_months":
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  startDate.setHours(0, 0, 0, 0);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(today),
  };
};
