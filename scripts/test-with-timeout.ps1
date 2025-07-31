param(
    [string]$TestCommand = "npm run test -- --run",
    [int]$TimeoutSeconds = 60
)

Write-Host "Starting test with $TimeoutSeconds second timeout..."
Write-Host "Command: $TestCommand"

# Start the test process in the current directory
$currentDir = Get-Location
$job = Start-Job -ScriptBlock {
    param($cmd, $dir)
    Set-Location $dir
    Invoke-Expression $cmd
} -ArgumentList $TestCommand, $currentDir

# Wait for completion or timeout
$completed = Wait-Job $job -Timeout $TimeoutSeconds

if ($completed) {
    # Job completed within timeout
    $result = Receive-Job $job
    Remove-Job $job
    Write-Host "Test completed successfully within timeout"
    Write-Output $result
    exit 0
} else {
    # Job timed out
    Write-Host "TEST TIMED OUT after $TimeoutSeconds seconds - KILLING PROCESS" -ForegroundColor Red
    
    # Kill the job
    Stop-Job $job
    Remove-Job $job -Force
    
    # Kill any remaining node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Write-Host "All test processes have been terminated" -ForegroundColor Yellow
    exit 1
}