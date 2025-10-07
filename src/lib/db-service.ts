import db from './database';

export interface Vehicle {
  id: number;
  person_name: string;
  contact_number: string;
  vehicle_number: string;
  vehicle_name: string;
  vehicle_type: '2-Wheeler' | '4-Wheeler';
  registration_date: string;
  flat_number?: string;
  purpose: string;
  created_at: string;
}

export interface VehicleLog {
  id: number;
  vehicle_id: number;
  vehicle_number: string;
  time_in: string;
  time_out?: string;
  purpose?: string;
  flat_number?: string;
  created_at: string;
  person_name?: string;
  vehicle_type?: string;
  vehicle_name?: string;
  contact_number?: string;
}

export const vehicleService = {
  // Vehicle operations
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
    const stmt = db.prepare(`
      INSERT INTO vehicles (person_name, contact_number, vehicle_number, vehicle_name, vehicle_type, registration_date, flat_number, purpose)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      vehicle.person_name,
      vehicle.contact_number,
      vehicle.vehicle_number.toUpperCase(),
      vehicle.vehicle_name,
      vehicle.vehicle_type,
      vehicle.registration_date,
      vehicle.flat_number || null,
      vehicle.purpose || 'visitor'
    );
    return vehicleService.getVehicleById(result.lastInsertRowid as number);
  },

  getAllVehicles: () => {
    const stmt = db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC');
    return stmt.all() as Vehicle[];
  },

  getVehicleById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
    return stmt.get(id) as Vehicle | undefined;
  },

  getVehicleByNumber: (vehicleNumber: string) => {
    const stmt = db.prepare('SELECT * FROM vehicles WHERE vehicle_number = ?');
    return stmt.get(vehicleNumber.toUpperCase()) as Vehicle | undefined;
  },

  updateVehicle: (id: number, updates: Partial<Vehicle>) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = db.prepare(`UPDATE vehicles SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    return vehicleService.getVehicleById(id);
  },

  deleteVehicle: (id: number) => {
    const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
    return stmt.run(id);
  },

  // Vehicle log operations
  checkInVehicle: (vehicleId: number, vehicleNumber: string, purpose?: string, flatNumber?: string) => {
    const stmt = db.prepare(`
      INSERT INTO vehicle_logs (vehicle_id, vehicle_number, time_in, purpose, flat_number)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      vehicleId,
      vehicleNumber.toUpperCase(),
      new Date().toISOString(),
      purpose || 'visitor',
      flatNumber || null
    );
    return vehicleService.getVehicleLogById(result.lastInsertRowid as number);
  },

  checkOutVehicle: (logId: number) => {
    const stmt = db.prepare('UPDATE vehicle_logs SET time_out = ? WHERE id = ?');
    stmt.run(new Date().toISOString(), logId);
    return vehicleService.getVehicleLogById(logId);
  },

  getCheckedInVehicles: () => {
    const stmt = db.prepare(`
      SELECT vl.*, v.person_name, v.vehicle_type, v.vehicle_name, v.contact_number, v.purpose
      FROM vehicle_logs vl
      JOIN vehicles v ON vl.vehicle_id = v.id
      WHERE vl.time_out IS NULL
      ORDER BY vl.time_in DESC
    `);
    return stmt.all() as VehicleLog[];
  },

  getVehicleLogById: (id: number) => {
    const stmt = db.prepare(`
      SELECT vl.*, v.person_name, v.vehicle_type, v.vehicle_name, v.contact_number
      FROM vehicle_logs vl
      JOIN vehicles v ON vl.vehicle_id = v.id
      WHERE vl.id = ?
    `);
    return stmt.get(id) as VehicleLog | undefined;
  },

  getVehicleHistory: (vehicleNumber: string) => {
    const stmt = db.prepare(`
      SELECT vl.*, v.person_name, v.vehicle_type, v.vehicle_name, v.contact_number
      FROM vehicle_logs vl
      JOIN vehicles v ON vl.vehicle_id = v.id
      WHERE vl.vehicle_number = ?
      ORDER BY vl.time_in DESC
    `);
    return stmt.all(vehicleNumber.toUpperCase()) as VehicleLog[];
  },

  getAllLogs: () => {
    const stmt = db.prepare(`
      SELECT vl.*, v.person_name, v.vehicle_type, v.vehicle_name, v.contact_number
      FROM vehicle_logs vl
      JOIN vehicles v ON vl.vehicle_id = v.id
      ORDER BY vl.time_in DESC
    `);
    return stmt.all() as VehicleLog[];
  }
};
