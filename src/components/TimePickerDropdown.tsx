import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { format24to12 } from "@/utils/timeFormat";

interface TimePickerDropdownProps {
  value: string; // 24-hour format (HH:mm)
  onChange: (value: string) => void; // Returns 24-hour format
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Dropdown-based time picker that guarantees 12-hour format (AM/PM)
 * Shows hours (1-12), minutes in 15-minute intervals, and AM/PM
 * User selects from dropdowns instead of typing or using browser picker
 */
export const TimePickerDropdown = ({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  className = "",
}: TimePickerDropdownProps) => {
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      const is24Hour = h >= 12;
      const hour12 = h % 12 || 12;
      
      setSelectedHour(String(hour12).padStart(2, "0"));
      setSelectedMinute(String(m).padStart(2, "0"));
      setSelectedPeriod(is24Hour ? "PM" : "AM");
    }
  }, [value]);

  const handleTimeChange = (hour: string, minute: string, period: "AM" | "PM") => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);

    // Convert to 24-hour format
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;

    const timeStr = `${String(hour24).padStart(2, "0")}:${String(parseInt(minute)).padStart(2, "0")}`;
    onChange(timeStr);
  };

  // Generate hours 1-12
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  
  // Generate minutes in 15-minute intervals: 00, 15, 30, 45
  const minutes = ["00", "15", "30", "45"];

  const clearTime = () => {
    onChange("");
    setSelectedHour("09");
    setSelectedMinute("00");
    setSelectedPeriod("AM");
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

      <div className={`flex items-center gap-2 ${className}`}>
        {/* Hour Dropdown */}
        <select
          value={selectedHour}
          onChange={(e) => handleTimeChange(e.target.value, selectedMinute, selectedPeriod)}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        {/* Separator */}
        <span className="text-sm font-bold text-muted-foreground">:</span>

        {/* Minute Dropdown */}
        <select
          value={selectedMinute}
          onChange={(e) => handleTimeChange(selectedHour, e.target.value, selectedPeriod)}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Period Dropdown (AM/PM) */}
        <select
          value={selectedPeriod}
          onChange={(e) => handleTimeChange(selectedHour, selectedMinute, e.target.value as "AM" | "PM")}
          disabled={disabled}
          className="px-3 py-2.5 rounded-lg bg-primary/20 border border-border text-sm font-medium text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={clearTime}
            disabled={disabled}
            className="px-2 py-2.5 rounded-lg hover:bg-destructive/20 text-destructive transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear time"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-1">Select from dropdowns (always 12-hour format)</p>
    </div>
  );
};
