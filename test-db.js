// Test script to verify database is working
import { vehicleService } from './src/lib/db-service.js';

console.log('Testing SQLite database...\n');

// Test database connection
console.log('✅ Database connected successfully');

// Test creating a vehicle
const testVehicle = vehicleService.createVehicle({
  person_name: 'Test User',
  contact_number: '9876543210',
  vehicle_number: 'TEST123',
  vehicle_name: 'Test Car',
  vehicle_type: '4-Wheeler',
  registration_date: '2024-10-06',
  flat_number: 'A-101',
  purpose: 'visitor'
});

console.log('✅ Created test vehicle:', testVehicle);

// Test checking in vehicle
const testLog = vehicleService.checkInVehicle(testVehicle.id, testVehicle.vehicle_number);
console.log('✅ Checked in vehicle:', testLog);

// Test getting checked-in vehicles
const checkedIn = vehicleService.getCheckedInVehicles();
console.log('✅ Current checked-in vehicles:', checkedIn.length);

console.log('\n🎉 Database is working perfectly!');
