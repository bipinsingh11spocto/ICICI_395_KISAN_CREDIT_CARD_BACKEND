const { mysqlconnection } = require("../constant/connection");
const mysql = require("mysql");
const { httpClient } = require('./httpClent');


async function hybridEncryptDecryption(payload, url) {
    return new Promise(async (resolve, reject) => {
        httpClient.post(url, payload).then((res) => {
            resolve(res.data);
        }).catch((err) => {
            reject(err);
        })
    })
}

async function HybridApiCall(payload) {
    return new Promise(async (resolve, reject) => {
        httpClient.config(payload).then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err);
        })
    })
}
async function dbQuery(query, data) {
    return new Promise((resolve, reject) => {
        const connect = mysql.createConnection(mysqlconnection);
        connect.query(query, data, (err, data) => {
            if (err) reject(err);
            connect.end();
            resolve(data)
        })
    })
}
module.exports = {
    hybridEncryptDecryption,
    HybridApiCall,
    dbQuery
}