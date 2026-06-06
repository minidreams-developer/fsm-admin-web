import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";
import { format24to12, format12to24 } from "@/utils/timeFormat";

interface TimePickerSpinnerProps {
  value: string; // 24-hour format (HH:mm)
  onChange: (value: string) => void; // Returns 24-hour format
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Custom time picker with spinners that guarantees 12-hour format (AM/PM)
 * Uses spinner controls to select hours (1-12), minutes, and AM/PM
 * Internally stores in 24-hour format, displays in 12-hour format
 */
export const TimePickerSpinner = ({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  className = "",
}: TimePickerSpinnerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [displayValue, setDisplayValue] = useState("");

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      const is24Hour = h >= 12;
      const hour12 = h % 12 || 12;
      
      setHours(hour12);
      setMinutes(m);
      setPeriod(is24Hour ? "PM" : "AM");
      setDisplayValue(`${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${is24Hour ? "PM" : "AM"}`);
    }
  }, [value]);

  const updateTime = (h: number, min: number, p: "AM" | "PM") => {
    setHours(h);
    setMinutes(min);
    setPeriod(p);
    
    // Convert to 24-hour format
    let hour24 = h;
    if (p === "PM" && h !== 12) hour24 = h + 12;
    if (p === "AM" && h === 12) hour24 = 0;
    
    const timeStr = `${String(hour24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const display = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")} ${p}`;
    
    setDisplayValue(display);
    onChange(timeStr);
  };

  const incrementHour = () => {
    let newHour = hours + 1;
    if (newHour > 12) newHour = 1;
    updateTime(newHour, minutes, period);
  };

  const decrementHour = () => {
    let newHour = hours - 1;
    if (newHour < 1) newHour = 12;
    updateTime(newHour, minutes, period);
  };

  const incrementMinute = () => {
    const newMinute = (minutes + 15) % 60;
    updateTime(hours, newMinute, period);
  };

  const decrementMinute = () => {
    const newMinute = minutes - 15 < 0 ? 45 : minutes - 15;
    updateTime(hours, newMinute, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    updateTime(hours, minutes, newPeriod);
  };

  const clearTime = () => {
    setDisplayValue("");
    onChange("");
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
      
      <div className={`relative ${className}`}>
        {/* Display field */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-center font-mono font-bold transition-all flex items-center justify-between ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
          }`}
        >
          <span className="flex-1">{displayValue || "-- : -- --"}</span>
          {displayValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearTime();
              }}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </button>

        {/* Time picker dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 w-full max-w-xs">
            <div className="flex items-center justify-center gap-4">
              {/* Hour Spinner */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={incrementHour}
                  className="p-1 hover:bg-secondary rounded transition-all"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="text-2xl font-bold w-12 text-center border border-border rounded py-2 bg-secondary">
                  {String(hours).padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={decrementHour}
                  className="p-1 hover:bg-secondary rounded transition-all"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground mt-1">Hour</span>
              </div>

              {/* Separator */}
              <div className="text-2xl font-bold">:</div>

              {/* Minute Spinner */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={incrementMinute}
                  className="p-1 hover:bg-secondary rounded transition-all"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="text-2xl font-bold w-12 text-center border border-border rounded py-2 bg-secondary">
                  {String(minutes).padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={decrementMinute}
                  className="p-1 hover:bg-secondary rounded transition-all"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground mt-1">Min</span>
              </div>

              {/* AM/PM Toggle */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={togglePeriod}
                  className="p-1 hover:bg-secondary rounded transition-all"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={togglePeriod}
                  className="text-lg font-bold w-14 text-center border border-border rounded py-2 bg-primary/20 hover:bg-primary/30 transition-all"
                >
                  {period}
                </button>
                <button
                  type="button"
                  onClick={togglePeriod}
                  className="p-1 hover:bg-secondary rounded transition-all"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground mt-1">Period</span>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">Click to select time (always 12-hour format)</p>
    </div>
  );
};
