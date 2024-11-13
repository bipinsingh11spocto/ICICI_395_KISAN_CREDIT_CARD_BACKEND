const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require('path');


const logfile = {
    ERROR_FILE: "../log/dash-%DATE%.log",
    INFO_FILE: "../log_info/dash-%DATE%.log"
}
const currentTimeStamp = () => {
    return new Date().toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' });
}

const logFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: currentTimeStamp }),
    winston.format.align(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

function createTransport(logFilePath = logfile.ERROR_FILE) {
    return new DailyRotateFile({
        filename: path.join(__dirname, logFilePath),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        prepend: true,
        level: "info",
    })
}

const loggerBuilder = (param) => winston.createLogger({
    format: logFormat,
    transports: [createTransport(param)]
});


/*
 * 
 * @param {*} error 
 * @param {*} url 
 * @param {*} spoctoId 
 */
async function logErrorAsync(error, url, spoctoId = "") {
    const logger = loggerBuilder(logfile.ERROR_FILE);
    logger.info(`Error : ${error}, "RequestUrl":${url},"spoctoId"=${spoctoId}`);
}

async function logInfoAsync(info, url, message = "") {
    const logger = loggerBuilder(logfile.INFO_FILE);
    logger.info(`INFO : ${info}, "RequestUrl":${url},"message"=${message}`);
}



module.exports = {
    logErrorAsync,
    logInfoAsync
};
