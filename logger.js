const { debug, info } = require("winston");
const winston = require("winston");
// require("dotenv").config({ path: __dirname + "/../../.env" });

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});

// if (process.env.NODE_ENV === "development") {
//   logger.add(
//     new winston.transports.File({ filename: "/logger.log", level: info })
//   );
// }

module.exports = logger;
