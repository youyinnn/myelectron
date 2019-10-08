const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    Tray
} = require('electron')
const path = require('path')

// 保持对win对象的全局引用，否则会被垃圾回收
let win

function createWindow() {

    // app.setAppUserModelId('firstelectrondemo')

    // 获取当前设备屏幕的大小
    const {
        width,
        height
    } = require('electron').screen.getPrimaryDisplay().workAreaSize

    // 创建浏览器窗口
    win = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        // 窗口无边框
        // frame: false,
        title: 'hello',
        useContentSize: true,

        // 这俩要一起用
        transparent: true,
        opacity: 0.8,

        // 是否在任务栏中显示窗口
        // skipTaskbar: true,

        // 终极全屏模式 配合上无边框之后 就像游戏的全屏模式一样
        // kiosk: true,

    })

    // 加载html文件
    win.loadFile('index.html')

    // 打开开发者工具
    win.webContents.toggleDevTools()

    // 窗口关闭事件
    win.on('closed', () => {
        // 取消对win对象的引用，如果应用支持多窗口的话
        // 通常会把多个window对象存在一个数组里 然后删除相应的元素
        // 不设置null的话 win会是destoty状态
        win = null
    })

    // 托盘
    let tray = new Tray('diamond.png')
    const contextMenu = Menu.buildFromTemplate([
        {label: 'one', type: 'radio', click: function () {
            console.log('hello')
        }}
    ])
    tray.setToolTip('Hello')
    tray.setContextMenu(contextMenu)

    global.share = {
        win: win,
        // 如果tray不share的话 它就会莫名其妙地消失
        tray: tray
    }

    tray.on('double-click', () => {
        win.show()
    })

    // 应用菜单
    // Menu.setApplicationMenu(null)

    let isMac = false;

    const template = [
        {
            label: 'Menu1',
            submenu: [
                new MenuItem({
                    label: 'about',
                    click() {
                        // 这行不会打在chrome调试控制台上 因为这里的console是nodejs后台
                        console.log('about')
                    }
                }),
                { type: 'separator' },
                { role: 'about' },
                new MenuItem({
                    label: 'xixi',
                    type: 'checkbox',
                    click() {
                        console.log('check')
                    }
                }),
                new MenuItem({
                    label: 'haha',
                    type: 'radio',
                    click() {
                        console.log('radio')
                    }
                }),
            ]
        },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

}

// electron会在初始化之后准备 在app的ready事件之后就能够创建窗口了
// 部分api只能在这个之间之后才能使用
app.on('ready', createWindow)

// 全部窗口都关闭了的时候
app.on('window-all-closed', () => {
    // mac上大部分应用即使在关闭窗口之后都会保持激活
    if (process.platform !== 'darwin')
        app.quit()
})

app.on("activate", () => {
    // 在macOS上 单击dock图标且没有其他窗口打开的时候 重新创建一个窗口
    if (win === null) {
        createWindow()
    }
})

// 设置任务栏任务
app.setUserTasks([{
    program: process.execPath,
    arguments: '--new-window',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'New Window',
    description: "Create a new window"
}])

// 主进程和渲染进程之间通信
const {
    ipcMain
} = require('electron')
ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg)
    // 通过event的reply方法 回复异步信息
    setTimeout(() => {
        event.reply('asynchronous-reply', 'as-pong')
    }, 2000);
})
ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg)
    // 直接用event的returnValue值来回复消息
    event.returnValue = 's-pong'
})