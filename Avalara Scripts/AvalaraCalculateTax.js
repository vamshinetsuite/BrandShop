/*
**************************************************************************************  
** Copyright 2003-2014                               
** NetScore Technologies.
** All Rights Reserved.                                                     
**                                                                         
** This code is the confidential and proprietary information of          
** NetScore Technologies Private Limited ("Confidential Information"). You shall not               
** disclose such Confidential Information and shall use it only in          
** accordance with the terms of the license agreement you enlineamounttered into    
** with NetScore.

**Description:  
**This script is defined to
** 1.Calcualte Ava tax on save of sales order and create Avalara sales invoice tax document in avalara with status uncommitted 
** 2.Create Auto cash sale or invoice on fulfillment
** 3.Commit Avalara sales invoice tax document  on save of cash sale or invoice if order is fully billed.
** 4.Create Return Invoice in Avalara on RMA creation in NetSuite

** Operation types:userEventBeforeSubmit,userEventAfterSubmit
** Deployed on :Sales order                
** @libraries used:
** @client:	BRAND SHOP
** @author: SIRISHA
** @dated: 	MAR-10-2016
** @type: USER EVENT
** @version: 1.0
**************************************************************************************/
function calculateAvaTax(type) {

    var currentContext = nlapiGetContext();
    var executionContext = currentContext.getExecutionContext();
    var recType = nlapiGetRecordType();
    nlapiLogExecution('ERROR', 'recType', recType);
    if (executionContext == 'userinterface') {

        if (recType == 'salesorder') {
            try {
			 var id = nlapiGetRecordId();
                var obj = nlapiLoadRecord(recType, id);
			var department=obj.getFieldValue('department');
		if(department==18){
               
                var status = obj.getFieldValue('status');
                //IF ORDER STATUS IS CLOSED,THEN VOID SALES TAX DOCUMENT IN AVALARA
                if (status == 'Closed' && recType == 'salesorder') {
					//GET AVA TAX DOCUMENT STORED IN SALES ORDER,IF DOCUMENT ID EXISTS
                    var docId = obj.getFieldValue('custbody_bs_ava_tax_doc_id')
                    if (docId) {
                        var jsonstring = "";
                        jsonstring += '{';
                        jsonstring += '"CompanyCode":' + '"BShopEmerson"';
                        jsonstring += ',"DocCode":' + '"' + docId + '"';
                        jsonstring += ',"DocType":' + '"SalesInvoice"';
                        jsonstring += ',"CancelCode":' + '"DocVoided"';
                        jsonstring += '}';
						//AVALARA TAX CANCELATION REQUEST URL
                        var taxURL = 'https://development.avalara.net/1.0/tax/cancel';
                        var Headers = {
                            "Authorization": "Basic dmFtc2lAbmV0c2NvcmV0ZWNoLmNvbTpNdms0YTA5Mg==",
                            "Content-Type": "application/json"
                        };
                        var taxReq = nlapiRequestURL(taxURL, jsonstring, Headers, null, 'POST');
                        var body = taxReq.getBody();
                        nlapiLogExecution('ERROR', 'body', body);
                        var JSONVal = JSON.parse(body);
                        nlapiLogExecution('ERROR', 'JSONVal', JSONVal);
                        var taxStatus = JSONVal.ResultCode;
                        if (taxStatus == 'Success') {
                            nlapiSubmitField(recType, id, 'custbody_bs_ava_tax_err', 'Tax Document Voided');

                        }
                    }
                }
                
            } 
			}catch (e) {
                nlapiLogExecution('ERROR', 'e', e);
            }
        }

        //TRANSFORM SALES ORDER TO CASHSALE OR INVOCIE ON SAVE OF ITEM FULFILLMENT IF TYPE IS CREATE AND STATUS IS SHIPPED
        if (recType == 'itemfulfillment') {
            try {
                if (type=='create') 
                {
                    var fullFillId = nlapiGetRecordId();
                    var itemFullfilmentObj = nlapiLoadRecord('itemfulfillment', fullFillId);
                    var soId = itemFullfilmentObj.getFieldValue('createdfrom');
                    var shipStatus = itemFullfilmentObj.getFieldValue('shipstatus');
                    var cashSaleObj = '';
                    nlapiLogExecution('Error', 'shipStatus', shipStatus);
					//IF STATUS IS SHIPPED,TRANSAFORM TO SALES ORDER TO BILL
                    if (shipStatus == 'C') {
                        try {
						//IF CASH SALE
                            cashSaleObj = nlapiTransformRecord('salesorder', soId, 'cashsale');
                        } catch (e) {
						//IF INVOICE
                            cashSaleObj = nlapiTransformRecord('salesorder', soId, 'invoice');
                        }
                        if (cashSaleObj) {
                            //cashSaleObj.setFieldValue('undepfunds', 'F');
							var shippingTaxRate=cashSaleObj.getFieldValue('custbody_ava_bs_shipping_tax');
							if(shippingTaxRate)
							cashSaleObj.setFieldValue('shippingtax1rate',shippingTaxRate);
                            var itemFullfilmentCount = cashSaleObj.getLineItemCount('item');
                            var FulfilItems = new Array();
							//PUSH ITEMS AND QTY OF FULFILMENT RECORD TO AN ARRAY,SO THAT BILL WILL BE CREATED ONLY FOR FULFILLED ITEMS
						   for (var k = 1; k <= itemFullfilmentCount; k++) {
                                var ItemId = itemFullfilmentObj.getLineItemValue('item', 'item', k);
                                var qty = itemFullfilmentObj.getLineItemValue('item', 'quantity', k);
                           var integrationTaxRate = itemFullfilmentObj.getLineItemValue('item', 'custcol_bs_tax_amount', k);
                                if (ItemId)
                                    FulfilItems.push({
                                        ItemId: ItemId,
                                        qty: qty,
                                        integrationTaxRate: integrationTaxRate
                                    })
                            }

                            var cashSaleCount = cashSaleObj.getLineItemCount('item');
							//UPDATED ITEMS AND QTY IN CASH SALE AS PER ITEM FULFILLMENT
                            for (var i = cashSaleCount; i >= 1; i--) {
                                var flag = false;
                                var itemExist = false;
                                var item = cashSaleObj.getLineItemValue('item', 'item', i);
                                var rate = cashSaleObj.getLineItemValue('item', 'rate', i);
                                for (var s = 0; s < FulfilItems.length; s++) {

                                    var itemId = FulfilItems[s].ItemId;
                                    if (item == itemId) {
                                        cashSaleObj.setLineItemValue('item', 'quantity', i, FulfilItems[s].qty);
                                        var lineAmount = rate * (FulfilItems[s].qty);
                                       // var taxAmount = (FulfilItems[s].integrationTaxRate) * FulfilItems[s].qty;
                                       // var taxratecal = (taxAmount * 100) / lineAmount;
									   var taxratecal =Number((FulfilItems[s].integrationTaxRate));
                                        cashSaleObj.setLineItemValue('item', 'taxrate1', i, taxratecal);

                                        flag = false;
                                        itemExist = true;
                                    } else {
                                        if (!itemExist)
                                            flag = true;
                                    }
                                }
                                nlapiLogExecution('Error', 'flag', flag);
                                if (flag)
                                    cashSaleObj.removeLineItem('item', i);
                            }
                            var billRecordType = cashSaleObj.getRecordType();
                            nlapiLogExecution('Error', 'billRecordType', billRecordType);
                            var SubmitRec = nlapiSubmitRecord(cashSaleObj, true, true);
                            var salesObj = nlapiLoadRecord('salesorder', soId);
                            var salesStatus = salesObj.getFieldValue('status');
                            var avaDoc = salesObj.getFieldValue('custbody_bs_ava_tax_doc_id');
                          
                          if ((salesStatus == 'fullyBilled' || salesStatus == 'Closed' || salesStatus == 'Billed') && avaDoc) {
                                commitAvalara(SubmitRec, billRecordType);

                            }


                        }
                    }
                }
            } catch (e) {
                nlapiLogExecution('Error', 'e', e);
            }
        } 
		if (recType == 'cashsale' || recType == 'invoice') {
		try{
			var recordId=nlapiGetRecordId();
			var billRecordType=recType;
			var salesOrderObj = nlapiLoadRecord('salesorder', recordId);
			var salesStatus = salesObj.getFieldValue('status');
            var avaDoc = salesObj.getFieldValue('custbody_bs_ava_tax_doc_id');
				if ((salesStatus == 'fullyBilled' || salesStatus == 'Closed' || salesStatus == 'Billed') && avaDoc) {
                    commitAvalara(recordId, billRecordType);

                   }
		}catch(e){
		nlapiLogExecution('Error', 'e', e);
		}
		}
    }

    /*IF CASH SALES IS CRETED IN NETSUITE THEN CHANGE TAX DOCUMENT COMMIT STATUS TO TRUE IN AVALARA*/

    if (recType == 'returnauthorization') {
        if (executionContext == 'userinterface') {
            try {

                var recId = nlapiGetRecordId();
                var rma = nlapiLoadRecord('returnauthorization', recId);
                //nlapiLookupField('returnauthorization',recId,['custbody_bs_ava_tax_doc_id,trandate']);
                var taxDocId = rma.getFieldValue('custbody_bs_ava_tax_doc_id');
                var createdFrom = rma.getFieldText('createdfrom');
                nlapiLogExecution('ERROR', 'createdFrom', createdFrom);
                var preOrderId = '';
                var soId = '';
                if (createdFrom.indexOf('Sales Order') > -1) {
                    soId = rma.getFieldValue('createdfrom');
                }
                if (soId) {
                    var soObj = nlapiLoadRecord('salesorder', soId);
                    //VIEW ADDRESS SUBRECORD BODY FIELD IN SALES ORDER
                    var addressSubrecord = soObj.viewSubrecord('shippingaddress');
                    //READ REQUIRED ADDRESS SUBRECORD FIELDS
                    var country = addressSubrecord.getFieldValue('country'), //Country must be set before setting the other address fields
                        line1 = addressSubrecord.getFieldValue('addr1');
                    line2 = addressSubrecord.getFieldValue('addr2');
                    city = addressSubrecord.getFieldValue('city');
                    regn = addressSubrecord.getFieldValue('dropdownstate');
                    zip = addressSubrecord.getFieldValue('zip');

                    //var preOrderId=nlapiLookupField('salesorder',soId,'createdfrom');
                    /* var preOrderId = soObj.getFieldValue('createdfrom');
                     var taxDate = nlapiLookupField('estimate', preOrderId, 'trandate');*/
                    var taxDate = soObj.getFieldValue('trandate');
                    nlapiLogExecution('ERROR', 'taxDate', taxDate);
                    taxDate = nlapiStringToDate(taxDate);
                    var taxFormattedDate = GetFormattedDate(taxDate);
                    var tranDate = rma.getFieldValue('trandate');
                    tranDate = nlapiStringToDate(tranDate);
                    var customerName = soObj.getFieldText('entity');
                    var formattedDate = GetFormattedDate(tranDate);
                    //GET LINE ITEMS & STORE IN A MAP OBJECT
                    var count = rma.getLineItemCount('item');
                    var map = [];
                    var originCode = '01';
                    var destinationCode = '02';
                    //add shipping item
                    var shipCarrier = rma.getFieldText('shipmethod');
                    var shipLine = count + 1;
                    var amount = rma.getFieldValue('shippingcost');
                    if (shipCarrier) {
                        map[item] = [{
                            lineIndex: shipLine,
                            item: shipCarrier,
                            amount: amount,
                            qty: 1,
                            itemCode: shipCarrier,
                            taxcode: "",
                            originCode: originCode,
                            destinationCode: destinationCode
                        }];
                    }

                    for (var i = 1; i < count + 1; i++) {

                        var item = rma.getLineItemText('item', 'item', i);
                        var qty = rma.getLineItemValue('item', 'quantity', i);
                        var amount = rma.getLineItemValue('item', 'amount', i);
                        amount = Number(amount) * (-1);
                        var itemCode = rma.getLineItemValue('item', 'custcol_bs_ava_upc', i);
						if(!itemCode)
						itemCode = rma.getLineItemValue('item', 'item', i);
                        var taxcode = rma.getLineItemValue('item', 'custcol_taxcode', i);

                        //check if it is tax item added in netsuite,if so ignore it sending to avalara

                        if (map[item] == undefined) {
                            map[item] = [{
                                lineIndex: i,
                                item: item,
                                amount: amount,
                                qty: qty,
                                itemCode: itemCode,
                                taxcode: taxcode,
                                originCode: originCode,
                                destinationCode: destinationCode
                            }];
                        } else {
                            map[item].push({
                                lineIndex: i,
                                item: item,
                                amount: amount,
                                qty: qty,
                                itemCode: itemCode,
                                taxcode: taxcode,
                                originCode: originCode,
                                destinationCode: destinationCode
                            });
                        }


                    }
                    var jsonstring = "";
                    jsonstring += '{';
                    jsonstring += '"CustomerCode":' + '"' + customerName + '"';
                    jsonstring += ',"CompanyCode":' + '"BShopEmerson"';
                    jsonstring += ',"DocDate":' + '"' + formattedDate + '"';
                    jsonstring += ',"DocCode":' + '"' + taxDocId + '"';
                    jsonstring += ',"DocType":' + '"ReturnInvoice"';
                    jsonstring += ',"TaxOverride":{';
                    jsonstring += '"TaxOverrideType":' + '"TaxDate"';
                    jsonstring += ',"Reason":' + '"Adjustment for return"';
                    jsonstring += ',"TaxDate":' + '"' + taxFormattedDate + '"';
                    jsonstring += ',"TaxAmount":' + '"0"';
                    jsonstring += "},";
                    jsonstring += '"Addresses":[';
                    jsonstring += '{';
                    jsonstring += '"AddressCode":' + '"01"';
                    jsonstring += ',"Line1":' + '"20 Constitution Blvd S"';
                    jsonstring += ',"City":' + '"Shelton"';
                    jsonstring += ',"Region":' + '"CT"';
                    jsonstring += ',"Country":' + '"US"';
                    jsonstring += ',"PostalCode":' + '"06484"';
                    jsonstring += "},";

                    jsonstring += '{';
                    jsonstring += '"AddressCode":' + '"02"';
                    jsonstring += ',"Line1":' + '"' + line1 + '"';
                    jsonstring += ',"City":' + '"' + city + '"';
                    jsonstring += ',"Region":' + '"' + regn + '"';
                    jsonstring += ',"Country":' + '"' + country + '"';
                    jsonstring += ',"PostalCode":' + '"' + zip + '"';
                    jsonstring += "}";
                    jsonstring += "],";

                    if (Object.keys(map).length > 0) {
                        var temp = 1;
                        jsonstring += '"Lines":[';

                        for (var key in map) {
                            var itemsArray = map[key];
                            for (var j = 0; j < itemsArray.length; j++) {
                                jsonstring += '{ "LineNo":' + '"' + itemsArray[j].lineIndex + '"' + ',"ItemCode":' + '"' + itemsArray[j].itemCode + '"' + ',';
                                jsonstring += '"TaxCode":' + '"' + itemsArray[j].taxcode + '"' + ',"Qty":' + '"' + itemsArray[j].qty + '"' + ',';
                                jsonstring += '"OriginCode":' + '"' + itemsArray[j].originCode + '"' + ',"destinationCode":' + '"' + itemsArray[j].destinationCode + '"' + ',';
                                jsonstring += '"Amount":' + '"' + itemsArray[j].amount + '"';


                            }
                            if (temp == Object.keys(map).length) {
                                jsonstring += '}';

                            } else {
                                jsonstring += '},';

                            }
                            temp = temp + 1;

                        }
                        jsonstring += ']';

                        jsonstring += '}';
                    }
                    var taxURL = 'https://development.avalara.net/1.0/tax/get';
                    var Headers = {
                        "Authorization": "Basic dmFtc2lAbmV0c2NvcmV0ZWNoLmNvbTpNdms0YTA5Mg==",
                        "Content-Type": "application/json"
                    };
                    //REQUEDT AVALARA ADRESS VALDATION URL WITH SELECTED ADDRESS FIELD PARAMS
                    var taxReq = nlapiRequestURL(taxURL, jsonstring, Headers, null, 'POST');
                    var body = taxReq.getBody();
                    nlapiLogExecution('ERROR', 'body', body);
                    var JSONVal = JSON.parse(body);

                    var taxStatus = JSONVal.ResultCode;
                    if (taxStatus == 'Success') {
                        rma.setFieldValue('custbody_bs_ava_tax_err', "");
                    } else {
                        var error = JSONVal.Messages[0].Summary;
                        rma.setFieldValue('custbody_bs_ava_tax_err', error);
                    }
                }
            } catch (e) {
                nlapiLogExecution('ERROR', 'e', e);
            }
        }
    }



}

