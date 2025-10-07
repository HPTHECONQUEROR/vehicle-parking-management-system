import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    vehicle_number TEXT UNIQUE NOT NULL,
    vehicle_name TEXT NOT NULL,
    vehicle_type TEXT CHECK(vehicle_type IN ('2-Wheeler', '4-Wheeler')) NOT NULL,
    registration_date DATE NOT NULL,
    flat_number TEXT,
    purpose TEXT DEFAULT 'visitor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicle_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    vehicle_number TEXT NOT NULL,
    time_in DATETIME NOT NULL,
    time_out DATETIME,
    purpose TEXT,
    flat_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
  );

  CREATE INDEX IF NOT EXISTS idx_vehicle_logs_vehicle_id ON vehicle_logs(vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_vehicle_logs_time_out ON vehicle_logs(time_out);
  CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_number ON vehicles(vehicle_number);
`);

export default db;
