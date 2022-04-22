import fs from "fs";
import path from "path";
import YAML from "yaml";
import { ChildProcess, exec } from "child_process";

const MODEL_MANIFEST_NAME = "manifest.sml.yaml";
const FILE_NAME_PARAM = "BASENAME";
const DIR_PARAM = "DIR";
const TEMPO = "TEMPO"

interface Configs {
  name: string;
  format: "midi" | "musicxml";
  parameters: Record<string, Parameter>;
  script: Array<string>;

  trimStart?: number;
  trimEnd?: number;
}

interface Parameter {
  type: "float" | "int" | "string" | "boolean" | "enum";
  default: number | string | boolean;
  min: number | undefined;
  max: number | undefined;
  private: boolean | undefined;
  enum: string[];
}

export function parse_configs(
  modelDir: string,
  removePrivate = false
): Configs {
  const FILE_DIR = path.join(modelDir, MODEL_MANIFEST_NAME);

  const configData = fs.readFileSync(FILE_DIR, "utf-8");

  const configs: Configs = YAML.parse(configData);

  for (const key of Object.keys(configs.parameters)) {
    // Create defaults
    const param = configs.parameters[key];

    if (typeof param === "string") {
      const value = param;
      configs.parameters[key].type = "string";
      configs.parameters[key].default = value;
    }

    if (!param.type) {
      param.type === "string";

      console.warn(
        `[Config Warning] ${configs.name}: No type specified for "${key}"`
      );
    }

    if (param.default === undefined) {
      switch (param.type) {
        case "string":
          param.default = "";
          break;
        case "boolean":
          param.default = false;
          break;
        case "int":
          param.default = 0;
          break;
        case "float":
          param.default = 1.0;
          break;
        case "enum":
          param.default = param.enum[0];
          break;
      }
      console.warn(
        `[Config Warning] ${configs.name}: No default value specified for "${key}"`
      );
    }

    // Remove private configs
    if (removePrivate && configs.parameters[key].private) {
      delete configs.parameters[key];
    }
  }

  return configs;
}

export function convert(
  filename: string,
  fileDir: string,
  modelDir: string,
  options: Record<string, string | number | boolean>,
  data: { bpm: number }
): ChildProcess {
  const configs = parse_configs(modelDir);

  inject_parameters(configs.script, options, filename, fileDir, data.bpm);

  let trimCommand = "";

  // if (configs.trimStart) {
  //   const file = path.join(fileDir, filename);

  //   trimCommand = ` & ffmpeg -loglevel error -ss ${
  //     (60 / data.bpm) * configs.trimStart
  //   } -i ${file}.wav ${file}_trimmed.wav`;
  // }

  return exec(
    `cd ${modelDir} & ` + configs.script.join(" & ") + trimCommand,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`[exec error] ${err}`);
        return;
      }

      console.log(`[stdout] ${stdout}`);
      if (stderr) console.error(`[stderr] ${stderr}`);
    }
  );
}

function inject_parameters(
  commands: Array<string>,
  parameters: Record<string, string | boolean | number>,
  fileName: string,
  fileDir: string,
  tempo: number,
) {
  const regex = /\$[a-zA-Z0-9]*/g;

  for (let i = 0; i < commands.length; i++) {
    let found = commands[i].match(regex);

    if (found) {
      for (let j = 0; j < found.length; j++) {
        let replace = "";

        const key = found[j].substring(1);

        switch (key) {
          case DIR_PARAM:
            replace = fileDir;
            break;
          case FILE_NAME_PARAM:
            replace = fileName;
            break;
          case TEMPO:
            replace = tempo + ""
            break;
          default:
            replace = `${parameters[key]}`;
        }

        commands[i] = commands[i].replace(found[j], replace);
      }
    }
  }
}
