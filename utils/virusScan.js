import { exec } from "child_process";
export const scanForVirus = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`clamscan ${filePath}`, (error, stdout) => {
      if (error) {
        return reject(new Error("Virus scan failed"));
      }
      if (stdout.includes("FOUND")) {
        return reject(new Error("Virus detected"));
      }
      resolve(true);
    });
  });
};
