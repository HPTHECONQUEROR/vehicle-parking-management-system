import { vehicleService } from './db-service';

// SQLite client that mimics Supabase interface
export const sqliteClient = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: () => {
          if (table === 'vehicles' && column === 'vehicle_number') {
            const result = vehicleService.getVehicleByNumber(value);
            return Promise.resolve({ data: result || null, error: null });
          }
          if (table === 'vehicles' && column === 'id') {
            const result = vehicleService.getVehicleById(value);
            return Promise.resolve({ data: result || null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        all: () => {
          if (table === 'vehicles') {
            const result = vehicleService.getAllVehicles();
            return Promise.resolve({ data: result, error: null });
          }
          return Promise.resolve({ data: [], error: null });
        }
      }),
      is: (column: string, value: any) => ({
        order: (orderColumn: string, direction: any) => ({
          all: () => {
            if (table === 'vehicle_logs' && column === 'time_out' && value === null) {
              const result = vehicleService.getCheckedInVehicles();
              return Promise.resolve({ data: result, error: null });
            }
            return Promise.resolve({ data: [], error: null });
          }
        })
      }),
      order: (orderColumn: string, direction: any) => ({
        all: () => {
          if (table === 'vehicle_logs') {
            const result = vehicleService.getAllLogs();
            return Promise.resolve({ data: result, error: null });
          }
          return Promise.resolve({ data: [], error: null });
        }
      })
    }),
    insert: (values: any[]) => ({
      select: () => ({
        single: () => {
          if (table === 'vehicles') {
            const result = vehicleService.createVehicle(values[0]);
            return Promise.resolve({ data: result || null, error: null });
          }
          if (table === 'vehicle_logs') {
            const result = vehicleService.checkInVehicle(
              values[0].vehicle_id,
              values[0].vehicle_number,
              values[0].purpose,
              values[0].flat_number
            );
            return Promise.resolve({ data: result || null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }
      })
    }),
    update: (updates: any) => ({
      eq: (column: string, value: any) => ({
        single: () => {
          if (table === 'vehicle_logs' && column === 'id') {
            const result = vehicleService.checkOutVehicle(value);
            return Promise.resolve({ data: result || null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        single: () => {
          if (table === 'vehicles' && column === 'id') {
            const result = vehicleService.deleteVehicle(value);
            return Promise.resolve({ data: result, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }
      })
    })
  }),

  // Real-time subscription mock
  channel: () => ({
    on: () => ({
      subscribe: () => ({
        unsubscribe: () => {}
      })
    }),
    subscribe: () => ({}),
    unsubscribe: () => {}
  })
};
