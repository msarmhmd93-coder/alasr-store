# make-zip.ps1
# Creates site.zip from current folder (run in project root)
# Usage: Open PowerShell in the project folder and run: .\make-zip.ps1

$dest = Join-Path -Path (Get-Location) -ChildPath "site.zip"
if(Test-Path $dest){ Remove-Item $dest -Force }
Compress-Archive -Path * -DestinationPath $dest -Force
Write-Host "Created: $dest" -ForegroundColor Green
