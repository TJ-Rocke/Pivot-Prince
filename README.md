# Pivot Prince

Pivot Prince is a web application for generating formatted bridge reports from PNOV (Parcel Notice of Violation) data. It allows users to upload CSV files, select templates, and generate ready-to-use reports for various purposes.

## Project Structure

This project consists of two main parts:

- **Frontend**: React application built with TypeScript and Vite
- **Backend**: Python Flask API for data processing

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Python (v3.9 or later)
- pip (Python package manager)

## Getting Started

### Frontend Setup

1. Clone the repository and navigate to the frontend directory:

   ```bash
   cd pivot-prince
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. The application will be available at [http://localhost:5173](http://localhost:5173)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd ../backend
   ```

2. Create and activate a virtual environment:

   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # macOS/Linux
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask server:

   ```bash
   python app.py
   ```

5. The API will be running at [http://localhost:5000](http://localhost:5000)

## Using the Application

1. Open the frontend application in your browser
2. Upload a PNOV CSV file (example file format can be found in the backend directory)
3. Select a template type (currently "PNOV Bridge" is supported)
4. Enter your username and ECD date
5. Click "Generate" to create the report
6. Use the "Copy" button to copy the formatted report
7. Use the "Refresh" button to reset the form and generate a new report

## Building for Production

### Frontend

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory, which can be deployed to any static hosting service.

### Backend

The backend includes a Dockerfile for containerization:

```bash
# From the backend directory
docker build -t pivot-prince-backend .
docker run -p 5000:5000 pivot-prince-backend
```

## Testing

Run frontend tests:

```bash
npm test
# or
yarn test
```

Run backend tests:

```bash
# From the backend directory with virtual environment activated
pytest
```

## Technologies Used

### Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS
- Headless UI

### Backend

- Python
- Flask
- Pandas for data processing

## License

[Your license information here]
