// Browser-compatible database wrapper
class DatabaseBrowser {
  private data = {
    vehicles: [
      {
        id: 1,
        person_name: 'Test User',
        contact_number: '9876543210',
        vehicle_number: 'TEST123',
        vehicle_name: 'Test Car',
        vehicle_type: '4-Wheeler',
        registration_date: '2024-10-06',
        flat_number: 'A-101',
        purpose: 'visitor',
        created_at: new Date().toISOString()
      }
    ],
    vehicle_logs: [
      {
        id: 1,
        vehicle_id: 1,
        vehicle_number: 'TEST123',
        time_in: new Date().toISOString(),
        time_out: null,
        purpose: 'visitor',
        flat_number: 'A-101',
        created_at: new Date().toISOString()
      }
    ]
  };

  getCheckedInVehicles() {
    return this.data.vehicle_logs
      .filter(log => !log.time_out)
      .map(log => ({
        ...log,
        person_name: this.data.vehicles.find(v => v.id === log.vehicle_id)?.person_name || 'Unknown',
        vehicle_type: this.data.vehicles.find(v => v.id === log.vehicle_id)?.vehicle_type || 'N/A',
        vehicle_name: this.data.vehicles.find(v => v.id === log.vehicle_id)?.vehicle_name || 'Unknown',
        contact_number: this.data.vehicles.find(v => v.id === log.vehicle_id)?.contact_number || 'N/A'
      }));
  }

  getAllVehicles() {
    return this.data.vehicles;
  }

  getVehicleByNumber(vehicleNumber: string) {
    return this.data.vehicles.find(v => v.vehicle_number === vehicleNumber.toUpperCase());
  }

  getVehicleById(id: number) {
    return this.data.vehicles.find(v => v.id === id);
  }

  createVehicle(vehicle: any) {
    const newVehicle = { ...vehicle, id: this.data.vehicles.length + 1, created_at: new Date().toISOString() };
    this.data.vehicles.push(newVehicle);
    return newVehicle;
  }

  checkInVehicle(vehicleId: number, vehicleNumber: string, purpose?: string, flatNumber?: string) {
    const newLog = {
      id: this.data.vehicle_logs.length + 1,
      vehicle_id: vehicleId,
      vehicle_number: vehicleNumber,
      time_in: new Date().toISOString(),
      time_out: null,
      purpose: purpose || 'visitor',
      flat_number: flatNumber || null,
      created_at: new Date().toISOString()
    };
    this.data.vehicle_logs.push(newLog);
    return newLog;
  }

  checkOutVehicle(logId: number) {
    const log = this.data.vehicle_logs.find(l => l.id === logId);
    if (log) {
      log.time_out = new Date().toISOString();
    }
    return log;
  }

  updateVehicle(id: number, updates: Partial<any>) {
    const vehicle = this.data.vehicles.find(v => v.id === id);
    if (vehicle) {
      Object.assign(vehicle, updates);
      return { data: vehicle, error: null };
    }
    return { data: null, error: new Error("Vehicle not found") };
  }
}

export const vehicleService = new DatabaseBrowser();
