import { spawn } from "child_process";

export function testConvert(file: Express.Multer.File, path: string) {
  return spawn("echo");
}
