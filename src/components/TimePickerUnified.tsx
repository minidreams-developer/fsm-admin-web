import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { format24to12, format12to24 } from "@/utils/timeFormat";

interface TimePickerUnifiedProps {
  value: string; // 24-hour format (HH:mm)
  onChange: (value: string) => void; // Returns 24-hour format
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Unified time picker - Single input field with 12-hour format
 * Vertical scrollable number selectors (minimized height)
 */
export const TimePickerUnified = ({
  value,
  onChange,
  label,
  placeholder = "hh:mm AM/PM",
  disabled = false,
  required = false,
  className = "",
}: TimePickerUnifiedProps) => {
  const [displayValue, setDisplayValue] = useState<string>("");
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    } else {
      setDisplayValue("");
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase();
    setDisplayValue(input);

    // Try to parse the input
    const patterns = [
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i,
      /^(\d{1,2})(\d{2})\s*(AM|PM)?$/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        const h = parseInt(match[1], 10);
        const min = parseInt(match[2], 10);
        const p = (match[3]?.toUpperCase() as "AM" | "PM") || "AM";

        if (h >= 1 && h <= 12 && min >= 0 && min < 60) {
          updateTime(h, min, p);
          return;
        }
      }
    }
  };

  const handleInputBlur = () => {
    // Reformat display value if it's valid
    if (displayValue && displayValue.trim()) {
      const reformatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
      setDisplayValue(reformatted);
    }
  };

  const clearTime = () => {
    setDisplayValue("");
    onChange("");
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2 block">
          <Clock className="w-3 h-3" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className={`relative ${className}`}>
        {/* Unified Input Field */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-card-foreground font-mono font-bold cursor-pointer flex items-center justify-between transition-all group hover:border-primary/50 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${isOpen ? "ring-2 ring-primary/20 border-primary/50" : ""}`}
        >
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={displayValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              spellCheck="false"
              className="w-full bg-transparent outline-none text-sm font-mono font-bold placeholder:text-muted-foreground"
            />
          </div>

          {/* Clear Button */}
          {displayValue && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearTime();
                inputRef.current?.focus();
              }}
              className="ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 p-1 rounded transition-all"
              title="Clear time"
            >
              ✕
            </button>
          )}

          {/* Clock Icon */}
          <Clock className="w-4 h-4 text-muted-foreground ml-2 group-hover:text-primary transition-colors" />
        </div>

        {/* Minimized Vertical Scroll Picker */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-2 bg-card border border-border rounded-lg shadow-lg p-2 w-full max-w-xs">
            <div className="grid grid-cols-3 gap-2">
              {/* Hour Vertical Scroller */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block text-center">Hour</label>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <button
                      key={h}
                      onClick={() => updateTime(h, minutes, period)}
                      className={`py-1 px-2 rounded text-xs font-semibold transition-all ${
                        hours === h
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-card-foreground"
                      }`}
                    >
                      {String(h).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Vertical Scroller */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block text-center">Min</label>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateTime(hours, m, period)}
                      className={`py-1 px-2 rounded text-xs font-semibold transition-all ${
                        minutes === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-card-foreground"
                      }`}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Buttons (Vertical) */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block text-center">Period</label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => updateTime(hours, minutes, "AM")}
                    className={`py-2 rounded text-xs font-semibold transition-all ${
                      period === "AM"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-card-foreground"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => updateTime(hours, minutes, "PM")}
                    className={`py-2 rounded text-xs font-semibold transition-all ${
                      period === "PM"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-card-foreground"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full mt-2 px-2 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>

     
    </div>
  );
};
