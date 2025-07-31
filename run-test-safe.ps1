param(
    [string]$TestFiles = "",
    [int]$TimeoutSeconds = 60
)

$testCommand = if ($TestFiles) {
    "npm run test -- --run --reporter=verbose --testTimeout=5000 $TestFiles"
} else {
    "npm run test -- --run --reporter=verbose --testTimeout=5000"
}

Write-Host "Running: $testCommand" -ForegroundColor Green
Write-Host "Timeout: $TimeoutSeconds seconds" -ForegroundColor Yellow

# Execute with timeout
powershell -ExecutionPolicy Bypass -File scripts/test-with-timeout.ps1 -TestCommand $testCommand -TimeoutSeconds $TimeoutSeconds