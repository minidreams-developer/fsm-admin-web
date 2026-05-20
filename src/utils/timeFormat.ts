/**
 * Utility functions for converting between 24-hour and 12-hour time formats
 */

/**
 * Convert 24-hour format (HH:mm) to 12-hour format (hh:mm AM/PM)
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export const convertTo12Hour = (time24: string): string => {
  if (!time24) return "";
  
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
};

/**
 * Convert 12-hour format (hh:mm AM/PM) to 24-hour format (HH:mm)
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM")
 * @returns Time in 24-hour format (e.g., "14:30")
 */
export const convertTo24Hour = (time12: string): string => {
  if (!time12) return "";
  
  const regex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
  const match = time12.match(regex);
  
  if (!match) return "";
  
  let [, hoursStr, minutes, period] = match;
  let hours = parseInt(hoursStr, 10);
  
  if (period.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

/**
 * Format time for display in 12-hour format
 * @param time24 - Time in 24-hour format
 * @returns Formatted time string
 */
export const formatTimeDisplay = (time24: string): string => {
  return convertTo12Hour(time24);
};

/**
 * Parse time input from 12-hour format for storage
 * @param time12 - Time in 12-hour format
 * @returns Time in 24-hour format for storage
 */
export const parseTimeInput = (time12: string): string => {
  return convertTo24Hour(time12);
};
