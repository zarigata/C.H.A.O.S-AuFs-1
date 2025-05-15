#!/bin/bash
# =============================================
# ============== CODEX SETUP =================
# =============================================
# C.H.A.O.S. Application Setup Script
# Cross-platform setup script for Linux environments

# Create virtual environment for Python components if needed
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
  source venv/bin/activate
  pip install -U pip setuptools wheel
else
  echo "Virtual environment already exists, activating..."
  source venv/bin/activate
fi

# Install backend dependencies
echo "Installing Backend dependencies..."
cd Backend
npm install
cd ..

# Install frontend dependencies
echo "Installing Frontend dependencies..."
cd FrontEnd
npm install
cd ..

# Setup database if it doesn't exist
echo "Setting up database..."
cd Backend
npx prisma generate
npx prisma migrate dev --name init
cd ..

echo "Setup complete! Run the following commands to start the application:"
echo "Backend: cd Backend && npm run dev"
echo "Frontend: cd FrontEnd && npm run dev"
