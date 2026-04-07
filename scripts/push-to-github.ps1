# Push project to GitHub (first push or update).
# Usage: .\scripts\push-to-github.ps1 [-Message "your message"]
# Requires: Git, GitHub auth (HTTPS token or SSH).

param(
    [string]$Message = "chore: sync with GitHub"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

$remoteUrl = "https://github.com/Jacque004/DevScope.git"

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

# Do not use "git remote get-url origin" here: it errors if origin is missing,
# and PowerShell treats git stderr as terminating when $ErrorActionPreference is Stop.
$remotes = @(git remote 2>$null)
if ($remotes -contains "origin") {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

git add -A
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Nothing to commit - pushing existing commits."
} else {
    git commit -m $Message
}

git push -u origin main
