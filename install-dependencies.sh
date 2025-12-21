#!/bin/bash
# Bash script to install all dependencies for the CMS E-Commerce project
# Run this script from the root directory: ./install-dependencies.sh

echo "========================================"
echo "Installing All Dependencies"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed. Please install Node.js first."
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✓ Node.js: $NODE_VERSION"
echo "✓ npm: $NPM_VERSION"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Install root dependencies
echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install root dependencies"
    exit 1
fi
echo "✓ Root dependencies installed"
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install backend dependencies"
    exit 1
fi
echo "✓ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install frontend dependencies"
    exit 1
fi
echo "✓ Frontend dependencies installed"
echo ""

# Install admin dependencies
echo "Installing admin dependencies..."
cd ../admin
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install admin dependencies"
    exit 1
fi
echo "✓ Admin dependencies installed"
echo ""

# Return to root
cd ..

echo "========================================"
echo "All Dependencies Installed Successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Create a .env file in the backend directory (optional)"
echo "3. Run 'npm run dev' to start all services"
echo ""

