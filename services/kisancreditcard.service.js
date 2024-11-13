const { dbQuery, hybridEncryptDecryption, HybridApiCall } = require("../util/gloableApi")
const FormData = require('form-data');
const env = require("dotenv");
const { default: axios } = require("axios");
const { getlogData, updateLogTable, InsertDetailLog, InsertLog } = require("./evenlog.service");
const { logErrorAsync } = require("../util/logger");
const { srGenerationStaticPayload, rejectErrorFormat, successResponseFormat, responseStatusCode } = require("../constant/constVariable");
const { hybridEnctyptionUrl, apiURL, kaleryaURL } = require("../constant/url");
const { httpClient } = require("../util/httpClent");
const { GET_ENGAGE_DATA_QUERY, CUSTOMER_VISITED_STATUS_QUERY, GET_STEPS } = require("../constant/query");
env.config();

/*
 * 
 * @param {*} payload 
 */
async function srGenerationService(payload) {
    return new Promise(async (resolve, reject) => {
        const srGenerationPayload = { ...srGenerationStaticPayload };
        srGenerationPayload['Custom']['Loan_Amount_l'] = payload.loanAmount;
        srGenerationPayload['FirstName'] = payload.firstName;
        srGenerationPayload['LastName'] = payload.firstName;
        srGenerationPayload['MobilePhone'] = payload.mobile;
        const encryptPayload = {
            "requestId": "",
            "service": "LP",
            "clientInfo": "",
            "optionalParam": "",
            "payload": srGenerationPayload
        }
        let encryptedSrPayload, encryptedSrResponse, decryptedSrResponse;
        try {
            encryptedSrPayload = await hybridEncryptDecryption(encryptPayload, hybridEnctyptionUrl.PROD_ENCRYPTION_URL_4005);
        }
        catch (err) {
            rejectErrorFormat["mobile"] = payload.mobile;
            rejectErrorFormat['errorURL'] = hybridEnctyptionUrl.PROD_ENCRYPTION_URL_4005
            rejectErrorFormat['message'] = JSON.stringify(err);
            reject(rejectErrorFormat);
        }
        try {
            const config = {
                method: 'post',
                url: apiURL.SR_GENERATE_LIVE,
                headers: {
                    'APIKey': process.env.SR_KEY_PROD
                },
                data: encryptedSrPayload
            };
            encryptedSrResponse = await HybridApiCall(config);
        }
        catch (err) {
            rejectErrorFormat["mobile"] = payload.mobile;
            rejectErrorFormat['errorURL'] = apiURL.SR_GENERATE_LIVE
            rejectErrorFormat['message'] = JSON.stringify(err);
            reject(rejectErrorFormat);
        }
        // In This try block we are decrypting API response.
        try {

            decryptedSrResponse = await hybridEncryptDecryption(encryptedSrResponse.data, hybridEnctyptionUrl.PROD_DECRYPTION_URL_4005);
            resolve(decryptedSrResponse);
        }
        catch (err) {
            rejectErrorFormat["mobile"] = payload.mobile;
            rejectErrorFormat['errorURL'] = hybridEnctyptionUrl.PROD_DECRYPTION_URL_4005
            rejectErrorFormat['message'] = JSON.stringify(err);
            reject(rejectErrorFormat);
        }
    })
}

/*
 * 
 * @param {*} payload 
 * @returns 
 */
async function getPrevData(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            const dbQueryData = await dbQuery(GET_ENGAGE_DATA_QUERY, [payload.customerId, payload.batchNo, payload.spoctoId]);
            console.log("🚀 ~ returnnewPromise ~ dbQueryData:", dbQueryData)
            resolve(dbQueryData)
        } catch (err) {
            reject(err);
        }
    })
}

async function getsteps(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            const dbQueryData = await dbQuery(GET_STEPS, [payload.customerId, payload.batchNo, payload.spoctoId]);
            resolve(dbQueryData)
        } catch (err) {
            reject(err);
        }
    })
}

/*
 * 
 * @param {\} payload 
 * @returns 
 */
