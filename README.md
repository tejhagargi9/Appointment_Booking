# Appointment Booking System

Hey there! This is a full-stack web app I built for managing business appointments. It's got a customer booking interface and an admin panel for managing everything.

## What's This All About?

So basically, this appointment booking system lets customers look at available time slots and book appointments, while giving business owners the tools they need to manage and approve or deny booking requests. I tried to make the interface clean and responsive using some modern web tech.

## Cool Features

**Customer Side:**
- Browse through a weekly calendar view
- Book available slots by entering their contact info
- Pretty straightforward to use

**Admin Dashboard:**
- See all appointments in one place
- Approve or deny requests as they come in
- Filter appointments by status (pending, approved, etc.)
- Export data to CSV for your records

**Other Stuff:**
- Real-time updates - when someone books a slot, it updates automatically
- Works great on both desktop and mobile
- Prevents double-booking (learned that the hard way!)
- Responsive design that doesn't look terrible on phones

## Tech Stack

### Frontend
- React 18 with TypeScript (because I like type safety)
- Vite for build tool and dev server - it's really fast
- Tailwind CSS for styling (utility-first approach)
- Shadcn/ui component library - built on Radix UI
- TanStack Query for managing server state
- Wouter for routing (lightweight alternative to React Router)
- React Hook Form with Zod validation

### Backend  
- Node.js with TypeScript
- Express.js web framework
- Zod for schema validation
- In-memory storage for now (probably want to switch to a real database later)

## Getting Started

### What You'll Need
- Node.js 18 or higher
- npm or yarn (I prefer npm but either works)

### Setup Instructions

1. Clone or download this project

git clone <repository-url>
cd appointment-booking-system


2. Install all the dependencies

npm install


3. Fire up the development server

npm run dev


4. Open your browser and go to http://localhost:5000

The app serves both the frontend and backend on the same port which makes things simpler.

## Available Scripts

- `npm run dev` - Starts development server with hot reload
- `npm run build` - Build for production 
- `npm run preview` - Preview the production build

## API Stuff

### Time Slots

Get all available slots:

GET /api/slots


Returns an array of TimeSlot objects like this:

[
  {
    "id": "some-uuid-here",
    "date": "2025-08-18",
    "startTime": "09:00", 
    "endTime": "09:30",
    "isAvailable": true
  }
]


### Appointments

Get appointments (you can filter by status):

GET /api/appointments?status=pending


Create a new appointment:

POST /api/appointments


Body should look like:

{
  "slotId": "some-uuid",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "reason": "Business consultation"
}


Update appointment status:

PATCH /api/appointments/:id


Body: `{ "status": "approved" }` or `{ "status": "denied" }`

Get some basic stats:

GET /api/appointments/stats


Returns something like:

{
  "totalSlots": 80,
  "pending": 5,
  "approved": 10, 
  "denied": 2,
  "totalAppointments": 17
}


### Example API Calls

Book an appointment:

curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/" \
  -d '{
    "slotId": "abc-123",
    "customerName": "Jane Smith", 
    "customerEmail": "jane@example.com",
    "reason": "Product demo"
  }'


Approve an appointment:

curl -X PATCH http://localhost:5000/api/appointments/def-456 \
  -H "Content-Type: application/" \
  -d '{ "status": "approved" }'


### Project Structure

├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components  
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx         # Main app component
├── server/                 # Backend Express app
│   ├── index.ts           # Where the server starts
│   ├── routes.ts          # All the API routes
│   ├── storage.ts         # Data storage stuff
│   └── vite.ts            # Vite integration
├── shared/                 # Shared between frontend/backend
│   └── schema.ts          # Zod schemas and TypeScript types
└── README.md              # You're reading it!


### Architecture of the project

**Frontend:**
- Component-based design (each component does one thing well)
- Custom hooks for fetching data and managing state
- API client with TanStack Query for caching (saves on network requests) to avoid redundant API calls
- Form validation using Zod schemas
- Responsive design with Tailwind classes

**Backend:**
- RESTful API design 
- Input validation using Zod 
- Error handling middleware
- Everything's type-safe with TypeScript

**Data Layer:**
- Storage interface cna we swapped with a production database of your choice
- In-memory storage used for demo
- Automatically generates time slots for business hours

## Error Handling

I tried to make error handling pretty comprehensive:

**Backend Errors:**
- Validation errors give you a 400 with details about what went wrong
- If something's not found, you will get a 404 
- Conflict errors (like trying to double-book) return 400 with explanation
- Server errors return 500 (but the details get logged)

**Frontend Errors:**
- Toast notifications so users know what happened
- Loading states so people don't think it's broken
- Inline form validation 
- fallbacks added when data is missing

Error responses look like this:

{
  "message": "Time slot is already booked",
  "errors": []
}


and for validation errors:

{
  "message": "Invalid appointment data", 
  "errors": [
    {
      "path": ["customerEmail"],
      "message": "Invalid email format"
    }
  ]
}


## Demo Data

When you start the app, it automatically creates some sample data:

- **Time Slots:** Monday through Friday, 9 AM to 5 PM in 30-minute chunks (80 slots total)
- **Business Hours:** You can change these in `server/storage.ts`
- **Appointments:** Starts empty - you create them through the UI or API

## Customizing Things

### Change Business Hours
Edit the `initializeWeeklySlots()` method in `server/storage.ts`:

### Add a Real Database
Replace the `MemStorage` class in `server/storage.ts` with your database implementation. Just make sure it implements the `IStorage` interface and you should be good to go.

### Customize the Look
You can modify colors and styling in `client/src/index.css` and the Tailwind config in `tailwind.config.ts`.

## Development Notes

- Using TypeScript strict mode because type safety is important
- Shared schemas between frontend and backend keeps things consistent  
- Hot module replacement makes development pretty fast
- All API responses are properly typed which makes the developer experience much better
- Using Shadcn/ui for accessible, customizable components

## License

This project is available for educational and commercial use. Feel free to use it however you want!
