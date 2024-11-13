const srGenerationStaticPayload = {
    "CampaignKey": "702124",
    "AssignToCode": "446789",
    "Custom": {
        "Source_of_Lead_l": "6",
        "Transaction_ID_l": "343805",
        "Product_Sub_Type_l": "GLD",
        "Routing_Parameter_l": "5",
        "FieldID_279": "19863",
        "SUB_Agent_code_l": "sdsdg",
        "Business_Line_l": "25",
        "Loan_Amount_l": "",
        "NRE_Account_l": "1",
        "PAN_Number_l": "BQCDF9234E",
        "GA_ID_l": "test",
        "FED_ID_l": "test1",
        "NTB_ID_l": "test2",
        "UTM_Campaign_l": "comment",
        "ITM_l": "test3"
    },
    "Email": "",
    "FirstName": "",
    "IsDedupeSearch": "true",
    "LastName": "",
    "LayoutKey": "102166",
    "LeadOwnerKey": "1",
    "LeadOwnerTypeID": "446789",
    "MiddleName": "",
    "MobilePhone": "",
    "ProductCategoryID": "2001",
    "ProductKey": "2004",
    "RatingKey": "1",
    "SalutationKey": "1",
    "StatusCodeKey": "144"
}

const kaleryaStandardStatus = {
    FAILED: "FAILED",
    NOANSWER: "NOANSWER",
    CANCEL: "CANCEL",
    CONGESTION: "CONGESTION",
    BUSY: "BUSY"
}

const errorMessage = {
    INTERNAL_ERROR: "Internal Server Error",
    BAD_REQUEST: "Bad Request",
    API_ERROR: "Some Error in API",
    SUCCESS: "SUCCESS",
    NO_DATA: "No Data Found"
}

const rejectErrorFormat = {
    "message": "",
    "spoctoId": "",
    "mobile": "",
    "errorURL": "",
    "error": true
}

const successResponseFormat = {
    "statusCode": "200",
    "data": "",
    "message": "success"
}

const errorResponseFormat = {
    "statusCode": "501",
    "error": "error",
    "message": "No Data Found"
}

const logStepMessage = {
    NINTYNINE: {
        STEPID: "0",
        STEPTEXT1: "LINK_EXPIRED",
        STEPTEXT2: "DATA_PERGUED",
        STEPTEXT3: "Offer Not Available",
        STEPTEXT4: "Error from thankyou page",
        STEPTEXT5: "Error in GCA data decryption"
    },
    ONE: {
        STEPID: "1",
        STEPTEXT: "Customer visited Kisan Credit Card page link"
    },
    TWO: {
        STEPID: "2",
        STEPTEXT: "Customer selected language"
    },
    THREE: {
        STEPID: "3",
        STEPTEXT: "Customer Clicked on iMobile"
    },
    FOUR: {
        STEPID: "4",
        STEPTEXT: "Customer Clicked on Download iMobile"
    },
    FIVE: {
        STEPID: "5",
        STEPTEXT: "Clicked on Connect with Relationship Manager"
    },
    SIX: {
        STEPID: "6",
        STEPTEXT: "Error in Call Cnnection API"
    },
    SEVEN: {
        STEPID: "7",
        STEPTEXT: "Call not connected to caller side"
    },
    EIGHT: {
        STEPID: "8",
        STEPTEXT: "Call not connected to RM side"
    },
    NINE: {
        STEPID: "9",
        STEPTEXT: "Call duration is less than 20 sec"
    },
    TEN: {
        STEPID: "10",
        STEPTEXT: "Customer try to call after work hour"
    },
    ELEVEN: {
        STEPID: "11",
        STEPTEXT: "SR No. generated"
    }, TWELVE: {
        STEPID: "12",
        STEPTEXT: "Call duration is more than 20 sec"
    }, THIRTEEN: {
        STEPID: "13",
        STEPTEXT: "Customer Clicked on Visit Branch"
    }
}

const responseStatusCode = {
    SUCCESS: 200,
    SUCCESS_STR: "200",
    SERVICE_UNAVAILABLE: 503,
    NOT_IMPLEMENTED: 501,
    LIMIT_EXCEED: "410",
    UNPROCESSABLE: 422,
    NOT_FOUND: 404,
    BAD_REQUEST: 400


}
const logErrorMessage = {
    PAYLOAD_MISING: "payload data missing",
    DATA_MISSING: "No data is Found from engage"

}
module.exports = {
    srGenerationStaticPayload,
    rejectErrorFormat,
    successResponseFormat,
    errorResponseFormat,
    errorMessage,
    kaleryaStandardStatus,
    logStepMessage,
    responseStatusCode,
    logErrorMessage
}