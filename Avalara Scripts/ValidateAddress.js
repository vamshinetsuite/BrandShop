/*
**************************************************************************************  
** Copyright (c) 2003-2014                               
** NetScore Technologies Private Limited
** 8300 Boone Boulevard, Suite 500
** Vienna, VA 22182 
** Phone 703-599-9282
** www.netscoretech.com 
** All Rights Reserved.                                                    
**                                                                         
** This code is the confidential and proprietary information of          
** NetScore Technologies Private Limited ("Confidential Information"). You shall not               
** disclose such Confidential Information and shall use it only in          
** accordance with the terms of the license agreement you entered into    
** with NetScore.
                  
** Description:This script is defined to validate address and send response to caller client script                   
** @author: Sirisha
** @dated: 5-25-2016
** @version: 1.0
** @Function:Suitelet
** @Clinet:BrandShop
**************************************************************************************
*/

function validateAddress(request, response) {
     try {
         var customerId = request.getParameter('customerId');
         var shippingaddress = request.getParameter('selctedAddress');
         nlapiLogExecution('ERROR', 'customerId', customerId);
         var record = nlapiLoadRecord('customer', customerId, {
             recordmode: 'dynamic'
         });
         var addressString ='';
         var count = record.getLineItemCount('addressbook');
         for (var i = 1; i <= count; i++) {
             var id = record.getLineItemValue('addressbook', 'internalid', i);
             //IF ADDRESS ID IS EQUAL TO SELCTED SHIP ADDRESS IN SALES ORDER THEN EDIT SURECORD AND SET VALIDATED ADDRESS
             if (shippingaddress == id) {
                 record.selectLineItem('addressbook', i);
                 //READ ADDRESS SUBRECORD AND STORE VALUES
				 var addressSubrecord = record.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
                 if (addressSubrecord) {                    
                     //READ REQUIRED ADDRESS SUBRECORD FIELDS
                     var country = addressSubrecord.getFieldValue('country');
                     var line1 = addressSubrecord.getFieldValue('addr1');
                     var line2 = addressSubrecord.getFieldValue('addr2');
                     var regn = addressSubrecord.getFieldValue('state');
                     var zip = addressSubrecord.getFieldValue('zip');
                     var city = addressSubrecord.getFieldValue('city');
                     var ParmValue = 'Line1=' + line1 + '&Line2=' + line2 + '&City=' + city + '&Region=' + regn + '&PostalCode=' + '' + '&Country=' + country;

                     ParmValue = ParmValue.replace(/ /g, "+");
                     nlapiLogExecution('ERROR', 'ParmValue', ParmValue);
                     //URL TO VALDIATE ADDRESS
                     var URL = 'https://development.avalara.net/1.0/address/validate.xml?' + ParmValue;
                     var Headers = {
                         "Authorization": "Basic dmFtc2lAbmV0c2NvcmV0ZWNoLmNvbTpNdms0YTA5Mg==",
                         "Content-Type": "application/json"
                     };
                
                 var shipvalidated = 'T';
                 var shipaddressError = '';
				//CALL AVALARA URL TO VALDIATE ADDRESS
                 var req = nlapiRequestURL(URL, null, Headers, null, 'GET');
                 var body = req.getBody();
                 nlapiLogExecution('ERROR', 'body', body);
                 var xml = nlapiStringToXML(body);
                 nlapiLogExecution('ERROR', 'xml', xml);
                 //GET VALIDATED ADDRESS
                 var sline1 = nlapiSelectValue(xml, 'ValidateResult/Address/Line1'),
                     scity = nlapiSelectValue(xml, 'ValidateResult/Address/City'),
                     srgn = nlapiSelectValue(xml, 'ValidateResult/Address/Region'),
                     sposcode = nlapiSelectValue(xml, 'ValidateResult/Address/PostalCode'),
                     sresCode = nlapiSelectValue(xml, 'ValidateResult/ResultCode'),
                     scountry = nlapiSelectValue(xml, 'ValidateResult/Address/Country');
				//EDIT ADDRESS SUBRECORD IN CUSTOMER RECORD AND SET ALL ADDRESS VALUES
                 var obj = record.editCurrentLineItemSubrecord('addressbook', 'addressbookaddress');

                 nlapiLogExecution('ERROR', 'sresCode', sresCode);
                 if (sresCode=='Error') {
                   var errorSummary = nlapiSelectValue(xml, 'ValidateResult/Messages/Message/Summary');
				 addressString= 'false'+'_'+errorSummary;
				   nlapiLogExecution('ERROR', 'addressString', addressString);
                 }else{				  
					obj.setFieldValue('country', scountry);
					obj.setFieldValue('addr1', sline1);
					obj.setFieldValue('addr2', "");
					obj.setFieldValue('state', srgn);
					obj.setFieldValue('zip', sposcode);
					obj.setFieldValue('city', scity);
					addressString = 'true'+'_'+sline1 + '_' + scity + '_' + srgn + '_' + sposcode + '_'+scountry;
					obj.setFieldValue('custrecord_bs_ava_address_validated', shipvalidated);
					obj.setFieldValue('custrecord_bs_ava_address_error', shipaddressError);
					var p = obj.commit();
					record.setCurrentLineItemValue('addressbook', 'defaultshipping', 'T');
					record.commitLineItem('addressbook');
					nlapiLogExecution('ERROR', 'addressString', addressString);
				 }                 
				}
             }
         }
         var cid = nlapiSubmitRecord(record, true, true);
         response.write(addressString);
         nlapiLogExecution('ERROR', 'e', cid);
       
     } catch (e) {
         nlapiLogExecution('ERROR', 'e', e);
     }
 }