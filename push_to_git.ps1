# Initialize Git
git init

# Add all files (respecting .gitignore)
git add .

# Commit
git commit -m "Initial commit of Online Medication System"

# Rename branch to main
git branch -M main

# Add remote (if not exists, or set-url if it does)
git remote add origin https://github.com/AJAYBUDIDA/Online-Medication-And-Prescription.git

# Push
git push -u origin main
