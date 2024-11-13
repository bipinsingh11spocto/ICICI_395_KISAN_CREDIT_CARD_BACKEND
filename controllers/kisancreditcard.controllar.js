const { decrypt, encrypt } = require("../constant/cryptojs");
const { kisancreditcardService } = require("../services");
const { logErrorAsync, logInfoAsync } = require("../util/logger");
const { dbQuery } = require("../util/gloableApi");
const { successResponseFormat, errorResponseFormat, errorMessage, kaleryaStandardStatus, logStepMessage, logErrorMessage, responseStatusCode } = require("../constant/constVariable");
const { CALL_RESPONSE_UPDATE } = require("../constant/query");

async function getPrevData(request, response) {
    
    let payload;
    try {
        payload = decrypt(request.body.payload);
        console.log("🚀 ~ getPrevData ~ payload:", payload)
        const prevData = await kisancreditcardService.getPrevData(payload)
        if (prevData.length > 0) {
            const successFormat = { ...successResponseFormat }
            successFormat['data'] = encrypt(prevData[0])
            return response.status(responseStatusCode.SUCCESS).json(successFormat);
        }
        else {
            logErrorAsync(logErrorMessage.DATA_MISSING, request.originalUrl, payload.spoctoId);
            const errorFormat = { ...errorResponseFormat }
            errorFormat['message'] = errorMessage.NO_DATA
            return response.status(responseStatusCode.NOT_FOUND).json(errorFormat);
        }
    }
    catch (err) {
        logErrorAsync(err, request.originalUrl);
        const errorFormat = { ...errorResponseFormat }
        errorFormat['message'] = errorMessage.INTERNAL_ERROR
        return response.status(responseStatusCode.NOT_IMPLEMENTED).json(errorFormat)
    }
}

async function generateSrNo(request, response) {
    try {
        const payload = decrypt(request.body.payload);
        try {
            const srGenerationResponseData = await kisancreditcardService.srGenerationService(payload);
            const successFormat = { ...successResponseFormat }
            successFormat['data'] = encrypt(srGenerationResponseData);
            logInfoAsync(JSON.stringify(srGenerationResponseData), request.originalUrl, payload.spoctoId)
            return response.status(responseStatusCode.SUCCESS).json(successFormat);
        }
        catch (err) {
            logErrorAsync(JSON.stringify(err), request.originalUrl, payload.spoctoId);
            const errorFormat = { ...errorResponseFormat }
            errorFormat['message'] = errorMessage.INTERNAL_ERROR
            errorFormat['error'] = err
            return response.status(responseStatusCode.NOT_IMPLEMENTED).json(errorFormat)
        }
    }
    catch (err) {
        logErrorAsync(err, request.originalUrl, payload.spoctoId);
        const errorFormat = { ...errorResponseFormat }
        errorFormat['message'] = errorMessage.INTERNAL_ERROR
        errorFormat['error'] = err
        return response.status(responseStatusCode.NOT_IMPLEMENTED).json(errorFormat)

    }
}

async function kaleraconnect(resquest, response) {
    const payload = decrypt(resquest.body.payload);
    try {
        const callResponse = await kisancreditcardService.connectToRM(payload);
        await dbQuery(CALL_RESPONSE_UPDATE, [callResponse.data.id, callResponse.status, payload.customerId, payload.batchNo, payload.spoctoId]);
        return response.status(responseStatusCode.SUCCESS).json(callResponse);
    }
    catch (err) {
        logErrorAsync(err, resquest.originalUrl, payload.spoctoId);
        const errorFormat = { ...errorResponseFormat }
        errorFormat['message'] = errorMessage.INTERNAL_ERROR
        return response.status(responseStatusCode.NOT_FOUND).json(errorFormat)
    }
}

