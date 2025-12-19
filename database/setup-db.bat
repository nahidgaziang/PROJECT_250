@echo off
echo ========================================
echo ReaDefy Database Setup
echo ========================================
echo.
echo This script will create the database schema.
echo Make sure XAMPP MySQL is running!
echo.
pause

echo Running SQL script...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS readefy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root readefy_db < schema.sql

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo ✓ Database created successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ✗ Database creation failed!
    echo Make sure XAMPP MySQL is running.
    echo ========================================
)

echo.
pause
