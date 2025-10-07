import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, LogIn, LogOut } from "lucide-react";

const LogVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [action, setAction] = useState<"in" | "out" | null>(null);

  const handleLog = async (logType: "in" | "out") => {
    setLoading(true);
    setAction(logType);

    try {
      // Check if vehicle exists
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("vehicle_number", vehicleNumber.toUpperCase())
        .single();

      if (vehicleError || !vehicle) {
        throw new Error("Vehicle not found. Please register first.");
      }

      if (logType === "in") {
        // Check if there's already an active log (not logged out)
        const { data: activeLog } = await supabase
          .from("vehicle_logs")
          .select("*")
          .eq("vehicle_id", vehicle.id)
          .is("time_out", null)
          .single();

        if (activeLog) {
          throw new Error("Vehicle is already logged IN. Please log OUT first.");
        }

        // Create new IN log
        const { error } = await supabase.from("vehicle_logs").insert([
          {
            vehicle_id: vehicle.id,
            vehicle_number: vehicle.vehicle_number,
            time_in: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        toast.success("Vehicle logged IN successfully!");
      } else {
        // Find the active log to update
        const { data: activeLog, error: findError } = await supabase
          .from("vehicle_logs")
          .select("*")
          .eq("vehicle_id", vehicle.id)
          .is("time_out", null)
          .single();

        if (findError || !activeLog) {
          throw new Error("No active IN log found for this vehicle.");
        }

        // Update with OUT time
        const { error } = await supabase
          .from("vehicle_logs")
          .update({ time_out: new Date().toISOString() })
          .eq("id", activeLog.id);

        if (error) throw error;
        toast.success("Vehicle logged OUT successfully!");
      }

      setVehicleNumber("");
    } catch (error: any) {
      toast.error(error.message || "Failed to log vehicle");
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="text-3xl">Log Vehicle IN/OUT</CardTitle>
          <CardDescription className="text-base">
            Enter vehicle number to record entry or exit time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
            <Input
              id="vehicleNumber"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
              disabled={loading}
              className="h-14 text-lg uppercase font-semibold"
              placeholder="e.g., MH12AB1234"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleLog("in")}
              disabled={!vehicleNumber || loading}
              className="h-16 text-lg font-semibold bg-accent hover:bg-accent/90"
            >
              {loading && action === "in" ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Logging IN...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-6 w-6" />
                  Log IN
                </>
              )}
            </Button>

            <Button
              onClick={() => handleLog("out")}
              disabled={!vehicleNumber || loading}
              className="h-16 text-lg font-semibold bg-warning hover:bg-warning/90"
              variant="secondary"
            >
              {loading && action === "out" ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Logging OUT...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-6 w-6" />
                  Log OUT
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 p-6 bg-secondary rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">Quick Guide:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Enter the vehicle number in the field above</li>
              <li>• Click "Log IN" when a vehicle enters</li>
              <li>• Click "Log OUT" when a vehicle exits</li>
              <li>• Times are recorded automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogVehicle;
