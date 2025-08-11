@echo off
setlocal enabledelayedexpansion
echo === Roommate Rent Manager — Sandbox (SQLite) ===
where node >nul 2>nul || (echo Node.js not found. Install Node 18+ from https://nodejs.org & pause & exit /b 1)
where pnpm >nul 2>nul || (echo Installing pnpm globally... & npm install -g pnpm || (echo Failed to install pnpm & pause & exit /b 1))
echo Installing dependencies... & pnpm install || (echo Install failed & pause & exit /b 1)
echo Applying Prisma migrations... & pnpm migrate:dev || (echo Migrate failed & pause & exit /b 1)
echo Seeding sample data... & pnpm seed || (echo Seed failed & pause & exit /b 1)
echo Starting dev server (http://localhost:3000)...
start "" http://localhost:3000
pnpm dev
