# Socialikool

## Introduction

### Project Overview

Socialikool is a social media platform designed to allow users to connect, share posts, comment on posts, and interact with other users' content. The platform offers real-time notifications, image uploads, and visibility settings for posts.

### Tech Stack

### Tech Stack

- **Frontend**: HTML, CSS, JS and EJS (Embedded JavaScript)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Passport.js, bcrypt
- **Real-time Communication**: Socket.io
- **Other Tools**: Docker, Docker Compose, Jest for testing

## Getting Started

### Prerequisites

- git
- Node.js
- npm
- Docker

### Installation Instructions

1. Clone the repository:

   - git clone https://github.com/Minard-NG/socialikool.git

   - extract and cd into the folder, "socialikool"

2. Build and run the application using Docker Compose:

   - docker-compose up --build

3. Running using node, first install the dependencies using:
   npm install

   - Add a /uploads folder in the root directory

   - Start the development server:
     npm start

   - Run tests:
     npm test

### Code Walkthrough

- `server.js`: Main server file that sets up the Express app and Socket.io.
- `routes/`: Contains route handlers for different parts of the application.
- `views/`: Contains EJS templates for rendering the frontend.
- `public/`: Contains static files such as CSS, images, and JavaScript.
- `controllers/`: Forwards requests to the services and handle responses
- `services/`: handles the business logic of the application

### Common Commands

- `npm start`: Start the application.
- `npm run dev`: Start the development server with Nodemon.
- `npm test`: Run tests.

## Acknowledgements

Special thanks to the amazing team at hiveonline for this challenge.
