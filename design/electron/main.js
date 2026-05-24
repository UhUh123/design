import { app, BrowserWindow, dialog, shell } from 'electron'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === 'development'

// Использовать "vpopus" вместо name из package.json ("vpopus-ui") для userData.
// Это влияет на ~/Library/Application Support/<name>/ и т.п.
app.setName('vpopus')

// === Paths ===

// В dev: __dirname = .../vpopus/frontend/electron → projectRoot два уровня выше.
// В prod (.app): backend/venv лежат в process.resourcesPath (см. electron-builder).
function getProjectRoot() {
  if (app.isPackaged) {
    return process.resourcesPath
  }
  return path.resolve(__dirname, '..', '..')
}

function getPythonPath(root) {
  if (process.platform === 'win32') {
    return path.join(root, '.venv', 'Scripts', 'python.exe')
  }
  return path.join(root, '.venv', 'bin', 'python')
}

const BACKEND_HOST = '127.0.0.1'
const BACKEND_PORT = 8000
const BACKEND_HEALTH_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/health`

// === Backend lifecycle ===

let backendProcess = null

function pingBackend() {
  return new Promise((resolve) => {
    const req = http.get(BACKEND_HEALTH_URL, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200)
      res.resume()
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function waitForBackend(timeoutMs = 30_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await pingBackend()) return true
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

async function startBackend(root) {
  // Если уже запущен (dev-сценарий: разработчик стартовал backend сам) — не дублируем.
  if (await pingBackend()) {
    console.log('[backend] уже запущен на', BACKEND_HEALTH_URL)
    return
  }

  const pythonPath = getPythonPath(root)
  if (!fs.existsSync(pythonPath)) {
    throw new Error(
      `Python не найден: ${pythonPath}\nСоздайте venv и установите зависимости:\n  cd ${root}\n  python3 -m venv .venv\n  .venv/bin/pip install -r requirements.txt`,
    )
  }

  // Логи backend в userData, чтобы можно было посмотреть если что-то упало.
  const userData = app.getPath('userData')
  fs.mkdirSync(userData, { recursive: true })
  const logPath = path.join(userData, 'backend.log')
  const logFd = fs.openSync(logPath, 'a')
  console.log('[backend] лог →', logPath)

  // Данные приложения (SQLite + ChromaDB) — в userData. В packaged .app
  // process.resourcesPath read-only, без этого backend упадёт на первом write.
  const dataDir = path.join(userData, 'data')
  fs.mkdirSync(dataDir, { recursive: true })
  fs.mkdirSync(path.join(dataDir, 'vectorstore'), { recursive: true })

  backendProcess = spawn(pythonPath, ['-m', 'backend.main'], {
    cwd: root,
    env: {
      ...process.env,
      APP_HOST: BACKEND_HOST,
      APP_PORT: String(BACKEND_PORT),
      DB_PATH: path.join(dataDir, 'conversations.db'),
      VECTOR_DB_PATH: path.join(dataDir, 'vectorstore'),
      PYTHONUNBUFFERED: '1',
    },
    stdio: ['ignore', logFd, logFd],
    detached: false,
  })

  backendProcess.on('exit', (code, signal) => {
    console.log(`[backend] exit code=${code} signal=${signal}`)
    backendProcess = null
  })

  const ok = await waitForBackend()
  if (!ok) {
    throw new Error(
      `Backend не ответил за 30 секунд. Лог:\n${logPath}`,
    )
  }
  console.log('[backend] готов')
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log('[backend] kill pid=', backendProcess.pid)
    backendProcess.kill('SIGTERM')
    // Force-kill через 3 секунды если SIGTERM не сработал.
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGKILL')
      }
    }, 3000)
  }
}

// === Window ===

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d1117',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

// === App lifecycle ===

app.whenReady().then(async () => {
  const root = getProjectRoot()
  try {
    await startBackend(root)
  } catch (e) {
    dialog.showErrorBox('vpopus: backend не запустился', String(e.message ?? e))
    app.quit()
    return
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', stopBackend)
app.on('quit', stopBackend)
