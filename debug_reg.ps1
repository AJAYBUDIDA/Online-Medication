$ErrorActionPreference = "Stop"
$body = @{
    username = "debug_ph3"
    email = "debug_ph3@test.com"
    password = "password123"
    role = "pharmacist"
    pharmacyName = "Debug Pharmacy 3"
    licenseNumber = "LIC-DEBUG-003"
    gstNumber = "GST-DEBUG-003"
} | ConvertTo-Json

Write-Host "Sending Registration Request..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/signup" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response Status: $($response.StatusCode)"
    Write-Host "Response Content: $($response.Content)"
} catch {
    Write-Host "Request Failed: $_"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Error Body: $($reader.ReadToEnd())"
    }
}
