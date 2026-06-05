import { useState } from "react";
import { format24to12, format12to24 } from "@/utils/timeFormat";
import { Clock } from "lucide-react";

interface TimeInput12HourProps {
  value: string; // 24-hour format (HH:mm)
  onChange: (value: string) => void; // Returns 24-hour format
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Custom time input component that always displays and accepts 12-hour format (AM/PM)
 * Internally stores and communicates in 24-hour format for consistency
 */
export const TimeInput12Hour = ({
  value,
  onChange,
  label,
  placeholder = "hh:mm AM/PM",
  disabled = false,
  required = false,
  className = "",
}: TimeInput12HourProps) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    // Convert 24-hour value to 12-hour for display
    return value ? format24to12(value) : "";
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toUpperCase();
    setDisplayValue(inputValue);

    // Convert from 12-hour to 24-hour and call onChange
    const converted24Hour = format12to24(inputValue);
    if (converted24Hour) {
      onChange(converted24Hour);
    } else if (inputValue === "") {
      // Allow clearing the field
      onChange("");
    }
  };

  const handleBlur = () => {
    // When leaving the field, reformat to ensure consistent format
    if (displayValue) {
      const converted24Hour = format12to24(displayValue);
      if (converted24Hour) {
        const reformatted12Hour = format24to12(converted24Hour);
        setDisplayValue(reformatted12Hour);
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2 block">
          <Clock className="w-3 h-3" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      />
      <p className="text-xs text-muted-foreground mt-1">Format: hh:mm AM/PM (e.g., 02:30 PM, 09:00 AM)</p>
    </div>
  );
};
