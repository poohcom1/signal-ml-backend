import fs from "fs";
import path from "path";

export function setUp(directories: string[], rootDir: string = "") {
  for (const dir of directories) {
    if (!fs.existsSync(path.join(rootDir, dir))) {
      fs.mkdirSync(path.join(rootDir, dir));
    }
  }
}
