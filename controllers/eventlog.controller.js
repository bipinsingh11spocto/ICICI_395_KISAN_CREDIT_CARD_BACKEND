const { decrypt } = require('../constant/cryptojs');
const { logErrorAsync } = require('../util/logger');
const { eventsService, kisancreditcardService } = require("../services");
const { logErrorMessage, responseStatusCode } = require('../constant/constVariable');
const { eventConversationalBot } = require('../services/evenlog.service');

async function addEvents(request, response) {
  let payload;
  try {
    payload = decrypt(request.body.payload);
    if (!payload.customerId || !payload.batchNo || !payload.spoctoId) {
      logErrorAsync(logErrorMessage.PAYLOAD_MISING, request.originalUrl, payload.spoctoId || "");
      return response.status(responseStatusCode.UNPROCESSABLE).json({
        "statusCode": responseStatusCode.UNPROCESSABLE
      })
    }
  }
  catch (err) {
    logErrorAsync(err, request.originalUrl, payload.spoctoId);
    return response.status(responseStatusCode.UNPROCESSABLE).json({
      "statusCode": responseStatusCode.UNPROCESSABLE,
    })
  }

  try {
    if (payload.sessionId !== 'undefined' && payload.sessionId !== undefined) {
      eventConversationalBot(payload);
    } else {
      logErrorAsync('missing sessionId', request.originalUrl, payload.spoctoId);
    }
  } catch (err) {
    logErrorAsync(err, request.originalUrl, payload.spoctoId);
  }

  try {
    // Here we are updating customer visited status in sp_Leads table.
    const customerReactionStepID = '1';
    if (payload.step === customerReactionStepID) {
      kisancreditcardService.UpdateCustomerStatusService(payload);
    }
    // initial required data
    let insertcols, insertvals;
    insertcols = 'customerid';
    insertvals = "'" + payload.customerId + "'";
    insertcols += ', batch';
    insertvals += ", '" + payload.batchNo + "'";
    insertcols += ', spoctoid';
    insertvals += ", '" + payload.spoctoId + "'";
    insertcols += ", product_type";
    insertvals += ", 'Kisan Credit Card'";
    insertcols += ', step';
    insertvals += ", '" + payload.step + "'";
    insertcols += ', step_text';
    insertvals += ", '" + payload.stepText + "'";

    const logData = await eventsService.getlogData(payload.customerId, payload.batchNo, payload.spoctoId);

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
      if (payload.languageTag !== null && payload.languageTag !== undefined) {
        updatecol += ", languages = '" + payload.languageTag + "'";
        insertcols += ', languages';
        insertvals += ", '" + payload.languageTag + "'";
      }
      else if (resData.languages != '' && resData.languages != null) {
        insertcols += ', languages';
        insertvals += ", '" + resData.languages + "'";
      }
      // storing in Db
      Promise.all([eventsService.updateLogTable(payload.customerId, payload.batchNo, payload.spoctoId, updatecol), eventsService.InsertDetailLog(insertcols, insertvals)])
        .then((res) => {
          response.status(responseStatusCode.SUCCESS).json({
            "statusCode": responseStatusCode.SUCCESS,
          })
        })
        .catch((err) => {
          logErrorAsync(err, request.originalUrl, payload.spoctoId);
          return response.status(responseStatusCode.SUCCESS).json({
            "status": responseStatusCode.SERVICE_UNAVAILABLE,
          })
        })
    }
    else {
      if (payload.accountNo !== null && payload.accountNo !== undefined) {
        insertcols += ', account_no';
        insertvals += ", '" + payload.accountNo + "'";
      }
      if (payload.outstandingAmount !== null && payload.outstandingAmount !== undefined && (payload.outstandingAmount) > 0) {
        insertcols += ', total_outstanding_amount';
        insertvals += ", '" + (payload.outstandingAmount) + "'";
      }
      if (payload.expiryDate !== null && payload.expiryDate !== undefined) {
        insertcols += ', expiry_date';
        insertvals += ", '" + (payload.expiryDate) + "'";
      }
      Promise.all([eventsService.InsertLog(insertcols, insertvals), eventsService.InsertDetailLog(insertcols, insertvals)])
        .then((res) => {
          response.status(responseStatusCode.SUCCESS).json({
            "statusCode": responseStatusCode.SUCCESS,
          })
        })
        .catch((err) => {
          logErrorAsync(err, request.originalUrl, payload.spoctoId);
          return response.status(responseStatusCode.SUCCESS).json({
            "status": responseStatusCode.SERVICE_UNAVAILABLE
          })
        })
    }
  }
  catch (err) {
    logErrorAsync(err, request.originalUrl, payload.spoctoId);
    return response.status(responseStatusCode.NOT_IMPLEMENTED).json({
      "statusCode": responseStatusCode.NOT_IMPLEMENTED,
    })
  }
};

module.exports = {
  addEvents
};