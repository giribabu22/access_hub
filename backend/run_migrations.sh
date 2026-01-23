#!/bin/bash
# Migration script for Linux/Mac
# This will apply all pending migrations to create the missing tables

echo "========================================"
echo "VMS Backend - Database Migration Script"
echo "========================================"
echo ""

echo "Step 1: Checking current migration status..."
echo ""
flask db current
echo ""

echo "Step 2: Showing migration history..."
echo ""
flask db history --verbose
echo ""

echo "Step 3: Running migrations..."
echo ""
flask db upgrade head
echo ""

if [ $? -eq 0 ]; then
    echo "========================================"
    echo "SUCCESS! All migrations applied."
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "1. Verify tables exist in PostgreSQL"
    echo "2. Test the stats API endpoint"
    echo "3. Seed initial data if needed"
    echo ""
else
    echo "========================================"
    echo "ERROR! Migration failed."
    echo "========================================"
    echo ""
    echo "Please check the error messages above."
    echo "You may need to:"
    echo "1. Check your DATABASE_URL in .env"
    echo "2. Ensure PostgreSQL is running"
    echo "3. Verify database credentials"
    echo ""
fi
