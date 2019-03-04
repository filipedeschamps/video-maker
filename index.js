import { requireDataForRobot } from "./src/cli/app-init";

function start() {
  const content = requireDataForRobot();
  console.log(content);
}

start()
