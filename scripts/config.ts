import { promises as fs } from "fs";

var config: any;

export async function initConfig() {
  try {
    console.log("Initializing configuration...");
    config = JSON.parse(await fs.readFile("./config.json", "utf-8"));
    console.log("Configuration loaded successfully.");
  } catch (error) {
    console.error("Error while initializing configuration:", error);
    throw error; // Propagate the error to the caller
  }
}

export function getConfig() {
  return config;
}

export function setConfig(path: string, val: string) {
  console.log(config);
  const splitPath = path.split(".").reverse();

  var ref = config;
  while (splitPath.length > 1) {
    let key = splitPath.pop();
    if (key) {
      if (!ref[key]) ref[key] = {};
      ref = ref[key];
    } else {
      return;
    }
  }

  let key = splitPath.pop();
  if (key) ref[key] = val;
}

export async function updateConfig() {
  console.log("write: ", JSON.stringify(config));

  return fs.writeFile("./config.json", JSON.stringify(config, null, 2));
}
