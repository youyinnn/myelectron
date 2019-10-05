console.log('Load render.js')
const $ = require('jquery')
const win = require('electron').remote.getGlobal('share').win

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

