# Scripts

This directory contains utility scripts for the yamlresume project.

## extract-changelog.sh

Extracts changelog entries for a specific version from `CHANGELOG.md`.

### Usage

```bash
# Extract to stdout
./scripts/extract-changelog.sh <version>

# Extract to file
./scripts/extract-changelog.sh <version> <output_file>
```

### Examples

```bash
# Extract changelog for version 0.4.1 to stdout
./scripts/extract-changelog.sh 0.4.1

# Extract changelog for version 0.4.1 to a file
./scripts/extract-changelog.sh 0.4.1 release_notes.md

# Works with 'v' prefix too
./scripts/extract-changelog.sh v0.4.1
```

### Features

- ✅ Handles version tags with or without 'v' prefix
- ✅ Extracts content between version headers
- ✅ Proper error handling for missing versions
- ✅ Can output to stdout or file
- ✅ Removes trailing empty lines
- ✅ Used in GitHub Actions for automated releases

### Exit Codes

- `0`: Success
- `1`: Version not found or no content found
- `1`: CHANGELOG.md file not found

### Integration

This script is used in the GitHub Actions workflow
(`.github/workflows/publish.yml`) to automatically extract release notes when
creating GitHub releases.
