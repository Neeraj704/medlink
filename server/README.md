# MedLink Backend

MedLink is a digital clinical record and prescription application that connects patients (authenticated via ABHA/ABDM Health ID) with doctors (verified via HPR). This repository contains the complete, production-ready backend service.

The backend is built with Node.js, Express, and Prisma ORM, connecting to a Postgres database (like NeonDB). It handles user authentication, data management, FHIR R4 Bundle creation, and PDF generation for clinical records.

## Key Features

-   **Patient Authentication**: Real, live ABHA OTP-based login.
-   **Doctor Verification**: Real, live HPR ID-based verification.
-   **Clinical Records**: Doctors can create consultations with coded diagnoses and prescriptions.
-   **FHIR R4 Generation**: The backend automatically constructs a standard FHIR R4 Bundle for each consultation.
-   **PDF Downloads**: Patients can download their consultation records as PDFs.
-   **Secure by Design**: Implements JWT (access/refresh tokens with rotation), rate limiting, CORS, and security headers via Helmet.
-   **Production Ready**: Structured logging, graceful shutdown, and containerization with Docker.

---

## Prerequisites

-   Node.js v18+
-   npm or yarn
-   Docker and Docker Compose (for containerized deployment)
-   A Postgres database (e.g., a free tier from [NeonDB](https://neon.tech/))

---

## Local Development Setup

Follow these steps to get the backend running on your local machine.

### 1. Clone & Install Dependencies

```bash
# Clone the repository (or copy the server/ folder)
git clone <your-repo-url>
cd server
npm install