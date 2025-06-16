#!/bin/bash

# Extract changelog for a specific version from CHANGELOG.md
# Usage: ./extract-changelog.sh <version> [output_file]
# Example: ./extract-changelog.sh 0.4.1
# Example: ./extract-changelog.sh 0.4.1 release_notes.md

set -e

VERSION="$1"
OUTPUT_FILE="$2"

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version> [output_file]"
  echo "Example: $0 0.4.1"
  echo "Example: $0 0.4.1 release_notes.md"
  exit 1
fi

# Remove 'v' prefix if present
VERSION="${VERSION#v}"

# Check if CHANGELOG.md exists
if [ ! -f "CHANGELOG.md" ]; then
  echo "Error: CHANGELOG.md not found" >&2
  exit 1
fi

# Extract the changelog section for the specified version
extract_changelog() {
  awk -v version="$VERSION" '
  BEGIN {
    found=0
    content=""
    in_section=0
  }

  # Match version header like ## [0.4.1](...)
  /^## \[/ {
    if (found && in_section) {
      # We hit the next version, stop here
      exit
    }
    if ($0 ~ "\\[" version "\\]") {
      found=1
      in_section=1
      next
    }
  }

  # If we found our version and we are in the section
  found && in_section {
    # Skip empty lines at the beginning
    if (content == "" && /^$/) {
      next
    }

    # Add content
    if (content != "") {
      content = content "\n" $0
    } else {
      content = $0
    }
  }

  END {
    if (!found) {
      print "No changelog found for version " version > "/dev/stderr"
      exit 1
    }

    # Remove trailing empty lines
    gsub(/\n+$/, "", content)

    if (content == "") {
      print "No content found for version " version > "/dev/stderr"
      exit 1
    }

    print content
  }
  ' CHANGELOG.md
}

# Extract the changelog
CHANGELOG_CONTENT=$(extract_changelog)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  exit $EXIT_CODE
fi

# Output to file or stdout
if [ -n "$OUTPUT_FILE" ]; then
  echo "$CHANGELOG_CONTENT" > "$OUTPUT_FILE"
  echo "Changelog for version $VERSION written to $OUTPUT_FILE" >&2
else
  echo "$CHANGELOG_CONTENT"
fi
