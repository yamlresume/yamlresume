# Miscellaneous Community Contributions

This directory contains valuable community contributions that extend YAML Resume
functionality.

## YAMLResume.psm1

[YAMLResume.psm1](./YAMLResume.psm1) is a PowerShell module that provides
convenient commands for creating and building resumes using Docker.

**Contributed by:** [@webJose](https://github.com/webJose)
([#64](https://github.com/yamlresume/yamlresume/issues/64))

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be
  installed and running.

### Usage

Import the module:

```powershell
Import-Module ./miscs/YAMLResume.psm1
```

#### Create a New YAML Resume File

```powershell
# Create with default name (my-resume.yml)
New-YamlResume

# Create with custom name
New-YamlResume custom.yml
```

#### Build a Resume

```powershell
# Build with defaults (my-resume.yml -> ./Latest)
Build-YamlResume

# Build with custom input and output
Build-YamlResume -YamlFile "custom.yml" -OutputPath "./2025-11-01"
```

> **Note:** All paths must be relative paths.
