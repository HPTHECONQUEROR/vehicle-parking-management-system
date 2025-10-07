import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const generateReport = async (type: "logs" | "registrations") => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    setLoading(true);

    try {
      if (type === "logs") {
        // Fetch logs with vehicle details
        const { data, error } = await supabase
          .from("vehicle_logs")
          .select(`
            *,
            vehicles (
              person_name,
              contact_number,
              vehicle_name,
              vehicle_type
            )
          `)
          .gte("time_in", fromDate)
          .lte("time_in", `${toDate} 23:59:59`)
          .order("time_in", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          toast.error("No logs found for the selected date range");
          return;
        }

        // Format data for Excel
        const excelData = data.map((log: any) => ({
          "Vehicle Number": log.vehicle_number,
          "Person Name": log.vehicles?.person_name || "N/A",
          "Contact Number": log.vehicles?.contact_number || "N/A",
          "Vehicle Name": log.vehicles?.vehicle_name || "N/A",
          "Vehicle Type": log.vehicles?.vehicle_type || "N/A",
          "Time IN": new Date(log.time_in).toLocaleString("en-IN"),
          "Time OUT": log.time_out ? new Date(log.time_out).toLocaleString("en-IN") : "Still Inside",
          "Duration (hours)": log.time_out
            ? ((new Date(log.time_out).getTime() - new Date(log.time_in).getTime()) / (1000 * 60 * 60)).toFixed(2)
            : "N/A",
        }));

        // Create workbook and export
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, "Vehicle Logs");
        XLSX.writeFile(wb, `Vehicle_Logs_${fromDate}_to_${toDate}.xlsx`);

        toast.success("Logs report downloaded successfully!");
      } else {
        // Fetch registrations
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .gte("registration_date", fromDate)
          .lte("registration_date", toDate)
          .order("registration_date", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          toast.error("No registrations found for the selected date range");
          return;
        }

        // Format data for Excel
        const excelData = data.map((vehicle) => ({
          "Person Name": vehicle.person_name,
          "Contact Number": vehicle.contact_number,
          "Vehicle Number": vehicle.vehicle_number,
          "Vehicle Name": vehicle.vehicle_name,
          "Vehicle Type": vehicle.vehicle_type,
          "Registration Date": new Date(vehicle.registration_date).toLocaleDateString("en-IN"),
        }));

        // Create workbook and export
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, "New Registrations");
        XLSX.writeFile(wb, `New_Registrations_${fromDate}_to_${toDate}.xlsx`);

        toast.success("Registrations report downloaded successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate report");
    } finally {
      setLoading(false);
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
          <CardTitle className="text-3xl">Generate Reports</CardTitle>
          <CardDescription className="text-base">
            Select date range and download Excel reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date *</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                disabled={loading}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date *</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                disabled={loading}
                className="h-12 text-base"
                min={fromDate}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              onClick={() => generateReport("logs")}
              disabled={loading || !fromDate || !toDate}
              className="w-full h-14 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Vehicle Logs
                </>
              )}
            </Button>

            <Button
              onClick={() => generateReport("registrations")}
              disabled={loading || !fromDate || !toDate}
              variant="secondary"
              className="w-full h-14 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download New Registrations
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 p-6 bg-secondary rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">Report Information:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Vehicle Logs:</strong> Complete IN/OUT history with duration</li>
              <li>• <strong>New Registrations:</strong> All vehicles registered in date range</li>
              <li>• Reports are downloaded as Excel (.xlsx) files</li>
              <li>• Both dates must be selected to generate reports</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
