import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settingsStore";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingsStore();
  const [kmPrice, setKmPrice] = useState(settings.kmPrice.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    const price = parseFloat(kmPrice);
    
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid kilometer price");
      return;
    }

    setIsSaving(true);
    try {
      updateSettings({ kmPrice: price });
      toast.success("Settings saved successfully");
      setIsSaving(false);
    } catch (error) {
      toast.error("Failed to save settings");
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setKmPrice(settings.kmPrice.toString());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-semibold text-card-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
           Travel Expense
          </h2>
          <p className="text-sm text-muted-foreground">Configure global application settings</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-8 card-shadow border border-border">
        <div className="max-w-2xl">
          {/* Kilometer Price Setting */}
          <div className="space-y-6">
            <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-2">Travel Expense Configuration</h3>
              <p className="text-sm text-muted-foreground">Set the default kilometer reimbursement rate for employees</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="kmPrice" className="block text-sm font-semibold text-card-foreground">
                  Kilometer Price (₹/km)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  This rate will be used to calculate travel expenses for employees. Individual employee rates can override this setting.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-muted-foreground">₹</span>
                  <input
                    id="kmPrice"
                    type="number"
                    step="0.5"
                    min="0"
                    value={kmPrice}
                    onChange={(e) => setKmPrice(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter kilometer price"
                  />
                  <span className="text-lg font-semibold text-muted-foreground">/km</span>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">100 km travel cost:</p>
                    <p className="text-lg font-bold text-primary">
                      ₹ {(parseFloat(kmPrice || "0") * 100).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">500 km travel cost:</p>
                    <p className="text-lg font-bold text-primary">
                      ₹ {(parseFloat(kmPrice || "0") * 500).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Note:</span> This global setting will be used as the default for all employees. 
                  Individual employees can have their own kilometer rates configured in their profiles, which will override this global setting.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6 border-t border-border">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg border border-border bg-card text-card-foreground font-semibold hover:bg-secondary transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
