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
                  
** Description:  this script is used calculate avalara tax requesting Avalara API
**                       
** @author: Sirisha
** @dated: 5-25-2016
** @version: 1.0
** @Function: (client)
** @Client:BrandShop
**************************************************************************************
*/
function calTaxAva() {
    try {
        //GET RECORD TYPE
        var recordType = nlapiGetRecordType();
        var department = nlapiGetFieldValue('department');
        if (department == 18) {           
            //FORM AVA TAX DOCUMENT ID
            var docId = nlapiGetFieldValue('custbody_bs_ava_tax_doc_id');                       
			var selctedAddress = nlapiGetFieldValue('shipaddress');
			var adressId = nlapiGetFieldValue('shipaddresslist');
            //IF ADDRESS ID IS SELECTED VALIDATE GET ADDRESS,ELSE THROW AN ALERT
			if (adressId) {
				var customerId = nlapiGetFieldValue('entity');
				var ParmValue = '&customerId=' + customerId + '&selctedAddress=' + adressId;
				var url = nlapiResolveURL('SUITELET', 'customscript_validateaddress', 'customdeploy_validateaddress') + ParmValue;                  
				var adresponse = nlapiRequestURL(url);
				var body = adresponse.getBody();
				if (body) {
					var addresss = body.split('_');
					//End Valdiate Address
					if (addresss[0] == 'true') {//IF ADDRESS IS VALID,FORM JSON OBJECT TO SEND TO AVALARA FOR TAX CALCULATION
						var country = addresss[5];
						var line1 = addresss[1];
						var city = addresss[2];
						var regn = addresss[3];
						var zip = addresss[4];
						alert('Address Validated Successfully');
						//CUSTOM RECORD CREATION TO HAVE UNIQUE DOCUMNET ID AND STORE TAX DETAILS
						if (!docId) {
							var taxCustomRecord = nlapiCreateRecord('customrecord_bs_avalara_tax_doc_rec');
							docId = nlapiSubmitRecord(taxCustomRecord, true, true);
						}
						var customerName = nlapiGetFieldText('entity');
						var tranDate = nlapiGetFieldValue('trandate');
						var discount = nlapiGetFieldValue('discountrate');
						var percentDisc=0;
						if (discount) {
							var tempDiscount =discount.split('%');
							discount=tempDiscount[0]*(-1);
							percentDisc=discount/100
							
							//alert(discount);
						}
						tranDate = nlapiStringToDate(tranDate);
						var formattedDate = GetFormattedDate(tranDate);
						//GET LINE ITEMS & STORE IN A MAP OBJECT
						var count = nlapiGetLineItemCount('item');
						//alert(count);
						var map = [];
						nlapiLogExecution('ERROR', 'discount', discount);
						/****************************ADD SHPPING ITEM TO SEND TO AVALARA *****************/
						var originCode = '01';
						var destinationCode = '02';
						var shipCarrier = nlapiGetFieldText('shipmethod');
						var shipLine = count + 1;
						var amount = nlapiGetFieldValue('shippingcost');
						if (shipCarrier) {
							map[item] = [{
								lineIndex: shipLine,
								item: shipCarrier,
								amount: amount,
								qty: 1,
								itemCode: shipCarrier,
								taxcode: "",
								originCode: originCode,
								destinationCode: destinationCode,
								Discounted: "false"
							}];
						}
						/*******************************End SHipping****************/
						/*PUSH LINE ITEMS INTO MAP OBJECT TO SEND TO AVALARA*/
						for (var i = 1; i <= count; i++) {
						
							var item = nlapiGetLineItemText('item', 'item', i);
							var itemId=nlapiGetLineItemValue('item', 'item', i);
							var itemCode = nlapiGetLineItemValue('item', 'custcol_bs_ava_upc', i);
							if(!itemCode)
							itemCode=nlapiGetLineItemValue('item', 'item', i);
							var qty = nlapiGetLineItemValue('item', 'quantity', i);
							if (!qty)
								qty = 1;
							var amount = nlapiGetLineItemValue('item', 'amount', i);
							var taxcode = nlapiGetLineItemValue('item', 'custcol_taxcode', i);
							var originCode = '01';
							var destinationCode = '02';
							var isClosed = nlapiGetLineItemValue('item', 'isclosed', i);
							
							if(itemId!=-2){
							//alert(isClosed== 'F' || isClosed=='' || isClosed==null);
							if (isClosed== 'F' || isClosed=='' || isClosed==null) {
							//alert(map[item] == undefined);
								if (map[item] == undefined) {
								
								
									map[item] = [{
										lineIndex: i,
										item: item,
										amount: amount,
										qty: qty,
										itemCode: itemCode,
										taxcode: taxcode,
										originCode: originCode,
										destinationCode: destinationCode,
										Discounted: "true",
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
										destinationCode: destinationCode,
										Discounted: "true"
									});
								}
							}
							}

						}
						//FORM JSON STRING WHICH NEEDS TO BE SEND TO AVALARA
						var jsonstring = "";
						jsonstring += '{';
						jsonstring += '"CustomerCode":' + '"' + customerName + '"';
						jsonstring += ',"DocDate":' + '"' + formattedDate + '"';
						jsonstring += ',"CompanyCode":' + '"BShopEmerson"';
						jsonstring += ',"DetailLevel":' + '"Tax"';
						//jsonstring += ',"Discount":'+ '"' + discount + '"',
						jsonstring += ',"Commit":' + '"false"';
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
						if (Object.keys(map).length > 0) {
							var temp = 1;
							jsonstring += '"Lines":[';

							for (var key in map) {
								var itemsArray = map[key];
								for (var j = 0; j < itemsArray.length; j++) {
									jsonstring += '{ "LineNo":' + '"' + itemsArray[j].lineIndex + '"' + ',"ItemCode":' + '"' + itemsArray[j].itemCode + '"' + ',';
									jsonstring += '"TaxCode":' + '"' + itemsArray[j].taxcode + '"' + ',"Qty":' + '"' + itemsArray[j].qty + '"' + ',';
									jsonstring += '"OriginCode":' + '"' + itemsArray[j].originCode + '"' + ',"destinationCode":' + '"' + itemsArray[j].destinationCode + '"' + ',';
									jsonstring += '"Amount":' + '"' + itemsArray[j].amount + '"' + ',';
									jsonstring += '"Discounted":' + '"' + itemsArray[j].Discounted + '"';


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
						 //alert(jsonstring);
						// TAX URL TO GET TAX AND CREATE TAX DOC IN AVALARA
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
						nlapiLogExecution('ERROR', 'JSONVal', JSONVal);
						var taxStatus = JSONVal.ResultCode;
						//alert(taxStatus);
						if (taxStatus == 'Success') {
						var discountTotal=Number(nlapiGetFieldValue('discounttotal'));
							var subTotal=Number(nlapiGetFieldValue('subtotal'));
							var shipCost=Number(nlapiGetFieldValue('altshippingcost'));
							//var discountTotal=nlapiGetFieldValue('custbody_avalara_bs_tax_total');
							var handlingCost=Number(nlapiGetFieldValue('althandlingcost'));
							
							var taxLinesCount = JSONVal.TaxLines.length;
							var TotalTaxCalculated = JSONVal.TotalTaxCalculated;
							nlapiSetFieldValue('custbody_avalara_bs_tax_total', Number(TotalTaxCalculated));
							//var discTemp=Number(TotalTaxCalculated)-(Number(TotalTaxCalculated)*percentDisc);
								var discTemp=Number(TotalTaxCalculated);
							//var tDisc=(Number(discount/100)).toFixed(2);
							//alert(discTemp);
							//var test=(Number(TotalTaxCalculated)*tDisc);
							//TotalTaxCalculated=Numner(TotalTaxCalculated)+Number(test);
							//alert(TotalTaxCalculated);
							var temp=discountTotal+subTotal+shipCost+handlingCost+Number(discTemp);
							var taxableAmount = JSONVal.TotalTaxable;
							var total = temp.toFixed(2);
							//alert(total);
							//alert(count+1);
							var taxLineDetailsAmt='';
							for (var i = 0; i < taxLinesCount; i++) {
							
								var lineamount = 0;
								var lineNo = JSONVal.TaxLines[i].LineNo;
								//alert('lineNo'+lineNo);
								var taxCode = JSONVal.TaxLines[i].TaxCode;
								var taxCalculated = JSONVal.TaxLines[i].TaxCalculated;
								//alert(lineNo != count + 1);
								if (lineNo != count + 1) {
									for (var j = 1; j <= count; j++) {
										var line = j;
										if (line == lineNo) {
											lineamount = nlapiGetLineItemValue('item', 'amount', line);
											avtaxAmount = Number(taxCalculated);
											//if (lineamount > 0)
											{
												taxrate = (avtaxAmount * 100) / lineamount;
												taxrate = Number(taxrate).toFixed(2);
												//nlapiSelectLineItem('item', j);
												//nlapiSetCurrentLineItemValue('item', 'custcol_bs_tax_amount', Number(taxrate).toFixed(3));
												//nlapiCommitLineItem('item');

											}
												taxLineDetailsAmt+=line+':'+taxrate+',';
												//alert(taxLineDetailsAmt);
										}
									}

								}
								if (lineNo == count + 1) //then this is shipping tax
								{
									//alert(lineNo == count + 1+'shipping');
									var shippingCost = nlapiGetFieldValue('shippingcost');
									avtaxAmount = taxCalculated;
									if (shippingCost > 0) {
										taxrate = (avtaxAmount * 100) / shippingCost;
										nlapiSetFieldValue('custbody_ava_bs_shipping_tax', taxrate);
									}
								}

							}
							
							//nlapiSetFieldValue('taxtotal', TotalTaxCalculated);
							
							nlapiSetFieldValue('custbody_ava_bs_tax_lines', taxLineDetailsAmt);
							nlapiSetFieldValue('taxtotal', TotalTaxCalculated);
							nlapiSetFieldValue('total', total);
							nlapiSetFieldValue('getauth', "T");
							nlapiSetFieldValue('custbody_bs_ava_tax_err', "");
							nlapiSetFieldValue('custbody_bs_ava_tax_doc_id', docId);
							alert('Tax Calculated');
						} else {
							var error = JSONVal.Messages[0].Summary;
							//DISPLAY TAX ERROR IF AVALARA RETURNS ERROR
							alert('Error: '+error);
						}
					} else {
					
						//DISPLAY AVALARA ADDRESS VALIDATION ERROR,IF ADDRESS IN NOT VALID
						alert('Error: '+addresss[1]);
					}
				}
			} else {

				alert('Please Select Ship To Address');

			}		
	} else {
		alert('Please Select Department as CSR to use this functionality');
	}

} catch (e) {
	alert('error' + e.getDetails());
}


}
//THIS CUSTOM FUNCTION IS DEFINED TO FORMAT DATE
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

/*//FIELD CHANGE FUNCTION ON PROMOTION
function addSubtotalDiscount(type,name){
alert('post sourcing');
try{
if(name=='custbody_bs_header_promo')
{
alert(name);
var promo=nlapiGetFieldValue('custbody_bs_header_promo');
var discountItem=nlapiLookupField('promotioncode',promo,'discount');
alert(discountItem);
var count=nlapiGetLineItemCount('item');
if(count>0){
if(discountItem){
nlapiSelectNewLineItem('item');
nlapiSetCurrentLineItemValue('item','item',-2);
nlapiCommitLineItem('item');
nlapiSelectNewLineItem('item');
nlapiSetCurrentLineItemValue('item','item',discountItem);
nlapiSetCurrentLineItemValue('item','custcol_bs_line_promo_code',promo);
nlapiCommitLineItem('item');

}
}else{
alert('Add line items before selecting header promotion');
nlapiSetFieldValue('custbody_bs_header_promo','',false);
}
}
}catch(e){
alert(e.getCode());
}
}*/