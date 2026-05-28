# Will Creation Support System

A full-stack web application that guides users through drafting a will and generates a formatted PDF document. Built as the flagship component of a master's thesis decision-support platform on proactive inheritance planning, this app pairs a React front end with a Python/Flask REST API.

## Overview

Creating a valid, well-structured will requires gathering and organizing a range of information — heirs, executors, real estate, bank accounts, securities, and more. This application breaks that process into clear, guided forms, assembles the data through a REST API, and produces a ready-to-review PDF.

It is the most technically complete of the three thesis apps, demonstrating an end-to-end full-stack architecture with a clear separation between client and server.

## Features

- Guided, multi-section data entry (heirs, executor, real estate, bank accounts, securities)
- Map-based selection for property-related entries
- Live preview of the will as the user fills in details
- Server-side PDF generation of the finished document
- List view of previously created wills
- Clean REST API separating the React front end from the Flask back end

## Architecture

```
┌────────────────────┐        REST API        ┌─────────────────────┐
│   React frontend    │  ───────────────────▶  │   Flask backend      │
│   (forms, preview)  │  ◀───────────────────  │   (logic, PDF gen)   │
└────────────────────┘        JSON / PDF       └─────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React |
| Backend | Python, Flask |
| API | REST (JSON) |
| Documents | Server-side PDF generation |

## Getting Started

Prerequisites: [Python 3](https://www.python.org/) and [Node.js](https://nodejs.org/).

### 1. Start the backend

```bash
cd will-creation-system/backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

### 2. Start the frontend (in a new terminal)

```bash
cd will-creation-system/frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The React app will open in your browser and communicate with the Flask API.

## Project Structure

```
will-creation-system/
├── backend/
│   ├── app.py              # Flask entry point
│   ├── routes.py           # REST API endpoints
│   ├── models.py           # Data models
│   ├── will_generator.py   # Will assembly logic
│   ├── pdf_generator.py    # PDF output
│   ├── requirements.txt
│   └── data/
│       └── wills/          # Generated wills (ignored by Git)
└── frontend/
    ├── public/
    └── src/
        ├── App.js
        └── components/      # HeirForm, ExecutorForm, RealEstateForm,
                             # BankAccountForm, SecuritiesForm,
                             # MapSelector, WillPreview, WillList
```

> Note: Generated wills may contain personal information and are excluded from version control via `.gitignore`.

## About This Project

This is the flagship of three apps that together form the decision-support platform built for my master's thesis at the Kobe Institute of Computing (2024–2026). The other two components are an [inheritance dispute risk predictor](https://github.com/s24030masaya/01.inheritance-predictor) and a [real-estate valuation tool](https://github.com/s24030masaya/02.real-estate-valuation).

## License

Released for portfolio and educational purposes.
