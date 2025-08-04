import { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const ICONS_DIR = path.join(process.env.APP_ROOT, 'electron/icons/')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// 支持多个窗口
const wins: Map<string, BrowserWindow> = new Map()

let isMoving: boolean = false,
  startX: number = 0,
  startY: number = 0,
  tray: Tray

type WindowConfig = {
  name: string
  url?: string
  options?: any
}

function createWindow(data: WindowConfig) {
  const { name, url, options } = data as WindowConfig

  if (wins.has(name)) {
    if (url && url !== wins.get(name)?.webContents.getURL()) {
      console.log('reload', url)
      wins.get(name)?.loadURL(url)
    }
    wins.get(name)?.focus()
    return wins.get(name)
  }

  const win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    ...options,
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // console.log('electron-env', process.env)
  if (url) {
    win.loadURL(url)
    wins.set(name, win)
    return
  }

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  wins.set(name, win)
}

// 初始化托盘函数
function initTray() {
  let icons = {
    logo: nativeImage
      .createFromPath(path.join(ICONS_DIR, 'logo.png'))
      .resize({ width: 16, height: 16 }),
    show: nativeImage
      .createFromPath(path.join(ICONS_DIR, 'show.png'))
      .resize({ width: 16, height: 16 }),
    hide: nativeImage
      .createFromPath(path.join(ICONS_DIR, 'hide.png'))
      .resize({ width: 16, height: 16 }),
    exit: nativeImage
      .createFromPath(path.join(ICONS_DIR, 'exit.png'))
      .resize({ width: 16, height: 16 }),
  }
  // 创建托盘实例
  tray = new Tray(icons.logo)

  // 设置托盘提示文本（鼠标悬停时显示）
  tray.setToolTip('我的 Electron 应用')

  // 设置托盘标题（部分系统支持，如 macOS）
  tray.setTitle('应用运行中')

  // 创建托盘右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      icon: icons.show,
      label: '显示窗口',
      click: () => {
        BrowserWindow.getAllWindows().forEach((window) => {
          window.show()
        })
      },
    },
    {
      icon: icons.hide,
      label: '隐藏窗口',
      click: () => {
        BrowserWindow.getAllWindows().forEach((window) => {
          window.hide()
        })
      },
    },
    { type: 'separator' }, // 分隔线
    {
      label: '静音模式',
      type: 'checkbox',
      checked: false,
      click: (item) => {
        // 实现静音逻辑
        BrowserWindow.getAllWindows().forEach((window) => {
          window.webContents.setAudioMuted(item.checked)
        })
      },
    },
    { type: 'separator' },
    {
      icon: icons.exit,
      label: '退出应用',
      click: () => {
        tray.destroy() // 销毁托盘
        app.quit() // 退出应用
        wins.clear()
      },
    },
  ])

  // 设置托盘右键菜单
  tray.setContextMenu(contextMenu)
  // 托盘点击事件（双击显示/隐藏窗口）
  tray.on('double-click', () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      if (window.isVisible()) {
        window.hide()
      } else {
        window.show()
      }
    })
  })

  // 托盘右键菜单打开/关闭事件
  contextMenu.on('menu-will-show', () => {
    console.log('托盘菜单即将显示')
  })
  contextMenu.on('menu-will-close', () => {
    console.log('托盘菜单即将关闭')
  })
}

type WindowActionData = {
  name: string
  action:
    | 'minimize'
    | 'maximize'
    | 'unmaximize'
    | 'exit'
    | 'create'
    | 'mousedown'
    | 'mousemove'
    | 'mouseup'
  url?: string
  hide?: boolean
  deltaX?: number
  deltaY?: number
  options?: Electron.BrowserWindowConstructorOptions
}

// 窗口操作监听
ipcMain.on(
  'window-action',
  (event: Electron.IpcMainEvent, data: WindowActionData) => {
    console.log('window-action', event)
    const { name, action, url, hide, deltaX, deltaY, options } = data
    switch (action) {
      case 'mousedown':
        // 记录初始位置
        if (wins.has(name)) {
          ;[startX, startY] = wins.get(name)?.getPosition() || [0, 0]
          isMoving = true
        }
        break
      case 'mousemove':
        if (wins.has(name) && deltaX !== undefined && deltaY !== undefined) {
          // 计算新位置并移动窗口
          wins.get(name)?.setPosition(startX + deltaX, startY + deltaY)
        }

        break
      case 'mouseup':
        isMoving = false
        startX = startY = 0
        break
      case 'minimize':
        wins.get(name)?.minimize()
        break
      case 'maximize':
        wins.get(name)?.maximize()
        break
      case 'unmaximize':
        wins.get(name)?.unmaximize()
        break
      case 'exit':
        if (wins.has(name)) {
          // 主窗口的话就所有窗口都关闭或隐藏
          if (name === 'home') {
            BrowserWindow.getAllWindows().forEach((win) => {
              if (hide) {
                win.hide()
              } else {
                win.close()
                wins.clear()
              }
            })
          } else {
            if (hide) {
              wins.get(name)?.hide()
            } else {
              wins.get(name)?.close()
              wins.delete(name)
            }
          }
        }
        break
      case 'create':
        if (url) {
          createWindow({
            name,
            url,
            options: options || {},
          })
        }
        break
    }
  }
)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    wins.clear()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow({ name: 'home' })
  }
})

app.whenReady().then(() => {
  createWindow({ name: 'home' })
  initTray()
})
