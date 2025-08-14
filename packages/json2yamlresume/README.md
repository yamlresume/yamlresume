# json2yamlresume

[![npm version](https://img.shields.io/npm/v/json2yamlresume.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/json2yamlresume)
[![Node.js Version](https://img.shields.io/node/v/json2yamlresume.svg?style=flat-square&logo=node.js&color=339933)](https://nodejs.org/)

A command-line tool to convert [JSON Resume](https://jsonresume.org/) to [YAMLResume](https://yamlresume.dev/) format.

## Features

- **Format Conversion**: Seamlessly convert JSON Resume to YAMLResume format
- **Structure Transformation**: 
  - Moves `basics.location` to top-level `location` object
  - Moves `basics.profiles` to top-level `profiles` array
  - Renames `education[].studyType` to `degree`
  - Merges `highlights` arrays into `summary` fields as markdown unordered lists
- **CLI Interface**: Simple command-line interface for easy conversion
- **Validation**: Built on top of YAMLResume's robust schema validation

## Installation

```bash
npm install -g json2yamlresume
```

## Usage

### Convert a JSON Resume to YAMLResume

```bash
json2yamlresume convert input.json output.yaml
```

### Show help

```bash
json2yamlresume help
# or
json2yamlresume -h
```

### Show version

```bash
json2yamlresume --version
# or  
json2yamlresume -V
```

## Example

### Input (JSON Resume)

```json
{
  "basics": {
    "name": "John Doe",
    "label": "Software Engineer",
    "email": "john@example.com",
    "location": {
      "city": "San Francisco",
      "countryCode": "US"
    },
    "profiles": [
      {
        "network": "GitHub",
        "username": "johndoe",
        "url": "https://github.com/johndoe"
      }
    ]
  },
  "work": [
    {
      "name": "Tech Corp",
      "position": "Senior Developer", 
      "startDate": "2020-01",
      "summary": "Led development of web applications.",
      "highlights": [
        "Increased performance by 40%",
        "Mentored 5 junior developers"
      ]
    }
  ],
  "education": [
    {
      "institution": "University of California",
      "area": "Computer Science",
      "studyType": "Bachelor of Science",
      "startDate": "2018"
    }
  ]
}
```

### Output (YAMLResume)

```yaml
content:
  basics:
    name: John Doe
    email: john@example.com
    headline: Software Engineer
    phone: null
    summary: null
    url: null
  education:
    - area: Computer Science
      institution: University of California
      degree: Bachelor of Science  # studyType -> degree
      startDate: "2018"
      courses: null
      endDate: null
      summary: null
      score: null
      url: null
  location:  # moved from basics.location
    address: null
    city: San Francisco
    country: US
    postalCode: null
    region: null
  profiles:  # moved from basics.profiles
    - network: GitHub
      username: johndoe
      url: https://github.com/johndoe
  work:
    - name: Tech Corp
      position: Senior Developer
      startDate: 2020-01
      endDate: null
      summary: |-  # highlights merged into summary
        Led development of web applications.

        - Increased performance by 40%
        - Mentored 5 junior developers
      url: null
```

## Conversion Rules

### 1. Location and Profiles Movement

- `basics.location` → top-level `location`
- `basics.profiles` → top-level `profiles`

### 2. Education Field Mapping

- `education[].studyType` → `education[].degree`

### 3. Highlights Integration

The converter merges `highlights` arrays into `summary` fields as markdown unordered lists for these sections:
- `work[]`
- `volunteer[]` 
- `projects[]`

**Example:**
```json
{
  "summary": "Led development team.",
  "highlights": ["Increased performance", "Mentored developers"]
}
```

Becomes:
```yaml
summary: |-
  Led development team.

  - Increased performance
  - Mentored developers
```

## Supported JSON Resume Sections

The converter supports all standard JSON Resume sections:
- ✅ `basics` (with location/profiles extraction)
- ✅ `work` (with highlights merging)
- ✅ `volunteer` (with highlights merging)
- ✅ `education` (with studyType → degree mapping)
- ✅ `awards`
- ✅ `certificates`
- ✅ `publications`
- ✅ `skills`
- ✅ `languages`
- ✅ `interests`
- ✅ `references`
- ✅ `projects` (with highlights merging)

## Related Projects

- [YAMLResume](https://yamlresume.dev/) - Resume as Code in YAML
- [JSON Resume](https://jsonresume.org/) - The open source initiative to create a JSON-based standard for resumes

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this tool helpful, consider supporting the YAMLResume project:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)