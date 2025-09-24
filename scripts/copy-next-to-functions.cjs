#!/usr/bin/env node
// Copia a pasta .next necessária para SSR dentro de functions
// Estrutura esperada final: functions/.next

const { execSync } = require('node:child_process')
const { existsSync, rmSync, mkdirSync } = require('node:fs')
const { join } = require('node:path')

const root = process.cwd()
const srcDir = join(root, '.next')
const destDir = join(root, 'functions', '.next')

if (!existsSync(srcDir)) {
  console.error('.next build não encontrada. Execute npm run build antes.')
  process.exit(1)
}

if (existsSync(destDir)) {
  rmSync(destDir, { recursive: true, force: true })
}

// Usar robocopy no Windows para performance
try {
  if (process.platform === 'win32') {
    execSync(`robocopy "${srcDir}" "${destDir}" /E > NUL`)
  } else {
    execSync(`cp -R "${srcDir}" "${destDir}"`)
  }
  console.log('Copiado .next -> functions/.next')
} catch (e) {
  console.error('Falha ao copiar build Next:', e)
  process.exit(1)
}
