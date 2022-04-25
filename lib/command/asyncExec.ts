import { promisify } from "util";
import { exec } from "child_process";

export const execAsync = promisify(exec);

export const sequentialExecution = async (commands: string[]) => {
  for (const command of commands) {
    const { stderr } = await execAsync(command);
  }
};
