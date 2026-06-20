# Dream Vacation Destinations

This is a full stack web application where users can search for countries they want to visit and save them to a personal list. Each entry displays the country name, its capital city, and the region it belongs to. The application is made up of three components: a React frontend, a Node.js Express backend, and a PostgreSQL database. All three run inside Docker containers and are managed through Docker Compose.

## What Was Done

The base project was a React and Node.js application with no containerization in place. The task was to take that existing codebase and make it run entirely through Docker, with all three services isolated in their own containers and able to communicate with each other over a shared network.

Several issues came up during the process that required real fixes beyond just writing configuration files.

The first issue was with the Node.js version. The React frontend uses an older version of webpack that is not compatible with the OpenSSL implementation in Node.js 18. This caused the frontend build to fail with a cryptography error. The fix was to pass the NODE_OPTIONS flag during the build step inside the Dockerfile to tell Node to use the legacy OpenSSL provider.

The second issue was that the REST Countries API the project was originally built around has been deprecated and taken offline. The backend was calling version 3.1 of that API and every request was returning a deprecation notice instead of country data, which caused the backend to crash whenever a user tried to add a country. After testing several alternatives from inside the running container, the application was updated to use the CountriesNow API for capital city data and the First.org countries API for region data. Both are free and do not require authentication.

The third issue was on the frontend side. The original code called toLocaleString() on the population field without checking whether the value existed first. Since neither of the replacement APIs returned population data, that field was stored as null in the database. When the frontend tried to render a saved entry, it crashed and left the page blank. A null check was added to the population display so it shows N/A instead of throwing an error.

A database initialisation file was also added so the destinations table gets created automatically whenever the database container starts for the first time, removing the need to create it manually.

## Project Structure

The repository contains a frontend directory with the React application, a backend directory with the Node.js API server, and Docker configuration at the project root. The backend also contains an SQL initialisation file that sets up the database table on first run.

## Requirements

Docker and Docker Compose must be installed. No other local dependencies are needed.

## Environment Setup

A .env file is required at the root of the project before running the application. Create one with the following content, updating the password to something of your choosing:

POSTGRES_USER=your_postgres_user

POSTGRES_PASSWORD=your_postgres_password

POSTGRES_DB=your_database_name

DATABASE_URL=postgresql://your_postgres_user:your_postgres_password@db:5432/your_database_name

PORT=3001

The database hostname in the connection string is set to db rather than localhost. This is because containers on the same Docker network reach each other using their service names, not localhost.

## Running the Application

From the root of the project, run:

docker compose up --build

Docker will build the frontend and backend images, pull the PostgreSQL image, create the shared network and database volume, and start all three containers. The table is created automatically on first startup.

Once everything is running, open a browser and go to http://localhost to access the application. The backend API is available at http://localhost:3001/api/destinations.

To stop the application, run docker compose down.

## Architecture

All three containers run on a custom bridge network which allows them to find each other by service name. The backend connects to the database using the service name db in its connection string, and the frontend communicates with the backend on port 3001.

The frontend image is built using a multi-stage Dockerfile. The first stage compiles the React application into static production files using Node.js. The second stage copies only those compiled files into a clean nginx image, which then serves them. The final image contains no source code or build tools, only nginx and the compiled output.

Database data is stored in a named Docker volume so it persists across container restarts. Stopping or recreating the containers does not result in data loss.

## Screenshots

![docker compose up build](screenshots/Docker%20compose%20up%20successful.jpeg)

![docker ps output showing vacation_db, vacation_backend, and vacation_frontend all with a status of Up](screenshots/Containers%20running.jpeg)

![The application open in the browser at http://localhost and countries were successfully added](screenshots/Countries%20added.jpeg)