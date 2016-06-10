/******************************************************************************************************
	Script Name  - AVA_PostCommitFunctions.js
	Company      - Avalara Technologies Pvt Ltd.
******************************************************************************************************/

{
	var AVA_PrevFlag, AVA_NextFlag, AVA_EndPage, AVA_LineCount, recordIdArray, recordObjArray;
}

function AVA_CommittedList(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 1 ) == 0)
	{
		recordIdArray = new Array();
		recordObjArray= new Array();
		
		var AVA_TransactionForm = nlapiCreateForm('AvaTax Committed Transaction List');
		AVA_TransactionForm.setTitle('AvaTax Committed Transactions List');
		
		var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
		
		var AVA_TransactionList = AVA_BodyFields(AVA_TransactionForm, AVA_Tab);
	
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentstatus',		null, 'equalto', 3);
		
		var cols = AVA_SearchColumns();
	
		var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		
		for( ; searchresult != null; )
		{
			for(var k=0; searchresult != null && k<searchresult.length; k++)
			{
				try
				{
					recordIdArray[recordIdArray.length] = searchresult[k].getId();
					recordObjArray[recordObjArray.length] = searchresult[k];
				}
				catch(err)
				{
				}
			}
					
			filters[1] = new nlobjSearchFilter('internalid',null, 'noneof', recordIdArray);
			
			searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		}
		
		if(recordObjArray != null)
		{
			var ListStart = AVA_ResultsList(AVA_TransactionList);
			
			var FirstLink = '&lt;&lt;First Page';
			var PrevLink = 'Previous';
			var NextLink = 'Next';
			var LastLink = 'Last Page&gt;&gt;';
			
			//First Page
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart=0';
							
				FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
			}	
				
			//Previous
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
											
				PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
			}
								
			//Next
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
						
				NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
			}
			
			//Last Page
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
			
				LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
			}	
				
			AVA_TransactionForm.addField('ava_star','help','(*) indicates Transactions deleted from NetSuite').setLayoutType('outsidebelow','startrow');
			
			var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
			var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
			html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
			var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
			PagingHtml.setLayoutType('outsidebelow','startrow');
		}
			
		AVA_TransactionForm.addPageLink('breadcrumb', 'Committed Transactions', nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist'));
		response.writePage(AVA_TransactionForm);
	}
}

function AVA_VoidedList(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 13 ) == 0)
	{
		recordIdArray = new Array();
		recordObjArray= new Array();
		
		var AVA_TransactionForm = nlapiCreateForm('AvaTax Voided Transaction List');
		AVA_TransactionForm.setTitle('AvaTax Voided Transactions List');
		
		var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
		
		var AVA_TransactionList = AVA_BodyFields(AVA_TransactionForm, AVA_Tab);
	
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentstatus',		null, 'equalto', 4);
		
		var cols = AVA_SearchColumns();
	
		var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		
		for( ; searchresult != null; )
		{
			for(var k=0; searchresult != null && k<searchresult.length; k++)
			{
				try
				{
					recordIdArray[recordIdArray.length] = searchresult[k].getId();
					recordObjArray[recordObjArray.length] = searchresult[k];
				}
				catch(err)
				{
				}
			}
					
			filters[1] = new nlobjSearchFilter('internalid',null, 'noneof', recordIdArray);
			
			searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		}
		
		if(recordObjArray != null)
		{
			var ListStart = AVA_ResultsList(AVA_TransactionList);
			
			var FirstLink = '&lt;&lt;First Page';
			var PrevLink = 'Previous';
			var NextLink = 'Next';
			var LastLink = 'Last Page&gt;&gt;';
			
			//First Page
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart=0';
							
			    FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
			}	
				
			//Previous
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
												
				PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
			}
								
			//Next
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
							
				NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
			}
			
			//Last Page
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
			
				LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
			}	
				
			AVA_TransactionForm.addField('ava_star','help','(*) indicates Transactions deleted from NetSuite').setLayoutType('outsidebelow','startrow');
			
			var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
			var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
			html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
			var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
			PagingHtml.setLayoutType('outsidebelow','startrow');
		}
	
		AVA_TransactionForm.addPageLink('breadcrumb', 'Voided Transactions', nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist'));
		response.writePage(AVA_TransactionForm);
	}
}

