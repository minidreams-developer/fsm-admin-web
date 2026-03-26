import { Card } from "./ui/card";

interface OdometerStripProps {
  distance?: string;
  startOdometer?: string;
  endOdometer?: string;
  className?: string;
}

export default function OdometerStrip({
  distance = "7.9 KM",
  startOdometer = "652,398",
  endOdometer = "652,653",
  className = ""
}: OdometerStripProps) {
  return (
    <Card className={`p-0 overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200/60 ${className}`}>
      <div className="grid grid-cols-3 divide-x divide-slate-200/60 h-20">
        {/* Distance Section */}
        <div className="flex flex-col justify-center px-6 py-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
              Distance
            </span>
          </div>
          <p className="text-lg font-bold text-blue-700 leading-tight">
            {distance}
          </p>
        </div>

        {/* Start Odometer Section */}
        <div className="flex flex-col justify-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-1.5">
            Start Odometer
          </span>
          <p className="text-sm font-semibold text-slate-800 font-mono">
            {startOdometer}
          </p>
        </div>

        {/* End Odometer Section */}
        <div className="flex flex-col justify-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-1.5">
            End Odometer
          </span>
          <p className="text-sm font-semibold text-slate-800 font-mono">
            {endOdometer}
          </p>
        </div>
      </div>
    </Card>
  );
}
