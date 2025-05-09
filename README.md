# DLSU Chorale Attendance System

A comprehensive attendance management system for DLSU Chorale members.

## Features

- User authentication with Google OAuth
- Role-based access control (Admin/Member)
- Attendance tracking and excuse submission
- Profile management
- Dark mode support
- Responsive design for mobile and desktop

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database, Storage)
- Resend (Email notifications)
- Docker for deployment

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Resend account for email notifications

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend API key for email notifications
RESEND_API_KEY=your_resend_api_key
\`\`\`

### Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/your-username/dlsu-chorale-attendance.git
   cd dlsu-chorale-attendance
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in the `migrations` folder
3. Set up the storage bucket for profile images
4. Add test emails to the Directory table:
   \`\`\`sql
   INSERT INTO "Directory" (email) VALUES 
   ('your-email@example.com'),
   ('test-member@dlsu.edu.ph'),
   ('test-admin@dlsu.edu.ph');
   \`\`\`

## Docker Deployment

1. Build the Docker image:
   \`\`\`
   docker build -t dlsu-chorale-attendance .
   \`\`\`

2. Run the container:
   \`\`\`
   docker run -p 3000:3000 --env-file .env.local dlsu-chorale-attendance
   \`\`\`

Alternatively, use Docker Compose:
   \`\`\`
   docker-compose up -d
   \`\`\`

## License

This project is licensed under the MIT License.
