$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080/api"

function Request-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
        ContentType = "application/json"
    }

    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }

    try {
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error calling $Endpoint : $_" -ForegroundColor Red
        return $null
    }
}

function Register-User {
    param([hashtable]$UserData)
    Write-Host "Sending Registration Payload: $($UserData | ConvertTo-Json -Depth 5)" -ForegroundColor Cyan
    $res = Request-API -Method POST -Endpoint "/auth/signup" -Body $UserData
    Write-Host "Registration Response: $($res | ConvertTo-Json -Depth 5)" -ForegroundColor Green
}

function Login-User {
    param([string]$Email, [string]$Password)
    $res = Request-API -Method POST -Endpoint "/auth/signin" -Body @{ email = $Email; password = $Password }
    return $res
}

Write-Host "Starting Verification..." -ForegroundColor Cyan

$timestamp = Get-Random -Minimum 1000 -Maximum 9999
$docEmail = "doc$timestamp@test.com"
$patEmail = "pat$timestamp@test.com"
$pharmaEmail = "pharma$timestamp@test.com"

# 1. Register
Write-Host "Registering Doctor..."
Register-User @{
    username = "doc$timestamp"
    email = $docEmail
    password = "password123"
    role = "doctor"
    specialization = "General"
    licenseNumber = "LIC123"
    hospitalName = "City Hospital"
}

Write-Host "Registering Patient..."
Register-User @{
    username = "pat$timestamp"
    email = $patEmail
    password = "password123"
    role = "patient"
    age = "30"
    medicalHistory = "None"
    allergies = "None"
}

Write-Host "Registering Pharmacist..."
Register-User @{
    username = "pharma$timestamp"
    email = $pharmaEmail
    password = "password123"
    role = "pharmacist"
    pharmacyName = "City Meds"
    licenseNumber = "PHARM123"
    gstNumber = "GST123"
}

# 2. Login
$docLogin = Login-User $docEmail "password123"
$docToken = $docLogin.token
$patLogin = Login-User $patEmail "password123"
$patId = $patLogin.id
$patToken = $patLogin.token
$pharmaLogin = Login-User $pharmaEmail "password123"
$pharmaToken = $pharmaLogin.token

if (-not $docToken) { throw "Doctor Login Failed" }
if (-not $patToken) { throw "Patient Login Failed" }
if (-not $pharmaToken) { throw "Pharmacist Login Failed" }

# 3. Create Prescription
Write-Host "Creating Prescription..."
# Note: For multipart/form-data with json, simplified approach if backend supports it.
# If strict multipart is required, we construct it manually. 
# But Invoke-RestMethod handling multipart is tricky.
# We will use a specially crafted wrapper for multipart if needed, or assume backend can take JSON if file is optional.
# But backend controller has @RequestPart. This usually forces multipart.

# Simple try: if file is optional, can we just send JSON? 
# Usually @RequestPart expects multipart request.
# Let's try to simulate multipart using boundaries in a raw string body if needed, 
# OR use a temporary file approach.
# Actually, Invoke-RestMethod -Form in PowerShell 6+ works, but standard PS 5.1 is harder.
# Let's try to use a simplified helper for multipart or just fail if not easy.
# Alternative: Use curl if available.

# Trying manual multipart construction
$boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
$LF = "`r`n"
$jsonBody = @{
    patientId = $patId
    renewalPeriod = 30
    maxRenewals = 2
    items = @(
        @{
            medicationName = "Paracetamol"
            dosage = "500mg"
            frequency = "Twice"
            duration = "5 days"
            instructions = "After food"
        },
        @{
            medicationName = "Amox"
            dosage = "250mg"
            frequency = "Thrice"
            duration = "3 days"
            instructions = "Complete"
        }
    )
} | ConvertTo-Json -Depth 10

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"prescription`"",
    "Content-Type: application/json",
    "",
    $jsonBody,
    "--$boundary--"
)
$multipartBody = $bodyLines -join $LF

try {
    $createRes = Invoke-RestMethod -Uri "$baseUrl/prescriptions" -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $multipartBody -Headers @{ Authorization = "Bearer $docToken" }
    Write-Host "Prescription Created! ID: $($createRes.id)" -ForegroundColor Green
    
    if ($createRes.items.Count -eq 2) {
        Write-Host "✅ Item count verified." -ForegroundColor Green
    } else {
        Write-Host "❌ Item count mismatch." -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to create prescription: $_" -ForegroundColor Red
    exit 1
}

$pId = $createRes.id

# 4. Audit
Write-Host "Checking Audit..."
$audit = Request-API -Method GET -Endpoint "/prescriptions/$pId/audit" -Token $docToken
if ($audit) {
    Write-Host "✅ Audit Verified. Count: $($audit.Count)" -ForegroundColor Green
} else {
    Write-Host "❌ Audit Verification Failed." -ForegroundColor Red
}

# 5. Approve
Write-Host "Approving Prescription..."
Request-API -Method PUT -Endpoint "/prescriptions/$pId/status" -Body "APPROVED" -Token $pharmaToken | Out-Null

# 6. Verify Status
Write-Host "Verifying Status via Patient View..."
$myPrescriptions = Request-API -Method GET -Endpoint "/prescriptions" -Token $patToken
$target = $myPrescriptions | Where-Object { $_.id -eq $pId }

if ($target.status -eq "APPROVED") {
    Write-Host "✅ Full Flow Verified Successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Status Verification Failed: $($target.status)" -ForegroundColor Red
}
