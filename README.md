# Therapist–Patient Video Conference App

This project is a React-based web application that allows therapists and patients to book appointments and join video calls via Jitsi Meet.

## 📦 Installation

1. **Clone the repository**  
   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

## 🚀 Running Locally (HTTPS)

Jitsi embedding requires a secure context (HTTPS). You have two options:

- **One-off**  
  ```bash
  HTTPS=true npm start
  ```

- **Permanent**  
  1. Create a file named `.env` in your project root containing:
     ```dotenv
     HTTPS=true
     ```
  2. Then run:
     ```bash
     npm start
     ```

3. **Open your browser** at `https://localhost:3000`  
   You may need to accept a self-signed certificate warning.
