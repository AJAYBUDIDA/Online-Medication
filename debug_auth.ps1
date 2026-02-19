$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"

$email = "test_debug_01@test.com"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "1. Registering..."
$regBody = @{
    username = "debug_user_01"
    email = $email
    password = "password123"
    role = "doctor"
    specialization = "Gen"
    licenseNumber = "123"
    hospitalName = "Hosp"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $regBody -Headers $headers
    Write-Host "Registration Success: $($res | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Registration Failed: $_" -ForegroundColor Red
    # Print response body if available
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }
}

Write-Host "2. Logging in..."
$loginBody = @{
    email = $email
    password = "password123"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/signin" -Method Post -Body $loginBody -Headers $headers
    Write-Host "Login Success!" -ForegroundColor Green
    Write-Host "Token: $($res.accessToken)"
} catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }
}
