# Enhanced Vehicle Parking System - Product Requirements Document

## Overview
Transform the current vehicle registration system into a comprehensive check-in/check-out management system with real-time dashboard capabilities.

## New Features Required

### 1. Integrated Registration + Check-in Flow
- **Registration Page**: After successful vehicle registration, automatically show "Check In" button
- **One-click Check-in**: Immediate check-in after registration completion
- **Success Flow**: Registration → Auto Check-in → Dashboard view

### 2. Live Dashboard (Main Page)
- **Real-time Display**: Show all currently checked-in vehicles
- **Vehicle Cards**: Each vehicle shows:
  - Vehicle number
  - Check-in time
  - "Check Out" button
- **Auto-refresh**: Real-time updates when vehicles check in/out

### 3. Re-check-in Capability
- **Returning Users**: Allow same vehicle number to check in again after checkout
- **Quick Check-in**: Simple vehicle number input for existing registered vehicles
- **Validation**: Ensure vehicle exists before allowing check-in

### 4. Enhanced Dashboard Filters
- **Date Range Filter**: Select start/end dates for viewing history
- **Vehicle Number Filter**: Search specific vehicle numbers
- **Flat Number**: New field for residential parking management
- **Purpose**: Track visit purpose (resident, visitor, delivery, etc.)

## Technical Requirements

### Database Schema Updates
```sql
-- Add new fields to vehicles table
ALTER TABLE vehicles ADD COLUMN flat_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN purpose VARCHAR(100);

-- Update vehicle_logs to track purpose and flat info
ALTER TABLE vehicle_logs ADD COLUMN purpose VARCHAR(100);
ALTER TABLE vehicle_logs ADD COLUMN flat_number VARCHAR(50);
```

### UI/UX Requirements
1. **Registration Flow**: Seamless transition from registration to check-in
2. **Dashboard Design**: Card-based layout with real-time updates
3. **Filter Interface**: Clean, intuitive filter controls
4. **Mobile Responsive**: Optimized for mobile devices

### Real-time Features
- WebSocket connections for live updates
- Optimistic UI updates
- Real-time vehicle count
- Instant check-in/check-out notifications

## User Stories

### Story 1: New Registration with Check-in
As a parking attendant, I want to register a new vehicle and immediately check it in so that I don't need to perform separate actions.

### Story 2: Live Dashboard View
As a security guard, I want to see all currently parked vehicles in real-time so I can monitor parking status.

### Story 3: Quick Checkout
As a parking attendant, I want to click a checkout button next to each vehicle so I can quickly process exits.

### Story 4: Re-check-in Existing Vehicle
As a resident, I want to check in my registered vehicle quickly using my vehicle number so I don't need to re-register.

### Story 5: Filter Parking History
As an administrator, I want to filter parking records by date, vehicle number, flat number, and purpose so I can generate specific reports.

## Acceptance Criteria

### Registration + Check-in Flow
- [ ] After successful registration, "Check In" button appears
- [ ] Clicking "Check In" immediately checks in the vehicle
- [ ] User is redirected to dashboard showing checked-in vehicle
- [ ] Registration and check-in happen as single transaction

### Live Dashboard
- [ ] Dashboard shows all currently checked-in vehicles
- [ ] Each vehicle displays: number, check-in time, checkout button
- [ ] Real-time updates without page refresh
- [ ] Mobile-responsive design
- [ ] Auto-refresh every 30 seconds

### Checkout Functionality
- [ ] "Check Out" button next to each vehicle
- [ ] Confirmation dialog before checkout
- [ ] Immediate removal from active list
- [ ] Timestamp recorded for checkout

### Re-check-in
- [ ] Quick check-in form for existing vehicles
- [ ] Vehicle number validation against registered vehicles
- [ ] Error handling for non-existent vehicles
- [ ] Success message and dashboard update

### Dashboard Filters
- [ ] Date range picker for filtering
- [ ] Vehicle number search
- [ ] Flat number dropdown/filter
- [ ] Purpose selector (dropdown with predefined options)
- [ ] Combined filters working together
- [ ] Clear filters button

## Technical Architecture

### Component Structure
```
App.tsx
├── DashboardLayout.tsx
├── pages/
│   ├── Dashboard.tsx (Enhanced - main page)
│   ├── NewRegistration.tsx (Enhanced with check-in)
│   ├── QuickCheckIn.tsx (New)
│   ├── Reports.tsx (Enhanced with filters)
│   └── Status.tsx (Replaced by enhanced Dashboard)
├── components/
│   ├── VehicleCard.tsx (New)
│   ├── FilterControls.tsx (New)
│   └── RealTimeUpdates.tsx (New)
```

### State Management
- React Query for server state
- Local state for filters and UI
- Real-time subscriptions with Supabase

### Performance Considerations
- Optimistic updates for better UX
- Debounced search for filters
- Pagination for large datasets
- Efficient re-rendering with React.memo

## Implementation Priority
1. **Phase 1**: Database schema updates and API endpoints
2. **Phase 2**: Enhanced registration with check-in flow
3. **Phase 3**: Live dashboard with checkout functionality
4. **Phase 4**: Dashboard filters and search
5. **Phase 5**: Quick check-in for existing vehicles
6. **Phase 6**: Testing and optimization
