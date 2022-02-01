import { parse_configs } from "./converter";

interface Configs {
    name: string
    format: "midi" | "musicxml"
    parameters: Record<string, Parameter>
    script: Array<string>
}

interface Parameter {
    type: "number" | "integer" | "string"
    default: number | string
    min: number | null
    max: number | null
}

let configs: Configs = parse_configs('models\\midi2params')

const FILE_NAME_PARAM = "BASENAME"
const DIR_PARAM = "DIR"

function inject_parameters(fileName: string, fileDir: string, parameters: Record<string, Parameter>, commands: Array<string>) {
    const regex = /\$[a-zA-Z0-9]*/g

    for (let i = 0; i < commands.length; i++) {
        let found = commands[i].match(regex)

        if (found) {
            for (let j = 0; j < found.length; j++) {
                let replace = ""

                switch (found[j].substr(1)) {
                    case DIR_PARAM:
                        replace = fileDir
                        break
                    case FILE_NAME_PARAM:
                        replace = fileName
                        break
                    default:
                        replace = `${parameters[found[j].substr(1)].default}`
                }

                commands[i] = commands[i].replace(found[j], replace)
            }
        }

        console.log(commands[i])
    }
}

inject_parameters("test", "files", configs.parameters, configs.script)