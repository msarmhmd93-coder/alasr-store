# publish-gh.ps1
# Requires: Git and GitHub CLI (gh) installed and you are authenticated with gh.
# This script will: init git (if needed), commit, create a GitHub repo and push.
# Run from project root: .\publish-gh.ps1

if(-not (Get-Command git -ErrorAction SilentlyContinue)){
  Write-Host 'Git not found. Install Git first: https://git-scm.com/downloads' -ForegroundColor Red
  exit 1
}
if(-not (Get-Command gh -ErrorAction SilentlyContinue)){
  Write-Host 'GitHub CLI (gh) not found. Install and authenticate: https://cli.github.com/' -ForegroundColor Red
  exit 1
}
$repo = Read-Host 'Enter GitHub repo name (e.g. my-store)'
if(-not $repo){ Write-Host 'Repo name required.' -ForegroundColor Yellow; exit 1 }

# Initialize git if no .git
if(-not (Test-Path .git)){
  git init
}

git add --all
# create commit if there's something to commit
$changes = git status --porcelain
if($changes){ git commit -m "Initial publish" }

# create repo and push (public)
gh repo create $repo --public --source=. --remote=origin --push

Write-Host "Repository created and pushed: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)" -ForegroundColor Green
