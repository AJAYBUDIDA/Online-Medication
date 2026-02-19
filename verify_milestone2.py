import json
import urllib.request
import urllib.error
import sys
import time

BASE_URL = "http://localhost:8080/api"

def request(method, endpoint, data=None, token=None):
    url = BASE_URL + endpoint
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    if data:
        body = json.dumps(data).encode('utf-8')
    else:
        body = None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status >= 200 and response.status < 300:
                resp_body = response.read().decode('utf-8')
                if resp_body:
                    return json.loads(resp_body)
                return {}
            else:
                print(f"Error {response.status}: {response.read().decode('utf-8')}")
                return None
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def register_user(user_data):
    print(f"Registering {user_data['username']} ({user_data['role']})...")
    res = request("POST", "/auth/signup", user_data)
    if res and "message" in res:
        print(f"Success: {res['message']}")
    else:
        print("Registration failed/skipped (maybe exists)")

def login(email, password):
    print(f"Logging in {email}...")
    res = request("POST", "/auth/signin", {"email": email, "password": password})
    if res and "token" in res:
        print("Login successful")
        return res["token"], res["id"]
    return None, None

def verify_flow():
    # 1. Register Users
    timestamp = int(time.time())
    doctor_email = f"doc_{timestamp}@test.com"
    patient_email = f"pat_{timestamp}@test.com"
    pharmacist_email = f"pharma_{timestamp}@test.com"

    # Register Doctor
    register_user({
        "username": f"doc_{timestamp}",
        "email": doctor_email,
        "password": "password123",
        "role": "doctor",
        "specialization": "General",
        "licenseNumber": "LIC123",
        "hospitalName": "City Hospital"
    })

    # Register Patient
    register_user({
        "username": f"pat_{timestamp}",
        "email": patient_email,
        "password": "password123",
        "role": "patient",
        "age": "30",
        "medicalHistory": "None",
        "allergies": "None"
    })

    # Register Pharmacist
    register_user({
        "username": f"pharma_{timestamp}",
        "email": pharmacist_email,
        "password": "password123",
        "role": "pharmacist",
        "pharmacyName": "City Meds",
        "licenseNumber": "PHARM123",
        "gstNumber": "GST123"
    })

    # 2. Login Doctor
    doc_token, doc_id = login(doctor_email, "password123")
    if not doc_token: return

    # 3. Login Patient to get ID
    pat_token, pat_id = login(patient_email, "password123")
    if not pat_token: return

    # 4. Create Prescription (Doctor)
    print("\n[Doctor] Creating Prescription with 2 items...")
    
    # We need patient ID. Assume we have it from login.
    # The create endpoint expects a Multipart request if file is involved, 
    # but based on the service code, it takes @RequestPart. 
    # Validating multipart with urllib is hard.
    # However, the controller creates PrescriptionItem from the JSON part.
    # Let's try to construct a multipart request or use a simpler JSON-only approach if supported?
    # The controller signature:
    # @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    # public ResponseEntity<?> createPrescription(
    #        @RequestPart("prescription") String prescriptionJson,
    #        @RequestPart(value = "file", required = false) MultipartFile file)
    
    # We must send multipart.
    
    prescription_payload = {
        "patientId": pat_id,
        "renewalPeriod": 30,
        "maxRenewals": 2,
        "items": [
            {
                "medicationName": "Paracetamol",
                "dosage": "500mg",
                "frequency": "Twice a day",
                "duration": "5 days",
                "instructions": "After food"
            },
             {
                "medicationName": "Amoxicillin",
                "dosage": "250mg",
                "frequency": "Thrice a day",
                "duration": "5 days",
                "instructions": "Complete course"
            }
        ]
    }
    
    # Using a boundary for multipart
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    data_list = []
    data_list.append(f'--{boundary}')
    data_list.append('Content-Disposition: form-data; name="prescription"')
    data_list.append('Content-Type: application/json')
    data_list.append('')
    data_list.append(json.dumps(prescription_payload))
    data_list.append(f'--{boundary}--')
    data_list.append('')
    
    body = '\r\n'.join(data_list).encode('utf-8')
    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Authorization': f'Bearer {doc_token}'
    }
    
    req = urllib.request.Request(BASE_URL + "/prescriptions", data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Create Response: {response.status}")
            resp_body = response.read().decode('utf-8')
            # The controller returns the created object? Or MessageResponse?
            # It returns ResponseEntity.ok(prescriptionService.createPrescription(...)) which returns the saved object.
            created_prescription = json.loads(resp_body)
            p_id = created_prescription.get('id')
            print(f"Prescription Created! ID: {p_id}")
            
            # Verify items
            if len(created_prescription.get('items', [])) == 2:
                print("✅ Verification Passed: Prescription has 2 items.")
            else:
                print("❌ Verification Failed: Items count mismatch.")
                
            # Verify Status
            if created_prescription.get('status') == 'PENDING_APPROVAL':
                print("✅ Verification Passed: Status is PENDING_APPROVAL.")
            else:
                print(f"❌ Verification Failed: Status is {created_prescription.get('status')}")
                
    except Exception as e:
        print(f"Failed to create prescription: {e}")
        return

    # 5. Check Audit (Doctor)
    print(f"\n[Doctor] Checking Audit for Prescription {p_id}...")
    audit_logs = request("GET", f"/prescriptions/{p_id}/audit", token=doc_token)
    if audit_logs:
        print(f"Audit Logs Found: {len(audit_logs)}")
        if len(audit_logs) > 0:
             print("✅ Verification Passed: Audit log created.")
             print(f"Change Reason: {audit_logs[0].get('changeReason')}")
        else:
             print("❌ Verification Failed: No audit logs.")

    # 5.5 Verify Reminders (Patient) - Added to verify Backend Fix
    print(f"\n[Patient] Verifying Medication Reminders...")
    reminder_payload = {
        "medicationName": "Dolo-650",
        "dosage": "650mg",
        "reminderTime": "09:00",
        "frequency": "DAILY",
        "active": True
    }
    
    # Create Reminder
    print("[Patient] Creating Reminder...")
    reminder_res = request("POST", "/reminders", reminder_payload, token=pat_token) # Note: Endpoint is /api/reminders
    if reminder_res and reminder_res.get('id'):
        rem_id = reminder_res.get('id')
        print(f"Reminder Created! ID: {rem_id}")
        
        # Verify List
        print("[Patient] Fetching My Reminders...")
        my_reminders = request("GET", "/reminders", token=pat_token)
        if my_reminders:
            print(f"Found {len(my_reminders)} reminders.")
            target_rem = next((r for r in my_reminders if r['id'] == rem_id), None)
            if target_rem:
                print(f"✅ Found created reminder: {target_rem['medicationName']}")
                # Verify Time Format (String expected "09:00", not array)
                r_time = target_rem.get('reminderTime')
                print(f"Time value in response: {r_time} (Type: {type(r_time)})")
                if isinstance(r_time, str) and ":" in r_time:
                     print("✅ verification Passed: Time format is correct (String HH:mm).")
                else:
                     print(f"❌ Verification Failed: Time format is incorrect: {r_time}")
            else:
                print("❌ Created reminder not found in list.")
        else:
            print("❌ No reminders found.")
    else:
        print("❌ Failed to create reminder.")

    # 6. Pharmacist Approve
    pharm_token, pharm_id = login(pharmacist_email, "password123")
    if not pharm_token: return

    print("\n[Pharmacist] Listing Pending Prescriptions...")
    pending_list = request("GET", "/prescriptions", token=pharm_token)
    # Filter for our prescription
    target_p = next((p for p in pending_list if p['id'] == p_id), None)
    
    if target_p:
         print(f"✅ Found pending prescription {p_id}")
    else:
         print(f"❌ Pending prescription {p_id} not found in pharmacist view")
         
    print(f"\n[Pharmacist] Approving Prescription {p_id}...")
    # Update status to APPROVED
    # Endpoint: PUT /api/prescriptions/{id}/status
    # Body: string status "APPROVED" (as JSON string?)
    # Service expects JSON string for status?
    # Controller: @RequestBody String status
    status_body = "APPROVED" # Simple string or JSON string?
    # Usually request body is JSON. So "APPROVED" might need quotes if parsed as JSON, or just raw string.
    # In my Frontend I used JSON.stringify(status) -> "APPROVED" (with quotes).
    # So the controller likely expects a JSON string.
    
    req_approve = request("PUT", f"/prescriptions/{p_id}/status", data=status_body, token=pharm_token)
    # Wait, the request helper wraps data in json.dumps, so "APPROVED" becomes "\"APPROVED\"" 
    # which is a valid JSON string.
    
    # Verification of approval
    print("\n[Patient] Checking My Prescriptions...")
    my_prescriptions = request("GET", "/prescriptions", token=pat_token)
    target_p_patient = next((p for p in my_prescriptions if p['id'] == p_id), None)
    
    if target_p_patient:
        if target_p_patient.get('status') == 'APPROVED':
             print("✅ Verification Passed: Prescription is APPROVED in Patient View.")
        else:
             print(f"❌ Verification Failed: Prescription status is {target_p_patient.get('status')}")
    else:
        print("❌ Prescription not found in Patient view.")

    print("\n✅ Verification Sequence Complete.")

if __name__ == "__main__":
    verify_flow()
