console.log('Load render.js')
const $ = require('jquery')
const win = require('electron').remote.getGlobal('share').win
const app = require('electron').remote.app

let progress = 0;
$('#processbar').click(function () {
    if (progress === 0) {
        progress = 0.5
    } else {
        progress = 0
    }
    win.setProgressBar(progress)
})

let flash = false
$('#flash').click(function () {
    if (flash) {
        flash = false
    } else {
        flash = true
    }
    // win.once('focus', () => win.flashFrame(false))
    win.flashFrame(flash)
})

const { ipcRenderer } = require('electron')

$('#asmessage').click(() => {
    // 异步信息 直接发送
    ipcRenderer.send('asynchronous-message','as-ping')
})

// 监听异步信息的响应
ipcRenderer.on('asynchronous-reply', (event, arg) => {
    // pong
    console.log(arg)
})

$('#smessage').click(() => {
    // 同步信息 发送之后等待响应
    console.log(ipcRenderer.sendSync('synchronous-message','s-ping'))
})

$('#exit').click(() => {
    app.exit(0)
})

$('#relaunch').click(() => {
    app.relaunch()
    app.exit(0)
})

$('#showemoji').click(() => {
    app.showEmojiPanel()
})

const { webContents } = require('electron').remote

let contents = webContents.getAllWebContents()
for (let c of contents) {
    console.log(c.getTitle())
    console.log(c.getURL())
}

// 监听content的findInPage方法的调用
contents[0].on('found-in-page', (event, result) => {
    console.log(event)
    console.log(result)
})


// 用于创建一个小的view
const { BrowserView } = require('electron').remote

let view
$('#webview').click(() => {
    view = new BrowserView()
    win.setBrowserView(view)
    view.setBounds({
        x: 12,
        y: 128,
        width: 100,
        height: 100
    })
    view.webContents.loadURL('https://github.com')
})


$('#jietu').click(() => {
    // 截图
    let c = contents[0].capturePage()
    // 从promise中获取数据
    c.then(function (data) {
        const fs = require('fs')
        // 用fs处理buffer
        let bf = data.toPNG()
        // 写到文件
        fs.writeFile('a.png', bf, (err) => {})
    })
})

const { dialog } = require('electron').remote

$('#sopendialog').click(() => {
    let p = dialog.showOpenDialogSync(win, {})
    console.log(p)
})

$('#asopendialog').click(() => {
    let p = dialog.showOpenDialog(win, {})
    p.then((data) => {
        console.log(data)
        console.log(data.filePaths)
    })
})

$('#smsgboxdialog').click(() => {
    let rs = dialog.showMessageBoxSync(win, {
        // type: 'info',
        // type: 'error',
        type: 'question',
        title: 'Message',
        buttons: ['Option one', 'Option two'],
        message: 'This is a stupid box.',
        detail: 'Extra message.',


    })
    console.log(rs)
})

// 模态窗口意味着 父窗口已经不可选 必须等模态窗口关闭之后 父窗口才能工作
const { BrowserWindow } = require('electron').remote
$('#modelwindow').click(() => {
    let child = new BrowserWindow({
        parent: win, 
        modal: true,
        show: false
    })
    child.loadURL('http://github.com')
    child.on('ready-to-show', () => {
        child.show()
    })
})

const { remote } = require('electron')
const { Menu, MenuItem } = remote

// 自定义右键菜单
const menu = new Menu()
menu.append(new MenuItem({
    label: 'MenuItem1', 
    click() {
         console.log('item 1 clicked') 
        } 
    }))
menu.append(new MenuItem({ 
    type: 'separator' 
}))
menu.append(new MenuItem({ 
    label: 'MenuItem2', 
    type: 'checkbox', 
    checked: true 
}))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup({ window: remote.getCurrentWindow() })
}, false)