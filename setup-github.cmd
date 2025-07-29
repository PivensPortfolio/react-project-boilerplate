@echo off
echo.
echo ========================================
echo   React Project Boilerplate Setup
echo ========================================
echo.

set /p username="Enter your GitHub username: "
set /p reponame="Enter repository name (default: react-project-boilerplate): "

if "%reponame%"=="" set reponame=react-project-boilerplate

echo.
echo Setting up repository: %username%/%reponame%
echo.

powershell -ExecutionPolicy Bypass -File "scripts/github-setup.ps1" -GitHubUsername "%username%" -RepositoryName "%reponame%"

echo.
echo Setup complete! Check the output above for next steps.
pause