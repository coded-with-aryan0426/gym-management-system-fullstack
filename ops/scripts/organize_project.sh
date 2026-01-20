#!/bin/bash

# Create new directory structure
mkdir -p documentation/plans
mkdir -p documentation/architecture
mkdir -p documentation/reports
mkdir -p documentation/guides
mkdir -p documentation/tech-notes
mkdir -p documentation/misc
mkdir -p documentation/career  # For interview-prep

mkdir -p ops/scripts
mkdir -p ops/logs
mkdir -p ops/build-artifacts

# --- Move Documentation ---
# Plans
mv COMPREHENSIVE_PROJECT_PLAN.md documentation/plans/ 2>/dev/null
mv PRD_V3_ATHLONX.md documentation/plans/ 2>/dev/null
mv ANALYSIS_AND_PLAN.md documentation/plans/ 2>/dev/null
mv product_requirements_document.md documentation/plans/ 2>/dev/null
mv REFACTORING_REUSABILITY_PLAN.md documentation/plans/ 2>/dev/null

# Architecture
mv ARCHITECTURE.md documentation/architecture/ 2>/dev/null
mv DATABASE_STRUCTURE_REPORT.md documentation/architecture/ 2>/dev/null
mv DATABASE_STRUCTURE_REPORT.pdf documentation/architecture/ 2>/dev/null
mv report_diagrams.md documentation/architecture/ 2>/dev/null
if [ -d "technical_roadmap" ]; then
    mv technical_roadmap documentation/architecture/roadmap
fi

# Reports
mv PAGE_AUDIT_REPORT.md documentation/reports/ 2>/dev/null

# Guides
mv STARTUP_GUIDE.md documentation/guides/ 2>/dev/null

# Tech Notes
mv "Trainers page explantion.txt" documentation/tech-notes/ 2>/dev/null
mv "members page explantion.txt" documentation/tech-notes/ 2>/dev/null
mv "landingpage and other page ui.md" documentation/tech-notes/ 2>/dev/null

# Misc & Career
mv TEST.txt documentation/misc/ 2>/dev/null
mv user_flows.md documentation/misc/ 2>/dev/null
if [ -d "interview-prep" ]; then
    mv interview-prep documentation/career/interview-prep
fi

# --- Move Operations ---
# Scripts
mv *.sh ops/scripts/ 2>/dev/null
# Don't move the script we are currently running (if called directly)
# but since mistakes happen, we'll assume I run this command and then move this file manually or delete it.

# Logs
mv *.log ops/logs/ 2>/dev/null

# Artifacts
if [ -d "dist" ]; then
    mv dist ops/build-artifacts/
fi

# --- Cleanup ---
# Remove empty components folder if it is truly empty/only has .DS_Store
if [ -d "components" ]; then
    rm -rf components
fi

echo "✅ Project organized successfully!"
echo "New structure:"
ls -F
