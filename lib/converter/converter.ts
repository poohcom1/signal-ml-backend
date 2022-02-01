import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { ChildProcess, spawn, exec } from "child_process";

const MODEL_MANIFEST_NAME = "manifest.sml.yaml"

export function parse_configs(modelDir: string): Configs {
  const FILE_DIR = path.join(modelDir, MODEL_MANIFEST_NAME)

  const configData = fs.readFileSync(FILE_DIR, 'utf-8')

  return YAML.parse(configData)
}

export function convert(filename: string, fileDir: string, modelDir: string): ChildProcess {
  const configs = parse_configs(modelDir)

  inject_parameters(configs.script, configs.parameters, filename, fileDir)

  return exec(`cd ${modelDir} & ` + configs.script.join(" & "),
    (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`)
        return
      }

      console.log(`stdout: ${stdout}`)
      if (stderr) console.error(`stderr: ${stderr}`)
    })
}

export function testConvert(file: Express.Multer.File, path: string) {
  return exec("ls");
}

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

const FILE_NAME_PARAM = "BASENAME"
const DIR_PARAM = "DIR"

function inject_parameters(commands: Array<string>, parameters: Record<string, Parameter>, fileName: string, fileDir: string,) {
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
  }
}