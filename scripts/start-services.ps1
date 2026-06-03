param(
    [int]$StartupTimeoutSeconds = 120,
    [switch]$SkipWait,
    [switch]$CleanLogs
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "logs"
$pidDir = Join-Path $root ".service-pids"
$mavenUserHome = Join-Path $root ".maven-cache"

$services = @(
    @{
        Name = "config-server"
        Path = "configServer"
        Port = 8888
    },
    @{
        Name = "eureka"
        Path = "eureka"
        Port = 8761
    },
    @{
        Name = "user-service"
        Path = "UserService"
        Port = 8081
    },
    @{
        Name = "activity-service"
        Path = "ActivityService"
        Port = 8082
    },
    @{
        Name = "ai-service"
        Path = "AiService"
        Port = 8083
    },
    @{
        Name = "api-gateway"
        Path = "apiGateway"
        Port = 8080
    }
)

function Test-Port {
    param(
        [string]$HostName,
        [int]$Port
    )

    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $connect = $client.BeginConnect($HostName, $Port, $null, $null)
        if (-not $connect.AsyncWaitHandle.WaitOne(1000, $false)) {
            return $false
        }
        $client.EndConnect($connect)
        return $true
    }
    catch {
        return $false
    }
    finally {
        $client.Close()
    }
}

function Wait-ForPort {
    param(
        [string]$ServiceName,
        [int]$Port
    )

    $deadline = (Get-Date).AddSeconds($StartupTimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Port -HostName "localhost" -Port $Port) {
            Write-Host "Ready: $ServiceName is listening on port $Port"
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "Timed out waiting for $ServiceName on port $Port"
}

New-Item -ItemType Directory -Force -Path $logDir, $pidDir, $mavenUserHome | Out-Null

if ($CleanLogs) {
    Get-ChildItem -Path $logDir -Filter "*.log" -ErrorAction SilentlyContinue | Remove-Item -Force
}

foreach ($service in $services) {
    $serviceDir = Join-Path $root $service.Path
    $mvnw = Join-Path $serviceDir "mvnw.cmd"
    $outLog = Join-Path $logDir "$($service.Name).out.log"
    $errLog = Join-Path $logDir "$($service.Name).err.log"
    $pidFile = Join-Path $pidDir "$($service.Name).pid"

    if (-not (Test-Path $mvnw)) {
        throw "Missing Maven wrapper for $($service.Name): $mvnw"
    }

    if (Test-Port -HostName "localhost" -Port $service.Port) {
        Write-Host "Already running: $($service.Name) on port $($service.Port)"
        continue
    }

    Write-Host "Starting $($service.Name)..."

    $arguments = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command",
        "`$env:MAVEN_USER_HOME='$mavenUserHome'; & '$mvnw' spring-boot:run"
    )

    $process = Start-Process `
        -FilePath "powershell.exe" `
        -ArgumentList $arguments `
        -WorkingDirectory $serviceDir `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -PassThru `
        -WindowStyle Hidden

    Set-Content -Path $pidFile -Value $process.Id
    Write-Host "Started $($service.Name) with PID $($process.Id). Logs: $outLog"

    if (-not $SkipWait) {
        Wait-ForPort -ServiceName $service.Name -Port $service.Port
    }
}

Write-Host ""
Write-Host "All requested services have been started."
Write-Host "Gateway: http://localhost:8080"
Write-Host "Eureka:  http://localhost:8761"
Write-Host "Logs:    $logDir"
