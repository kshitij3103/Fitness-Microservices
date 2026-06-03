$ports = @(8761,8888,8080,8081,8082,8083,5173)

foreach ($port in $ports) {

    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

    if ($conn) {

        $processIds = $conn |
                Select-Object -ExpandProperty OwningProcess -Unique

        foreach ($procId in $processIds) {

            Write-Host "Stopping process on port $port (PID $procId)..."

            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
    else {
        Write-Host "Nothing running on port $port"
    }
}

Write-Host "All done."