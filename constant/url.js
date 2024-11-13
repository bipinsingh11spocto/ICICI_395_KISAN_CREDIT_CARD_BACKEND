const hybridEnctyptionUrl = {
    DEV_ENCRYPTION_URL_4002: 'http://localhost:4002/encrypt',
    DEV_ENCRYPTION_URL_4001: 'http://localhost:4001/encrypt',
    PROD_ENCRYPTION_URL_4003: 'http://localhost:4003/encrypt',
    PROD_ENCRYPTION_URL_4005: 'http://localhost:4005/encrypt',
    DEV_DECRYPTION_URL_4002: 'http://localhost:4002/decrypt',
    DEV_DECRYPTION_URL_4001: 'http://localhost:4001/decrypt',
    PROD_DECRYPTION_URL_4003: 'http://localhost:4003/decrypt',
    PROD_DECRYPTION_URL_4005: 'http://localhost:4005/decrypt',
    PROD_DECRYPTION_URL_4006: 'http://localhost:4006/decrypt',
    PROD_ENCRYPTION_URL_4006: 'http://localhost:4006/encrypt',
}


const apiURL = {
    SR_GENERATE_DEV: "https://apibankingonesandbox.icicibank.com/api/v0/CRMNext/save",
    SR_GENERATE_LIVE: "https://apibankingone.icicibank.com/api/v0/CRMNext/save",
    //CONVERSATIONAL_WEBHOOK: 'https://curie.moviusdev.ai/maya_multitenant/spocto/v1/webhook' //DEV
    CONVERSATIONAL_WEBHOOK: 'https://prd.moviusdev.ai/maya_multitenant/spocto/v1/webhook'

}

const kaleryaURL = {
    CALL_TO_CONNECT: "https://api-voice.kaleyra.com/v1/",
    CALL_TO_CONNECT_CALLBACK: "https://api-voice.kaleyra.com/v1/?callback=",
}



module.exports = {
    hybridEnctyptionUrl,
    apiURL,
    kaleryaURL
}