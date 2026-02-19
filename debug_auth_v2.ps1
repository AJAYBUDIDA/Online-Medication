$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"

$timestamp = Get-Date -Format "HHmmss"
$email = "debug_$timestamp@test.com"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "1. Registering with $email..."
$regBody = @{
    username = "deb_$timestamp"
    email = $email
    password = "password123"
    role = "doctor"
    specialization = "Gen"
    licenseNumber = "123"
    hospitalName = "Hosp"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $regBody -Headers $headers
    Write-Host "Registration Response: $($res | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Registration Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }
}

Write-Host "2. Logging in with $email..."
$loginBody = @{
    email = $email
    password = "password123"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/signin" -Method Post -Body $loginBody -Headers $headers
    Write-Host "Login Response: $($res | ConvertTo-Json)" -ForegroundColor Green
    if ($res.token) {
        Write-Host "Login SUCCESS. Token received." -ForegroundColor Green
        
        $token = $res.token
        $authHeader = @{ Authorization = "Bearer $token" }
        
        Write-Host "3. Testing Secured Access (GET /prescriptions)..."
        try {
            $getRes = Invoke-RestMethod -Uri "$baseUrl/prescriptions" -Method Get -Headers $authHeader
            Write-Host "Access SUCCESS. Items found: $($getRes.Count)" -ForegroundColor Green
        } catch {
            Write-Host "Access FAILED: $_" -ForegroundColor Red
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "Login SUCCEEDED but no token field found?" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }
}
