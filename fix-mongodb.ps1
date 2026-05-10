# This script enables replica set on MongoDB and restarts the service
$cfgPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"
$content = Get-Content $cfgPath -Raw
$content = $content -replace '#replication:', "replication:`n  replSetName: rs0"
Set-Content $cfgPath -Value $content
Write-Host "Config updated. Restarting MongoDB..."
Restart-Service MongoDB
Write-Host "MongoDB restarted with replica set enabled."
