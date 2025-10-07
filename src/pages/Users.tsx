import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleService } from "@/lib/database-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Pencil, Save, X } from "lucide-react";

interface Vehicle {
  id: number;
  person_name: string;
  contact_number: string;
  vehicle_number: string;
  vehicle_name: string;
  vehicle_type: string;
  registration_date: string;
}

const Users = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    try {
      const data = vehicleService.getAllVehicles();
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setEditData({ ...vehicle });
  };

  const handleSave = async (id: number) => {
    try {
      const { error } = await vehicleService.updateVehicle(id, editData);
      if (error) throw error;

      toast.success("User updated successfully");
      setEditingId(null);
      fetchVehicles();
    } catch (error: any) {
      toast.error("Failed to update user");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
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

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="text-3xl">Users Management</CardTitle>
          <CardDescription className="text-base">
            View and edit registered vehicle users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No users registered yet</p>
              <Button
                onClick={() => navigate("/dashboard/new-registration")}
                className="mt-4"
              >
                Register First Vehicle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base">Name</TableHead>
                    <TableHead className="text-base">Contact</TableHead>
                    <TableHead className="text-base">Vehicle No.</TableHead>
                    <TableHead className="text-base">Vehicle</TableHead>
                    <TableHead className="text-base">Type</TableHead>
                    <TableHead className="text-base">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.person_name}</TableCell>
                      <TableCell>
                        {editingId === vehicle.id ? (
                          <Input
                            value={editData.contact_number || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, contact_number: e.target.value })
                            }
                            className="h-9"
                          />
                        ) : (
                          vehicle.contact_number
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {editingId === vehicle.id ? (
                          <Input
                            value={editData.vehicle_number || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, vehicle_number: e.target.value })
                            }
                            className="h-9 uppercase"
                          />
                        ) : (
                          vehicle.vehicle_number
                        )}
                      </TableCell>
                      <TableCell>{vehicle.vehicle_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={vehicle.vehicle_type === "2-Wheeler" ? "secondary" : "default"}
                        >
                          {vehicle.vehicle_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingId === vehicle.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(vehicle.id)}
                              className="h-8"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="h-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(vehicle)}
                            className="h-8"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
