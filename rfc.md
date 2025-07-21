# RFC: YAMLResume - A Standard Format for Resume Crafting

**RFC Number:** YAMLResume-001
**Title:** YAMLResume - A Standard Format for Resume Crafting
**Author:** YAMLResume Team
**Status:** Draft
**Created:** 2024
**Updated:** 2024

## Abstract

This RFC defines YAMLResume, a standardized YAML-based format for creating and exchanging resume data. The format provides a structured, machine-readable representation of professional resumes that can be rendered into various output formats including PDF, LaTeX, and other document formats. YAMLResume aims to standardize resume creation, enable interoperability between different resume tools, and provide a foundation for automated resume processing and analysis.

## 1. Introduction

### 1.1 Motivation

Resume creation and management is a critical aspect of professional development, yet current approaches suffer from several limitations:

- **Format Fragmentation**: Multiple proprietary formats limit interoperability
- **Manual Maintenance**: Updates require manual reformatting across different platforms
- **Limited Automation**: Difficulty in programmatic processing and analysis
- **Inconsistent Standards**: No universal format for resume data exchange

YAMLResume addresses these challenges by providing a standardized, human-readable format that can be processed by various tools and rendered into multiple output formats.

### 1.2 Design Goals

- **Simplicity**: Easy to read and write for humans
- **Extensibility**: Support for custom fields and sections
- **Validation**: Strong schema validation to ensure data integrity
- **Internationalization**: Support for multiple languages and locales
- **Rendering Flexibility**: Multiple output format support
- **Versioning**: Backward compatibility and version management

## 2. Format Overview

