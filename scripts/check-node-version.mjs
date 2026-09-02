import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const REQUIRED_NODE_VERSION = '>=22.0.0'
const ROOT = process.cwd()
const manifestPaths = ['package.json']

function collectPackageManifests(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (
      !entry.isDirectory() ||
      ['dist', 'docs', 'node_modules'].includes(entry.name)
    ) {
      continue
    }

    const entryPath = path.join(directory, entry.name)
    const manifestPath = path.join(entryPath, 'package.json')

    if (fs.existsSync(manifestPath)) {
      manifestPaths.push(path.relative(ROOT, manifestPath))
    }

    collectPackageManifests(entryPath)
  }
}

collectPackageManifests(path.join(ROOT, 'packages'))

const failures = []
for (const manifestPath of [...new Set(manifestPaths)].sort()) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.engines?.node !== REQUIRED_NODE_VERSION) {
    failures.push(
      `${manifestPath}: expected engines.node to be ${REQUIRED_NODE_VERSION}, ` +
        `received ${manifest.engines?.node ?? 'undefined'}`
    )
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(
  `Validated Node.js ${REQUIRED_NODE_VERSION} in ${new Set(manifestPaths).size} first-party manifests.`
)