async function connectToRM(payload) {
    const formData = new FormData();
    formData.append('method', 'dial.click2call');
    formData.append('format', 'json');
    formData.append('caller', payload.caller);
    formData.append('receiver', payload.rmMobile);
    formData.append('return', '1');
    return new Promise(async (resolve, reject) => {
        var config = {
            method: 'post',
            url: !payload.callback ? kaleryaURL.CALL_TO_CONNECT : `${kaleryaURL.CALL_TO_CONNECT_CALLBACK}${payload.callback}`,
            headers: {
                'x-api-key': `${process.env.KALERA_API_KEY}`,
                ...formData.getHeaders()
            },
            data: formData
        };
        axios(config)
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                reject(error)
            });
    }).catch((err) => {
        console.log(err)
        throw err
    })
}

/*
 * 
 * @param {*} payload 
 * @returns 
 */
async function connectToRMStatus(payload) {
    const formData = new FormData();
    return new Promise(async (resolve, reject) => {
        formData.append('method', payload.method);
        formData.append('format', 'json');
        formData.append('id', payload.id);

        var config = {
            method: 'post',
            url: kaleryaURL.CALL_TO_CONNECT,
            headers: {
                'x-api-key': `${process.env.KALERA_API_KEY}`,
                ...formData.getHeaders()
            },
            data: formData
        };
        httpClient.config(config).then(function (response) {
            resolve(response.data)
        }).catch(function (error) {
            reject(error)
        });
    })
}

/*
 * 
 * @param {*} payload 
 * @returns 
 */
