module.exports.readVersion = (contents) => {
  const version = contents.match(/version:\s*['"]([0-9.]+)['"]/)
  return version ? version[1] : undefined
}

module.exports.writeVersion = (contents, version) => contents.replace(
  /version:\s*['"]([0-9.]+)['"]/,
  `version: '${version}'`
)
