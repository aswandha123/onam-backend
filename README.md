# Onam Backend

Backend API for the Onam Lucky Draw website.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Razorpay

## Installation

Clone the repository

```bash
git clone https://github.com/aswandha123/onam-backend.git
cd onam-backend
```

Install dependencies

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Run the server

```bash
npm start
```

Server runs on:

```
http://localhost:5000
```

## Features

- Razorpay Order Creation
- Razorpay Payment Verification
- User Registration
- Ticket Generation
- Payment Storage
- Duplicate Ticket Prevention
- MongoDB Integration