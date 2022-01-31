var command = null
const commandName = document.querySelector('.toolbox .command-name')

function execute_command() {
    {
        let editor = editor_monaco

        try {
            eval(command_monaco.getValue())
        } catch (error) {
            preview.innerHTML = error
        }
    }
}

function select_command() {
    dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: '自動化腳本', extensions: ['js'] }] })
        .then(function (res) {
            const split_arr = res.filePaths[0].split('\\')
            const fileName = split_arr[split_arr.length - 1].split('.')[0]

            fs.readFile(res.filePaths[0], function (err, data) {
                if (err) throw err;
                command_monaco.setValue(data.toString())
                command = fileName
                commandName.innerHTML = command
            });
        })
}

function new_command() {
    command_monaco.setValue("")
    command = null
    commandName.innerHTML = '自動化'
}

function save_command() {
    dialog.showSaveDialog({ title: '儲存自動化檔案', filters: [{ name: '自動化腳本', extensions: ['js'] }] }).then((res) => {
        console.log(res);
        const split_arr = res.filePath.split('\\')
        const fileName = split_arr[split_arr.length - 1].split('.')[0]

        fs.writeFile(res.filePath, command_monaco.getValue(), function (err) {
            if (err) throw err;
            command = fileName
            commandName.innerHTML = command
        });
    })




}