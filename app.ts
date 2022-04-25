import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { setUp } from "./lib/setup";
import { convert, parse_configs } from "./lib/converter/converter";
import cors from "cors";

const app = express();
const port = process.env.PORT;

const FILES_DIR_NAME = "files";
const MODELS_DIR_NAME = "models";

setUp([FILES_DIR_NAME, MODELS_DIR_NAME], ".");

const model_dir = path.join(__dirname, MODELS_DIR_NAME);
const files_dir = path.join(__dirname, FILES_DIR_NAME);

const upload = multer({ dest: files_dir });

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("hi")
})

app.get("/models", (req, res) => {
  const models = fs.readdirSync(model_dir).reverse();

  const configs = {};

  models.forEach((model) => {
    configs[model] = parse_configs(path.join(MODELS_DIR_NAME, model), true);
  });

  res.send(configs);
});

app.post("/convert/:model", upload.single("midi"), (req, res) => {
  const modelName = req.params.model;

  console.log(`[Convert] [${modelName}] Received midi `);

  const options = JSON.parse(req.body.options);
  const bpm = req.body.bpm;

  let timerStart = process.hrtime();

  console.log(req.file.path);

  // Setup files
  const newDirPath = req.file.path + "_project";
  fs.mkdirSync(newDirPath);
  const newFilepath = path.join(newDirPath, req.file.filename);
  fs.renameSync(req.file.path, newFilepath);
  const file_name = path.join(newDirPath, req.file.filename);
  const output_path = file_name + ".wav";

  // Convert
  let convert_process = convert(
    req.file.filename,
    newDirPath,
    path.join(MODELS_DIR_NAME, modelName),
    options,
    { bpm }
  );

  convert_process.on("exit", () => {
    console.info(`[Convert] Finished in ${process.hrtime(timerStart)} ms`);

    if (fs.existsSync(`${file_name}_trimmed.wav`)) {
      console.log("Audio trimmed!");

      fs.renameSync(`${file_name}_trimmed.wav`, output_path);
    }

    res.sendFile(output_path);
  });

  res.on("finish", () => {
    fs.rmSync(req.file.path + "_project", { recursive: true, force: true });
  });
  res.on("error", (e) => {
    fs.rmSync(req.file.path + "_project", { recursive: true, force: true });
  });
});

app.listen(port, () => {
  // Check configs
  const models = fs.readdirSync(model_dir);

  models.forEach((model) => {
    parse_configs(path.join(MODELS_DIR_NAME, model), true);
  });

  console.info(`[Info] Loaded ${models.length} models.`);
});