function AVA_BodyFields(InForm, AVA_Tab)
{
	var AVA_TransactionList = InForm.addSubList('custpage_avatranslist', 'list', 'AvaTax Transactions', AVA_Tab);			

	AVA_TransactionList.addField('custrecord_ava_documentdate',			'date', 	'Document Date', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_documentinternalid',	'text', 	'AvaTax Document Number', 	'LEFT');
	AVA_TransactionList.addField('custrecord_ava_documentno',			'text', 	'NetSuite Document Number', 'LEFT');
	AVA_TransactionList.addField('custrecord_ava_documenttype',			'text', 	'AvaTax Document Type', 	'LEFT');
	AVA_TransactionList.addField('custrecord_ava_netsuitedoctype',		'text', 	'NetSuite Document Type', 	'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totalamount',			'currency', 'Total Amount', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totaldiscount',		'currency', 'Total Discount', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totalnontaxable',		'currency', 'Total Non-Taxable', 		'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totaltaxable',			'currency', 'Total Taxable', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totaltax',				'currency', 'Total Tax', 				'LEFT');

	return AVA_TransactionList;
}

function AVA_SearchColumns()
{
	var cols = new Array();
	cols[0]  = new nlobjSearchColumn('custrecord_ava_documentdate');
	cols[1]  = new nlobjSearchColumn('custrecord_ava_documentid');
	cols[2]  = new nlobjSearchColumn('custrecord_ava_documentinternalid');
	cols[3]  = new nlobjSearchColumn('custrecord_ava_documentno');
	cols[4]  = new nlobjSearchColumn('custrecord_ava_documenttype');
	cols[5]  = new nlobjSearchColumn('custrecord_ava_netsuitedoctype');
	cols[6]  = new nlobjSearchColumn('custrecord_ava_totalamount');
	cols[7]  = new nlobjSearchColumn('custrecord_ava_totaldiscount');
	cols[8]  = new nlobjSearchColumn('custrecord_ava_totaltaxable');
	cols[9]  = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
	cols[10] = new nlobjSearchColumn('custrecord_ava_totaltax');
	cols[11] = new nlobjSearchColumn('custrecord_ava_basecurrency');
	cols[12] = new nlobjSearchColumn('custrecord_ava_foreigncurr');
	cols[13] = new nlobjSearchColumn('custrecord_ava_exchangerate');
		
	return cols;	
}


function AVA_ResultsList(AVA_TransactionList)
{
	var RecordCountStart, RecordCountText;
	var j = (request.getParameter('ava_liststart')==null)? 0 : parseFloat(request.getParameter('ava_liststart'));
	AVA_LineCount = (request.getParameter('ava_linecount')==null)? 0: parseFloat(request.getParameter('ava_linecount'));
	
	var ListLimit = parseFloat(nlapiGetContext().getSetting('PREFERENCE', 'LISTSEGMENTSIZE'));
	var AVA_Flag = (request.getParameter('ava_flag')==null)? 'T' : request.getParameter('ava_flag');
	
	if(AVA_Flag == 'F')
	{
		if(AVA_LineCount>0)
		{
			if(AVA_LineCount<ListLimit)
			{
				MaxLength = parseFloat(ListLimit) + parseFloat(AVA_LineCount);
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
			else
			{
				MaxLength = (parseFloat(ListLimit) * parseFloat(2));
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
		}

	}
	
	for(var i=0; recordObjArray != null && i < ListLimit && j<recordObjArray.length && j>=0 ; i++, j++)
	{
		AVA_TransactionList.setLineItemValue('custrecord_ava_documentdate',			i+1, recordObjArray[j].getValue('custrecord_ava_documentdate'));
		AVA_TransactionList.setLineItemValue('custrecord_ava_documentinternalid',	i+1, (recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null && recordObjArray[j].getValue('custrecord_ava_documentinternalid').length > 0) ? recordObjArray[j].getValue('custrecord_ava_documentinternalid') : '*');
		
		var DocType = (recordObjArray[j].getValue('custrecord_ava_documenttype') == 2)? 'SalesInvoice' : 'ReturnInvoice';
		AVA_TransactionList.setLineItemValue('custrecord_ava_documenttype',			i+1, DocType);

		var NetDocType;
		switch(recordObjArray[j].getValue('custrecord_ava_netsuitedoctype'))
		{
			case '1':
				NetDocType = 'Invoice';
				break;
				
			case '2':
				NetDocType = 'Cash Sale';
				break;
				
			case '3':
				NetDocType = 'Credit Memo';
				break;
				
			case '4':
				NetDocType = 'Cash Refund';
				break;
				
			default:
				break;
		}
		
		if(recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null && recordObjArray[j].getValue('custrecord_ava_documentinternalid').length > 0)
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avagettaxhistory_suitelet', 'customdeploy_gettaxhistory', false);
			URL1 = URL1 + '&doctype=' + DocType +'&doccode=' + recordObjArray[j].getValue('custrecord_ava_documentinternalid') + '&rectype=' + NetDocType + '&subid=' + recordObjArray[j].getValue('custrecord_ava_subsidiaryid');
			
			var FinalURL = '<a href="' + URL1 + '" target="_blank">' + recordObjArray[j].getValue('custrecord_ava_documentno') + '</a>';
	
			AVA_TransactionList.setLineItemValue('custrecord_ava_documentno',			i+1, FinalURL);
		}
		else
		{
			AVA_TransactionList.setLineItemValue('custrecord_ava_documentno',			i+1, recordObjArray[j].getValue('custrecord_ava_documentno'));
		}
		
		AVA_TransactionList.setLineItemValue('custrecord_ava_netsuitedoctype',		i+1, NetDocType);
		AVA_TransactionList.setLineItemValue('custrecord_ava_totalamount',			i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totalamount')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totaldiscount',		i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totaldiscount')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totalnontaxable',		i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totalnontaxable')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totaltaxable',			i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltaxable')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totaltax',				i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltax')));
		
	}
	
	AVA_LineCount = i;
		
	if(AVA_Flag == 'F')
	{
		RecordCountStart = ListStart;
		var RecordEnd = parseFloat(i) + parseFloat(ListStart);
		RecordCountText = 'Records: ' + ((i==0) ? 1 : (parseFloat((RecordCountStart>=0)? RecordCountStart:0) + parseFloat(1))) + ' - ' + RecordEnd;
	}
	else
	{
		if(request.getMethod() == 'POST')
		{
			RecordCountStart = 0;
		}
		else
		{
			RecordCountStart = (request.getParameter('ava_liststart') == null)? 0:parseFloat(request.getParameter('ava_liststart'));
		}
		RecordCountText = 'Records: ' + ((i==0) ? 0 : (parseFloat(RecordCountStart) + parseFloat(1))) + ' - ' + j;
	}
	
	if(RecordCountStart>0)
  {
  	AVA_PrevFlag = 'T'; 
  }
  
  if(i==ListLimit)
  {
  	AVA_NextFlag = 'T';
  }
  
  try
  {
	  AVA_EndPage = String(parseFloat(recordObjArray.length)/parseFloat(ListLimit));
	  var AmountSplit = new Array();
	  AmountSplit = AVA_EndPage.split('.');
	  AVA_EndPage = parseFloat(AmountSplit[0]) * parseFloat(ListLimit);
	}
	catch(err)
	{
	}
	RecordCountText = RecordCountText + ' of ' + recordObjArray.length;
	AVA_TransactionList.setHelpText(RecordCountText);
	
	return j;
}


function AVA_ViewTransactions(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 12 ) == 0)
	{
		if(request.getMethod() == 'GET' || request.getMethod() == 'POST')
		{
			var AVA_TransactionForm = nlapiCreateForm('AvaTax Transactions');
			AVA_TransactionForm.setScript('customscript_avatransactionlist_client');
			AVA_TransactionForm.setTitle('AvaTax Transactions');
			
			var DateFrom 	= AVA_TransactionForm.addField('ava_datefrom',		'date',			'Starting Date');
			DateFrom.setDefaultValue(request.getParameter('ava_datefrom'));
			DateFrom.setMandatory(true);
			
			var DateTo 		= AVA_TransactionForm.addField('ava_dateto',		'date',			'Ending Date');
			DateTo.setDefaultValue(request.getParameter('ava_dateto'));
			DateTo.setMandatory(true);
			
			var DateFormat 	= AVA_TransactionForm.addField('ava_dateformat',		'text',			'Date Format');
			DateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
			DateFormat.setMandatory(true);
			DateFormat.setDisplayType('hidden');
			
			var DocumentType = AVA_TransactionForm.addField('ava_doctype',		'select',		'Document Type');
			DocumentType.addSelectOption('1', 'All');
			DocumentType.addSelectOption('2', 'SalesInvoice');
			DocumentType.addSelectOption('6', 'ReturnInvoice');
			DocumentType.setDefaultValue(request.getParameter('ava_doctype'));
			DocumentType.setMandatory(true);
		
			var DocumentStatus = AVA_TransactionForm.addField('ava_docstatus',		'select',		'Document Status');
			DocumentStatus.addSelectOption('1', 'All');
//			DocumentStatus.addSelectOption('2', 'Saved');
			DocumentStatus.addSelectOption('3', 'Committed');
			DocumentStatus.addSelectOption('4', 'Voided');
			DocumentStatus.setDefaultValue(request.getParameter('ava_docstatus'));
			DocumentStatus.setMandatory(true);
			
			var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
			
			var AVA_TransactionList = AVA_TransactionForm.addSubList('custpage_avatranslist', 'list', 'AvaTax Transactions', AVA_Tab);		
			AVA_TransactionList.addField('avainternalid', 		'text', 		'Internal Id', 					null);
			AVA_TransactionList.addField('avadocdate', 			'date', 		'Document Date', 				null);
//			AVA_TransactionList.addField('avatransid', 			'text', 		'AvaTax Transaction Id', 		null);
			AVA_TransactionList.addField('avadocno', 			'text', 		'AvaTax Document Number', 		null);
			AVA_TransactionList.addField('avanetdocno', 		'text', 		'NetSuite Transaction Number', 	null);
			AVA_TransactionList.addField('avadoctype', 			'text', 		'AvaTax Document Type', 		null);
			AVA_TransactionList.addField('avadocstatus', 		'text', 		'AvaTax Document Status', 		null);
			AVA_TransactionList.addField('avataxdate', 			'date', 		'Tax Calculation Date', 		null);
			AVA_TransactionList.addField('avatotamt', 			'currency', 	'Total Amount', 				null);
			AVA_TransactionList.addField('avatotdisc', 			'currency', 	'Total Discount', 				null);
			AVA_TransactionList.addField('avatotnontax', 		'currency', 	'Total Non-Taxable', 			null);
			AVA_TransactionList.addField('avatottaxable', 		'currency', 	'Total Taxable', 				null);
			AVA_TransactionList.addField('avatottax', 			'currency', 	'Total Tax', 					null);
			AVA_TransactionList.getField('avainternalid').setDisplayType('hidden');
	
			if((request.getParameter('ava_datefrom') != null) && (request.getParameter('ava_datefrom').length > 0))
			{
						
				//AVA_NextFlag = 'T';
				var ListStart = AVA_GetTransactionData(request.getParameter('ava_datefrom'), request.getParameter('ava_dateto'), request.getParameter('ava_doctype'), request.getParameter('ava_docstatus'), AVA_TransactionList);
				
				AVA_TransactionForm.addField('ava_linecount','integer','Line Count').setDisplayType('hidden');
				AVA_TransactionForm.getField('ava_linecount').setDefaultValue(AVA_LineCount);
				
				var FirstLink = '&lt;&lt;First Page';
				var PrevLink = 'Previous';
				var NextLink = 'Next';
				var LastLink = 'Last Page&gt;&gt;';
				
				//First Page
				if(AVA_PrevFlag == 'T')
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
					URL1 = URL1 + '&ava_liststart=0';
					
			        FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
				}	
					
				//Previous
				if(AVA_PrevFlag == 'T')
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
									
					PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
				}
									
				//Next
				if(AVA_NextFlag == 'T')
				{
					URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
				
					NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
				}
				
				//Last Page
				if(AVA_NextFlag == 'T')
				{
					URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
					URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
				
					LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
				}	
				
				AVA_TransactionForm.addField('ava_star','help','<br>(*) indicates Transactions deleted from NetSuite<br><br>').setLayoutType('outsidebelow','startrow');
				
				var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
				var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
				html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
				var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
				PagingHtml.setLayoutType('outsidebelow','startrow');
			}
	
			AVA_TransactionForm.addSubmitButton('Get Records');
			AVA_TransactionForm.addPageLink('breadcrumb', 'AvaTax Transactions', nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist'));
	
			response.writePage(AVA_TransactionForm);
		}
	}
}

function AVA_GetTransactionData(StartDate, EndDate, DocType, DocStatus, AVA_TransactionList)
{
	recordIdArray = new Array();
	recordObjArray= new Array();
	var RecordCountStart, RecordCountText;
	var filters = new Array();
	
	if(DocType == 1 && DocStatus == 1)
	{
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentdate', 	null, 'within', StartDate, EndDate);
	}
	else if(DocType == 1 && DocStatus != 1)
	{
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentdate',	null, 'within', StartDate, EndDate);
		if(DocStatus > 1)
		{
			DocStatus = (DocStatus == 2)? 1 : DocStatus;
			filters[1] = new nlobjSearchFilter('custrecord_ava_documentstatus',	null, 'equalto', DocStatus);
		}
	}	
	else	
	{
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentdate',	null, 'within', StartDate, EndDate);
		filters[1] = new nlobjSearchFilter('custrecord_ava_documenttype',	null, 'equalto', 	DocType);
		if(DocStatus > 1)
		{
			DocStatus = (DocStatus == 2)? 1 : DocStatus;
			filters[2] = new nlobjSearchFilter('custrecord_ava_documentstatus',	null, 'equalto', DocStatus);
		}
	}
	
	var cols = new Array();
	cols[0]  = new nlobjSearchColumn('custrecord_ava_documentid');
	cols[1]  = new nlobjSearchColumn('custrecord_ava_documentdate');
	cols[2]  = new nlobjSearchColumn('custrecord_ava_documentinternalid');
	cols[3]  = new nlobjSearchColumn('custrecord_ava_documentno');
	cols[4]  = new nlobjSearchColumn('custrecord_ava_documenttype');
	cols[5]  = new nlobjSearchColumn('custrecord_ava_documentstatus');
	cols[6]  = new nlobjSearchColumn('custrecord_ava_taxcalculationdate');
	cols[7]  = new nlobjSearchColumn('custrecord_ava_totalamount');
	cols[8]  = new nlobjSearchColumn('custrecord_ava_totaldiscount');
	cols[9]  = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
	cols[10] = new nlobjSearchColumn('custrecord_ava_totaltaxable');
	cols[11] = new nlobjSearchColumn('custrecord_ava_totaltax');
	cols[12] = new nlobjSearchColumn('custrecord_ava_basecurrency');
	cols[13] = new nlobjSearchColumn('custrecord_ava_foreigncurr');
	cols[14] = new nlobjSearchColumn('custrecord_ava_exchangerate');
	cols[15] = new nlobjSearchColumn('custrecord_ava_netsuitedoctype');

	var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	
	for( ; searchresult != null; )
	{
		for(var k=0; searchresult != null && k<searchresult.length; k++)
		{
			try
			{
				recordIdArray[recordIdArray.length] = searchresult[k].getId();
				recordObjArray[recordObjArray.length] = searchresult[k];
			}
			catch(err)
			{
			}
		}
		
		filters[filters.length] = new nlobjSearchFilter('internalid',		null, 'noneof', recordIdArray);
		
		searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	}
	
	if(request.getMethod() == 'POST')
	{
		var j = 0;
		AVA_LineCount = 0;
	}
	else
	{
		var j = parseFloat(request.getParameter('ava_liststart'));
		AVA_LineCount = parseFloat(request.getParameter('ava_linecount'));
	}
	
	var ListLimit = parseFloat(nlapiGetContext().getSetting('PREFERENCE', 'LISTSEGMENTSIZE'));
	var AVA_Flag = request.getParameter('ava_flag');
	
	if(AVA_Flag == 'F')
	{
		if(request.getParameter('ava_linecount')>0)
		{
			if(request.getParameter('ava_linecount')<ListLimit)
			{
				MaxLength = parseFloat(ListLimit) + parseFloat(AVA_LineCount);
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
			else
			{
				MaxLength = (parseFloat(ListLimit) * parseFloat(2));
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
		}

	}
		
	for(var i=0; recordObjArray != null && i < ListLimit && j<recordObjArray.length && j>=0 ; j++)
	{
		AVA_TransactionList.setLineItemValue('avainternalid', 	i+1, 	recordObjArray[j].getId());
		AVA_TransactionList.setLineItemValue('avadocdate', 		i+1, 	recordObjArray[j].getValue('custrecord_ava_documentdate'));
		
		var DocType = recordObjArray[j].getValue('custrecord_ava_documenttype');
		DocType = (DocType == 2)? 'SalesInvoice' : 'ReturnInvoice';
		AVA_TransactionList.setLineItemValue('avadoctype', 		i+1, 	(recordObjArray[j].getValue('custrecord_ava_documenttype') == 2) ? 'Sales Invoice' : 'Return Invoice');
		
		if(recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null && recordObjArray[j].getValue('custrecord_ava_documentinternalid').length > 0)
		{
			var doctype = recordObjArray[j].getValue('custrecord_ava_netsuitedoctype');
			doctype = (doctype == 2) ? 'cashsale': ((doctype == 3) ? 'creditmemo' : ((doctype == 4) ? 'cashrefund' : 'invoice'));
			
			var URL1 = nlapiResolveURL('RECORD', doctype, recordObjArray[j].getValue('custrecord_ava_documentinternalid'));
			var FinalURL = '<a href="' + URL1 + '" target="_blank">' + recordObjArray[j].getValue('custrecord_ava_documentno') + '</a>';
			
			AVA_TransactionList.setLineItemValue('avanetdocno', 	i+1, 	FinalURL);
		}
		else
		{
			AVA_TransactionList.setLineItemValue('avanetdocno', 	i+1, 	recordObjArray[j].getValue('custrecord_ava_documentno'));
		}
			
		var DocStatus = recordObjArray[j].getValue('custrecord_ava_documentstatus');
		switch(DocStatus)
		{
			case '1':
				DocStatus = 'Saved';
				break;
				
			case '3':
				DocStatus = 'Committed';
				break;
				
			case '4':
				DocStatus = 'Voided';
				break;
				
			default:
				DocStatus = '0';
				break;
		}		
		AVA_TransactionList.setLineItemValue('avadocstatus', 		i+1, 	DocStatus);

		if(recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null)
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avagettaxhistory_suitelet', 'customdeploy_gettaxhistory', false);
			URL1 = URL1 + '&doctype=' + DocType +'&doccode=' + recordObjArray[j].getValue('custrecord_ava_documentinternalid') + '&subid='+ recordObjArray[j].getValue('custrecord_ava_subsidiaryid');
			var FinalURL = '<a href="' + URL1 + '" target="_blank">' + recordObjArray[j].getValue('custrecord_ava_documentinternalid') + '</a>';
			
			AVA_TransactionList.setLineItemValue('avadocno', 		i+1, 	FinalURL);
		}
		else
		{
			AVA_TransactionList.setLineItemValue('avadocno', 		i+1, 	'*');
		}
		
		AVA_TransactionList.setLineItemValue('avataxdate', 		i+1, 	recordObjArray[j].getValue('custrecord_ava_taxcalculationdate'));
		AVA_TransactionList.setLineItemValue('avatotamt', 		i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totalamount')));
		AVA_TransactionList.setLineItemValue('avatotdisc', 		i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totaldiscount')));
		AVA_TransactionList.setLineItemValue('avatotnontax', 	i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totalnontaxable')));
		AVA_TransactionList.setLineItemValue('avatottaxable',   i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltaxable')));
		AVA_TransactionList.setLineItemValue('avatottax', 		i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltax')));
		i++;
	
	}
	
	AVA_LineCount = i;
	
	
	if(AVA_Flag == 'F')
	{
		RecordCountStart = ListStart;
		var RecordEnd = parseFloat(i) + parseFloat(ListStart);
		RecordCountText = 'Records: ' + ((i==0) ? 1 : (parseFloat((RecordCountStart>=0)? RecordCountStart:0) + parseFloat(1))) + ' - ' + RecordEnd;
	}
	else
	{
		if(request.getMethod() == 'POST')
		{
			RecordCountStart = 0;
		}
		else
		{
			RecordCountStart = parseFloat(request.getParameter('ava_liststart'));
		}
		RecordCountText = 'Records: ' + ((i==0) ? 0 : (parseFloat(RecordCountStart) + parseFloat(1))) + ' - ' + j;
	}
	
	if(RecordCountStart>0)
  {
  	AVA_PrevFlag = 'T'; 
  }
  
  if(i==ListLimit)
  {
  	AVA_NextFlag = 'T';
  }
  
  try
  {
	  AVA_EndPage = String(parseFloat(recordObjArray.length)/parseFloat(ListLimit));
	  var AmountSplit = new Array();
	  AmountSplit = AVA_EndPage.split('.');
	  AVA_EndPage = parseFloat(AmountSplit[0]) * parseFloat(ListLimit);
	}
	catch(err)
	{
	}
	RecordCountText = RecordCountText + ' of ' + recordObjArray.length;
	AVA_TransactionList.setHelpText(RecordCountText);
	
	return j;
}

function AVA_ValidateDates()
{
	var StartDate = nlapiGetFieldValue('ava_datefrom');
	var EndDate = nlapiGetFieldValue('ava_dateto');
	var DateFormat = nlapiGetFieldValue('ava_dateformat');

	if(StartDate == null || StartDate.length == 0)
	{
		alert('Select Starting Date');
		return false;
	}
	
	if(EndDate == null || EndDate.length == 0)
	{
		alert('Select Ending Date');
		return false;
	}
	
	StartDate = new Date(AVA_FormatDate(DateFormat,StartDate));
	EndDate = new Date(AVA_FormatDate(DateFormat,EndDate));
	
	if(EndDate < StartDate)
	{
		alert('Ending Date should be greater than or equal to Start Date');
		return false;
	}
	
	return true;
}

