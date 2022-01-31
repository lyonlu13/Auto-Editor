const { dialog } = require('electron').remote
const path = require('path');
const amdLoader = require('monaco-editor/min/vs/loader');
const fs = require('fs');
const { app, Menu, getCurrentWindow } = require('electron').remote
const compatibles = require('./js/data/compatibles.js')
let isChanged = false
let thisFile = null
let programFlag = false

updateTitle()

const template = [{
    label: '檔案',
    submenu: [{
        label: '新增檔案',
        click: menuNewFile
    }, {
        label: '開啟',
        click: menuOpenFile
    }, {
        label: '儲存',
        click: menuSave
    }, {
        label: '另存新檔',
        click: menuSaveAs
    }, {
        type: 'separator'
    }, {
        label: '結束',
        click() {
            app.quit();
        }
    }]
}, ]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

const amdRequire = amdLoader.require;
const amdDefine = amdLoader.require.define;

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, './node_modules/monaco-editor/min'))
});

// workaround monaco-css not understanding the environment
self.module = undefined;

var preview = document.querySelector("#preview")
var editor_monaco
var command_monaco

amdRequire(['vs/editor/editor.main'], function() {
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: function(model, position) {
            var word = model.getWordUntilPosition(position);
            var range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            return {
                suggestions: createDependencyProposals(range, false, editor, word)
            };
        }
    });

    function createDependencyProposals(range, languageService = false, editor, curWord) {
        let snippets = [{
                label: "editor",
                kind: monaco.languages.CompletionItemKind.Keyword,
                documentation: "",
                insertText: "editor",
                range: range
            },
            {
                label: "preview",
                kind: monaco.languages.CompletionItemKind.Keyword,
                documentation: "",
                insertText: "preview",
                range: range
            },
        ];
        return snippets;
    }

    editor_monaco = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: '',
        automaticLayout: true,
        theme: "vs-dark",
    });

    editor_monaco.getModel().onDidChangeContent((event) => {
        if (programFlag) return programFlag = false
        isChanged = true;
        updateTitle()
    });

    command_monaco = monaco.editor.create(document.getElementById('console'), {
        value: '',
        language: 'javascript',
        automaticLayout: true,
        theme: "vs-dark",
        minimap: {
            enabled: false
        },
    })

    command_monaco.getModel().onDidChangeContent((event) => {
        const commandName = document.querySelector('.toolbox .command-name')
        if (command) {
            commandName.innerHTML = command + '*'
        } else {
            commandName.innerHTML = '自動化*'
        }
    });
});

function updateTitle() {
    if (thisFile) {
        getCurrentWindow().setTitle(`${thisFile.name} - Auto Editor ${isChanged?"[未儲存]":''}`)
    } else {
        getCurrentWindow().setTitle(`Untitled - Auto Editor ${isChanged?"[未儲存]":''}`)
    }
}

function saveFile(callback) {
    if (thisFile) {
        fs.writeFile(thisFile.filePath, editor_monaco.getValue(), function(err) {
            if (err) throw err
            isChanged = false
            updateTitle()
            callback && callback()
        });
    } else {
        dialog.showSaveDialog({
            title: '儲存',
            filters: compatibles
        }).then((res) => {
            if (res.canceled) return
            const split_arr = res.filePath.split('\\')
            const fileName = split_arr[split_arr.length - 1]

            fs.writeFile(res.filePath, editor_monaco.getValue(), function(err) {
                if (err) throw err
                isChanged = false
                thisFile = { filePath: res.filePath, name: fileName }
                updateTitle()
                callback && callback()
            });
        })
    }
}

function saveFileIfNeeded(callback) {
    if (!isChanged) return
    const fileName = thisFile ? thisFile.name : "Untitled"
    dialog.showMessageBox({ type: "question", cancelId: -1, buttons: ["是", "否", "取消"], message: `是否儲存 ${fileName} ?` })
        .then(({ response }) => {
            if (response === -1 || response === 2) return
            if (response === 0)
                saveFile(callback)
            else
                callback()
        })

}

function newFile() {
    thisFile = null;
    programFlag = true
    editor_monaco.setValue("")
    isChanged = false;
    updateTitle()
}

function menuNewFile() {
    saveFileIfNeeded(newFile)
}

function menuOpenFile() {
    dialog.showOpenDialog({
        title: '開啟檔案',
        filters: compatibles
    }).then((res) => {
        console.log(res);
        if (res.canceled) return
        const split_arr = res.filePaths[0].split('\\')
        const fileName = split_arr[split_arr.length - 1]
        fs.readFile(res.filePaths[0], function(err, data) {
            if (err) throw err;
            editor_monaco.setValue(data.toString())

            isEdited = false
            thisFile = { filePath: res.filePath, name: fileName }
            updateTitle()
        });
    })

}

function menuSave() {
    saveFile()
}

function menuSaveAs() {

}