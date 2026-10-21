const fs = require('fs')
const path = require('path')

/** Read a JSON file, returning `fallback` if it does not exist yet. */
function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

/** Write JSON atomically: write a temp file, then rename it over the real one. */
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temp = `${file}.tmp`
  fs.writeFileSync(temp, JSON.stringify(data, null, 2))
  fs.renameSync(temp, file)
}

module.exports = { readJson, writeJson }