function GetFormattedDate(tranDate) {
    nlapiLogExecution('ERROR', 'tranDate', tranDate);
    var month = tranDate.getMonth() + 1;
    if ((month.toString()).length == 1)
        month = '0' + month;
    var day = tranDate.getDate();
    if ((day.toString()).length == 1)
        day = '0' + day;
    var year = tranDate.getFullYear();
    var newDate = year + "-" + month + "-" + day;
    return newDate;
}
/*CUSTOM FUNCTION TO COMMIT TRANSACTION */
function commitAvalara(SubmitRec, billRecordType) {
    nlapiLogExecution('ERROR', SubmitRec, billRecordType);
    if (billRecordType == 'cashsale' || billRecordType == 'invoice') {

        try {
            var cashSaleId = SubmitRec;
            var inv = nlapiLoadRecord(billRecordType, cashSaleId);
            //var soId=nlapiLookupField(recordType,cashSaleId,'createdfrom');
            var soId = inv.getFieldValue('createdfrom');
            nlapiLogExecution('ERROR', 'soId', soId);
            if (soId) {
                var obj_SalesOrder = nlapiLoadRecord('salesorder', soId);
                var customerName = obj_SalesOrder.getFieldText('entity');
                //var tranId = nlapiLookupField('estimate', estimateTranId, 'tranid');
                var docId = obj_SalesOrder.getFieldValue('custbody_bs_ava_tax_doc_id');
                nlapiLogExecution('ERROR', 'docId', docId);
                if (docId) {
                    var tranDate = obj_SalesOrder.getFieldValue('trandate');
                    tranDate = nlapiStringToDate(tranDate);
                    var formattedDate = GetFormattedDate(tranDate);
                    var soStatus = obj_SalesOrder.getFieldValue('status');;
                    nlapiLogExecution('ERROR', 'soStatus', soStatus);
                    // var selctedAddress = obj_SalesOrder.getFieldValue('shipaddresslist');
                    // if (soStatus == 'Billed' || soStatus == 'Closed')
                    {
                        //VIEW ADDRESS SUBRECORD BODY FIELD IN SALES ORDER
                        var addressSubrecord = obj_SalesOrder.viewSubrecord('shippingaddress');

                        //READ REQUIRED ADDRESS SUBRECORD FIELDS
                        var country = addressSubrecord.getFieldValue('country'), //Country must be set before setting the other address fields
                        line1 = addressSubrecord.getFieldValue('addr1');
                        line2 = addressSubrecord.getFieldValue('addr2');
                        city = addressSubrecord.getFieldValue('city');
                        regn = addressSubrecord.getFieldValue('dropdownstate');
                        zip = addressSubrecord.getFieldValue('zip');

                        //GET LINE ITEMS & STORE IN A MAP OBJECT
                        var count = obj_SalesOrder.getLineItemCount('item');
                        var map = [];
                        var originCode = '01';
                        var destinationCode = '02';
                        var flag = false;

                        //add shipping item
                        var shipCarrier = obj_SalesOrder.getFieldText('shipmethod');
                        var shipLine = count + 1;
                        var amount = obj_SalesOrder.getFieldValue('shippingcost');
                        if (shipCarrier) {
                            map[item] = [{
                                lineIndex: shipLine,
                                item: shipCarrier,
                                amount: amount,
                                qty: 1,
                                itemCode: shipCarrier,
                                taxcode: "",
                                originCode: originCode,
                                destinationCode: destinationCode
                            }];
                        }
                        //add line items to map object
                        for (var i = 1; i <= count; i++) {

                            var item = obj_SalesOrder.getLineItemText('item', 'item', i);
                            var itemCodee = obj_SalesOrder.getLineItemValue('item', 'custcol_bs_ava_upc', i);
							if(!itemCodee)
							itemCodee=obj_SalesOrder.getLineItemValue('item', 'item', i);
                            var qty = obj_SalesOrder.getLineItemValue('item', 'quantity', i);
                            var amount = obj_SalesOrder.getLineItemValue('item', 'amount', i);
                            //var itemCode = obj_SalesOrder.getLineItemValue('item', 'custcol_itemcode', i);
                            var taxcode = obj_SalesOrder.getLineItemValue('item', 'custcol_taxcode', i);
                            var isClosed = obj_SalesOrder.getLineItemValue('item', 'isclosed', i);
                            if (isClosed != 'T') {
                                flag = true;
                                if (map[item] == undefined) {
                                    map[item] = [{
                                        lineIndex: i,
                                        item: item,
                                        amount: amount,
                                        qty: qty,
                                        itemCode: itemCodee,
                                        taxcode: taxcode,
                                        originCode: originCode,
                                        destinationCode: destinationCode
                                    }];
                                } else {
                                    map[item].push({
                                        lineIndex: i,
                                        item: item,
                                        amount: amount,
                                        qty: qty,
                                        itemCode: itemCodee,
                                        taxcode: taxcode,
                                        originCode: originCode,
                                        destinationCode: destinationCode
                                    });
                                }
                            }

                        }
                        //form json string with header details
                        var jsonstring = "";
                        jsonstring += '{';
                        jsonstring += '"CustomerCode":' + '"' + customerName + '"';
                        jsonstring += ',"CompanyCode":' + '"BShopEmerson"';
                        jsonstring += ',"DetailLevel":' + '"Tax"';
                        jsonstring += ',"Commit":' + '"true"';
                        jsonstring += ',"DocCode":' + '"' + docId + '"';
                        jsonstring += ',"DocType":' + '"SalesInvoice"';
                        jsonstring += ',"TaxOverride":{';
                        jsonstring += '"TaxOverrideType":' + '"TaxDate"';
                        jsonstring += ',"Reason":' + '"Adjustment for return"';
                        jsonstring += ',"TaxDate":' + '"' + formattedDate + '"';
                        jsonstring += ',"TaxAmount":' + '"0"';
                        jsonstring += "},";
                        jsonstring += '"Addresses":[';
                        jsonstring += '{';
                        jsonstring += '"AddressCode":' + '"01"';
                        jsonstring += ',"Line1":' + '"20 Constitution Blvd S"';
                        jsonstring += ',"City":' + '"Shelton"';
                        jsonstring += ',"Region":' + '"CT"';
                        jsonstring += ',"Country":' + '"US"';
                        jsonstring += ',"PostalCode":' + '"06484"';
                        jsonstring += "},";

                        jsonstring += '{';
                        jsonstring += '"AddressCode":' + '"02"';
                        jsonstring += ',"Line1":' + '"' + line1 + '"';
                        jsonstring += ',"City":' + '"' + city + '"';
                        jsonstring += ',"Region":' + '"' + regn + '"';
                        jsonstring += ',"Country":' + '"' + country + '"';
                        jsonstring += ',"PostalCode":' + '"' + zip + '"';
                        jsonstring += "}";
                        jsonstring += "],";
                        //append line details to json
                        if (Object.keys(map).length > 0) {
                            if (flag == true) {
                                var temp = 1;
                                jsonstring += '"Lines":[';
                                for (var key in map) {
                                    var itemsArray = map[key];
                                    for (var j = 0; j < itemsArray.length; j++) {
                                        jsonstring += '{ "LineNo":' + '"' + itemsArray[j].lineIndex + '"' + ',"ItemCode":' + '"' + itemsArray[j].itemCode + '"' + ',';
                                        jsonstring += '"TaxCode":' + '"' + itemsArray[j].taxcode + '"' + ',"Qty":' + '"' + itemsArray[j].qty + '"' + ',';
                                        jsonstring += '"OriginCode":' + '"' + itemsArray[j].originCode + '"' + ',"destinationCode":' + '"' + itemsArray[j].destinationCode + '"' + ',';
                                        jsonstring += '"Amount":' + '"' + itemsArray[j].amount + '"';

                                    }
                                    if (temp == Object.keys(map).length) {
                                        jsonstring += '}';

                                    } else {
                                        jsonstring += '},';

                                    }
                                    temp = temp + 1;
                                }
                                jsonstring += ']';
                                jsonstring += '}';
                                var taxURL = 'https://development.avalara.net/1.0/tax/get';
                                var Headers = {
                                    "Authorization": "Basic dmFtc2lAbmV0c2NvcmV0ZWNoLmNvbTpNdms0YTA5Mg==",
                                    "Content-Type": "application/json"
                                };
                                nlapiLogExecution('ERROR', 'jsonstring', jsonstring);
                                var taxReq = nlapiRequestURL(taxURL, jsonstring, Headers, null, 'POST');
                                var body = taxReq.getBody();
                                nlapiLogExecution('ERROR', 'body', body);
                            }
                        }

                    }
                }
            }

        } catch (e) {
            var errorid = nlapiGetRecordId();
            nlapiLogExecution('ERROR', 'e', e);
        }
    }

}

