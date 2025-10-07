import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Car, CheckCircle2 } from "lucide-react";

interface StatusCount {
  in: number;
  out: number;
}

interface ActiveVehicle {
  vehicle_number: string;
  person_name: string;
  vehicle_type: string;
  time_in: string;
}

const Status = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<StatusCount>({ in: 0, out: 0 });
  const [activeVehicles, setActiveVehicles] = useState<ActiveVehicle[]>([]);

  useEffect(() => {
    fetchStatus();

    // Set up realtime subscription
    const channel = supabase
      .channel('vehicle-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_logs'
        },
        () => {
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStatus = async () => {
    try {
      // Get count of vehicles currently IN (no time_out)
      const { count: inCount, error: inError } = await supabase
        .from("vehicle_logs")
        .select("*", { count: "exact", head: true })
        .is("time_out", null);

      if (inError) throw inError;

      // Get total registered vehicles
      const { count: totalCount, error: totalError } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true });

      if (totalError) throw totalError;

      // Get details of vehicles currently IN
      const { data: activeLogs, error: activeError } = await supabase
        .from("vehicle_logs")
        .select(`
          vehicle_number,
          time_in,
          vehicles (
            person_name,
            vehicle_type
          )
        `)
        .is("time_out", null)
        .order("time_in", { ascending: false });

      if (activeError) throw activeError;

      const activeVehiclesData = activeLogs?.map((log: any) => ({
        vehicle_number: log.vehicle_number,
        person_name: log.vehicles?.person_name || "Unknown",
        vehicle_type: log.vehicles?.vehicle_type || "Unknown",
        time_in: log.time_in,
      })) || [];

      setCounts({
        in: inCount || 0,
        out: (totalCount || 0) - (inCount || 0),
      });
      setActiveVehicles(activeVehiclesData);
    } catch (error: any) {
      toast.error("Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold">Vehicle Status Dashboard</h1>
        <p className="text-lg text-muted-foreground">Real-time vehicle tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="shadow-elevated border-2 border-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-muted-foreground">Vehicles IN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center">
                <Car className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="text-6xl font-bold text-accent">{counts.in}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated border-2 border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-muted-foreground">Vehicles OUT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-6xl font-bold text-muted-foreground">{counts.out}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeVehicles.length > 0 && (
        <Card className="shadow-elevated max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Currently Inside</CardTitle>
            <CardDescription className="text-base">
              Vehicles that are currently logged IN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeVehicles.map((vehicle, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{vehicle.vehicle_number}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.person_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{vehicle.vehicle_type}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      IN: {formatTime(vehicle.time_in)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Status;
