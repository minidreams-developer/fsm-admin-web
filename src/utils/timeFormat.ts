/**
 * Utility functions for handling 12-hour time format (AM/PM)
 * Ensures consistent time display regardless of system settings
 */

/**
 * Convert 24-hour format (HH:mm) to 12-hour format (hh:mm AM/PM)
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "02:30 PM")
 */
export const format24to12 = (time24: string): string => {
  if (!time24) return "";
  
  const [hours, minutes] = time24.split(":");
  if (!hours || !minutes) return "";
  
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  if (isNaN(hour) || isNaN(minute)) return "";
  
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight, keep 12 as is
  
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
};

/**
 * Convert 12-hour format (hh:mm AM/PM) to 24-hour format (HH:mm)
 * @param time12 - Time in 12-hour format (e.g., "02:30 PM")
 * @returns Time in 24-hour format (e.g., "14:30")
 */
export const format12to24 = (time12: string): string => {
  if (!time12) return "";
  
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  
  let [, hours, minutes, period] = match;
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  // Convert to 24-hour format
  if (period.toUpperCase() === "PM") {
    if (hour !== 12) hour += 12;
  } else {
    if (hour === 12) hour = 0;
  }
  
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

/**
 * Parse a time input value and return 12-hour formatted display
 * Handles both 24-hour input (from type="time") and 12-hour display
 * @param value - Raw time value (typically from input)
 * @returns 12-hour formatted time string
 */
export const parseAndFormat12Hour = (value: string): string => {
  if (!value) return "";
  
  // If it looks like 24-hour format, convert it
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    return format24to12(value);
  }
  
  // If it already looks like 12-hour format, return as is
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(value)) {
    return value;
  }
  
  return "";
};

/**
 * Get display time in 12-hour format for showing to user
 * @param time24 - Time in 24-hour format or already formatted
 * @returns 12-hour formatted string for display
 */
export const getDisplay12Hour = (time24: string): string => {
  if (!time24) return "—";
  
  // If already in 12-hour format, return as is
  if (/\s*(AM|PM)$/i.test(time24)) {
    return time24;
  }
  
  // Otherwise convert from 24-hour
  return format24to12(time24) || "—";
};

/**
 * Format a time range in 12-hour format
 * @param fromTime24 - Start time in 24-hour format
 * @param toTime24 - End time in 24-hour format
 * @returns Formatted time range (e.g., "09:00 AM - 05:00 PM")
 */
export const formatTimeRange12Hour = (fromTime24: string, toTime24: string): string => {
  const from = format24to12(fromTime24);
  const to = format24to12(toTime24);
  
  if (!from || !to) return "—";
  
  return `${from} - ${to}`;
};