async function updateCallStatus(request, response) {
    const payload = request.body.payload;
    let countTimerInSec = 0, waitTimeToStartCountInms = 10000, callDuration_20s = 20, callDuration_30s = 30
    try {
        let intervalTime = setInterval(async () => {
            const resData = await kisancreditcardService.connectToRMStatus(payload);
            countTimerInSec++;
            const resDataJson = resData.data[0];
            if (resData.data.length <= 0 && countTimerInSec <= 10) {
                return;
            }
            // updating and inserting call details in log table
            const logPayload = {
                customerId: payload.customerId,
                batchNo: payload.batchNo,
                spoctoId: payload.spoctoId,
                callerStatus: resDataJson['status'],
                rmCallStatus: resDataJson['status2'],
                callDuration: resDataJson['duration'],
                callInitiateId: resDataJson['id']
            }
            if (resDataJson.status === kaleryaStandardStatus.FAILED || resDataJson.status === kaleryaStandardStatus.NOANSWER || resDataJson.status === kaleryaStandardStatus.CANCEL || resDataJson.status === kaleryaStandardStatus.CONGESTION || resDataJson.status === kaleryaStandardStatus.BUSY) {
                clearInterval(intervalTime);
                logPayload['step'] = logStepMessage.SEVEN.STEPID
                logPayload['stepText'] = logStepMessage.SEVEN.STEPTEXT
                kisancreditcardService.updateLogFromRMConnect(logPayload)
                logInfoAsync(JSON.stringify(resDataJson), request.originalUrl, payload.spoctoId)
                return response.status(responseStatusCode.SUCCESS).json(resDataJson);
            }
            else if (resDataJson.status2 === kaleryaStandardStatus.FAILED || resDataJson.status2 === kaleryaStandardStatus.NOANSWER || resDataJson.status2 === kaleryaStandardStatus.CANCEL || resDataJson.status2 === kaleryaStandardStatus.CONGESTION || resDataJson.status2 === kaleryaStandardStatus.BUSY) {
                clearInterval(intervalTime);
                logPayload['step'] = logStepMessage.EIGHT.STEPID
                logPayload['stepText'] = logStepMessage.EIGHT.STEPTEXT
                kisancreditcardService.updateLogFromRMConnect(logPayload)
                logInfoAsync(JSON.stringify(resDataJson), request.originalUrl, payload.spoctoId)
                return response.status(responseStatusCode.SUCCESS).send(resDataJson)
            }
            else if (resDataJson.status2 !== null && resDataJson.status !== null) {
                clearInterval(intervalTime);
                if (resDataJson.duration > callDuration_20s) {
                    logPayload['step'] = logStepMessage.TWELVE.STEPID
                    logPayload['stepText'] = logStepMessage.TWELVE.STEPTEXT
                }
                else {
                    logPayload['step'] = logStepMessage.NINE.STEPID
                    logPayload['stepText'] = logStepMessage.NINE.STEPTEXT
                }
                logInfoAsync(JSON.stringify(resDataJson), request.originalUrl, payload.spoctoId)
                kisancreditcardService.updateLogFromRMConnect(logPayload)
                return response.status(responseStatusCode.SUCCESS).send(resDataJson)
            }
            else if (countTimerInSec > callDuration_30s) {
                clearInterval(intervalTime);
                logPayload['step'] = logStepMessage.TWELVE.STEPID
                logPayload['stepText'] = logStepMessage.TWELVE.STEPTEXT
                kisancreditcardService.updateLogFromRMConnect(logPayload)
                logInfoAsync(JSON.stringify(resDataJson), request.originalUrl, payload.spoctoId)
                return response.status(responseStatusCode.SUCCESS).send(resDataJson)
            }
        }, waitTimeToStartCountInms);
    }
    catch (err) {
        logErrorAsync(err, request.originalUrl, payload.spoctoId);
        const errorFormat = { ...errorResponseFormat }
        errorFormat['message'] = errorMessage.INTERNAL_ERROR
        return response.status(responseStatusCode.NOT_IMPLEMENTED).json(errorFormat)
    }
}

async function getCurrentSteps(request, response) {
    try {
        const params = request.query;
        if (!params.custid | !params.batchno | !params.spoctoid) {
            const errorFormat = { ...errorResponseFormat }
            errorFormat['message'] = errorMessage.NO_DATA
            return response.status(responseStatusCode.BAD_REQUEST).json(errorFormat)
        }
        const prevData = await kisancreditcardService.getsteps({ "customerId": params.custid, "batchNo": params.batchno, "spoctoId": params.spoctoid });
        if (prevData.length > 0) {
            const successFormat = { ...successResponseFormat }
            successFormat['data'] = prevData[0]
            return response.status(responseStatusCode.SUCCESS).json(successFormat);
        }
        else {
            logErrorAsync(logErrorMessage.DATA_MISSING, request.originalUrl, params.spoctoid);
            const errorFormat = { ...errorResponseFormat }
            errorFormat['message'] = errorMessage.NO_DATA
            return response.status(responseStatusCode.NOT_FOUND).json(errorFormat);
        }
    }
    catch (err) {
        console.log(err)
        logErrorAsync(err, request.originalUrl);
        const errorFormat = { ...errorResponseFormat }
        errorFormat['message'] = errorMessage.INTERNAL_ERROR
        return response.status(responseStatusCode.NOT_IMPLEMENTED).json(errorFormat)
    }
}


module.exports = {
    getPrevData,
    generateSrNo,
    kaleraconnect,
    updateCallStatus,
    getCurrentSteps
}
