module.exports = {
    CALL_RESPONSE_UPDATE: `UPDATE sp_gold_loan_log set call_initiate_id=?, call_connection_status=? WHERE customerid=? and batch=? and spoctoid=?`,
    GET_LOG_DATA_QUERY: `SELECT customerid,batch,languages,spoctoid,step,product_type,step_text,account_no , total_outstanding_amount , expiry_date,DATE_FORMAT(created_date,"%Y-%m-%d %h:%i:%S") as created_date, call_duration , caller_status , rm_call_status , call_connection_status ,call_initiate_id FROM sp_gold_loan_log where customerid=? and batch=? and spoctoid=? ORDER BY id DESC Limit 1`,
    UPDATE_LOG_QUERY: `UPDATE sp_gold_loan_log SET ? WHERE customerid=? and batch=? and spoctoid=?`,
    INSERT_DETAILED_LOG: `Insert into sp_gold_loan_detailed_log ? values ?`,
    INSERT_LOG_QUERY: `Insert into sp_gold_loan_log ? values ?`,
    GET_ENGAGE_DATA_QUERY: `SELECT firstname as name, mobile, email, sp_account_number as gold_loan_acc_no, sp_principal_outstanding as total_outstanding_amount,due_date as expiry_date , flex_1 as rm_name ,flex_2 as rm_mobile_no,flex_3 as imobileTagging, flex_5 as videoFlag, language as language, flex_6 as branchAddress from sp_leads sl WHERE customerid=? and batch_no =? and spoctoid =?`,
    CUSTOMER_VISITED_STATUS_QUERY: `UPDATE sp_leads set flex_4 = "VISITED" WHERE customerid=? and batch_no=? and spoctoid=?`,
    GET_STEPS: `select step as stepId, step_text as stepText from sp_gold_loan_log sgll where customerid=? and batch=? and  spoctoid=?`

}