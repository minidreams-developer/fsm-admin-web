import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";

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
      // Parse 24-hour format (HH:mm)
      const parts = value.split(":");
      if (parts.length !== 2) {
        setDisplayValue("");
        return;
      }
      
      let h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      
      // Validate parsed values
      if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m >= 60) {
        setDisplayValue("");
        return;
      }

      // Convert 24-hour to 12-hour
      const is24Hour = h >= 12;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;

      setHours(hour12);
      setMinutes(m);
      setPeriod(is24Hour ? "PM" : "AM");
      setDisplayValue(`${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${is24Hour ? "PM" : "AM"}`);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  // Update picker position when it opens and on scroll/resize
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setPickerPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
          });
        }
      };

      // Initial position
      updatePosition();

      // Update on scroll and resize
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside container AND outside the portal picker
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const isOutsidePicker = !(event.target as HTMLElement)?.closest('[data-picker="true"]');
      
      if (isOutsideContainer && isOutsidePicker) {
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
        const p = (match[3]?.toUpperCase() as "AM" | "PM") || period;

        // Validate hour and minute ranges
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
          onClick={(e) => {
            if (!disabled && (e.target === inputRef.current || e.currentTarget.contains(e.target as Node))) {
              !isOpen && setIsOpen(true);
            }
          }}
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
              className="w-full bg-transparent outline-none text-sm font-mono font-bold placeholder:text-muted-foreground cursor-text"
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

          {/* Clock Icon - Clickable to toggle picker */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              !disabled && setIsOpen(true);
            }}
            className="ml-2 p-1 hover:bg-secondary/50 rounded transition-all cursor-pointer"
            title="Open time picker"
          >
            <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Minimized Vertical Scroll Picker - Using Portal for Global Overlay */}
        {isOpen && !disabled && createPortal(
          <div
            data-picker="true"
            className="fixed z-50 bg-card border border-border rounded-lg shadow-xl p-1.5 w-fit"
            style={{
              top: `${pickerPosition.top}px`,
              left: `${pickerPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-1">
              {/* Hour Vertical Scroller */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block text-center">H</label>
                <div className="flex flex-col gap-0.5 max-h-24 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <button
                      key={h}
                      onClick={() => updateTime(h, minutes, period)}
                      className={`py-0.5 px-1.5 rounded text-[10px] font-semibold transition-all ${
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
                <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block text-center">M</label>
                <div className="flex flex-col gap-0.5 max-h-24 overflow-y-auto">
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateTime(hours, m, period)}
                      className={`py-0.5 px-1.5 rounded text-[10px] font-semibold transition-all ${
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
                <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block text-center">P</label>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => updateTime(hours, minutes, "AM")}
                    className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all ${
                      period === "AM"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-card-foreground"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => updateTime(hours, minutes, "PM")}
                    className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all ${
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
              className="w-full mt-1 px-1.5 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-semibold hover:bg-primary/90 transition-all"
            >
              Done
            </button>
          </div>,
          document.body
        )}
      </div>

     
    </div>
  );
};
