import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const dashboardRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const nodeModules = path.join(dashboardRoot, 'node_modules')
const require = createRequire(path.join(dashboardRoot, 'package.json'))

const pkg = JSON.parse(fs.readFileSync(path.join(dashboardRoot, 'package.json'), 'utf8'))
const deps = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {})
]

fs.mkdirSync(nodeModules, { recursive: true })

for (const dep of deps) {
  if (dep.startsWith('@odyssey/')) continue

  const linkPath = path.join(nodeModules, dep)
  if (fs.existsSync(linkPath)) continue

  let packageDir
  try {
    packageDir = path.dirname(require.resolve(`${dep}/package.json`))
  } catch {
    console.warn(`[link-deps] skip ${dep}: not resolvable`)
    continue
  }

  fs.mkdirSync(path.dirname(linkPath), { recursive: true })
  fs.symlinkSync(packageDir, linkPath, 'dir')
  console.log(`[link-deps] ${dep} -> ${packageDir}`)
}
