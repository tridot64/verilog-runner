#code --install-extension verilog-runner.vsix

#downloading the icarus verilog package from breyer.org
$URL_iverilog = "https://bleyer.org/icarus/iverilog-0.9.7_setup.exe"
$URL = "https://github.com/tridot64/verilog-runner/releases/download/Beta_vsix/verilog-runner-0.0.1.vsix"
$path = Get-Location
mkdir $path/src_win_verilog_install
try {
    Invoke-WebRequest -Uri $URL_iverilog -OutFile $path/src_win_verilog_install/install.exe
    Invoke-WebRequest -Uri $URL -OutFile $path/src_win_verilog_install/verilog_run.vsix
}
catch {
    <#Do this if a terminating exception happens#>
    Write-Output "Error Occured Please run the script as administrator"
}

#Installing iverilog 0.9.7

.\src_win_verilog_install\install.exe

code --install-extension src_win_verilog_install/verilog_run.vsix




