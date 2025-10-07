import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleService } from "@/lib/database-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, LogIn } from "lucide-react";

const NewRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [registeredVehicle, setRegisteredVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({
    personName: "",
    contactNumber: "",
    vehicleNumber: "",
    registrationDate: new Date().toISOString().split('T')[0],
    vehicleName: "",
    vehicleType: "",
    flatNumber: "",
    purpose: "visitor",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicle = vehicleService.createVehicle({
        person_name: formData.personName,
        contact_number: formData.contactNumber,
        vehicle_number: formData.vehicleNumber.toUpperCase(),
        vehicle_name: formData.vehicleName,
        vehicle_type: formData.vehicleType as "2-Wheeler" | "4-Wheeler",
        registration_date: formData.registrationDate,
        flat_number: formData.flatNumber,
        purpose: formData.purpose,
      });

      setRegisteredVehicle(vehicle);
      setShowCheckIn(true);
      toast.success("Vehicle registered successfully! Ready to check in.");
    } catch (error: any) {
      toast.error(error.message || "Failed to register vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!registeredVehicle) return;
    
    setLoading(true);
    try {
      vehicleService.checkInVehicle(
        registeredVehicle.id,
        registeredVehicle.vehicle_number,
        registeredVehicle.purpose,
        registeredVehicle.flat_number
      );

      toast.success("Vehicle checked in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to check in vehicle");
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
          <CardTitle className="text-3xl">New Vehicle Registration</CardTitle>
          <CardDescription className="text-base">Fill in the details to register a new vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="personName">Person Name *</Label>
              <Input
                id="personName"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                required
                disabled={loading}
                className="h-12 text-base"
                placeholder="Enter person's full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                required
                disabled={loading}
                className="h-12 text-base"
                placeholder="Enter mobile number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
              <Input
                id="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                required
                disabled={loading}
                className="h-12 text-base uppercase"
                placeholder="e.g., MH12AB1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDate">Date of Registration *</Label>
              <Input
                id="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                required
                disabled={loading}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleName">Vehicle Name *</Label>
              <Input
                id="vehicleName"
                value={formData.vehicleName}
                onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                required
                disabled={loading}
                className="h-12 text-base"
                placeholder="e.g., Honda Activa, Maruti Swift"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                required
                disabled={loading}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-Wheeler">2-Wheeler</SelectItem>
                  <SelectItem value="4-Wheeler">4-Wheeler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flatNumber">Flat Number</Label>
              <Input
                id="flatNumber"
                value={formData.flatNumber}
                onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                disabled={loading}
                className="h-12 text-base"
                placeholder="e.g., A-101, B-205"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Select
                value={formData.purpose}
                onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                required
                disabled={loading}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!showCheckIn ? (
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Register Vehicle
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Vehicle registered! Ready to check in?
                  </p>
                </div>
                <Button
                  onClick={handleCheckIn}
                  className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Check In Vehicle
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="w-full h-12 text-base"
                >
                  Skip to Dashboard
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRegistration;
