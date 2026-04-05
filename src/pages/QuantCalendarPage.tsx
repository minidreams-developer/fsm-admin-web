import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import { useLeadsStore } from "@/store/leadsStore";
import { useServicesStore } from "@/store/servicesStore";
import { useEmployeesStore } from "@/store/employeesStore";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type CalEvent = {
  label: string;
  color: string;
  type: "work-order" | "enquiry" | "service" | "employee";
};

type TabFilter = "All" | "Work Order" | "Employee";

const QuantCalendarPage = () => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<number | null>(null);
  const [tab, setTab] = useState<TabFilter>("All");

  const { workOrders } = useProjectsStore();
  const { leads } = useLeadsStore();
  const { appointments } = useServicesStore();
  const { employees } = useEmployeesStore();

  const prev = () => { setSelected(null); setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }); };
  const next = () => { setSelected(null); setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }); };

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const eventMap: Record<number, CalEvent[]> = {};

  const addEvent = (dateStr: string, event: CalEvent) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d.getFullYear() === current.year && d.getMonth() === current.month) {
      const day = d.getDate();
      if (!eventMap[day]) eventMap[day] = [];
      eventMap[day].push(event);
    }
  };

  if (tab === "All" || tab === "Work Order") {
    workOrders.forEach(wo => {
      addEvent(wo.start, { label: `WO: ${wo.customer}`, color: "bg-primary/80", type: "work-order" });
    });
    leads.forEach(l => {
      if (l.nextFollowUpDate) {
        addEvent(l.nextFollowUpDate, { label: `Follow Up: ${l.name}`, color: "bg-warning/80", type: "enquiry" });
      }
    });
    appointments.forEach(apt => {
      addEvent(apt.date, { label: `Service: ${apt.workOrderId}`, color: "bg-success/80", type: "service" });
    });
  }

  if (tab === "All" || tab === "Employee") {
    employees.forEach(emp => {
      // Show employee clock-in as a daily marker — use today's date as placeholder for demo
      const d = new Date(current.year, current.month, 1);
      for (let day = 1; day <= daysInMonth; day++) {
        d.setDate(day);
        if (d.getDay() !== 0 && d.getDay() !== 6) { // weekdays only
          addEvent(`${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            { label: `${emp.name} (${emp.clockIn})`, color: "bg-purple-500/70", type: "employee" });
        }
      }
    });
  }

  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const selectedEvents = selected ? (eventMap[selected] || []) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Quant Calendar</h2>
          <p className="text-sm text-muted-foreground">Work orders, follow-ups and service appointments</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {(["All", "Work Order", "Employee"] as TabFilter[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${tab === t ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              style={tab === t ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {(tab === "All" || tab === "Work Order") && <>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary/80" />Work Orders</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning/80" />Enquiry Follow-ups</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success/80" />Service Appointments</span>
        </>}
        {(tab === "All" || tab === "Employee") && (
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500/70" />Employee Schedule</span>
        )}
      </div>

      <div className="bg-card rounded-xl card-shadow border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h3 className="text-base font-bold text-card-foreground">{MONTHS[current.month]} {current.year}</h3>
          <button onClick={next} className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const isToday = day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
            const isSelected = day === selected;
            const events = day ? (eventMap[day] || []) : [];
            return (
              <div
                key={i}
                onClick={() => day && setSelected(isSelected ? null : day)}
                className={`min-h-[72px] p-1.5 rounded-lg border transition-colors ${
                  !day ? "border-transparent" :
                  isSelected ? "border-primary bg-primary/5 cursor-pointer" :
                  "border-border hover:bg-secondary/50 cursor-pointer"
                }`}
              >
                {day && (
                  <>
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${isToday ? "text-white" : "text-card-foreground"}`}
                      style={isToday ? { background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" } : {}}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {events.slice(0, 2).map((ev, idx) => (
                        <div key={idx} className={`${ev.color} text-white text-[10px] font-medium px-1 py-0.5 rounded truncate`}>
                          {ev.label}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">+{events.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="bg-card rounded-xl card-shadow border border-border p-5">
          <h4 className="text-sm font-semibold text-card-foreground mb-3">
            {MONTHS[current.month]} {selected}, {current.year}
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">No events on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ev.color}`} />
                  <span className="text-sm text-card-foreground">{ev.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">{ev.type.replace("-", " ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuantCalendarPage;
