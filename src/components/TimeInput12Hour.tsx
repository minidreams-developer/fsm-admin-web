import React, { useState, useEffect } from "react";
import { convertTo12Hour, convertTo24Hour } from "@/utils/timeFormat";

interface TimeInput12HourProps {
  value: string; // 24-hour format (HH:mm)
  onChange: (value: string) => void; // Returns 24-hour format
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Time input component that displays and accepts 12-hour format
 * but stores and returns 24-hour format internally
 */
export const TimeInput12Hour: React.FC<TimeInput12HourProps> = ({
  value,
  onChange,
  placeholder = "hh:mm AM/PM",
  className = "",
  disabled = false,
  required = false,
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Convert 24-hour value to 12-hour for display
  useEffect(() => {
    if (value) {
      setDisplayValue(convertTo12Hour(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    // Convert to 24-hour format and call onChange
    const time24 = convertTo24Hour(input);
    if (time24) {
      onChange(time24);
    } else if (input === "") {
      onChange("");
    }
  };

  const handleBlur = () => {
    // Reformat on blur to ensure consistent display
    if (displayValue) {
      const time24 = convertTo24Hour(displayValue);
      if (time24) {
        setDisplayValue(convertTo12Hour(time24));
        onChange(time24);
      }
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      pattern="^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$"
    />
  );
};
