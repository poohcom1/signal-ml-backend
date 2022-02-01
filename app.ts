import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { setUp } from "./lib/setup";
import { convert, testConvert } from "./lib/converter/converter";
import cors from 'cors'

const app = express();
const port = 5000;

const FILES_DIR_NAME = "files";
const MODELS_DIR_NAME = "models";

setUp([FILES_DIR_NAME, MODELS_DIR_NAME], ".");

const model_dir = path.join(__dirname, MODELS_DIR_NAME);
const files_dir = path.join(__dirname, FILES_DIR_NAME);

const upload = multer({ dest: files_dir });

app.use(cors())

app.post("/convert/", upload.single("midi"), (req, res) => {
  console.log("[Convert] received midi");

  let timerStart = process.hrtime();

  const newDirPath = req.file.path + "_project"
  fs.mkdirSync(newDirPath)
  const newFilepath = path.join(newDirPath, req.file.filename)
  fs.renameSync(req.file.path, newFilepath)

  const output_path = path.join(newDirPath, req.file.filename + ".wav");

  let convert_process = convert(req.file.filename, newDirPath, path.join(MODELS_DIR_NAME, "midi2params"))

  convert_process.on("exit", () => {
    console.log(`[Convert] Finished in ${process.hrtime(timerStart)} ms`);

    res.sendFile(output_path);
  });

  res.on("finish", () => {
    fs.rmSync(req.file.path + "_project", { recursive: true, force: true });
  });
  res.on("error", e => {
    console.log(e)
    fs.rmSync(req.file.path + "_project", { recursive: true, force: true });
  })
});

app.listen(port, () => { });