YAMLResume uses YAML (YAML Ain't Markup Language) as its base format, providing a clean, human-readable structure. The format consists of two main sections:

- **Content**: Contains all resume data and information
- **Layout**: Contains presentation and formatting instructions

## 3. Document Structure

### 3.1 Root Structure

```yaml
content:
  # All resume content sections
layout:
  # Layout and presentation configuration
```

### 3.2 Required Sections

Only two sections are mandatory in a YAMLResume document:

1. **`content.basics`**: Personal and contact information
2. **`content.education`**: Educational background

All other sections are optional.

## 4. Content Sections

### 4.1 Basics Section

**Required:** Yes
**Type:** Object

Contains core personal and contact information.

#### Required Fields

- **`name`** (string, 2-128 characters): Full personal name
  - Examples: "Andy Dufresne", "Xiao Hanyu", "Jane Smith"

#### Optional Fields

- **`email`** (string): Valid email address
  - Format: Standard email format with domain validation
  - Examples: "hi@ppresume.com", "first.last@company.org"
  - Validation: Must include valid domain with TLD

- **`headline`** (string, 8-128 characters): Professional headline
  - Examples: "Full-stack software engineer", "Data Scientist with a passion for Machine Learning"

- **`phone`** (string): Phone number
  - Format: Supports international formats with country codes, parentheses, spaces, and hyphens
  - Examples: "555-123-4567", "+44 20 7946 0958", "(555) 123-4567"
  - Validation: Regex pattern `/^[+]?[(]?[0-9\s-]{1,15}[)]?[0-9\s-]{1,15}$/`

- **`summary`** (string, 16-1024 characters): Professional summary
  - Supports limited markdown syntax (bold, italic, lists, links)
  - Examples: "Experienced software engineer with 5+ years in full-stack development."

- **`url`** (string, max 256 characters): Personal website or portfolio URL
  - Format: Valid URI format
  - Examples: "https://yamlresume.dev", "https://ppresume.com"

#### Example

```yaml
content:
  basics:
    name: "Andy Dufresne"
    email: "hi@ppresume.com"
    headline: "Headed for the Pacific"
    phone: "(213) 555-9876"
    summary: |
      - Computer Science major with strong foundation in data structures, algorithms, and software development
      - Pixel perfect full stack web developer, specialised in creating high-quality, visually appealing websites
    url: "https://ppresume.com"
```

### 4.2 Education Section

**Required:** Yes
**Type:** Array of objects

Contains educational background and academic achievements.

#### Required Fields

- **`area`** (string, 2-64 characters): Field of study or major
  - Examples: "Computer Science", "Business Administration", "Engineering"

- **`institution`** (string, 2-128 characters): Educational institution name
  - Examples: "University of California, Los Angeles", "Harvard University"

- **`degree`** (enum): Degree type from predefined options
  - Options: "Middle School", "High School", "Diploma", "Associate", "Bachelor", "Master", "Doctor"

- **`startDate`** (string, 4-32 characters): Start date of education
  - Format: Must be parseable by `Date.parse()`
  - Examples: "2020-01-01", "Jul 2020", "July 3, 2020"

#### Optional Fields

- **`endDate`** (string, 4-32 characters): End date of education
  - Leave empty to indicate "Present"
  - Format: Must be parseable by `Date.parse()`

- **`score`** (string, 2-32 characters): GPA or academic score
  - Examples: "3.8", "3.8/4.0", "A+", "95%", "First Class Honours"

- **`courses`** (array of strings): Relevant courses taken
  - Each course: 2-128 characters
  - Examples: ["Data Structures", "Algorithms", "Database Systems"]

- **`summary`** (string, 16-1024 characters): Description of accomplishments
  - Supports limited markdown syntax

- **`url`** (string, max 256 characters): Institution or degree URL
  - Format: Valid URI format

#### Example

```yaml
content:
  education:
    - institution: "University of Southern California"
      url: "https://www.cs.usc.edu/"
      degree: "Bachelor"
      area: "Computer Engineering and Computer Science"
      score: "3.8"
      startDate: "Sep 1, 2016"
      endDate: "Jul 1, 2020"
      courses:
        - "Discrete Methods in Computer Science"
        - "Programming Language Concepts"
        - "Data Structures and Object-Oriented Design"
      summary: |
        - Developed proficiency in programming languages such as Java, C++, and Python
        - Gained hands-on experience in software development through various projects
```

### 4.3 Work Section

**Required:** No
**Type:** Array of objects

Contains professional work experience and employment history.

#### Required Fields

- **`name`** (string, 2-128 characters): Company or organization name
- **`position`** (string, 2-64 characters): Job title or position
- **`startDate`** (string, 4-32 characters): Employment start date
- **`summary`** (string, 16-1024 characters): Job responsibilities and achievements

#### Optional Fields

- **`endDate`** (string, 4-32 characters): Employment end date (empty = "Present")
- **`url`** (string, max 256 characters): Company website URL
- **`keywords`** (array of strings): Technologies or skills used
  - Each keyword: 1-32 characters

#### Example

```yaml
content:
  work:
    - name: "PPResume"
      url: "https://ppresume.com"
      startDate: "Dec 1, 2022"
      endDate:  # Present
      position: "Senior Software Engineer"
      summary: |
        - Developed and implemented efficient and scalable code, ensuring high-quality and maintainable web applications
        - Collaborated with cross-functional teams to gather project requirements and translate them into technical solutions
      keywords:
        - "Scalability"
        - "Growth"
        - "Quality"
        - "Mentorship"
```

### 4.4 Skills Section

**Required:** No
**Type:** Array of objects

Contains technical and professional skills with proficiency levels.

#### Required Fields

- **`name`** (string, 2-128 characters): Skill name
- **`level`** (enum): Proficiency level from predefined options
  - Options: "Novice", "Beginner", "Intermediate", "Advanced", "Expert", "Master"

#### Optional Fields

- **`keywords`** (array of strings): Related technologies or sub-skills
  - Each keyword: 1-32 characters

#### Example

```yaml
content:
  skills:
    - name: "Web Development"
      level: "Expert"
      keywords:
        - "Python"
        - "Ruby"
        - "CSS"
        - "React"
        - "JavaScript"
    - name: "DevOps"
      level: "Intermediate"
      keywords:
        - "Python"
        - "Kubernetes"
        - "Docker"
        - "Shell"
        - "Ansible"
```

### 4.5 Languages Section

**Required:** No
**Type:** Array of objects

Contains language proficiencies and fluency levels.

#### Required Fields

- **`language`** (enum): Language from predefined options
  - Options: 80+ languages including "English", "Chinese", "Spanish", "French", "German", etc.
- **`fluency`** (enum): Fluency level from predefined options
  - Options: "Elementary Proficiency", "Limited Working Proficiency", "Minimum Professional Proficiency", "Full Professional Proficiency", "Native or Bilingual Proficiency"

#### Optional Fields

- **`keywords`** (array of strings): Additional language skills or certifications
  - Each keyword: 1-32 characters

#### Example

```yaml
content:
  languages:
    - language: "English"
      fluency: "Native or Bilingual Proficiency"
      keywords:
        - "TOEFL 110"
        - "IELTS 7.5"
    - language: "Chinese"
      fluency: "Elementary Proficiency"
      keywords: []
```

### 4.6 Projects Section

**Required:** No
**Type:** Array of objects

Contains personal and professional projects.

#### Required Fields

- **`name`** (string, 2-128 characters): Project name
- **`startDate`** (string, 4-32 characters): Project start date
- **`summary`** (string, 16-1024 characters): Project description and achievements

#### Optional Fields

- **`description`** (string, 4-128 characters): Detailed project description
- **`endDate`** (string, 4-32 characters): Project end date
- **`url`** (string, max 256 characters): Project URL (repository, demo, etc.)
- **`keywords`** (array of strings): Technologies or concepts used

#### Example

```yaml
content:
  projects:
    - name: "EduWeb"
      url: "https://www.eduweb.xyz/"
      description: "A web-based educational platform for interactive learning"
      startDate: "Sep 2016"
      endDate: "Dec 2016"
      summary: |
        - Designed to enhance online learning experiences
        - Facilitates students' engagement and collaboration through interactive features
      keywords:
        - "Education"
        - "Online Learning"
        - "HCI"
```

### 4.7 Awards Section

**Required:** No
**Type:** Array of objects

Contains awards, honors, and recognitions.

#### Required Fields

- **`title`** (string, 2-128 characters): Award title
- **`awarder`** (string, 2-128 characters): Organization that presented the award

#### Optional Fields

- **`date`** (string, 4-32 characters): Award date
- **`summary`** (string, 16-1024 characters): Award description

#### Example

```yaml
content:
  awards:
    - title: "Dean's List"
      awarder: "University of Southern California"
      date: "Oct 2016"
      summary: |
        Awarded to students who achieve a high academic standing by maintaining a specified grade point average (GPA) during a semester.
```

### 4.8 Certificates Section

**Required:** No
**Type:** Array of objects

Contains professional certifications and credentials.

#### Required Fields

- **`name`** (string, 2-128 characters): Certificate name
- **`issuer`** (string, 2-128 characters): Issuing organization

#### Optional Fields

- **`date`** (string, 4-32 characters): Certification date
- **`url`** (string, max 256 characters): Verification URL

#### Example

```yaml
content:
  certificates:
    - name: "AWS Certified Developer - Associate"
      url: "https://aws.amazon.com/certification/"
      issuer: "AWS"
      date: "Mar 2021"
```

### 4.9 Publications Section

**Required:** No
**Type:** Array of objects

Contains academic and professional publications.

#### Required Fields

- **`name`** (string, 2-128 characters): Publication title
- **`publisher`** (string, 2-128 characters): Publishing organization

#### Optional Fields

- **`releaseDate`** (string, 4-32 characters): Publication date
- **`summary`** (string, 16-1024 characters): Publication abstract
- **`url`** (string, max 256 characters): Publication URL (DOI, etc.)

#### Example

```yaml
content:
  publications:
    - publisher: "ACM Transactions on Interactive Intelligent Systems"
      url: "https://dl.acm.org/journal/tiis"
      name: "Enhancing Human-Computer Interaction through Augmented Reality"
      releaseDate: "Dec 2017"
      summary: |
        - Explores the potential of augmented reality (AR) in improving interaction between humans and computers
        - Highlights benefits of AR in various areas such as gaming, education, healthcare, and design
```

### 4.10 References Section

**Required:** No
**Type:** Array of objects

Contains professional references and recommendations.

#### Required Fields

- **`name`** (string, 2-128 characters): Reference name
- **`summary`** (string, 16-1024 characters): Reference description

#### Optional Fields

- **`email`** (string): Reference email address
- **`phone`** (string): Reference phone number
- **`relationship`** (string, 2-128 characters): Professional relationship

#### Example

```yaml
content:
  references:
    - name: "Dr. Amanda Reynolds"
      phone: "(555) 123-4567"
      relationship: "Computer Science Professor"
      email: "amanda.reynolds@usc.edu"
      summary: |
        Andy Dufresne shows exceptional problem-solving skills and a solid understanding of programming concepts, he would bring immense value to any team or organization he becomes a part of.
```

### 4.11 Volunteer Section

**Required:** No
**Type:** Array of objects

Contains volunteer work and community service.

#### Required Fields

- **`organization`** (string, 2-128 characters): Organization name
- **`position`** (string, 2-64 characters): Volunteer role
- **`startDate`** (string, 4-32 characters): Start date
- **`summary`** (string, 16-1024 characters): Responsibilities and achievements

#### Optional Fields

- **`endDate`** (string, 4-32 characters): End date
- **`url`** (string, max 256 characters): Organization URL

#### Example

```yaml
content:
  volunteer:
    - organization: "USC Computer Science and Engineering Society"
      url: "https://www.usccsesociety.org/"
      position: "Tech Mentor"
      startDate: "Sep 2015"
      endDate: "Jul 2023"
      summary: |
        - Volunteered as a Tech Mentor at USC Computer Science and Engineering Society
        - Provided guidance and assistance to fellow students in their technical projects and coursework
```

### 4.12 Interests Section

**Required:** No
**Type:** Array of objects

Contains personal interests and hobbies.

#### Required Fields

- **`name`** (string, 2-128 characters): Interest category name

#### Optional Fields

- **`keywords`** (array of strings): Related activities or sub-interests
  - Each keyword: 1-32 characters

#### Example

```yaml
content:
  interests:
    - name: "Sports"
      keywords:
        - "Soccer"
        - "Swimming"
        - "Bicycling"
        - "Hiking"
    - name: "Music"
      keywords:
        - "Piano"
        - "Guitar"
```

### 4.13 Location Section

**Required:** No
**Type:** Object

Contains geographical and address information.

#### Required Fields

- **`city`** (string, 2-64 characters): City name

#### Optional Fields

- **`address`** (string, 4-256 characters): Full address
- **`region`** (string, 2-64 characters): State, province, or region
- **`country`** (enum): Country from predefined options (200+ countries)
- **`postalCode`** (string, 2-16 characters): Postal or ZIP code

#### Example

```yaml
content:
  location:
    address: "123 Main Street"
    city: "Sacramento"
    region: "California"
    country: "United States"
    postalCode: "95814"
```

### 4.14 Profiles Section

**Required:** No
**Type:** Array of objects

Contains online profiles and social media presence.

#### Required Fields

- **`network`** (enum): Social network from predefined options
  - Options: "GitHub", "LinkedIn", "Twitter", "Facebook", "Instagram", etc.
- **`username`** (string, 2-64 characters): Username or handle

#### Optional Fields

- **`url`** (string, max 256 characters): Profile URL

#### Example

```yaml
content:
  profiles:
    - network: "Line"
      url: "https://line.com/PPResumeX"
      username: "PPResumeX"
    - network: "Twitter"
      url: "https://twitter.com/PPResumeX"
      username: "PPResumeX"
```

## 5. Layout Section

The layout section controls the presentation and formatting of the resume.

### 5.1 Template

**Type:** Enum
**Options:** "moderncv-banking", "moderncv-casual", "moderncv-classic"

### 5.2 Locale

**Type:** Object

#### Fields

- **`language`** (enum): Display language
  - Options: "en", "zh-hans", "zh-hant-hk", "zh-hant-tw", "es"

### 5.3 Margins

**Type:** Object

#### Fields

- **`top`** (string): Top margin (e.g., "2.5cm", "1in", "72pt")
- **`bottom`** (string): Bottom margin
- **`left`** (string): Left margin
- **`right`** (string): Right margin

### 5.4 Typography

**Type:** Object

#### Fields

- **`fontSize`** (enum): Font size
  - Options: "10pt", "11pt", "12pt"

### 5.5 Page

**Type:** Object

#### Fields

- **`showPageNumbers`** (boolean): Whether to show page numbers

### 5.6 Sections

**Type:** Object

#### Fields

- **`aliases`** (object): Custom section name aliases
- **`order`** (array): Custom section ordering

### 5.7 LaTeX

**Type:** Object

#### Fields

- **`fontspec.numbers`** (enum): Number style
  - Options: "Lining", "OldStyle", "Auto"

#### Example

```yaml
layout:
  locale:
    language: "en"
  margins:
    top: "2.5cm"
    left: "1.5cm"
    right: "1.5cm"
    bottom: "2.5cm"
  page:
    showPageNumbers: true
  template: "moderncv-banking"
  typography:
    fontSize: "11pt"
```

## 6. Validation Rules

### 6.1 String Length Constraints

- **Names**: 2-128 characters
- **Headlines**: 8-128 characters
- **Areas**: 2-64 characters
- **Positions**: 2-64 characters
- **Institutions**: 2-128 characters
- **Organizations**: 2-128 characters
- **URLs**: Maximum 256 characters
- **Summaries**: 16-1024 characters
- **Keywords**: 1-32 characters each
- **Dates**: 4-32 characters
- **Scores**: 2-32 characters
- **Addresses**: 4-256 characters
- **Cities**: 2-64 characters
- **Regions**: 2-64 characters
- **Postal codes**: 2-16 characters
- **Usernames**: 2-64 characters

### 6.2 Format Validation

- **Email**: Standard email format with domain validation
- **Phone**: International format with regex validation
- **URL**: Valid URI format
- **Date**: Must be parseable by `Date.parse()`

### 6.3 Enum Constraints

All enum fields must use predefined values from the specification.

## 7. Markdown Support

The following fields support limited markdown syntax:

- **Bold**: `**text**`
- **Italic**: `*text*`
- **Lists**: Ordered and unordered lists with nesting
- **Links**: `[text](url)`

## 8. Internationalization

### 8.1 Supported Languages

- English (en)
- Simplified Chinese (zh-hans)
- Traditional Chinese - Hong Kong (zh-hant-hk)
- Traditional Chinese - Taiwan (zh-hant-tw)
- Spanish (es)

### 8.2 Localization Features

- Translated section names
- Translated option values (degrees, fluency levels, etc.)
- Locale-specific formatting
- Country name translations

## 9. Versioning

### 9.1 Version Format

Versions follow semantic versioning (SemVer): `MAJOR.MINOR.PATCH`

### 9.2 Current Version

- **Schema Version**: 0.5.1
- **Schema ID**: https://yamlresume.dev/schema.json

## 10. Implementation Notes

### 10.1 Schema Validation

The format includes a comprehensive JSON Schema for validation:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://yamlresume.dev/schema.json"
}
```

### 10.2 Tooling Support

- **CLI Tools**: Command-line interface for validation and rendering
- **Editor Support**: YAML language server with schema validation
- **Rendering Engines**: LaTeX/PDF, HTML, and other format support

### 10.3 Extensibility

The format supports custom fields and sections through the flexible YAML structure while maintaining core validation requirements.

## 11. Security Considerations

### 11.1 Data Privacy

- Resume data may contain sensitive personal information
- Implementers should consider data encryption and secure storage
- URL validation prevents potential security issues

### 11.2 Input Validation

- Strict schema validation prevents injection attacks
- String length limits prevent resource exhaustion
- Enum constraints prevent invalid data

## 12. Examples

### 12.1 Minimal Resume

```yaml
content:
  basics:
    name: "John Doe"
  education:
    - institution: "University of Example"
      degree: "Bachelor"
      area: "Computer Science"
      startDate: "2018"
      endDate: "2022"
```

### 12.2 Complete Resume

See the attached `software-engineer.yml` example for a comprehensive resume.

## 13. References

- [YAML Specification](https://yaml.org/spec/)
- [JSON Schema](https://json-schema.org/)
- [RFC 5322 - Email Format](https://tools.ietf.org/html/rfc5322)
- [RFC 3986 - URI Format](https://tools.ietf.org/html/rfc3986)

## 14. Acknowledgments

This specification builds upon existing resume formats and standards, incorporating best practices from the professional community and feedback from implementers and users.

---

**Note:** This RFC is a living document and may be updated based on community feedback and evolving requirements. Implementers are encouraged to provide feedback and suggestions for improvements.
