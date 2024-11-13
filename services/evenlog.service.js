const { generateHMACKey } = require("../constant/cryptojs");
const { GET_LOG_DATA_QUERY } = require("../constant/query");
const { apiURL } = require("../constant/url");
const { dbQuery } = require("../util/gloableApi");
const { httpClient } = require("../util/httpClent");
const { logErrorAsync, logInfoAsync } = require("../util/logger");

/*
 * 
 * @param {*} customerId 
 * @param {*} batchNo 
 * @param {*} spoctoId 
 * @returns 
 */
async function getlogData(customerId, batchNo, spoctoId) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await dbQuery(GET_LOG_DATA_QUERY, [customerId, batchNo, spoctoId])
            resolve(data)
        }
        catch (err) {
            reject(err);
        }
    })
}

/*
 * 
 * @param {*} customerId 
 * @param {*} batchNo 
 * @param {*} spoctoId 
 * @param {*} updatecol 
 * @returns 
 */
async function updateLogTable(customerId, batchNo, spoctoId, updatecol) {
    return new Promise(async (resolve, reject) => {
        try {
            const query = `UPDATE sp_gold_loan_log SET ${updatecol} WHERE customerid=? and batch=? and spoctoid=?`
            const data = await dbQuery(query, [customerId, batchNo, spoctoId])
            resolve(data)
        }
        catch (err) {
            reject(err);
        }
    })
}

/*
 * 
 * @param {*} insertcols 
 * @param {*} insertvals 
 * @returns 
 */
async function InsertDetailLog(insertcols, insertvals) {
    return new Promise(async (resolve, reject) => {
        try {
            const query = `Insert into sp_gold_loan_detailed_log (${insertcols} ) values(${insertvals})`
            const data = await dbQuery(query, [])
            resolve(data)
        }
        catch (err) {
            reject(err);
        }
    })
}

/*
 * 
 * @param {*} insertcols 
 * @param {*} insertvals 
 * @returns 
 */
async function InsertLog(insertcols, insertvals) {
    return new Promise(async (resolve, reject) => {
        try {
            const query = `Insert into sp_gold_loan_log (${insertcols}) values(${insertvals})`
            const data = await dbQuery(query, [])
            resolve(data)
        }
        catch (err) {
            reject(err);
        }
    })
}


async function eventConversationalBot(payload) {
    const botID = '6e956eb7a39349b11158de6c'
    logInfoAsync('starting webhook', '/event/webhook', payload.spoctoId);
    return new Promise(async (resolve, reject) => {
        let data = {};
        try {
            data = {
                "custid": payload.customerId,
                "spoctoid": payload.spoctoId,
                "loan_account_number": payload.accountNo,
                "event": payload.step === '6' ? '7' : payload.step,
                'language': payload['languages'] || "",
                "prompt": "play_prompt"
            };
        } catch (err) {
            reject(err);
            return;
        }
        logInfoAsync(JSON.stringify(data), '/event/webhook', payload.spoctoId);
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${apiURL['CONVERSATIONAL_WEBHOOK']}/${botID}/${payload.sessionId}`,
            headers: {
                'X-Signature-SHA256': generateHMACKey(JSON.stringify(data)),
                'Content-Type': 'application/json'
            },
            data: data
        };
        httpClient.config(config).then((res) => {
            resolve(res.data);
            logInfoAsync(JSON.stringify(res.data), '/event/webhook', payload.spoctoId);
        }).catch((err) => {
            logErrorAsync(err, '/event/webhook', payload.spoctoId);
            reject(err);
        })
    })
}

module.exports = {
    getlogData,
    updateLogTable,
    InsertDetailLog,
    InsertLog,
    eventConversationalBot
}