function populateAvaTax(type) {
    var currentContext = nlapiGetContext();
    var executionContext = currentContext.getExecutionContext();

    try {
        var recordType = nlapiGetRecordType();
        if (recordType == 'returnauthorization' || recordType=='cashsale' || recordType=='invoice') {
            var salesOrderId = nlapiGetFieldValue('createdfrom');
            if (salesOrderId) {
                var soObj = '';
                soObj = nlapiLoadRecord('salesorder', salesOrderId);
                if (soObj) {
                  
                    var taxCode = soObj.getFieldValue('shippingtaxcode');
                    var taxRate = soObj.getFieldValue('shippingtax1rate');
                    if (taxCode)
                        nlapiSetFieldValue('shippingtaxcode', taxCode);
                    if (taxRate)
                        nlapiSetFieldValue('shippingtax1rate', taxRate);



                    var count = nlapiGetLineItemCount('item');
                    if (count > 0) {
                        for (var i = 1; i <= count; i++) {
                         // var customTaxAmount_Single = nlapiGetLineItemValue('item', 'custcol_bs_tax_per_unit', i);
                            var customTaxAmount = 0;
                            var ItemQty = nlapiGetLineItemValue('item', 'quantity', i);
							nlapiLogExecution('ERROR', 'ItemQty', ItemQty);
                            //if (customTaxAmount_Single)
                                //customTaxAmount = customTaxAmount_Single * ItemQty;
							
							customTaxAmount=nlapiGetLineItemValue('item', 'custcol_bs_tax_amount', i);
                            if (customTaxAmount > 0) {
                                var lineamount = nlapiGetLineItemValue('item', 'amount', i);
                                var taxratecal = (customTaxAmount * 100) / lineamount;
                                //obj.setLineItemValue('item','taxcode',j,-14);
                                nlapiSetLineItemValue('item', 'taxrate1', i, customTaxAmount);
                                nlapiLogExecution('ERROR', 'taxrate', taxratecal);
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'e', e);
    }
}