import path from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'prisma/config'

// Manually load .env file if it exists
function loadEnvFile() {
  const envPaths = ['.env.local', '.env']
  
  for (const envPath of envPaths) {
    try {
      const fullPath = path.resolve(process.cwd(), envPath)
      const content = readFileSync(fullPath, 'utf-8')
      const lines = content.split('\n')
      
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex === -1) continue
        
        const key = trimmed.substring(0, eqIndex).trim()
        let value = trimmed.substring(eqIndex + 1).trim()
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
      console.log(`[prisma.config] Loaded env from ${envPath}`)
      break // Stop after first successful load
    } catch (error) {
      // File doesn't exist, continue to next
    }
  }
}

// Load environment variables
loadEnvFile()

// Get database URL
const databaseUrl = 
  process.env.MS_PRISMA_DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.DATABASE_URL

// Provide a helpful error message
if (!databaseUrl) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: DATABASE_URL environment variable is not set')
  console.error('\x1b[33m%s\x1b[0m', '\nPlease create a .env file with one of:')
  console.error('  MS_PRISMA_DATABASE_URL="postgresql://..."')
  console.error('  DATABASE_URL="postgresql://..."')
  console.error('\nExample:')
  console.error('  echo \'DATABASE_URL="postgresql://user:pass@localhost:5432/db"\' > .env\n')
  
  // For development, you can uncomment this to use SQLite as fallback
  // console.log('Using SQLite as fallback for development...')
  // process.env.DATABASE_URL = 'file:./dev.db'
}

// Set DATABASE_URL for Prisma CLI
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  // Only set datasource if URL exists
  ...(databaseUrl && {
    datasource: {
      url: databaseUrl,
    },
  }),
})