async function updateLogFromRMConnect(payload) {
    try {
        // initial required data
        let insertcols, insertvals;
        insertcols = 'customerid';
        insertvals = "'" + payload.customerId + "'";
        insertcols += ', batch';
        insertvals += ", '" + payload.batchNo + "'";
        insertcols += ', spoctoid';
        insertvals += ", '" + payload.spoctoId + "'";
        insertcols += ", languages, product_type";
        insertvals += ", 'English','Kisan Credit Card'";
        insertcols += ', step';
        insertvals += ", '" + payload.step + "'";
        insertcols += ', step_text';
        insertvals += ", '" + payload.stepText + "'";

        const logData = await getlogData(payload.customerId, payload.batchNo, payload.spoctoId);
        if (logData.length > 0) {
            let updatecol;
            const resData = logData[0];
            updatecol = "step = '" + payload.step + "'";
            updatecol += ", step_text = '" + payload.stepText + "'";
            updatecol += ", product_type = 'Kisan Credit Card'";

            if (payload.outstandingAmount !== null && payload.outstandingAmount !== undefined) {
                updatecol += ", total_outstanding_amount = '" + payload.outstandingAmount + "'";
                insertcols += ', total_outstanding_amount';
                insertvals += ", '" + payload.outstandingAmount + "'";
            }
            else if (resData.total_outstanding_amount != '' && resData.total_outstanding_amount != null) {
                insertcols += ', total_outstanding_amount';
                insertvals += ", '" + resData.total_outstanding_amount + "'";
            }
            if (payload.accountNo !== null && payload.accountNo !== undefined) {
                updatecol += ", account_no = '" + payload.accountNo + "'";
                insertcols += ', account_no';
                insertvals += ", '" + payload.accountNo + "'";
            }
            else if (resData.account_no != '' && resData.account_no != null) {
                insertcols += ', account_no';
                insertvals += ", '" + resData.account_no + "'";
            }
            if (payload.expiryDate !== null && payload.expiryDate !== undefined) {
                updatecol += ", expiry_date = '" + payload.expiryDate + "'";
                insertcols += ', expiry_date';
                insertvals += ", '" + payload.expiryDate + "'";
            }
            else if (resData.expiry_date != '' && resData.expiry_date != null) {
                insertcols += ', expiry_date';
                insertvals += ", '" + resData.expiry_date + "'";
            }
            if (payload.callDuration !== null && payload.callDuration !== undefined) {
                updatecol += ", call_duration = '" + payload.callDuration + "'";
                insertcols += ', call_duration';
                insertvals += ", '" + payload.callDuration + "'";
            }
            else if (resData.call_duration != '' && resData.call_duration != null) {
                insertcols += ', call_duration';
                insertvals += ", '" + resData.call_duration + "'";
            }
            if (payload.callerStatus !== null && payload.callerStatus !== undefined) {
                updatecol += ", caller_status = '" + payload.callerStatus + "'";
                insertcols += ', caller_status';
                insertvals += ", '" + payload.callerStatus + "'";
            }
            else if (resData.caller_status != '' && resData.caller_status != null) {
                insertcols += ', caller_status';
                insertvals += ", '" + resData.caller_status + "'";
            }
            if (payload.rmCallStatus !== null && payload.rmCallStatus !== undefined) {
                updatecol += ", rm_call_status = '" + payload.rmCallStatus + "'";
                insertcols += ', rm_call_status';
                insertvals += ", '" + payload.rmCallStatus + "'";
            }
            else if (resData.rm_call_status != '' && resData.rm_call_status != null) {
                insertcols += ', rm_call_status';
                insertvals += ", '" + resData.rm_call_status + "'";
            }
            if (payload.callConnectionStatus !== null && payload.callConnectionStatus !== undefined) {
                updatecol += ", call_connection_status = '" + payload.callConnectionStatus + "'";
                insertcols += ', call_connection_status';
                insertvals += ", '" + payload.callConnectionStatus + "'";
            }
            else if (resData.call_connection_status != '' && resData.call_connection_status != null) {
                insertcols += ', call_connection_status';
                insertvals += ", '" + resData.call_connection_status + "'";
            }
            if (payload.callInitiateId !== null && payload.callInitiateId !== undefined) {
                updatecol += ", call_initiate_id = '" + payload.callInitiateId + "'";
                insertcols += ', call_initiate_id';
                insertvals += ", '" + payload.callInitiateId + "'";
            }
            else if (resData.call_initiate_id != '' && resData.call_initiate_id != null) {
                insertcols += ', call_initiate_id';
                insertvals += ", '" + resData.call_initiate_id + "'";
            }
            // storing in Db
            Promise.all([updateLogTable(payload.customerId, payload.batchNo, payload.spoctoId, updatecol), InsertDetailLog(insertcols, insertvals)])
                .then(() => {
                    return (successResponseFormat)
                })
                .catch((err) => {
                    logErrorAsync(err, request.originalUrl, payload.spoctoId);
                    return ({
                        "status": responseStatusCode.SERVICE_UNAVAILABLE,
                    })
                })
        }
        else {
            if (payload.callInitiateId !== null && payload.callInitiateId !== undefined) {
                insertcols += ', call_initiate_id';
                insertvals += ", '" + payload.callInitiateId + "'";
            }
            if (payload.rmCallStatus !== null && payload.rmCallStatus !== undefined && (payload.rmCallStatus) > 0) {
                insertcols += ', rm_call_status';
                insertvals += ", '" + (payload.rmCallStatus) + "'";
            }
            if (payload.callerStatus !== null && payload.callerStatus !== undefined) {
                insertcols += ', caller_status';
                insertvals += ", '" + (payload.callerStatus) + "'";
            }
            if (payload.callDuration !== null && payload.callDuration !== undefined) {
                insertcols += ', call_duration';
                insertvals += ", '" + (payload.callDuration) + "'";
            }
            if (payload.callConnectionStatus !== null && payload.callConnectionStatus !== undefined) {
                insertcols += ', call_connection_status';
                insertvals += ", '" + (payload.callConnectionStatus) + "'";
            }
            Promise.all([InsertLog(insertcols, insertvals), InsertDetailLog(insertcols, insertvals)])
                .then(() => {
                    return (successResponseFormat)
                })
                .catch((err) => {
                    logErrorAsync(err, request.originalUrl, payload.spoctoId);
                    return ({
                        "status": responseStatusCode.SERVICE_UNAVAILABLE,
                    })
                })
        }
    }
    catch (err) {
        logErrorAsync(err, request.originalUrl, payload.spoctoId);
        return ({
            "statusCode": responseStatusCode.SERVICE_UNAVAILABLE,
        })
    }
}

/*
 * 
 * @param {*} payload 
 * @returns 
 */
async function UpdateCustomerStatusService(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            const dbQueryData = await dbQuery(CUSTOMER_VISITED_STATUS_QUERY, [payload.customerId, payload.batchNo, payload.spoctoId]);
            resolve(dbQueryData)
        } catch (err) {
            reject(err);
        }
    })
}
module.exports = {
    getPrevData,
    connectToRM,
    connectToRMStatus,
    updateLogFromRMConnect,
    UpdateCustomerStatusService,
    srGenerationService,
    getsteps
}