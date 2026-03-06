<#
.SYNOPSIS
    PowerShell module for YAML Resume operations (build and new).
.DESCRIPTION
    Provides functions to build a résumé from a YAML file and to generate a new YAML résumé file using Docker and YAML Resume CLI.
#>

function New-YamlResume {
    <#
    .SYNOPSIS
        Generates a new YAML résumé file using YAML Resume CLI via Docker.
    .PARAMETER YamlFile
        The relative path for the new YAML file to create. Defaults to "my-resume.yml".
    .EXAMPLE
        New-YamlResume -YamlFile custom.yml
    #>
    param(
        [Parameter(Position = 0)]
        [string]$YamlFile = "my-resume.yml"
    )

    try {
        Test-RelativePath $YamlFile 'YamlFile'
    }
    catch {
        Write-Error $_
        return
    }

    $absoluteOutputPath = Get-Location | Get-AbsoluteOutputPath

    Write-Verbose "About to execute: docker run --rm -v `"$($absoluteOutputPath):/home/yamlresume`" yamlresume/yamlresume new $YamlFile"
    docker run --rm -v "$($absoluteOutputPath):/home/yamlresume" yamlresume/yamlresume new $YamlFile
}

function Build-YamlResume {
    <#
    .SYNOPSIS
        Builds a résumé from a specified YAML file using YAML Resume CLI via Docker.
    .PARAMETER YamlFile
        The relative path to the YAML file to process. Defaults to "my-resume.yml".
    .PARAMETER OutputPath
        The output directory where the built résumé will be saved. Defaults to "./Latest".
    .EXAMPLE
        Build-YamlResume -YamlFile "custom.yml" -OutputPath "./2025-11-01"
    #>
    param(
        [Parameter(Position = 0)]
        [string]$YamlFile = "my-resume.yml",
        [Parameter(Position = 1)]
        [string]$OutputPath = "./Latest"
    )
    try {
        Test-RelativePath $YamlFile 'YamlFile'
        Test-RelativePath $OutputPath 'OutputPath'
    }
    catch {
        Write-Error $_
        return
    }

    $absoluteOutputPath = Get-AbsoluteOutputPath $OutputPath

    if (Test-Path $absoluteOutputPath) {
        Get-ChildItem -Path $absoluteOutputPath | Remove-Item -Recurse -Force
    }

    Copy-Item -Path $YamlFile -Destination $absoluteOutputPath -Force
    $YamlFile = $YamlFile -replace '\\', '/'
    Write-Verbose "About to execute: docker run --rm -v `"$($absoluteOutputPath):/home/yamlresume`" yamlresume/yamlresume build $YamlFile"
    docker run --rm -v "$($absoluteOutputPath):/home/yamlresume" yamlresume/yamlresume build $YamlFile
}

# Private helper: checks if a path is relative and throws if not
function Test-RelativePath {
    param([string]$Path, [string]$ParamName)
    if ([System.IO.Path]::IsPathRooted($Path)) {
        throw "$ParamName must be a relative path."
    }
}

# Private helper: resolves and normalizes output path
function Get-AbsoluteOutputPath {
    param([Parameter(ValueFromPipeline)][string]$OutputPath)
    $absoluteOutputPath = (Resolve-Path -Path $OutputPath -ErrorAction SilentlyContinue).Path
    if (-not $absoluteOutputPath) {
        $absoluteOutputPath = (New-Item -Path $OutputPath -ItemType Directory -Force).FullName
    }
    return $absoluteOutputPath -replace '\\', '/'
}

Export-ModuleMember -Function New-YamlResume, Build-YamlResume
