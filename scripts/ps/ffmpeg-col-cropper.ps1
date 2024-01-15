# Get the current working directory
$WorkingDirectory = Get-Location

# Prompt the user to enter the input file name (without the path)
$FileName = Read-Host "Enter the input file name (e.g., CoL2):"
$FileName = $FileName + ".mp4"
$StartTime = Read-Host "Enter the start time"
# If startTime is empty, set to 3.5
if ($StartTime -eq "") { $StartTime = 3.5 }
$EndTime = Read-Host "Enter the end time"

# Calculate the duration
$Duration = $EndTime - $StartTime

# Combine the working directory and the input file name to create the full path
$InputFilePath = Join-Path -Path $WorkingDirectory -ChildPath $FileName

# Check if the input file exists
if (Test-Path $InputFilePath -PathType Leaf) {
    # Extract the filename (without extension)
    $FileNameWithoutExtension = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    
    # Set the output file name
    $OutputFileName = "${FileNameWithoutExtension}_OUT.mp4"

    # Build and execute the FFmpeg command
    $FFmpegCommand = "ffmpeg -y -an -ss $StartTime -t $Duration -i `"$InputFilePath`" -vf `"`"scale=640:360`"`" -c:v libx264 -crf 25 -threads 16 -r 24 `"$OutputFileName`""
    Invoke-Expression $FFmpegCommand

    Write-Host "File conversion complete. Output file saved as $OutputFileName in the working directory."
} else {
    Write-Host "The input file does not exist in the working directory."
}