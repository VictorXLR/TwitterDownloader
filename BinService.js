const execa = require("execa")
const MAIN_APP = "youtube-dl"

async function get_version() {
    const { stderr, command, stdout } = await execa(MAIN_APP, ["--version"])
    let message = { "command": command, "version": stdout }
    return message
}

async function list_formats(download_url) {
    const { command, stdout, stderr } = await execa(MAIN_APP, ["-F", download_url])
    if (stderr) return stderr

    return format_json(command, stdout)
}

function format_json(command_string, terminal_message) {
    terminal_message = terminal_message.split("\n")
    let format_output = []
    // remove the terminal output stuff
    terminal_message.shift()
    terminal_message.shift()
    terminal_message.shift()

    // for big terminal output, convert to json object
    terminal_message.forEach((format) => {
        // split by regex by space, this creates an array with 
        // all the records in values 
        let array_message = format.split(/(\s+)/)

        // remove array items of empty stings " "
        array_message = array_message.
            filter(entry => {
                // if not empty string or just comma,
                if (entry.trim() != "" && entry.trim() != ",")
                    return true
                return false
            })
        let message = {
            "vid_code": array_message[0],
            "video_extension": array_message[1],
            "resolution": array_message[2],
            "video_format": array_message[3],
            "size": array_message.pop()

        }
        format_output.push(message)
    })

    let final_message = { "command": command_string, "formats": format_output }

    return final_message
}


async function direct_url(format_code, download_url) {
    const { command, stdout, stderr } = await execa(MAIN_APP, ["-f", format_code, "--get-url", download_url])

    return { "command": command, "direct_url": stdout }

}

async function download_url(download_url) {
    const { command, stdout, stderr } = await execa(MAIN_APP, ["-f best", "--get-url", download_url])
    if (stderr) return stderr

    return stdout

}



module.exports = { get_version, list_formats, direct_url, download_url }