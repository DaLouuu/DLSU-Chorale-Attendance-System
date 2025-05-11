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
- Docker Desktop installed

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend API key for email notifications
RESEND_API_KEY=your_resend_api_key
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/dlsu-chorale-attendance.git
   cd dlsu-chorale-attendance
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in the `migrations` folder
3. Set up the storage bucket for profile images
4. Add test emails to the Directory table:
   ```sql
   INSERT INTO "Directory" (email) VALUES 
   ('your-email@example.com'),
   ('test-member@dlsu.edu.ph'),
   ('test-admin@dlsu.edu.ph');
   ```

## Docker Deployment

### Running with Docker

1. **Start Docker Desktop**
   - Make sure Docker Desktop is running on your machine
   - Check for the Docker icon in your system tray

2. **Navigate to Project Directory**
   ```bash
   cd path/to/dlsu-chorale-attendance
   ```

3. **Start the Application**
   - First time or after pulling new changes:
   ```bash
   docker-compose --env-file .env.local up --build -d
   ```
   - Restarting existing setup:
   ```bash
   docker-compose --env-file .env.local up -d
   ```

4. **Access the Application**
   - Open your browser and go to http://localhost:3000

5. **Useful Commands for Development**
   - View logs:
   ```bash
   docker logs dlsu-chorale-attendance-system-app-1
   ```
   - Stop the application:
   ```bash
   docker-compose down
   ```
   - Rebuild after changes:
   ```bash
   docker-compose --env-file .env.local up --build -d
   ```

6. **Environment Variables**
   - Ensure `.env.local` is present with required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

7. **Troubleshooting**
   - For permission errors:
   ```bash
   docker-compose down
   docker system prune -a  # Cleans up unused images and containers
   docker-compose --env-file .env.local up --build -d
   ```
   - If container isn't starting:
   ```bash
   docker-compose logs  # Check for errors
   ```

### Important Notes
- Keep `.env.local` secure and never commit it to version control
- `-d` flag runs container in detached mode (background)
- `--build` flag rebuilds images when code changes
- `--env-file .env.local` ensures environment variables are loaded

## License

This project is licensed under the MIT License.
