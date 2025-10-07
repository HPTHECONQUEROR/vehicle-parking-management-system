import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleService } from "@/lib/database-browser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Car, LogOut, LogIn, Filter, Calendar, Home, User, Loader2 } from "lucide-react";

interface CheckedInVehicle {
  id: number;
  vehicle_number: string;
  person_name?: string;
  vehicle_type?: string;
  vehicle_name?: string;
  time_in: string;
  flat_number?: string;
  contact_number?: string;
  purpose?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [checkedInVehicles, setCheckedInVehicles] = useState<CheckedInVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickCheckInVehicle, setQuickCheckInVehicle] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  
  // Filter states
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterFlat, setFilterFlat] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchCheckedInVehicles();
    // For SQLite, we'll use polling instead of real-time subscriptions
    const interval = setInterval(fetchCheckedInVehicles, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCheckedInVehicles = () => {
    console.log('🔍 Fetching checked in vehicles...');
    try {
      const vehicles = vehicleService.getCheckedInVehicles();
      console.log('✅ Found vehicles:', vehicles.length, vehicles);
      setCheckedInVehicles(vehicles);
    } catch (error: any) {
      console.error('❌ Error loading vehicles:', error);
      toast.error("Failed to load checked-in vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    if (!quickCheckInVehicle.trim()) return;
    
    setQuickLoading(true);
    try {
      const vehicle = vehicleService.getVehicleByNumber(quickCheckInVehicle);
      if (!vehicle) {
        toast.error("Vehicle not found. Please register first.");
        return;
      }

      const checkedInVehicles = vehicleService.getCheckedInVehicles();
      const existingLog = checkedInVehicles.find(v => v.vehicle_number === vehicle.vehicle_number);
      if (existingLog) {
        toast.error("Vehicle is already checked in.");
        return;
      }

      vehicleService.checkInVehicle(vehicle.id, vehicle.vehicle_number);
      toast.success("Vehicle checked in successfully!");
      setQuickCheckInVehicle("");
      fetchCheckedInVehicles();
    } catch (error: any) {
      toast.error(error.message || "Failed to check in vehicle");
    } finally {
      setQuickLoading(false);
    }
  };

  const handleCheckOut = async (logId: number, vehicleNumber: string) => {
    try {
      vehicleService.checkOutVehicle(logId);
      toast.success(`Vehicle ${vehicleNumber} checked out successfully!`);
      fetchCheckedInVehicles();
    } catch (error: any) {
      toast.error(error.message || "Failed to check out vehicle");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredVehicles = checkedInVehicles.filter(vehicle => {
    const matchesVehicle = !filterVehicle || vehicle.vehicle_number.toLowerCase().includes(filterVehicle.toLowerCase());
    const matchesFlat = !filterFlat || (vehicle.flat_number && vehicle.flat_number.toLowerCase().includes(filterFlat.toLowerCase()));
    return matchesVehicle && matchesFlat;
  });

  return (
    <div className="space-y-6">
      {/* Quick Check-in Section */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="text-2xl">Quick Check-in</CardTitle>
          <CardDescription>Check in existing registered vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter vehicle number"
              value={quickCheckInVehicle}
              onChange={(e) => setQuickCheckInVehicle(e.target.value)}
              className="flex-1 h-12 text-lg uppercase"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickCheckIn()}
            />
            <Button
              onClick={handleQuickCheckIn}
              disabled={!quickCheckInVehicle.trim() || quickLoading}
              className="h-12 px-6"
            >
              {quickLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Check In
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="text-2xl">Filters</CardTitle>
          <CardDescription>Filter checked-in vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Vehicle Number</Label>
              <Input
                placeholder="Search vehicle..."
                value={filterVehicle}
                onChange={(e) => setFilterVehicle(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Label>Flat Number</Label>
              <Input
                placeholder="e.g., A-101"
                value={filterFlat}
                onChange={(e) => setFilterFlat(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterVehicle("");
                  setFilterFlat("");
                }}
                className="h-10"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Live Parking Status</CardTitle>
                  <CardDescription>
                    {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} currently parked
                  </CardDescription>
                </div>
                <Button
                  onClick={() => navigate("/dashboard/new-registration")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Car className="mr-2 h-4 w-4" />
                  New Registration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {checkedInVehicles.length === 0 ? "No vehicles currently parked" : "No vehicles match your filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Car className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{vehicle.vehicle_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.person_name || 'Unknown'} • {vehicle.vehicle_name || 'Unknown Vehicle'}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{vehicle.vehicle_type || 'N/A'}</Badge>
                            <Badge variant="secondary">{vehicle.purpose || 'visitor'}</Badge>
                          {vehicle.flat_number && vehicle.flat_number !== '' && <Badge variant="outline">{vehicle.flat_number}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatTime(vehicle.time_in)}</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCheckOut(vehicle.id, vehicle.vehicle_number)}
                          className="mt-2"
                        >
                          <LogOut className="mr-1 h-4 w-4" />
                          Check Out
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/new-registration")}
              >
                <Car className="mr-2 h-4 w-4" />
                Register New Vehicle
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/users")}
              >
                <User className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/reports")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Generate Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="text-xl">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Parked</span>
                <span className="font-bold text-2xl">{filteredVehicles.length}</span>
              </div>
              <div className="space-y-2">
                {['2-Wheeler', '4-Wheeler'].map(type => {
                  const count = filteredVehicles.filter(v => v.vehicle_type === type).length;
                  return count > 0 ? (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
