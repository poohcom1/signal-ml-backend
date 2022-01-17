import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { setUp } from "./lib/setup";
import { testConvert } from "./lib/converter";

const app = express();
const port = 5000;

const FILES_DIR_NAME = "files";
const MODELS_DIR_NAME = "models";

setUp([FILES_DIR_NAME, MODELS_DIR_NAME], ".");

const model_dir = path.join(__dirname, MODELS_DIR_NAME);
const files_dir = path.join(__dirname, FILES_DIR_NAME);

const upload = multer({ dest: files_dir });

app.post("/convert/", upload.single("midi"), (req, res) => {
  console.log("[Convert] received midi");

  let timerStart = process.hrtime();

  const output_path = path.join(files_dir, req.file.filename + ".wav");

  let convert_process = testConvert(req.file, output_path);

  convert_process.on("exit", () => {
    console.log(`[Convert] Finished in ${process.hrtime(timerStart)} ms`);
    res.sendFile(output_path);
  });

  res.on("finish", () => {
    fs.rm(req.file.path, () => {});
    fs.rm(output_path, () => {});
  });
});

app.listen(port, () => {});
