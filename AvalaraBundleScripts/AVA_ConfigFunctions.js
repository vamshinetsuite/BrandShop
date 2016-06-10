/******************************************************************************************
	Script Name  - AVA_ConfigFunctions.js
	Company      - Avalara Technologies Pvt Ltd.
******************************************************************************************/

{
	var ConfigLogs = {};
	var AVA_ConfigRecordID, AVA_StatesArray, flag = 0, AVA_CompanyInfo, AVA_CompCode, AVA_ParentCompany, AVA_StateCountry;
}

//Function for Free Trial
function AVA_FreeTrial(request, response)
{
	if(request.getMethod() == 'GET')
	{
		var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
		
		if(searchresult == null)
		{
			var CompanyInfo = nlapiLoadConfiguration('companyinformation');
			var CompanyName = (CompanyInfo.getFieldValue('companyname') != null) ? CompanyInfo.getFieldValue('companyname').substring(0, 24) : '';
			var Address1 	= (CompanyInfo.getFieldValue('address1') != null) ? CompanyInfo.getFieldValue('address1') : '';
			var Address2 	= (CompanyInfo.getFieldValue('address2') != null) ? CompanyInfo.getFieldValue('address2') : '';
			var City 		= (CompanyInfo.getFieldValue('city') != null) ? CompanyInfo.getFieldValue('city') : '';
			var State 		= (CompanyInfo.getFieldValue('state') != null) ? CompanyInfo.getFieldValue('state') : '';
			var Country 	= (CompanyInfo.getFieldValue('country') != null) ? CompanyInfo.getFieldValue('country') : '';
			var Zip 		= (CompanyInfo.getFieldValue('zip') != null) ? CompanyInfo.getFieldValue('zip') : '';
			
			var form = nlapiCreateForm('Self Provisioning');
			form.setScript('customscript_avafreetrial_client');
			form.setTitle('Welcome! Get Started with Avalara AvaTax');
			
			var help = '<br>New users can click <b>Sign up</b> to create an Avalara AvaTax 30 day free trial account.<br><br>';
			help += 'Existing users with valid Avalara AvaTax credentials, please click <b>Sign in</b> to use your existing Avalara AvaTax account.'
			
			var WidgetDiv = form.addField('ava_wigdetdiv', 'inlinehtml', 'Widget Div');
			WidgetDiv.setDefaultValue('<div id="divHelp">' + help + '</div><div id="avalaraDiv" style="height:500px;width:1000px;"></div>');
			
			form.addButton('ava_signup', 'Sign up', "AVA_SignUp('"+ CompanyName + "','" + Address1 + "','" + Address2 + "','" + City + "','" + State + "','" + Country + "','" + Zip + "')");
			form.addButton('ava_signin', 'Sign in', 'AVA_SignIn()');
			
			response.writePage(form);
		}
		else
		{
			nlapiSetRedirectURL('SUITELET', 'customscript_avaconfig_wizard', 'customdeploy_ava_configurewizard');
		}
	}
}

function AVA_SignUp(CompanyName, Address1, Address2, City, State, Country, Zip)
{
	NS.jQuery(".uir-header-buttons").hide(); // Hiding Sign Up & Sign In buttons
	NS.jQuery("#divHelp").hide();			 // Hide help section
	
	if(nlapiGetContext().getEnvironment() == 'PRODUCTION')
	{
		NS.jQuery("#avalaraDiv").AvaWidget({
		    InheritCss:true,
		    CssLinks: GetCssURLs(),
		    AvalaraOnboardingObject:new AvalaraOnboarding('NetSuite Basic', CompanyName, '', Address1, Address2, '', City, Country, State, Zip, '', '', '', '', ''),
		    RedirectUrl: window.location.href,
		    onAvaTaxCompanyCreated: function (onboardingData) {
		    	//your code for further processing.
		    },
		    FinishButton: { Visible: true, Caption: "Continue", onFinishClicked: function (onboardingData) {
		        //your code to continue to next page. Onboarding data will also be available here in "onboardingData" object.
				var AVA_AccountValue = onboardingData.Result.AccountId;
				var AVA_LicenseKey	 = nlapiEncrypt(onboardingData.Result.LicenseKey, 'aes', Sha256.hash('AVATAX'));
				var AVA_Username	 = onboardingData.Result.User.UserName;
				var AVA_Password	 = nlapiEncrypt(onboardingData.Result.User.TempPwd, 'aes', Sha256.hash('AVATAX'));
				
				var record = nlapiCreateRecord('customrecord_avaconfig');
				record.setFieldValue('custrecord_ava_accountvalue', AVA_AccountValue);
				record.setFieldValue('custrecord_ava_licensekey', 	AVA_LicenseKey);
				record.setFieldValue('custrecord_ava_url', 			'0');
				record.setFieldValue('custrecord_ava_username', 	AVA_Username);
				record.setFieldValue('custrecord_ava_password', 	AVA_Password);
				record.setFieldValue('custrecord_ava_servicetypes', 'TaxSvc, AddressSvc,');
				record.setFieldValue('custrecord_ava_encryptflag',  'T');
				nlapiSubmitRecord(record, false);
				
				var URL = nlapiResolveURL('SUITELET', 'customscript_avaconfig_wizard1', 'customdeploy_avaconfig_wizard1', false);
				window.open(URL, '_self');
		    }}
		});
	}
	else
	{
		NS.jQuery("#avalaraDiv").AvaWidgetSandbox({
		    InheritCss:true,
		    CssLinks: GetCssURLsSandbox(),
		    AvalaraOnboardingObject:new AvalaraOnboarding('Test Connector', CompanyName, '', Address1, Address2, '', City, Country, State, Zip, '', '', '', '', ''),
		    RedirectUrl: window.location.href,
		    onAvaTaxCompanyCreated: function (onboardingData) {
		    	//your code for further processing.
		    },
		    FinishButton: { Visible: true, Caption: "Continue", onFinishClicked: function (onboardingData) {
		        //your code to continue to next page. Onboarding data will also be available here in "onboardingData" object.
				var AVA_AccountValue = onboardingData.Result.AccountId;
				var AVA_LicenseKey	 = nlapiEncrypt(onboardingData.Result.LicenseKey, 'aes', Sha256.hash('AVATAX'));
				var AVA_Username	 = onboardingData.Result.User.UserName;
				var AVA_Password	 = nlapiEncrypt(onboardingData.Result.User.TempPwd, 'aes', Sha256.hash('AVATAX'));
				
				var record = nlapiCreateRecord('customrecord_avaconfig');
				record.setFieldValue('custrecord_ava_accountvalue', AVA_AccountValue);
				record.setFieldValue('custrecord_ava_licensekey', 	AVA_LicenseKey);
				record.setFieldValue('custrecord_ava_url', 			'1');
				record.setFieldValue('custrecord_ava_username', 	AVA_Username);
				record.setFieldValue('custrecord_ava_password', 	AVA_Password);
				record.setFieldValue('custrecord_ava_servicetypes', 'TaxSvc, AddressSvc,');
				record.setFieldValue('custrecord_ava_encryptflag',  'T');
				nlapiSubmitRecord(record, false);
				
				var URL = nlapiResolveURL('SUITELET', 'customscript_avaconfig_wizard1', 'customdeploy_avaconfig_wizard1', false);
				window.open(URL, '_self');
		    }}
		});
	}
}

function AVA_SignIn()
{
	var URL = nlapiResolveURL('SUITELET', 'customscript_avaconfig_wizard', 'customdeploy_ava_configurewizard', false);
	window.open(URL, '_self');
}

// Function to be called when user configures AvaTax for first time
function AVA_SetupAssistant(request, response)
{
	if(request.getMethod() == 'GET')
	{
		var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
		
		var form = nlapiCreateForm('Configuration');
		form.setScript('customscript_avaconfig_client');
		
		/* HEADER LEVEL FIELDS */
		var AccountValue = form.addField('ava_accountvalue', 'text', 'Account Number');
		AccountValue.setDisplaySize('40');
		
		var LicenseKey = form.addField('ava_licensekey', 'password', 'License Key');
		LicenseKey.setMaxLength(100);
		LicenseKey.setDisplaySize('40');
		
		var ServiceUrl = form.addField('ava_serviceurl', 'select', 'Service URL');
		ServiceUrl.addSelectOption('0', 'Production');
		ServiceUrl.addSelectOption('1', 'Development');
		
		var AVA_Environment = nlapiGetContext().getEnvironment();
		if(AVA_Environment != 'PRODUCTION')
		{
			ServiceUrl.setDefaultValue('1');
		}
		
		var Username = form.addField('ava_username', 'text', 'Username').setLayoutType('startrow','startcol');
		Username.setDisplaySize('40');
		
		var Password = form.addField('ava_password', 'password', 'Password');
		Password.setMaxLength(100);
		Password.setDisplaySize('40');
		
		form.addField('ava_setupconfig', 'text', 'Setup/Config Flag').setDisplayType('hidden');
		form.getField('ava_setupconfig').setDefaultValue('F');
		
		var AVA_GlobalDateFormat 	= form.addField('ava_globaldateformat', 'text', 'Global Date Format');                                                                                                                                                                                                                                                                                                                                                                                                                          
		AVA_GlobalDateFormat.setDisplayType('hidden');
		AVA_GlobalDateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
		
		var AVA_ServiceTypesField 	= form.addField('ava_servicetypes', 'text', 'Service Types');                                                                                                                                                                                                                                                                                                                                                                                                                          
		AVA_ServiceTypesField.setDisplayType('hidden');
		
		if(searchresult != null)
		{
			var AVA_Record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
			var AVA_LoadValues = AVA_LoadValuesToGlobals(AVA_Record);
			
			AccountValue.setDefaultValue(AVA_AccountValue);
			LicenseKey.setDefaultValue(AVA_LicenseKey);
			ServiceUrl.setDefaultValue(AVA_ServiceUrl);
			Username.setDefaultValue(AVA_Username);
			Password.setDefaultValue(AVA_Password);

			if(AVA_ConfigFlag == 'T')
			{
				form.setTitle('Avalara Configuration');
				
				if(AVA_AccountValue != null && AVA_AccountValue.length > 0 && AVA_LicenseKey != null && AVA_LicenseKey.length > 0 && AVA_Username != null && AVA_Username.length > 0 && AVA_Password != null && AVA_Password.length > 0 && request.getParameter('flag') != 1)
				{
					nlapiSetRedirectURL('SUITELET', 'customscript_avaconfig_suitlet', 'customdeploy_configuration');
				}
				else
				{
					form.getField('ava_setupconfig').setDefaultValue('T');
				}
			}
			else
			{
				form.setTitle('Setup Assistant');
			}
		}
		else
		{
			form.setTitle('Setup Assistant');
		}
		
		form.addSubmitButton('Validate');
		response.writePage(form);
	}
	else
	{
		var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
		
		if(searchresult == null)
		{
			var record = nlapiCreateRecord('customrecord_avaconfig');
		}
		else
		{
			var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
		}
		
		record.setFieldValue('custrecord_ava_accountvalue', request.getParameter('ava_accountvalue'));
		record.setFieldValue('custrecord_ava_licensekey', 	request.getParameter('ava_licensekey'));
		record.setFieldValue('custrecord_ava_url', 			request.getParameter('ava_serviceurl'));
		record.setFieldValue('custrecord_ava_servicetypes', request.getParameter('ava_servicetypes'));
		record.setFieldValue('custrecord_ava_username', 	request.getParameter('ava_username'));
		record.setFieldValue('custrecord_ava_password', 	request.getParameter('ava_password'));
		record.setFieldValue('custrecord_ava_encryptflag',  'T');
		nlapiSubmitRecord(record, false);
		
		if(request.getParameter('ava_setupconfig') == 'F')
		{
			nlapiSetRedirectURL('SUITELET', 'customscript_avaconfig_wizard1', 'customdeploy_avaconfig_wizard1');
		}
		else
		{
			nlapiSetRedirectURL('SUITELET', 'customscript_avaconfig_suitlet', 'customdeploy_configuration');
		}
	}
}

//Function to be called after user validates AvaTax credentials for first time
function AVA_SetupAssistant1(request, response)
{
	if(request.getMethod() == 'GET')
	{
		var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
		
		var AVA_Record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
		var AVA_LoadValues = AVA_LoadValuesToGlobals(AVA_Record);
		
		if(AVA_ConfigFlag == 'F')
		{
			AVA_CompanyInfo = new Array();
			var CompanyInfo = nlapiLoadConfiguration('companyinformation');
			
			var form = nlapiCreateForm('Configuration');
			form.setScript('customscript_avaconfig_client');
			form.setTitle('Setup Assistant');
			
			/* HEADER LEVEL FIELDS */
			var AccountValue = form.addField('ava_accountvalue', 'text', 'Account Number');
			AccountValue.setDisplayType('disabled');
			AccountValue.setDisplaySize('40');
			AccountValue.setDefaultValue(AVA_AccountValue);
			
			var LicenseKey = form.addField('ava_licensekey', 'password', 'License Key');
			LicenseKey.setDisplayType('disabled');
			LicenseKey.setMaxLength(100);
			LicenseKey.setDisplaySize('40');
			LicenseKey.setDefaultValue(AVA_LicenseKey);
			
			var ServiceUrl = form.addField('ava_serviceurl', 'select', 'Service URL');
			ServiceUrl.addSelectOption('0', 'Production');
			ServiceUrl.addSelectOption('1', 'Development');
			ServiceUrl.setDisplayType('disabled');
			ServiceUrl.setDefaultValue(AVA_ServiceUrl);
			
			var Username = form.addField('ava_username', 'text', 'Username').setLayoutType('startrow','startcol');
			Username.setDisplayType('disabled');
			Username.setDisplaySize('40');
			Username.setDefaultValue(AVA_Username);
			
			var Password = form.addField('ava_password', 'password', 'Password');
			Password.setDisplayType('disabled');
			Password.setMaxLength(100);
			Password.setDisplaySize('40');
			Password.setDefaultValue(AVA_Password);
			
			AVA_CompanyFetch(AVA_ServiceUrl, AVA_Username, AVA_Password, '1');
			
			var AvaTaxCompanyName = form.addField('ava_company', 'select', 'AvaTax Company Code/Name');
			AvaTaxCompanyName.setMandatory(true);
			AvaTaxCompanyName.setDisplaySize('300');
			AvaTaxCompanyName.setHelpText('Company code is an unique identifier for your company. AvaTax creates this identifier and uses it during tax calculation.<br>Hit the \'Create Company\' button to proceed on company creation process.');
			
			if(AVA_CompanyInfo != null && AVA_CompanyInfo.length > 0)
			{
				AvaTaxCompanyName.addSelectOption('', '<Select Company>');
				for(var i = 0; AVA_CompanyInfo != null && i < AVA_CompanyInfo.length; i++)
				{
					AvaTaxCompanyName.addSelectOption(AVA_CompanyInfo[i][0], (AVA_CompanyInfo[i][0] + ' : ' + AVA_CompanyInfo[i][1]));
				}
			}
			else
			{
				AvaTaxCompanyName.addSelectOption('', 'No Company found');
			}
			
			var AVA_ServiceTypesField = form.addField('ava_servicetypes', 'text', 'Service Types');
			AVA_ServiceTypesField.setDisplayType('hidden');
			AVA_ServiceTypesField.setDefaultValue(request.getParameter('servicetypes'));
			
			form.addField('ava_netsuitedition', 'text', 'NetSuite Edition').setDisplayType('hidden');
			form.getField('ava_netsuitedition').setDefaultValue(CompanyInfo.getFieldValue('country'));
			
			form.addTab('ava_requiredparameter', 'Required Parameters');
			form.addField('ava_help',  'label', '<b>Connect to Avalara AvaTax</b><br>Following are the required parameters to be completed in order to start calculating with AvaTax.', null, 'ava_requiredparameter').setLayoutType('outsidebelow', 'startrow');
			form.addField('ava_taxagencyid', 'text', 'Tax agency ID').setDisplayType('hidden');
			
			// Search for checking AVALARA Tax Agency exists or not
			var filter = new Array();
			filter[0] = new nlobjSearchFilter('isinactive', null, 'is',    	  'F');
			filter[1] = new nlobjSearchFilter('entityid',   null, 'contains', 'AVALARA');
			filter[2] = new nlobjSearchFilter('category',   null, 'anyof',    'Tax agency');
			
			var searchres = nlapiSearchRecord('vendor', null, filter);
			
			if(searchres != null && searchres.length > 0)
			{
				form.addField('ava_taxagency', 	  'checkbox', 'Tax Agency (Avalara) already created in NetSuite', null, 'ava_requiredparameter').setLayoutType('outsidebelow', 'startrow');
				form.getField('ava_taxagency').setHelpText('You can set up a vendor as a tax agency as below:<br>By selecting Tax Agency in the Category field on the vendor record.<br><br>You can create new tax agency at Lists > Relationships > Vendors > New.<br>Recommended Tax Agency name is \'Avalara\'.', false);
				form.getField('ava_taxagency').setDefaultValue('T');
				form.getField('ava_taxagency').setDisplayType('disabled');
				form.getField('ava_taxagencyid').setDefaultValue(searchres[0].getId());
			}
			else
			{
				form.addField('ava_taxagency', 	  'checkbox', 'Tax Agency (Avalara) is created in NetSuite', null, 'ava_requiredparameter').setLayoutType('outsidebelow', 'startrow');
				form.getField('ava_taxagency').setHelpText('You can set up a vendor as a tax agency as below:<br>By selecting Tax Agency in the Category field on the vendor record.<br><br>You can create new tax agency at Lists > Relationships > Vendors > New.<br>Recommended Tax Agency name is \'Avalara\'.', false);
				
				var AVA_TaxAgency = nlapiCreateRecord('vendor');
				AVA_TaxAgency.setFieldValue('companyname', 'AVALARA');
				AVA_TaxAgency.setFieldText('category',     'Tax Agency');
				var id = nlapiSubmitRecord(AVA_TaxAgency, false, true);
				
				form.getField('ava_taxagency').setDefaultValue('T');
				form.getField('ava_taxagency').setDisplayType('disabled');
				form.getField('ava_taxagencyid').setDefaultValue(id);
			}
			
			if(CompanyInfo.getFieldValue('country') == 'US')
			{
				var filters = [['isinactive', 'is', 'F'], 'and', ['country', 'anyof', 'US'], 'and', ['itemid', 'is', 'AVATAX'], 'or', ['itemid', 'is', 'AVATAX-US']];
				
				var searchresult = nlapiSearchRecord('salestaxitem', null, filters);
				
				if(searchresult != null && searchresult.length > 0)
				{
					form.addField('ava_taxcode', 'checkbox', 'Tax Code (AVATAX) already created in NetSuite', null, 'ava_requiredparameter').setLayoutType('outsidebelow', 'startrow');
					form.getField('ava_taxcode').setHelpText('A tax code is an entity to remit taxes which is configured to customer or transaction. This default tax code needs to be configured on (Avalara Configuration --> Tax Calculation Tab) \'DEFAULT TAX CODE\' field to trigger AvaTax tax calculation.<br><br>You can create new tax codes at Setup > Accounting > Tax Codes > New.<br> Recommended Tax Code name is \'AVATAX\' with Tax Rate as 0%.', false);
					form.getField('ava_taxcode').setDefaultValue('T');
					form.getField('ava_taxcode').setDisplayType('disabled');
				}
				else
				{
					form.addField('ava_taxcontrolacct', 'select', 'Please select GL account of type \'Tax Control\' to create \'AVATAX\' Tax Code', 'account', 'ava_requiredparameter').setLayoutType('outsidebelow', 'startrow');
					form.getField('ava_taxcontrolacct').setMandatory(true);
					form.addField('ava_taxcode', 'checkbox', 'Tax Code Flag', null, 'ava_requiredparameter').setDefaultValue('F');
					form.getField('ava_taxcode').setDisplayType('hidden');
				}
			}
			else
			{
				form.addField('ava_taxcode', 'checkbox', '\'AVATAX\' created as Tax Code in NetSuite', null, 'ava_requiredparameter').setLayoutType('outsidebelow', 'startrow');
				form.getField('ava_taxcode').setHelpText('A tax code is an entity to remit taxes which is configured to customer or transaction. This default tax code needs to be configured on (Avalara Configuration --> Tax Calculation Tab) \'DEFAULT TAX CODE\' field to trigger AvaTax tax calculation.<br><br>You can create new tax codes at Setup > Accounting > Tax Codes > New.<br> Recommended Tax Code name is \'AVATAX\' with Tax Rate as 0%.', false);
			}
			
			form.addButton('ava_previous', 'Previous', 'AVA_Previous(0)');
			form.addButton('ava_next', 'Next', "AVA_Next()");
			
			form.addButton('ava_createcompany', 'Create Company', 'AVA_CreateCompany()');
			
			response.writePage(form);
		}
		else
		{
			nlapiSetRedirectURL('SUITELET', 'customscript_avaconfig_suitlet', 'customdeploy_configuration', null, null);
		}
	}
}

function AVA_Previous(flag)
{
	window.onbeforeunload = undefined;
	var URL = nlapiResolveURL('SUITELET', 'customscript_avaconfig_wizard', 'customdeploy_ava_configurewizard', false);
	URL += '&flag=' + flag;
	window.open(URL, '_self');
}

function AVA_Next()
{
	window.onbeforeunload = undefined;
	
	if(nlapiGetFieldValue('ava_company') == null || nlapiGetFieldValue('ava_company').length == 0)
	{
		alert('Please select AvaTax Company Code/Name');
		return;
	}
	
	if(nlapiGetFieldValue('ava_netsuitedition') == 'US')
	{
		if(nlapiGetFieldValue('ava_taxcode') == 'F' && (nlapiGetFieldValue('ava_taxcontrolacct') == null || nlapiGetFieldValue('ava_taxcontrolacct').length == 0))
		{
			alert('Please select GL account of type \'Tax Control\'');
			return;
		}
		
		if(nlapiGetFieldValue('ava_taxcode') == 'F')
		{
			var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', false) + '&type=createtaxcode&taxagencyid=' + nlapiGetFieldValue('ava_taxagencyid') + '&taxcontrolacct=' + nlapiGetFieldValue('ava_taxcontrolacct'), null, null );
			var TaxCodeResult = response.getBody();
			
			if(TaxCodeResult == 0)
			{
				alert('Please select respective GL account of type \'Tax Control\'');
				return;
			}
		}
	}
	else
	{
		if(nlapiGetFieldValue('ava_taxcode') == 'F')
		{
			var msg = 'The required minimum configuration setting (Tax Code Created) to calculate tax are not completed.\n\nDo you want to still continue?';
			if(!(confirm(msg)))
			{
				return;
			}
		}
	}
	
	var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
	
	var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
	record.setFieldValue('custrecord_ava_configflag', 'T');
	record.setFieldValue('custrecord_ava_defcompanycode', nlapiGetFieldValue('ava_company'));
	nlapiSubmitRecord(record, false);
	
	var URL = nlapiResolveURL('SUITELET', 'customscript_avaconfig_suitlet', 'customdeploy_configuration', false);
	window.open(URL, '_self');
}

function AVA_CreateCompany()
{
	if(AVA_UserAccountTestConnection() == true)
	{
		var URL = nlapiResolveURL('SUITELET', 'customscript_ava_createcompany_suitelet', 'customdeploy_ava_createcompany_suitelet', false);
		window.open(URL, 'Create AvaTax Company', 'scrollbars = yes, width = 1024, height = 600, left = 200, top = 120');
	}
}

//Function for creating company on AvaTax Admin console using On-boarding API
function AVA_CreateCompanyForm(request, response)
{
	if(AVA_CheckSecurity( 28 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var CompanyCode, j = 1;
			AVA_CompanyInfo = new Array();
			var CompanyInfo = nlapiLoadConfiguration('companyinformation');
			
			var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
			
			var AVA_Record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
			var AVA_LoadValues = AVA_LoadValuesToGlobals(AVA_Record);
			
			AVA_CompanyFetch(AVA_ServiceUrl, AVA_Username, AVA_Password, '1');
			
			// Generate AvaTax Company code
			if(AVA_CompanyInfo != null && AVA_CompanyInfo.length > 0)
			{
				while(true)
				{
					var flag = 0;
					CompanyCode = 'netsuite' + j;
					for(var i = 0; i < AVA_CompanyInfo.length; i++)
					{
						if(CompanyCode == AVA_CompanyInfo[i][0])
						{
							j++;
							flag = 1;
							break;
						}
					}
					
					if(flag == 0)
					{
						break;
					}
				}
			}
			else
			{
				CompanyCode = nlapiGetContext().getCompany();
			}
			
			
			var form = nlapiCreateForm('Create AvaTax Company');
			form.setScript('customscript_avaconfig_client');
			form.setTitle('Create AvaTax Company');
			
			var AVA_CompanyName = form.addField('ava_companyname', 'text', 'Company Name');
			AVA_CompanyName.setMandatory(true);
			AVA_CompanyName.setMaxLength(25);
			AVA_CompanyName.setDefaultValue(CompanyInfo.getFieldValue('companyname').substring(0, 24));
			
			var AVA_AddressLine1 = form.addField('ava_address1', 'text', 'Address 1');
			AVA_AddressLine1.setMandatory(true);
			AVA_AddressLine1.setDefaultValue(CompanyInfo.getFieldValue('address1'));
			
			var AVA_AddressLine2 = form.addField('ava_address2', 'text', 'Address 2');
			AVA_AddressLine2.setDefaultValue(CompanyInfo.getFieldValue('address2'));
			
			var AVA_City = form.addField('ava_city', 'text', 'City');
			AVA_City.setMandatory(true);
			AVA_City.setDefaultValue(CompanyInfo.getFieldValue('city'));
			
			var AVA_State = form.addField('ava_state', 'text', 'State');
			AVA_State.setMandatory(true);
			AVA_State.setMaxLength(2);
			AVA_State.setDefaultValue(CompanyInfo.getFieldValue('state'));
			
			var AVA_Zip = form.addField('ava_zip', 'text', 'Zip');
			AVA_Zip.setMandatory(true);
			AVA_Zip.setDefaultValue(CompanyInfo.getFieldValue('zip'));
			
			var AVA_Country = form.addField('ava_country', 'text', 'Country');
			AVA_Country.setMandatory(true);
			AVA_Country.setMaxLength(2);
			AVA_Country.setDefaultValue(CompanyInfo.getFieldValue('country'));
			
			var AVA_CompanyCode = form.addField('ava_companycode', 'text', 'Company Code').setLayoutType('startrow','startcol');
			AVA_CompanyCode.setMandatory(true);
			AVA_CompanyCode.setMaxLength(25);
			AVA_CompanyCode.setDisplaySize('52');
			AVA_CompanyCode.setDefaultValue(CompanyCode);
			AVA_CompanyCode.setHelpText('Company code is an unique identifier for your company. AvaTax creates this identifier and uses it during tax calculation.');
			
			var AVA_Email = form.addField('ava_email', 'email', 'Email');
			AVA_Email.setMandatory(true);
			
			var AVA_FirstName = form.addField('ava_firstname', 'text', 'First Name');
			AVA_FirstName.setMandatory(true);
			
			var AVA_LastName = form.addField('ava_lastname', 'text', 'Last Name');
			AVA_LastName.setMandatory(true);
			
			var AVA_PhoneNumber = form.addField('ava_phonenumber', 'phone', 'Phone Number');
			AVA_PhoneNumber.setMandatory(true);
			
			var AVA_tinNumber = form.addField('ava_tinnumber', 'text', 'Business Tax Identification Number (TIN)');
			AVA_tinNumber.setMaxLength(9);
			
			var ServiceUrl = form.addField('ava_serviceurl', 'text', 'Service URL');
			ServiceUrl.setDisplayType('hidden');
			ServiceUrl.setDefaultValue(AVA_ServiceUrl);
			
			var AccountValue = form.addField('ava_accountvalue', 'text', 'Account Number');
			AccountValue.setDisplayType('hidden');
			AccountValue.setDefaultValue(AVA_AccountValue);
			
			var Username = form.addField('ava_username', 'text', 'Username');
			Username.setDisplayType('hidden');
			Username.setDefaultValue(AVA_Username);
			
			var Password = form.addField('ava_password', 'text', 'Password');
			Password.setDisplayType('hidden');
			Password.setDefaultValue(AVA_Password);
			
			form.addSubmitButton('Create Company');
			
			response.writePage(form);
		}
		else
		{
			var params = new Array();
			params['companycode'] = request.getParameter('ava_companycode');
			params['company']	  = 'new';
			 
			nlapiSetRedirectURL('SUITELET', 'customscript_avaenablenexus_suitelet', 'customdeploy_avaenablenexus_suitelet', null, params);
		}
	}
}

//Function for enabling nexuses for AvaTax Company created on AvaTax Admin Console
function AVA_EnableNexus(request, response)
{
	if(request.getMethod() == 'GET')
	{
		var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
		
		var AVA_Record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
		var AVA_LoadValues = AVA_LoadValuesToGlobals(AVA_Record);
		
		var nexusform = nlapiCreateForm('Nexus Setup');
		nexusform.setScript('customscript_avaconfig_client');
		nexusform.setTitle('Nexus Setup');
		
		var ServiceUrl = nexusform.addField('ava_serviceurl', 'text', 'Service URL');
		ServiceUrl.setDisplayType('hidden');
		ServiceUrl.setDefaultValue(AVA_ServiceUrl);
		
		var AccountValue = nexusform.addField('ava_accountvalue', 'text', 'Account Number');
		AccountValue.setDisplayType('hidden');
		AccountValue.setDefaultValue(AVA_AccountValue);
		
		var Username = nexusform.addField('ava_username', 'text', 'Username');
		Username.setDisplayType('hidden');
		Username.setDefaultValue(AVA_Username);
		
		var Password = nexusform.addField('ava_pass', 'text', 'Password');
		Password.setDisplayType('hidden');
		Password.setDefaultValue(AVA_Password);
		
		var CompanyFlag = nexusform.addField('ava_compflag', 'text', 'Company Flag');
		CompanyFlag.setDisplayType('hidden');
		CompanyFlag.setDefaultValue(request.getParameter('company'));
		
		if(request.getParameter('company') == 'exist')
		{
			AVA_CompanyInfo = new Array();
			
			AVA_CompanyFetch(AVA_ServiceUrl, AVA_Username, AVA_Password, '1');
			
			var AvaTaxCompanyName = nexusform.addField('ava_company', 'select', 'AvaTax Company Code/Name');
			AvaTaxCompanyName.setMandatory(true);
			AvaTaxCompanyName.setDisplaySize('300');
			
			if(AVA_CompanyInfo != null && AVA_CompanyInfo.length > 0)
			{
				AvaTaxCompanyName.addSelectOption('', '<Select Company>');
				for(var i = 0; AVA_CompanyInfo != null && i < AVA_CompanyInfo.length; i++)
				{
					AvaTaxCompanyName.addSelectOption(AVA_CompanyInfo[i][0], (AVA_CompanyInfo[i][0] + ' : ' + AVA_CompanyInfo[i][1]));
				}
			}
			else
			{
				AvaTaxCompanyName.addSelectOption('', 'No Company found');
			}
			
			nexusform.addField('ava_flag', 'text', 'Flag').setDisplayType('hidden');
			nexusform.addSubmitButton('Next');
		}
		else
		{
			AVA_StateCountry = new Array();
			AVA_CompCode = request.getParameter('companycode');
			
			if(request.getParameter('company') == 'exists')
			{
				// Fetch Parent company code if exists
				AVA_CompanyFetch(AVA_ServiceUrl, AVA_Username, AVA_Password, '2');
			}
			
			var help = 'Where should AvaTax collect tax for you? Let\'s take a look at it together!<br><br>';
			help += 'At least one jurisdiction must be selected in order to start calculating tax using AvaTax. The list below will help you select nexus jurisdictions based on your data in NetSuite.<br><br>';
			help += '<b>**Please note, the selections below only reflect a basic nexus configuration. Where applicable, local jurisdictions can be selected within your AvaTax Admin Console.<br>';
			help += 'Further information about local jurisdictions is found <a href= "http://help.avalara.com/000_AvaTax_Calc/000AvaTaxCalc_User_Guide/020_Add_Nexus_Jurisdictions/About_Local_Jurisdictions" target="_blank">here</a></b><br><br>';
			help += '<b>Select the locations below where you want to collect tax and hit "Enable Tax Jurisdiction(s)"';
			var NexusHelp = nexusform.addField('ava_help', 'label', help);
			
			var AVA_NexusSubList = nexusform.addSubList('custpage_nexuslist', 'list', 'Nexus List');
			AVA_NexusSubList.addField('ava_selectnexus',  'checkbox', 'Select Nexus');
			AVA_NexusSubList.addField('ava_nexusname', 	  'text', 	 'Where (State,  Country)');
			
			var NexusState = AVA_NexusSubList.addField('ava_nexusstate',   	 'text', 'Nexus State');
			NexusState.setDisplayType('hidden');
			var NexusCountry = AVA_NexusSubList.addField('ava_nexuscountry', 'text', 'Nexus Country');
			NexusCountry.setDisplayType('hidden');
			
			AVA_NexusSubList.addMarkAllButtons();
			
			var CompanyCode = nexusform.addField('ava_compcode', 'text', 'Company Code');
			CompanyCode.setDisplayType('hidden');
			CompanyCode.setDefaultValue(AVA_CompCode);
			
			nexusform.addField('ava_nexusform',	'text', 'Nexus Form Flag').setDisplayType('hidden');
			
			var cols = new Array();
			cols[0]  = new nlobjSearchColumn('state');
			cols[1]  = new nlobjSearchColumn('country');
			 		
			var searchResult = nlapiSearchRecord('location', null, null, cols);
			for(var i = 0; searchResult != null && i < searchResult.length; i++)
			{
				if(searchResult[i].getValue('state') != null && searchResult[i].getValue('state').length == 2)
				{
					if(i == 0)
					{
						var ArrIndex = AVA_StateCountry.length;
						AVA_StateCountry[ArrIndex] = new Array();
						AVA_StateCountry[ArrIndex][0] = searchResult[i].getValue('state');
						AVA_StateCountry[ArrIndex][1] = searchResult[i].getValue('country');
						AVA_StateCountry[ArrIndex][2] = 1;
					}
					else
					{
						var flag = 0;
						for(var k = 0; k < AVA_StateCountry.length ; k++)
						{
							if(AVA_StateCountry[k][0] == searchResult[i].getValue('state'))
							{
								flag = 1;
								break;
							}
						}
		
						if(flag == 0)
						{
							var ArrIndex = AVA_StateCountry.length;
							AVA_StateCountry[ArrIndex] = new Array();
							AVA_StateCountry[ArrIndex][0] = searchResult[i].getValue('state');
							AVA_StateCountry[ArrIndex][1] = searchResult[i].getValue('country');
							AVA_StateCountry[ArrIndex][2] = 1;
						}		
					}
				}
			}
			
			var filters = new Array();
			filters[filters.length] = new nlobjSearchFilter('mainline',   null, 'is', 'T');
			
			var TypeArray = new Array('Estimate','SalesOrd','CustInvc','CashSale','RtnAuth','CashRfnd','CustCred');
			filters[filters.length] = new nlobjSearchFilter('type', 	  null, 'anyof', TypeArray);
			
			var column = new Array();
			column[0] = new nlobjSearchColumn('internalid').setSort(true);
			column[1] = new nlobjSearchColumn('shipstate');
			column[2] = new nlobjSearchColumn('shipcountrycode');
			
			var searchTransaction = nlapiSearchRecord('transaction', null, filters, column);
			for(var i = 0; searchTransaction != null && i < searchTransaction.length ; i++)
			{
				if(searchTransaction[i].getValue('shipstate') != null && searchTransaction[i].getValue('shipstate').length == 2)
				{
					if(i == 0  && (AVA_StateCountry == null || AVA_StateCountry.length == 0))
					{
						var ArrIndex = AVA_StateCountry.length;
						AVA_StateCountry[ArrIndex] = new Array();
						AVA_StateCountry[ArrIndex][0] = searchTransaction[i].getValue('shipstate');
						AVA_StateCountry[ArrIndex][1] = searchTransaction[i].getValue('shipcountrycode');
						AVA_StateCountry[ArrIndex][2] = 1;
					}
					else
					{
						var flag = 0;
						for(var k = 0; k < AVA_StateCountry.length ; k++)
						{
							if(AVA_StateCountry[k][0] == searchTransaction[i].getValue('shipstate'))
							{
								flag = 1;
								break;
							}
						}
		
						if(flag == 0)
						{
							var ArrIndex = AVA_StateCountry.length;
							AVA_StateCountry[ArrIndex] = new Array();
							AVA_StateCountry[ArrIndex][0] = searchTransaction[i].getValue('shipstate');
							AVA_StateCountry[ArrIndex][1] = searchTransaction[i].getValue('shipcountrycode');
							AVA_StateCountry[ArrIndex][2] = 1;
						}
					}
				}
			}
			
			var CompanyInfo = nlapiLoadConfiguration('companyinformation');
			var State   = CompanyInfo.getFieldValue('state');
			var Country = CompanyInfo.getFieldValue('country');
			
			if(State != null && State.length == 2)
			{
				var flag = 0;
				for(var j = 0; j < AVA_StateCountry.length ; j++)
				{
					if(AVA_StateCountry[j][0] == State)
					{
						flag = 1;
						break;
					}
				}
				
				if(flag == 0)
				{
					var ArrIndex = AVA_StateCountry.length;
					AVA_StateCountry[ArrIndex] = new Array();
					AVA_StateCountry[ArrIndex][0] = State;
					AVA_StateCountry[ArrIndex][1] = Country;
					AVA_StateCountry[ArrIndex][2] = 1;
				}
			}
			
			if(request.getParameter('company') == 'exists')
			{
				// Fetch nexuses of existing AvaTax Company
				AVA_FetchNexus(AVA_ServiceUrl, AVA_AccountValue, AVA_Username, AVA_Password, AVA_CompCode);
			}
			
			for(var i = 0, j = 1; AVA_StateCountry != null && i < AVA_StateCountry.length ; i++)
			{
				if(AVA_StateCountry[i][2] == 1)
				{
					AVA_NexusSubList.setLineItemValue('ava_nexusname', 	  j, AVA_StateCountry[i][0] + ', ' + AVA_StateCountry[i][1]);
					AVA_NexusSubList.setLineItemValue('ava_nexusstate',   j, AVA_StateCountry[i][0]);
					AVA_NexusSubList.setLineItemValue('ava_nexuscountry', j, AVA_StateCountry[i][1]);
					j++;
				}
			}
			
			nexusform.addSubmitButton('Enable Tax Jurisdiction(s)');
		}
		
		response.writePage(nexusform);
	}
	else
	{
		if(request.getParameter('ava_compflag') == 'exist')
		{
			var params = new Array();
			params['companycode'] = request.getParameter('ava_company');
			params['company']	  = 'exists';
			 
			nlapiSetRedirectURL('SUITELET', 'customscript_avaenablenexus_suitelet', 'customdeploy_avaenablenexus_suitelet', null, params);
		}
		else
		{
			nlapiSetRedirectURL('TASKLINK', 'CARD_-29');
		}
	}
}

function AVA_FetchNexus(UrL, AccountId, Username, Password, CompanyCode)
{
	var AVA_Password = nlapiDecrypt(Password, 'aes', Sha256.hash('AVATAX'));
	
	if(UrL == '1')
	{
		var AccountType    = 'sandbox.';
		var Authentication = 'TEST/' + Username + ':' + AVA_Password;
	}
	else
	{
		var AccountType    = '';
		var Authentication = Username + ':' + AVA_Password;
	}
	
	var soapHead = {};
	soapHead['Type']		  = 'GET';
	soapHead['Content-Type']  = 'application/json';
	soapHead['Accept'] 		  = 'application/json';
	soapHead['Authorization'] = 'Basic ' + nlapiEncrypt(Authentication, 'base64');
	
	try
	{
		var response = nlapiRequestURL('https://' + AccountType + 'onboarding.api.avalara.com/v1/Accounts/' + AccountId + '/Companies/' + CompanyCode + '/Nexuses', null, soapHead);
		var jsonResponse = JSON.parse(response.getBody());
		
		if(response.getCode() == 200)
		{	
			if(jsonResponse.Status == 'Success')
			{
				var Nexus = jsonResponse.Result.CreatedNexus;
				
				for(var i = 0; Nexus != null && i < Nexus.length; i++)
				{
					for(j = 0; AVA_StateCountry != null && j < AVA_StateCountry.length; j++)
					{
						if((Nexus[i].State == AVA_StateCountry[j][0]) && (Nexus[i].Country == AVA_StateCountry[j][1]))
						{
							AVA_StateCountry[j][2] = 0;
							break;
						}
					}
				}
			}
		}
		else
		{
			if(jsonResponse.Status == 'Error')
			{
				nlapiLogExecution('Debug', 'Error', jsonResponse.Message);
			}
		}
	}
	catch(err)
	{
		nlapiLogExecution('Debug', 'Try/Catch Error', err.message);
	}
}

function AVA_ConfigForm(request, response)
{
	//Design of the form
	if(AVA_CheckSecurity( 2 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			AVA_CompanyInfo = new Array();
			var CompanyInfo = nlapiLoadConfiguration('companyinformation');
			
			var form = nlapiCreateForm('Configuration');
			form.setScript('customscript_avaconfig_client');
			form.setTitle('Avalara Configuration');
			
			/* HEADER LEVEL FIELDS */
			var AccountValue = form.addField('ava_accountvalue', 'text', 'Account Number');
			AccountValue.setDisplayType('disabled');
			AccountValue.setDisplaySize('40');
			
			var LicenseKey = form.addField('ava_licensekey', 'password', 'License Key');
			LicenseKey.setDisplayType('disabled');
			LicenseKey.setMaxLength(100);
			LicenseKey.setDisplaySize('40');
			
			var ServiceUrl = form.addField('ava_serviceurl', 'select', 'Service URL');
			ServiceUrl.addSelectOption('0', 'Production');
			ServiceUrl.addSelectOption('1', 'Development');
			ServiceUrl.setDisplayType('disabled');
			
			var Username = form.addField('ava_username', 'text', 'Username').setLayoutType('startrow','startcol');
			Username.setDisplayType('disabled');
			Username.setDisplaySize('40');
			
			var Password = form.addField('ava_password', 'password', 'Password');
			Password.setDisplayType('disabled');
			Password.setDisplaySize('40');
			Password.setMaxLength(100);
			
			var AvaTaxCompanyName = form.addField('ava_company', 'select', 'AvaTax Company Code/Name');
			AvaTaxCompanyName.setMandatory(true);
			AvaTaxCompanyName.setDisplaySize('300');
			AvaTaxCompanyName.setHelpText('Company code is an unique identifier for your company. AvaTax creates this identifier and uses it during tax calculation.<br>Hit the \'Create Company\' button to proceed on company creation process.');
			
			form.addField('ava_servicetype', 		'text',     'Service Types').setDisplayType('hidden');
			form.addField('ava_flag', 				'text',     'Flag').setDisplayType('hidden');
			form.addField('ava_globaldateformat',	'text',	 	'Global Date Format');
			form.getField('ava_globaldateformat').setDisplayType('hidden');
			form.getField('ava_globaldateformat').setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
			
			var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
			
			if(searchresult != null && searchresult.length > 0)
			{
				var AVA_Record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
				var AVA_LoadValues = AVA_LoadValuesToGlobals(AVA_Record);
				
				AccountValue.setDefaultValue(AVA_AccountValue);	
				LicenseKey.setDefaultValue(AVA_LicenseKey);				
				ServiceUrl.setDefaultValue(AVA_ServiceUrl);
				Username.setDefaultValue(AVA_Username);	
				Password.setDefaultValue(AVA_Password);
				form.getField('ava_servicetype').setDefaultValue(AVA_ServiceTypes);
				
				AVA_CompanyFetch(AVA_ServiceUrl, AVA_Username, AVA_Password, '1');
				
				if(AVA_CompanyInfo != null && AVA_CompanyInfo.length > 0)
				{
					AvaTaxCompanyName.addSelectOption('', '<Select Company>');
					for(var i = 0; AVA_CompanyInfo != null && i < AVA_CompanyInfo.length; i++)
					{
						AvaTaxCompanyName.addSelectOption(AVA_CompanyInfo[i][0], (AVA_CompanyInfo[i][0] + ' : ' + AVA_CompanyInfo[i][1]));
					}

					AvaTaxCompanyName.setDefaultValue(AVA_DefCompanyCode);
				}
				else
				{
					AvaTaxCompanyName.addSelectOption('', 'No Company found');
				}
				
				if(AVA_ServiceTypes != null)
				{
					if(AVA_ServiceTypes.search('TaxSvc') != -1)
					{
						form.addTab('ava_general', 'General');
						form.addTab('ava_taxcalculation', 'Tax Calculation');
						form.addTab('ava_cutvatsetting',  'Consumer Use Tax/Input VAT');
						
						// Adding Elements inside First Tab - General
						// Item Specific Fields
						form.addField('ava_itemhelp', 		   'help',	   '<b>Item Specific:</b><hr>',    null, 'ava_general').setLayoutType('startrow','startcol');
						form.addField('ava_taxcodemapping',    'checkbox', 'Enable Tax Code Mapping', 	   null, 'ava_general');
						form.addField('ava_taxcodeprecedence', 'checkbox', 'Override Avatax Taxcode', 	   null, 'ava_general');
						form.getField('ava_taxcodeprecedence').setHelpText('Enable this option to send NT as the tax code for all non-taxable items. If this option is disabled, the assigned AvaTax tax code is send for an item');
						form.addField('ava_udf1', 			   'checkbox', 'User Defined 1', 			   null, 'ava_general');
						form.addField('ava_udf2', 			   'checkbox', 'User Defined 2', 			   null, 'ava_general');						
						form.addField('ava_itemaccount', 	   'checkbox', 'Send Item Account to Avalara', null, 'ava_general');						
						
						//Customer Specific Fields
						form.addField('ava_custhelp', 			'help',		'<b>Customer/Vendor Specific:</b><hr>', 				null, 'ava_general').setLayoutType('startrow','startcol');						
						
						var AVA_CustCodeField	= form.addField('ava_customercode',		'select',		'Customer Code',			null, 'ava_general');				
						AVA_CustCodeField.addSelectOption('0','Customer ID');
						AVA_CustCodeField.addSelectOption('1','Customer Name');		
						AVA_CustCodeField.addSelectOption('2','Customer Internal ID');
						AVA_CustCodeField.addSelectOption('3','Partner ID');
						AVA_CustCodeField.addSelectOption('4','Partner Name');
						AVA_CustCodeField.addSelectOption('5','Partner Internal ID');
						AVA_CustCodeField.addSelectOption('6','Customer ID/Name');
						AVA_CustCodeField.addSelectOption('7','Partner ID/Name');
						AVA_CustCodeField.setHelpText('Customer Code with which the tax call needs to be made to AvaTax.', false);
						
						var AVA_VendorCodeField	= form.addField('ava_vendorcode', 'select', 'Vendor Code',	null, 'ava_general');
					    
						AVA_VendorCodeField.addSelectOption('0','Vendor ID');
						AVA_VendorCodeField.addSelectOption('1','Vendor Name');
						AVA_VendorCodeField.addSelectOption('2','Vendor Internal ID');
						AVA_VendorCodeField.setHelpText('Vendor Code with which the tax call needs to be made to AvaTax.', false);			
						
						var AVA_MarkCustomerTaxable	= form.addField('ava_markcusttaxable',		'select',		'Default Customers to Taxable',			null, 'ava_general');
						AVA_MarkCustomerTaxable.addSelectOption('0','');
						AVA_MarkCustomerTaxable.addSelectOption('1','New and Existing Customer(s)');
						AVA_MarkCustomerTaxable.addSelectOption('2','Only New Customer(s)');
						AVA_MarkCustomerTaxable.addSelectOption('3','Only Existing Customer(s)');
						
						var AVA_DefaultCustTaxcode	= form.addField('ava_defaultcustomer',		'select',		'Apply Default Taxcode To',			null, 'ava_general');
						AVA_DefaultCustTaxcode.addSelectOption('0','');
						AVA_DefaultCustTaxcode.addSelectOption('1','New and Existing Customer(s)');
						AVA_DefaultCustTaxcode.addSelectOption('2','Only New Customer(s)');
						AVA_DefaultCustTaxcode.addSelectOption('3','Only Existing Customer(s)');
						
						form.addField('ava_entityusecode', 	'checkbox', 	'Enable Entity/Use Code', 			null, 'ava_general');
						
						//Miscellaneous Setting Fields
						form.addField('ava_mischelp', 			'help',		'<b>Miscellaneous Settings:</b><hr>', null, 'ava_general').setLayoutType('startrow','startcol');
			
						var AVA_DefShipCode = form.addField('ava_defshipcode', 'select', 'Default Shipping Code', null, 'ava_general');
						
						// Adding Shipping Codes
						var searchresult = nlapiSearchRecord('customrecord_avashippingcodes', null, null, null);
						if (searchresult != null)
						{
							AVA_DefShipCode.addSelectOption('', '');
			
							for (var i =0; i < Math.min(500, searchresult.length); i++)
							{
								var record = nlapiLoadRecord('customrecord_avashippingcodes',searchresult[i].getId());
								AVA_DefShipCode.addSelectOption(record.getFieldValue('custrecord_ava_shippingcode'), record.getFieldValue('custrecord_ava_shippingcode'));
							}
						}
			
						var AVA_ShowMsgs	= form.addField('ava_showmessages',		'select',		'Show Warnings/Errors',		null, 'ava_general');	
						AVA_ShowMsgs.addSelectOption('0','None');                                                                                                                                                                                                                                                                                                                                  
						AVA_ShowMsgs.addSelectOption('1','Only Warnings');                                                                                                                                                                                                                                                                                                      
						AVA_ShowMsgs.addSelectOption('2','Only Errors');                                                                                                                                                                                                                                                                                                              
						AVA_ShowMsgs.addSelectOption('3','Both');
						
						var AVA_BillTimeName;
						
						if(nlapiGetContext().getSetting('FEATURE', 'billscosts') == 'T')
						{
							AVA_BillTimeName = form.addField('ava_billtimename',	'select',		'Billable Time Name',		null, 'ava_general');
							AVA_BillTimeName.addSelectOption('0','Billable Time');
							AVA_BillTimeName.addSelectOption('1','Item Name');
						}
			
						// Adding Elements inside Second Tab - Tax Calcuation
						form.addField('ava_disabletax', 			'checkbox', 	'Disable Tax Calculation', 					null, 'ava_taxcalculation');
						form.addField('ava_disabletaxquote', 		'checkbox', 	'Disable Tax Calculation for Quotes', 		null, 'ava_taxcalculation');
						form.addField('ava_disabletaxsalesorder', 	'checkbox', 	'Disable Tax Calculation for Sales Order',	null, 'ava_taxcalculation');
						form.addField('ava_disableline', 			'checkbox', 	'Disable Tax Calculation at line level', 	null, 'ava_taxcalculation');
						form.addField('ava_enablelogging', 			'checkbox', 	'Enable Logging', 							null, 'ava_taxcalculation');
						form.addField('ava_taxondemand', 			'checkbox', 	'Calculate Tax on Demand', 					null, 'ava_taxcalculation');
						form.addField('ava_taxinclude', 			'checkbox', 	'Tax Included Capability', 					null, 'ava_taxcalculation');
			
						form.addField('ava_usepostingperiod', 'checkbox', 'Use Posting Period as Transaction date during Tax calls', null, 'ava_taxcalculation');
						if(nlapiGetContext().getFeature('accountingperiods') != true)
						{
							form.getField('ava_usepostingperiod').setDisplayType('disabled');
						}
						
						form.addField('ava_disableloccode',   'checkbox', 'Disable Location Code', 		 null, 'ava_taxcalculation');
						form.addField('ava_enableupccode', 	  'checkbox', 'Enable UPC Code as ItemCode', null, 'ava_taxcalculation');
						if(nlapiGetContext().getFeature('barcodes') == false)
						{
							form.getField('ava_enableupccode').setDisplayType('disabled');
						}
						
						form.addField('ava_enablediscount', 		'checkbox', 	'Enable Discount Mechanism', 			    null, 'ava_taxcalculation');
						var AVA_ShowDiscountMapping	= form.addField('ava_discountmapping',		'select',		'Discount Mapping',			null, 'ava_taxcalculation');
						AVA_ShowDiscountMapping.addSelectOption('0', 'Gross Amount');
						AVA_ShowDiscountMapping.addSelectOption('1', 'Net Amount');
						AVA_ShowDiscountMapping.setDisplayType('disabled');
						form.addField('ava_discounttaxcode', 'text', 'Discount Tax Code', null, 'ava_taxcalculation').setDisplayType('disabled');
						
						var AVA_ShowTaxRate	= form.addField('ava_taxrate',		'select',		'Tax Rate',			null, 'ava_taxcalculation');
						AVA_ShowTaxRate.addSelectOption('0','Show Base Rate');
						AVA_ShowTaxRate.addSelectOption('1','Show Net Rate');
			
						var AVA_DeciPlaces	= form.addField('ava_decimalplaces',		'select',		'Round-off Tax percentage(Decimal Places)',			null, 'ava_taxcalculation');
						AVA_DeciPlaces.addSelectOption('2','2');
						AVA_DeciPlaces.addSelectOption('3','3');
						AVA_DeciPlaces.addSelectOption('4','4');
						AVA_DeciPlaces.addSelectOption('5','5');
						
						var AVA_DefTaxcode = form.addField('ava_deftaxcode', 'select', 'Default Tax Code', null, 'ava_taxcalculation');
						AVA_DefTaxcode.setMandatory(true);
						AVA_DefTaxcode.addSelectOption('', '');
						
						var AVA_DefTaxcodeRate 	= form.addField('ava_deftaxcoderate', 'select',	'Default Tax Code Rate', null, 'ava_taxcalculation');     
						AVA_DefTaxcodeRate.addSelectOption('', 	'');                                                                                                                               
						AVA_DefTaxcodeRate.setDisplayType('disabled');
						
						var TaxCodeName, TaxCodeRate, TaxGroupName, TaxGroupRate;
						var AVA_TaxCodeID = new Array();
						var AVA_TaxGroupID = new Array();
			
						var filter = new Array();
						filter[0] = new nlobjSearchFilter('isinactive',null,'is','F');
			
						var cols = new Array();
						cols[0] = new nlobjSearchColumn('itemid');
						cols[1] = new nlobjSearchColumn('rate');
			
						// Retrieve Tax Code
						var searchresult = nlapiSearchRecord('salestaxitem', null, filter, cols);
						
						while(searchresult !=null && searchresult.length > 0)
						{
							for(var i=0; searchresult!=null && i < searchresult.length; i++)
							{
								TaxCodeName = searchresult[i].getValue('itemid');
								TaxCodeRate = searchresult[i].getValue('rate');
								AVA_TaxCodeID[AVA_TaxCodeID.length] = searchresult[i].getId();
								
								if(TaxCodeName != '-Not Taxable-')
								{
									AVA_DefTaxcode.addSelectOption(TaxCodeName + '+' + searchresult[i].getId(), TaxCodeName);
									AVA_DefTaxcodeRate.addSelectOption(searchresult[i].getId(), TaxCodeRate);
								}
							}
							
							if(searchresult.length >= 1000)
							{
								filter[1] = new nlobjSearchFilter('internalid', null, 'noneof', AVA_TaxCodeID);
								
								searchresult = nlapiSearchRecord('salestaxitem', null, filter, cols);
							}
							else
							{
								break;
							}
						}
			
						// Retrieve Tax Groups
						var filters = new Array();
						filters[0] = new nlobjSearchFilter('isinactive',null,'is','F');
						
						var searchresult = nlapiSearchRecord('taxGroup', null, filters, cols);
						
						while(searchresult !=null && searchresult.length > 0)
						{
							for(var i=0; searchresult!=null && i < searchresult.length; i++)
							{
								TaxGroupName = searchresult[i].getValue('itemid');
								TaxGroupRate = searchresult[i].getValue('rate');
								AVA_TaxGroupID[AVA_TaxGroupID.length] = searchresult[i].getId();
								
								if(TaxGroupName != '-Not Taxable-')
								{
									AVA_DefTaxcode.addSelectOption(TaxGroupName + '+' + searchresult[i].getId(), TaxGroupName);
									AVA_DefTaxcodeRate.addSelectOption(searchresult[i].getId(), TaxGroupRate);
								}
							}
							
							if(searchresult.length >= 1000)
							{
								filters[1] = new nlobjSearchFilter('internalid', null, 'noneof', AVA_TaxGroupID);
								
								searchresult = nlapiSearchRecord('taxgroup', null, filters, cols);
							}
							else
							{
								break;
							}
						}
						
						var Def_Addressee = form.addField('ava_def_addressee',     'text',     'Addressee', 	   null, 'ava_taxcalculation').setLayoutType('normal', 'startcol');
						Def_Addressee.setMandatory(true);
						Def_Addressee.setMaxLength(50);
			
						var Def_Addr1 = form.addField('ava_def_addr1', 		       'text',     'Address 1', 	   null, 'ava_taxcalculation');
						Def_Addr1.setMandatory(true);
						Def_Addr1.setMaxLength(50);
						
						var Def_Addr2 = form.addField('ava_def_addr2', 	           'text',     'Address 2', 	   null, 'ava_taxcalculation');
						Def_Addr2.setMandatory(false);
						Def_Addr2.setMaxLength(50);
						
						var Def_City = form.addField('ava_def_city', 		       'text',     'City', 		   	   null, 'ava_taxcalculation');
						Def_City.setMandatory(true);
						Def_City.setMaxLength(50);
						
						var Def_State = form.addField('ava_def_state', 		       'text',     'State/Province',   null, 'ava_taxcalculation');	
						Def_State.setMandatory(true);
			
						var Def_Zip = form.addField('ava_def_zip', 			       'text', 	   'Zip', 		       null, 'ava_taxcalculation');
						Def_Zip.setMandatory(true);
						Def_Zip.setMaxLength(13);
						
						var Def_Country = form.addField('ava_def_country',         'text', 	   'Country',		   null, 'ava_taxcalculation');
						Def_Country.setMandatory(true);
						
						var AVA_Def_Address = form.addField('ava_def_addrtext',    	   'textarea', 'Address',	 	   null, 'ava_taxcalculation');
						AVA_Def_Address.setDisplayType('disabled');
						AVA_Def_Address.setDisplaySize(50,7);
						
						var AVA_AddressValidate = form.addField('ava_addressvalidate', 'checkbox', 'Validate Address', null, 'ava_taxcalculation');
						AVA_AddressValidate.setDefaultValue('F');
			
						form.addField('ava_taxsettings', 'help','<b>Abort Save Operation on Tax Calculation Errors:</b><hr>', 	null, 'ava_taxcalculation').setLayoutType('normal', 'startcol');
						form.addField('ava_abortbulkbilling', 			'checkbox', 	'Bulk Billing', 		   null, 'ava_taxcalculation');
						form.addField('ava_abortuserinterfaces', 		'checkbox', 	'User Interfaces', 		   null, 'ava_taxcalculation');			
						form.addField('ava_abortwebservices', 			'checkbox', 	'Webservices', 			   null, 'ava_taxcalculation');
						form.addField('ava_abortcsvimports', 			'checkbox', 	'CSV Imports', 			   null, 'ava_taxcalculation');
						form.addField('ava_abortscheduledscripts', 		'checkbox', 	'Scheduled Scripts', 	   null, 'ava_taxcalculation');			
						form.addField('ava_abortsuitelets', 			'checkbox', 	'Suitelets', 			   null, 'ava_taxcalculation');
						form.addField('ava_abortworkflowactionscripts', 'checkbox', 	'Workflow Action Scripts', null, 'ava_taxcalculation');
						
						// Adding Elements inside Third Tab - Consumer Use Tax / Input VAT
						form.addField('ava_usetaxhelp',   		'help',	  	'<b>Consumer Use Tax Assessment Settings:</b><hr>',    null, 'ava_cutvatsetting').setLayoutType('startrow','startcol');
						form.addField('ava_enablebatchservice', 'checkbox', 'Enable UseTax Batch Service',						   null, 'ava_cutvatsetting');
						form.addField('ava_enableusetax', 		'checkbox', 'Enable Use Tax Assessment on Vendor Bill',			   null, 'ava_cutvatsetting');
			
						form.addField('ava_creditaccount', 'select', 'Use Tax Payable Liability Account', 'account',     'ava_cutvatsetting').setDisplayType('disabled');
						form.addField('ava_glaccount', 	   'label',  'GL Account to Debit', 			   null, 		 'ava_cutvatsetting');
						form.addField('ava_glaccounts',    'radio',  'Individual Item/Expense Account',   'itemaccount', 'ava_cutvatsetting').setDisplayType('disabled');
						form.addField('ava_glaccounts',    'radio',  'Select a Use Tax Debit GL Account', 'glaccount',   'ava_cutvatsetting').setDisplayType('disabled');
						form.getField('ava_glaccounts').setDefaultValue('itemaccount');
						form.addField('ava_debitaccount',  'select', 'Use Tax Debit GL Account', 		  'account', 	 'ava_cutvatsetting').setDisplayType('disabled');
						
						form.addField('ava_vatinhelp',   	  	'help',	  	'<b>Input VAT Verification Settings:</b><hr>',    null, 	 'ava_cutvatsetting').setLayoutType('normal', 'startcol');
						form.addField('ava_enablevatin', 	  	'checkbox', 'Enable Input VAT Verification on Vendor Bill',	  null, 	 'ava_cutvatsetting');
						//form.addField('ava_vatinputaccount',  'select',   'Input VAT Account',							  'account', 'ava_cutvatsetting');
						//form.addField('ava_vatoutputaccount', 'select',   'Output VAT Account',							  'account', 'ava_cutvatsetting');
						
						//Setting values
						/* General Tab Elements Detail */
						form.getField('ava_udf1').setDefaultValue(AVA_UDF1);
						form.getField('ava_udf2').setDefaultValue(AVA_UDF2);
						form.getField('ava_entityusecode').setDefaultValue(AVA_EntityUseCode);
						form.getField('ava_itemaccount').setDefaultValue(AVA_ItemAccount);
						form.getField('ava_taxcodemapping').setDefaultValue(AVA_TaxCodeMapping);
						form.getField('ava_taxcodeprecedence').setDefaultValue(AVA_TaxCodePrecedence);
						
						if(AVA_CustomerCode != null && AVA_CustomerCode.length > 0)
						{
							form.getField('ava_customercode').setDefaultValue(AVA_CustomerCode);	
						}
						
						if(AVA_VendorCode != null && AVA_VendorCode.length > 0)
						{
							form.getField('ava_vendorcode').setDefaultValue(AVA_VendorCode);	
						}
						
						if(AVA_MarkCustTaxable != null && AVA_MarkCustTaxable.length > 0)
						{
							form.getField('ava_markcusttaxable').setDefaultValue(AVA_MarkCustTaxable);
						}
						else
						{
							form.getField('ava_markcusttaxable').setDefaultValue('');
						}
												
						if(AVA_DefaultCustomerTaxcode != null && AVA_DefaultCustomerTaxcode.length > 0)
						{
							form.getField('ava_defaultcustomer').setDefaultValue(AVA_DefaultCustomerTaxcode);
						}
						else
						{
							form.getField('ava_defaultcustomer').setDefaultValue('');
						}

						if(AVA_ShowMessages != null && AVA_ShowMessages.length > 0)
						{
							form.getField('ava_showmessages').setDefaultValue(AVA_ShowMessages);
						}
						
						if(form.getField('ava_billtimename') != null)	
						{
							if(AVA_BillableTimeName != null && AVA_BillableTimeName.length > 0)
							{
								form.getField('ava_billtimename').setDefaultValue(AVA_BillableTimeName);	
							}
						}
						
						form.getField('ava_defshipcode').setDefaultValue(AVA_DefaultShippingCode);
						
						/* Tax Calculation Elements Details */
						form.getField('ava_disabletax').setDefaultValue(AVA_DisableTax);
						form.getField('ava_disabletaxquote').setDefaultValue(AVA_DisableTaxQuote);
						form.getField('ava_disabletaxsalesorder').setDefaultValue(AVA_DisableTaxSalesOrder);
						form.getField('ava_disableline').setDefaultValue(AVA_DisableLine);
						form.getField('ava_taxondemand').setDefaultValue(AVA_CalculateonDemand);
						form.getField('ava_enablelogging').setDefaultValue(AVA_EnableLogging);
						form.getField('ava_taxrate').setDefaultValue(AVA_TaxRate);
						form.getField('ava_decimalplaces').setDefaultValue(AVA_DecimalPlaces);
						form.getField('ava_usepostingperiod').setDefaultValue(AVA_UsePostingPeriod);
						form.getField('ava_taxinclude').setDefaultValue(AVA_TaxInclude);
						form.getField('ava_enablediscount').setDefaultValue(AVA_EnableDiscount);
						if(AVA_EnableDiscount == 'T')
						{
							form.getField('ava_discountmapping').setDisplayType('normal');
							form.getField('ava_discounttaxcode').setDisplayType('normal');
						}
						if(AVA_DiscountTaxCode != null && AVA_DiscountTaxCode.length > 0)
						{
							form.getField('ava_discounttaxcode').setDefaultValue(AVA_DiscountTaxCode);
						}
						else
						{
							form.getField('ava_discounttaxcode').setDefaultValue('NT');
						}
						form.getField('ava_discountmapping').setDefaultValue(AVA_DiscountMapping);
						form.getField('ava_disableloccode').setDefaultValue(AVA_DisableLocationCode);
						form.getField('ava_enableupccode').setDefaultValue(AVA_EnableUpcCode);
						form.getField('ava_deftaxcode').setDefaultValue(AVA_DefaultTaxCode);
						
						if(AVA_DefaultTaxCode != null)
						{
							var val = AVA_DefaultTaxCode.substr(AVA_DefaultTaxCode.lastIndexOf('+') + 1, AVA_DefaultTaxCode.length);
							form.getField('ava_deftaxcoderate').setDefaultValue(val);
						}
						
						if (AVA_DisableTax == 'T')
						{
							form.getField('ava_disabletaxquote').setDisplayType('disabled');
							form.getField('ava_disabletaxsalesorder').setDisplayType('disabled');
							form.getField('ava_disableline').setDisplayType('disabled');
							form.getField('ava_taxondemand').setDisplayType('disabled');
							form.getField('ava_enablelogging').setDisplayType('disabled');
							form.getField('ava_taxrate').setDisplayType('disabled');
							form.getField('ava_decimalplaces').setDisplayType('disabled');
							form.getField('ava_deftaxcode').setDisplayType('disabled');
							form.getField('ava_usepostingperiod').setDisplayType('disabled');
							form.getField('ava_taxinclude').setDisplayType('disabled');
							form.getField('ava_enablediscount').setDisplayType('disabled');
							form.getField('ava_discountmapping').setDisplayType('disabled');
							form.getField('ava_discounttaxcode').setDisplayType('disabled');
							form.getField('ava_disableloccode').setDisplayType('disabled');
							form.getField('ava_enableupccode').setDisplayType('disabled');
							form.getField('ava_abortbulkbilling').setDisplayType('disabled');
							form.getField('ava_abortuserinterfaces').setDisplayType('disabled');
							form.getField('ava_abortwebservices').setDisplayType('disabled');
							form.getField('ava_abortcsvimports').setDisplayType('disabled');
							form.getField('ava_abortscheduledscripts').setDisplayType('disabled');
							form.getField('ava_abortsuitelets').setDisplayType('disabled');
							form.getField('ava_abortworkflowactionscripts').setDisplayType('disabled');
						}
						
						var CompanyAddress = nlapiLoadConfiguration('companyinformation');
						form.getField('ava_def_addressee').setDefaultValue((AVA_Def_Addressee != null && AVA_Def_Addressee.length > 0) ? AVA_Def_Addressee : CompanyAddress.getFieldValue('addressee'));
						form.getField('ava_def_addr1').setDefaultValue((AVA_Def_Addr1 != null && AVA_Def_Addr1.length > 0) ? AVA_Def_Addr1 : CompanyAddress.getFieldValue('address1'));
						form.getField('ava_def_addr2').setDefaultValue((AVA_Def_Addr2 != null && AVA_Def_Addr2.length > 0) ? AVA_Def_Addr2 : CompanyAddress.getFieldValue('address2'));
						form.getField('ava_def_city').setDefaultValue((AVA_Def_City != null && AVA_Def_City.length > 0) ? AVA_Def_City : CompanyAddress.getFieldValue('city'));
						form.getField('ava_def_state').setDefaultValue((AVA_Def_State != null && AVA_Def_State.length > 0) ? AVA_Def_State : CompanyAddress.getFieldValue('state'));
						form.getField('ava_def_zip').setDefaultValue((AVA_Def_Zip != null && AVA_Def_Zip.length > 0) ? AVA_Def_Zip : CompanyAddress.getFieldValue('zip'));
						form.getField('ava_def_country').setDefaultValue((AVA_Def_Country != null && AVA_Def_Country.length > 0) ? AVA_Def_Country : CompanyAddress.getFieldValue('country'));
						
						var address = '';
						if (AVA_Def_Addressee != null && AVA_Def_Addressee.length > 0)
						{
							address = AVA_Def_Addressee + '\n' + AVA_Def_Addr1 + ((AVA_Def_Addr2 == null)? '' : '\n' + AVA_Def_Addr2) + '\n' + AVA_Def_City + '\n' + AVA_Def_State + '\n' + AVA_Def_Zip + '\n' + AVA_Def_Country;
						}
						else
						{
							address = CompanyAddress.getFieldValue('addressee') + '\n' + CompanyAddress.getFieldValue('address1') + ((CompanyAddress.getFieldValue('address2') != null && CompanyAddress.getFieldValue('address2').length > 0)? '\n' + CompanyAddress.getFieldValue('address2') : '') + '\n' + CompanyAddress.getFieldValue('city') + '\n' + CompanyAddress.getFieldValue('state') + '\n' + CompanyAddress.getFieldValue('zip') + '\n' + CompanyAddress.getFieldValue('country');
						}
						
						form.getField('ava_def_addrtext').setDefaultValue(address);

						form.getField('ava_abortbulkbilling').setDefaultValue(AVA_AbortBulkBilling);
						form.getField('ava_abortuserinterfaces').setDefaultValue(AVA_AbortUserInterfaces);
						form.getField('ava_abortwebservices').setDefaultValue(AVA_AbortWebServices);
						form.getField('ava_abortcsvimports').setDefaultValue(AVA_AbortCSVImports);
						form.getField('ava_abortscheduledscripts').setDefaultValue(AVA_AbortScheduledScripts);
						form.getField('ava_abortsuitelets').setDefaultValue(AVA_AbortSuitelets);
						form.getField('ava_abortworkflowactionscripts').setDefaultValue(AVA_AbortWorkflowActionScripts);
						
						/* Consumer Use Tax / Input VAT Elements Details */
						form.getField('ava_enablebatchservice').setDefaultValue(AVA_EnableBatchService);
						form.getField('ava_enableusetax').setDefaultValue(AVA_EnableUseTax);
						
						if(AVA_EnableUseTax == 'T')
						{
							form.getField('ava_creditaccount').setDisplayType('normal');
							form.getField('ava_glaccounts', 'glaccount').setDisplayType('normal');
							form.getField('ava_glaccounts', 'itemaccount').setDisplayType('normal');
							if(AVA_GlAccounts == 'glaccount')
							{
								form.getField('ava_debitaccount').setDisplayType('normal');
							}
						}
						
						if(AVA_GlAccounts != null && AVA_GlAccounts.length > 0)
						{
							form.getField('ava_glaccounts').setDefaultValue(AVA_GlAccounts);	
						}
						else
						{
							form.getField('ava_glaccounts').setDefaultValue('itemaccount');
						}
						
						if(AVA_UseTaxCredit != null && AVA_UseTaxCredit.length > 0)
						{
							form.getField('ava_creditaccount').setDefaultValue(AVA_UseTaxCredit);
						}
						else
						{
							form.getField('ava_creditaccount').setDefaultValue('');
						}
						
						if(AVA_UseTaxDebit != null && AVA_UseTaxDebit.length > 0)
						{
							form.getField('ava_debitaccount').setDefaultValue(AVA_UseTaxDebit);
						}
						else
						{
							form.getField('ava_debitaccount').setDefaultValue('');
						}
						
						if(AVA_EnableBatchService == 'T')
						{
							form.getField('ava_enableusetax').setDefaultValue('F');
							form.getField('ava_enableusetax').setDisplayType('disabled');
							form.getField('ava_creditaccount').setDisplayType('disabled');
							form.getField('ava_glaccounts', 'glaccount').setDisplayType('disabled');
							form.getField('ava_glaccounts', 'itemaccount').setDisplayType('disabled');
							form.getField('ava_debitaccount').setDisplayType('disabled');
						}
						
						form.getField('ava_enablevatin').setDefaultValue(AVA_EnableVatIn);
						
						/*if(AVA_VatInputAccount != null && AVA_VatInputAccount.length > 0)
						{
							form.getField('ava_vatinputaccount').setDefaultValue(AVA_VatInputAccount);
						}
						else
						{
							form.getField('ava_vatinputaccount').setDefaultValue('');
						}
						
						if(AVA_VatOutputAccount != null && AVA_VatOutputAccount.length > 0)
						{
							form.getField('ava_vatoutputaccount').setDefaultValue(AVA_VatOutputAccount);
						}
						else
						{
							form.getField('ava_vatoutputaccount').setDefaultValue('');
						}*/
					}
					
					if(AVA_ServiceTypes.search('AddressSvc') != -1)
					{
						form.addTab('ava_addressvalidation', 'Address Validation');
						
						// Adding Elements inside Third Tab - Address Validation
						var AVA_DisableAddVal = form.addField('ava_disableaddvalidation', 	     'checkbox', 'Disable Address Validation', 					null, 'ava_addressvalidation');
						var AVA_EnableAddressValonTran = form.addField('ava_enableaddvalontran', 'checkbox', 'Enable Address Validation on Transaction(s)', null, 'ava_addressvalidation');
						var AVA_EnableAddressValFlag = form.addField('ava_enableaddvalflag', 	 'checkbox', 'Track Previously Validated Addresses', 		null, 'ava_addressvalidation');
						var AVA_UpperCaseAddress = form.addField('ava_uppercaseaddress', 		 'checkbox', 'Result in Upper Case', 				 		null, 'ava_addressvalidation').setLayoutType('startrow','startcol');
						
						var AVA_AddBatchProField = form.addField('ava_addbatchprocessing', 		 'select', 	 'Batch Processing', 							null, 'ava_addressvalidation');
						AVA_AddBatchProField.addSelectOption('manual', 'Manual');
						AVA_AddBatchProField.addSelectOption('automatic', 'Automatic');
						AVA_AddBatchProField.setHelpText('Manual: Once the addresses are validated, user would need to select all the addresses that he want to get updated in the respective customer or location record(s) manually. \n Automatic: In this case, as soon as the addresses get validated, it will get updated in the respective customer or location record(s) automatically. ', false);
						
						// Setting Values
						AVA_DisableAddVal.setDefaultValue(AVA_DisableAddValidation);	
						AVA_UpperCaseAddress.setDefaultValue(AVA_AddUpperCase);	
						AVA_AddBatchProField.setDefaultValue((AVA_AddBatchProcessing == 0) ? 'manual' : 'automatic');
						AVA_EnableAddressValonTran.setDefaultValue(AVA_EnableAddValonTran);
						AVA_EnableAddressValFlag.setDefaultValue(AVA_EnableAddValFlag);
						
						if(AVA_DisableAddValidation == 'T')
						{
							AVA_UpperCaseAddress.setDisplayType('disabled');
							AVA_AddBatchProField.setDisplayType('disabled');
							AVA_EnableAddressValonTran.setDisplayType('disabled');
							AVA_EnableAddressValFlag.setDisplayType('disabled');
						}
					}
				}
				
				form.addTab('ava_about', 'About Avalara');
				
				// Adding Elements inside Fourth Tab - About AvaTax
				var dYear = new Date();
				var AVA_Copyright 		= form.addField('ava_copyright', 			'help', 	'Copyright &copy ' + dYear.getFullYear() + ' Avalara, Inc. All Rights Reserved.', 		null, 'ava_about');
				
				var AVA_Ver 			= form.addField('ava_version', 				'text', 	'Version', 													null, 'ava_about');
				AVA_Ver.setDisplayType('inline');
				AVA_Ver.setDefaultValue(AVA_ClientAtt);
				
				var AVA_SerVersion 		= form.addField('ava_serversion', 			'text', 	'AvaTax Version', 											null, 'ava_about');
				AVA_SerVersion.setDisplayType('inline');
				AVA_SerVersion.setDefaultValue(AVA_Ping());
				
				var AVA_Email 			= form.addField('ava_email', 				'email', 	'Email', 													null, 'ava_about');
				AVA_Email.setDisplayType('inline');
				AVA_Email.setDefaultValue('support@avalara.com');
				
				var AVA_Phone 			= form.addField('ava_phone', 				'phone', 	'Phone', 													null, 'ava_about');
				AVA_Phone.setDisplayType('inline');
				AVA_Phone.setDefaultValue('(877)-780-4848');
				
				var AVA_Web				= form.addField('ava_web', 					'url', 		'Website', 													null, 'ava_about');
				AVA_Web.setDisplayType('inline');
				AVA_Web.setDefaultValue('http://www.avalara.com/');
	
				var AVA_AdminConsole	= form.addField('ava_adminconsole', 		'url', 		'Avalara Customer Portal', 									null, 'ava_about');
				AVA_AdminConsole.setDisplayType('inline');
				AVA_AdminConsole.setDefaultValue((AVA_ServiceUrl == 1) ? 'https://admin-development.avalara.net/login.aspx' : 'https://admin-avatax.avalara.net/login.aspx');
				
				var AVA_UserCenter		= form.addField('ava_usercenter', 			'url', 		'Avalara User Center', 										null, 'ava_about');
				AVA_UserCenter.setDisplayType('inline');
				AVA_UserCenter.setDefaultValue('https://help.avalara.com');
			}
			
			form.addSubmitButton('Save');
			form.addButton('ava_back', 'Edit Credentials', 'AVA_Previous(1)');
			form.addButton('ava_createcompany', 'Create Company', 'AVA_CreateCompany()');
			form.addButton('ava_enablenexus',   'Setup where to collect tax', 'AVA_EnableNexusExistingComp()');
			
			response.writePage(form);
		}
		else
		{
			var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
			var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
			
			record.setFieldValue('custrecord_ava_accountvalue', 	request.getParameter('ava_accountvalue'));
			record.setFieldValue('custrecord_ava_licensekey', 		request.getParameter('ava_licensekey'));
			record.setFieldValue('custrecord_ava_url', 				request.getParameter('ava_serviceurl'));
			record.setFieldValue('custrecord_ava_servicetypes', 	request.getParameter('ava_servicetype'));
			record.setFieldValue('custrecord_ava_username', 		request.getParameter('ava_username'));
			record.setFieldValue('custrecord_ava_password', 		request.getParameter('ava_password'));
			record.setFieldValue('custrecord_ava_defcompanycode', 	request.getParameter('ava_company'));
			
			/* General Tab Elements Detail */
			record.setFieldValue('custrecord_ava_udf1', 			request.getParameter('ava_udf1') );
			record.setFieldValue('custrecord_ava_udf2', 			request.getParameter('ava_udf2'));
			record.setFieldValue('custrecord_ava_entityusecode', 	request.getParameter('ava_entityusecode'));
			record.setFieldValue('custrecord_ava_itemaccount', 		request.getParameter('ava_itemaccount'));
			record.setFieldValue('custrecord_ava_taxcodemapping', 	request.getParameter('ava_taxcodemapping'));
			record.setFieldValue('custrecord_ava_taxcodepreced', 	request.getParameter('ava_taxcodeprecedence'));
			record.setFieldValue('custrecord_ava_customercode', 	request.getParameter('ava_customercode'));
			record.setFieldValue('custrecord_ava_vendorcode', 		request.getParameter('ava_vendorcode'));
			record.setFieldValue('custrecord_ava_markcusttaxable',  request.getParameter('ava_markcusttaxable'));
			record.setFieldValue('custrecord_ava_defaultcustomer',  request.getParameter('ava_defaultcustomer'));
			record.setFieldValue('custrecord_ava_showmessages', 	request.getParameter('ava_showmessages'));
			
			if(request.getParameter('ava_billtimename') != null && request.getParameter('ava_billtimename').length > 0)
			{
				record.setFieldValue('custrecord_ava_billtimename', request.getParameter('ava_billtimename'));
			}
			
			var defshipcode = request.getParameter('ava_defshipcode');
			defshipcode = (defshipcode != null && defshipcode.length > 1)? defshipcode.substring(0,(defshipcode.length)): defshipcode;
			
			record.setFieldValue('custrecord_ava_defshipcode', 		  defshipcode);
			record.setFieldValue('custrecord_ava_enablebatchservice', request.getParameter('ava_enablebatchservice'));

			record.setFieldValue('custrecord_ava_enableusetax', 	  request.getParameter('ava_enableusetax'));
			if(request.getParameter('ava_enableusetax') == 'T')
			{
				record.setFieldValue('custrecord_ava_glaccounts', 	request.getParameter('ava_glaccounts'));
				record.setFieldValue('custrecord_ava_usetaxcredit', request.getParameter('ava_creditaccount'));
				if(request.getParameter('ava_glaccounts') == 'glaccount')
				{
					record.setFieldValue('custrecord_ava_usetaxdebit', 	request.getParameter('ava_debitaccount'));
				}
			}
			
			record.setFieldValue('custrecord_ava_enablevatin', 	    request.getParameter('ava_enablevatin'));
			/*if(request.getParameter('ava_enablevatin') == 'T')
			{
				record.setFieldValue('custrecord_ava_vatinaccount',  request.getParameter('ava_vatinputaccount'));
				record.setFieldValue('custrecord_ava_vatoutaccount', request.getParameter('ava_vatoutputaccount'));
			}*/
			
			/* Tax Calculation Elements Details */	
			record.setFieldValue('custrecord_ava_disabletax', 			request.getParameter('ava_disabletax'));
			record.setFieldValue('custrecord_ava_disabletaxquotes', 	request.getParameter('ava_disabletaxquote'));
			record.setFieldValue('custrecord_ava_disabletaxsalesorder', request.getParameter('ava_disabletaxsalesorder'));
			record.setFieldValue('custrecord_ava_disableline', 			request.getParameter('ava_disableline'));
			record.setFieldValue('custrecord_ava_taxondemand', 			request.getParameter('ava_taxondemand'));
			record.setFieldValue('custrecord_ava_enablelogging', 		request.getParameter('ava_enablelogging'));
			record.setFieldValue('custrecord_ava_taxrate', 				request.getParameter('ava_taxrate'));
			record.setFieldValue('custrecord_ava_decimalplaces', 		request.getParameter('ava_decimalplaces'));
			record.setFieldValue('custrecord_ava_deftaxcode', 			request.getParameter('ava_deftaxcode'));
			record.setFieldValue('custrecord_ava_usepostingdate',   	request.getParameter('ava_usepostingperiod'));
			record.setFieldValue('custrecord_ava_taxinclude',      		request.getParameter('ava_taxinclude'));
			record.setFieldValue('custrecord_ava_enablediscount',   	request.getParameter('ava_enablediscount'));
			record.setFieldValue('custrecord_ava_discountmapping',  	request.getParameter('ava_discountmapping'));
			record.setFieldValue('custrecord_ava_discounttaxcode',  	request.getParameter('ava_discounttaxcode'));
			record.setFieldValue('custrecord_ava_disableloccode',   	request.getParameter('ava_disableloccode'));
			record.setFieldValue('custrecord_ava_enableupccode',    	request.getParameter('ava_enableupccode'));
			
			record.setFieldValue('custrecord_ava_addressee',			request.getParameter('ava_def_addressee'));
			record.setFieldValue('custrecord_ava_address1',				request.getParameter('ava_def_addr1'));
			record.setFieldValue('custrecord_ava_address2',				request.getParameter('ava_def_addr2'));
			record.setFieldValue('custrecord_ava_city',					request.getParameter('ava_def_city'));
			record.setFieldValue('custrecord_ava_state',				request.getParameter('ava_def_state'));
			record.setFieldValue('custrecord_ava_zip',					request.getParameter('ava_def_zip'));
			record.setFieldValue('custrecord_ava_country',				request.getParameter('ava_def_country'));
		
			record.setFieldValue('custrecord_ava_abortbulkbilling', 	 request.getParameter('ava_abortbulkbilling'));
			record.setFieldValue('custrecord_ava_abortuserinterfaces', 	 request.getParameter('ava_abortuserinterfaces'));
			record.setFieldValue('custrecord_ava_abortwebservices', 	 request.getParameter('ava_abortwebservices'));
			record.setFieldValue('custrecord_ava_abortcsvimports', 		 request.getParameter('ava_abortcsvimports'));
			record.setFieldValue('custrecord_ava_abortscheduledscripts', request.getParameter('ava_abortscheduledscripts'));
			record.setFieldValue('custrecord_ava_abortsuitelets', 		 request.getParameter('ava_abortsuitelets'));
			record.setFieldValue('custrecord_ava_abortworkflowscripts',  request.getParameter('ava_abortworkflowactionscripts'));
			
			/* Address Validation Elements Details */
			record.setFieldValue('custrecord_ava_disableaddvalidation', request.getParameter('ava_disableaddvalidation'));
			record.setFieldValue('custrecord_ava_adduppercase', 		request.getParameter('ava_uppercaseaddress'));
			record.setFieldValue('custrecord_ava_addbatchprocessing', 	(request.getParameter('ava_addbatchprocessing') == 'manual' ? '0' : '1'));
			record.setFieldValue('custrecord_ava_enableaddvalontran',   request.getParameter('ava_enableaddvalontran'));
			record.setFieldValue('custrecord_ava_enableaddvalflag',     request.getParameter('ava_enableaddvalflag'));
			
			nlapiSubmitRecord(record, false);
			nlapiSetRedirectURL('TASKLINK', 'CARD_-29');
		}
	}
}

function AVA_EnableNexusExistingComp()
{	
	var URL = nlapiResolveURL('SUITELET', 'customscript_avaenablenexus_suitelet', 'customdeploy_avaenablenexus_suitelet', false);
	URL += '&company=exist';
	window.open(URL, '_blank');
}

function AVA_ConfigWizardChanged(type, name, linenum)
{
	var address = '';
	var AVA_Address = new Array(7);
	
	// Store Configurations Logs
	/*switch(name)
	{
		case 'ava_company':
			ConfigLogs.AvaTaxCompanyCodeName = nlapiGetFieldValue(name);
			break;
		case 'ava_taxcodemapping':
			ConfigLogs.EnableTaxCodeMapping = nlapiGetFieldValue(name);
			break;
		case 'ava_taxcodeprecedence':
			ConfigLogs.TaxCodePrecedence = nlapiGetFieldValue(name);
			break;
		case 'ava_udf1':
			ConfigLogs.UserDefined1 = nlapiGetFieldValue(name);
			break;
		case 'ava_udf2':
			ConfigLogs.UserDefined2 = nlapiGetFieldValue(name);
			break;
		case 'ava_itemaccount':
			ConfigLogs.SendItemAccountToAvalara = nlapiGetFieldValue(name);
			break;
		case 'ava_customercode':
			ConfigLogs.CustomerCode = nlapiGetFieldValue(name);
			break;
		case 'ava_vendorcode':
			ConfigLogs.VendorCode = nlapiGetFieldValue(name);
			break;
		case 'ava_markcusttaxable':
			ConfigLogs.DefaultCustomersToTaxable = nlapiGetFieldValue(name);
			break;
		case 'ava_defaultcustomer':
			ConfigLogs.ApplyDefaultTaxcodeTo = nlapiGetFieldValue(name);
			break;
		case 'ava_entityusecode':
			ConfigLogs.EnableEntityUseCode = nlapiGetFieldValue(name);
			break;
		case 'ava_defshipcode':
			ConfigLogs.DefaultShippingCode = nlapiGetFieldValue(name);
			break;
		case 'ava_showmessages':
			ConfigLogs.ShowWarningsError = nlapiGetFieldValue(name);
			break;
		case 'ava_billtimename':
			ConfigLogs.BillableTimeName = nlapiGetFieldValue(name);
			break;
		case 'ava_disabletax':
			ConfigLogs.DisableTaxCalculation = nlapiGetFieldValue(name);
			break;
		case 'ava_disabletaxquote':
			ConfigLogs.DisableTaxCalculationQuote = nlapiGetFieldValue(name);
			break;
		case 'ava_disabletaxsalesorder':
			ConfigLogs.DisableTaxCalculationOrder = nlapiGetFieldValue(name);
			break;
		case 'ava_disableline':
			ConfigLogs.DisableTaxCalculationLineLevel = nlapiGetFieldValue(name);
			break;
		case 'ava_enablelogging':
			ConfigLogs.EnableLogging = nlapiGetFieldValue(name);
			break;
		case 'ava_taxondemand':
			ConfigLogs.CalculateTaxOnDemand = nlapiGetFieldValue(name);
			break;
		case 'ava_taxinclude':
			ConfigLogs.TaxIncludedCapability = nlapiGetFieldValue(name);
			break;
		case 'ava_usepostingperiod':
			ConfigLogs.UsePostingPeriod = nlapiGetFieldValue(name);
			break;
		case 'ava_disableloccode':
			ConfigLogs.DisableLocationCode = nlapiGetFieldValue(name);
			break;
		case 'ava_enableupccode':
			ConfigLogs.EnableUPCCode = nlapiGetFieldValue(name);
			break;
		case 'ava_enablediscount':
			ConfigLogs.EnableDiscountMechanism = nlapiGetFieldValue(name);
			break;
		case 'ava_discountmapping':
			ConfigLogs.DiscountMapping = nlapiGetFieldValue(name);
			break;
		case 'ava_discounttaxcode':
			ConfigLogs.DiscountTaxCode = nlapiGetFieldValue(name);
			break;
		case 'ava_taxrate':
			ConfigLogs.TaxRate = nlapiGetFieldValue(name);
			break;
		case 'ava_decimalplaces':
			ConfigLogs.RoundOffTaxPercentage = nlapiGetFieldValue(name);
			break;
		case 'ava_deftaxcode':
			ConfigLogs.DefaultTaxCode = nlapiGetFieldValue(name);
			break;
		case 'ava_deftaxcoderate':
			ConfigLogs.DefaultTaxCodeRate = nlapiGetFieldValue(name);
			break;
		case 'ava_def_addressee':
			ConfigLogs.Addressee = nlapiGetFieldValue(name);
			break;
		case 'ava_def_addr1':
			ConfigLogs.Address1 = nlapiGetFieldValue(name);
			break;
		case 'ava_def_addr2':
			ConfigLogs.Address2 = nlapiGetFieldValue(name);
			break;
		case 'ava_def_city':
			ConfigLogs.City = nlapiGetFieldValue(name);
			break;
		case 'ava_def_state':
			ConfigLogs.State = nlapiGetFieldValue(name);
			break;
		case 'ava_def_zip':
			ConfigLogs.Zip = nlapiGetFieldValue(name);
			break;
		case 'ava_def_country':
			ConfigLogs.Country = nlapiGetFieldValue(name);
			break;
		case 'ava_abortbulkbilling':
			ConfigLogs.AbortBulkBilling = nlapiGetFieldValue(name);
			break;
		case 'ava_abortuserinterfaces':
			ConfigLogs.AbortUserInterfaces = nlapiGetFieldValue(name);
			break;
		case 'ava_abortwebservices':
			ConfigLogs.AbortWebservices = nlapiGetFieldValue(name);
			break;
		case 'ava_abortcsvimports':
			ConfigLogs.AbortCSVImports = nlapiGetFieldValue(name);
			break;
		case 'ava_abortscheduledscripts':
			ConfigLogs.AbortScheduledScripts = nlapiGetFieldValue(name);
			break;
		case 'ava_abortsuitelets':
			ConfigLogs.AbortSuitelets = nlapiGetFieldValue(name);
			break;
		case 'ava_abortworkflowactionscripts':
			ConfigLogs.AbortWorkFlowActionsScripts = nlapiGetFieldValue(name);
			break;
		case 'ava_enablebatchservice':
			ConfigLogs.EnableUseTaxBatchService = nlapiGetFieldValue(name);
			break;
		case 'ava_enableusetax':
			ConfigLogs.EnableUseTaxAssessment = nlapiGetFieldValue(name);
			break;
		case 'ava_creditaccount':
			ConfigLogs.UseTaxPayableAccount = nlapiGetFieldValue(name);
			break;
		case 'ava_glaccount':
			ConfigLogs.GLAccountDebit = nlapiGetFieldValue(name);
			break;
		case 'ava_debitaccount':
			ConfigLogs.UseTaxDebitAccount = nlapiGetFieldValue(name);
			break;
		case 'ava_enablevatin':
			ConfigLogs.EnableInputVAT = nlapiGetFieldValue(name);
			break;
		case 'ava_disableaddvalidation':
			ConfigLogs.DisableAddressValidation = nlapiGetFieldValue(name);
			break;
		case 'ava_enableaddvalontran':
			ConfigLogs.EnableAddrValTransaction = nlapiGetFieldValue(name);
			break;
		case 'ava_enableaddvalflag':
			ConfigLogs.TrackPreviouslyValAddr = nlapiGetFieldValue(name);
			break;
		case 'ava_uppercaseaddress':
			ConfigLogs.ResultInUpperCase = nlapiGetFieldValue(name);
			break;
		case 'ava_addbatchprocessing':
			ConfigLogs.BatchProcessing = nlapiGetFieldValue(name);
			break;
		default :
			break;
	}*?
	
	/* Start of 1st Check */
	if (name == 'ava_disabletax')
	{
		if (nlapiGetFieldValue('ava_disabletax') == 'T')
		{
			if (confirm('Are you sure you want to disable AvaTax Tax Calculation ?') == true)
			{
				AVA_DisableTaxFields(true);
			}
			else
			{
				nlapiSetFieldValue('ava_disabletax', 'F');
			}
		}
		else
		{
			AVA_DisableTaxFields(false);
		}
	}
	/* End of 1st Check */		

	/* Start of 2nd Check */		
	if(name == 'ava_deftaxcode')
	{
		var val = nlapiGetFieldValue('ava_deftaxcode');
		val = val.substr(val.lastIndexOf('+')+1, val.length);
		nlapiSetFieldValue('ava_deftaxcoderate', val, 'F');
	}
	
	/* End of 2nd Check */	
		
	/* Start of 3rd Check */		
	if ((name == 'ava_def_addressee') || (name == 'ava_def_addr1') || (name == 'ava_def_addr2') || (name == 'ava_def_city') || (name == 'ava_def_state') || (name == 'ava_def_zip') || (name == 'ava_def_country'))
	{
		if (nlapiGetFieldValue('ava_def_addressee') != null)
		{
			AVA_Address[0] = (nlapiGetFieldValue('ava_def_addressee').length > 0)? nlapiGetFieldValue('ava_def_addressee') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_addr1') != null)
		{
			AVA_Address[1] = (nlapiGetFieldValue('ava_def_addr1').length > 0)? nlapiGetFieldValue('ava_def_addr1') + '\n' : '';
		}
		if(nlapiGetFieldValue('ava_def_addr2') != null)
		{
			AVA_Address[2] = (nlapiGetFieldValue('ava_def_addr2').length > 0)? nlapiGetFieldValue('ava_def_addr2') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_city') != null)
		{
			AVA_Address[3] = (nlapiGetFieldValue('ava_def_city').length > 0) ? nlapiGetFieldValue('ava_def_city') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_state') != null)
		{
			AVA_Address[4] = (nlapiGetFieldValue('ava_def_state').length > 0) ? nlapiGetFieldValue('ava_def_state') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_zip') != null)
		{
			AVA_Address[5] = (nlapiGetFieldValue('ava_def_zip').length > 0) ? nlapiGetFieldValue('ava_def_zip') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_country') != null)
		{
			AVA_Address[6] = (nlapiGetFieldValue('ava_def_country').length > 0) ? nlapiGetFieldValue('ava_def_country') + '\n' : '';
		}

		for(var i=0; i <= 6 ; i++)
		{
			address = address +  AVA_Address[i];
		}
		
		nlapiSetFieldValue('ava_def_addrtext', address, false);
	}
	/* End of 3rd Check */		
		
	if(name == 'ava_addressvalidate')
	{		
		if(nlapiGetFieldValue('ava_addressvalidate') == 'T')
		{			
			var response ;
			var AVA_URL = (nlapiGetFieldValue('ava_serviceurl') == '1') ? AVA_DevelopmentURL : AVA_ProductionURL;
			var security = AVA_TaxSecurity(nlapiGetFieldValue('ava_accountvalue'), nlapiGetFieldValue('ava_licensekey'));
			var headers = AVA_Header(security);
			var body = AVA_ValidateShipFromAddressBody();
			var soapPayload = AVA_BuildEnvelope(headers + body);
			
			var soapHead = {};
			soapHead['Content-Type'] = 'text/xml';
			soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/Validate"';
			
			try
			{	
				response = nlapiRequestURL(AVA_URL + '/address/addresssvc.asmx', soapPayload, soapHead);
				
				if(response.getCode() == 200)
				{	
					var soapText = response.getBody();
				    var soapXML = nlapiStringToXML(soapText);
					
					var ValidateResult = nlapiSelectNode(soapXML, "//*[name()='ValidateResult']");
					var ResultCode = nlapiSelectValue(ValidateResult, "//*[name()='ResultCode']");
					
					if(ResultCode == 'Success')
					{
						var Line1 		= nlapiSelectValues( soapXML, "//*[name()='Line1']");
						var Line2 		= nlapiSelectValues( soapXML, "//*[name()='Line2']");
						var City  		= nlapiSelectValues( soapXML, "//*[name()='City']");
						var Region  	= nlapiSelectValues( soapXML, "//*[name()='Region']");
						var PostalCode  = nlapiSelectValues( soapXML, "//*[name()='PostalCode']");
						var Country  	= nlapiSelectValues( soapXML, "//*[name()='Country']");
							
						nlapiSetFieldValue('ava_def_addr1', 	Line1, false);
						nlapiSetFieldValue('ava_def_addr2', 	Line2, false);
						nlapiSetFieldValue('ava_def_city', 		City, false);
						nlapiSetFieldValue('ava_def_state', 	Region, false);
						nlapiSetFieldValue('ava_def_zip', 		PostalCode, false);
						nlapiSetFieldValue('ava_def_country', 	Country, false);
							
						var address = '';
						Line2 = (Line2 !=null && Line2.length > 0)? '\n' + Line2 : '';
						address = nlapiGetFieldValue('ava_def_addressee') + '\n' + Line1 + Line2 + City + '\n' + Region + '\n' + PostalCode + '\n' + Country;
						nlapiSetFieldValue('ava_def_addrtext',address, false);
							
					}
					else
					{
						alert(nlapiSelectValue( ValidateResult, "//*[name()='Summary']"));
					}
				}
	
			}
			catch(err)
			{
				alert('Address Validation was not Successful');
			}
		}
		nlapiSetFieldValue('ava_addressvalidate', 'F', false);
	}	
	
	if(name == 'ava_disableaddvalidation')
	{
		if(nlapiGetFieldValue('ava_disableaddvalidation') == 'T')
		{
			nlapiDisableField('ava_enableaddvalontran', true);
			nlapiDisableField('ava_enableaddvalflag', true);
			nlapiDisableField('ava_uppercaseaddress', true);
			nlapiDisableField('ava_addbatchprocessing', true);
		}
		else if(nlapiGetFieldValue('ava_disableaddvalidation') == 'F')
		{
			nlapiDisableField('ava_enableaddvalontran', false);
			nlapiDisableField('ava_enableaddvalflag', false);
			nlapiDisableField('ava_uppercaseaddress', false);
			nlapiDisableField('ava_addbatchprocessing', false);
		}
	}

	/* Start of 5th check */
	if(name == 'ava_customercode')
	{
		if(nlapiGetFieldValue('ava_customercode') >= 3 && nlapiGetFieldValue('ava_customercode') != 6)
		{
			if(nlapiGetContext().getFeature('prm') != true)
			{
				alert('Partner information cannot be passed to service as the required features are not enabled.');
			}
			else
			{
				if(nlapiGetContext().getFeature('multipartner') == true)
				{
					alert('Customer information will be passed to the service as Multi-Partner Management feature is enabled.');
				}
			}
		}
	}
	
	if(name == 'ava_enablebatchservice')
	{
		var displaytype = (nlapiGetFieldValue('ava_enablebatchservice') == 'T') ? true : false;
		
		if(nlapiGetFieldValue('ava_enablebatchservice') == 'T')
		{
			nlapiSetFieldValue('ava_enableusetax', 'F');
			nlapiDisableField('ava_enableusetax',  displaytype);
			nlapiDisableField('ava_creditaccount', displaytype);
			nlapiDisableField('ava_glaccounts',    displaytype);
			nlapiDisableField('ava_debitaccount',  displaytype);
		}
		else
		{
			nlapiDisableField('ava_enableusetax',  displaytype);
		}
	}
	
	if(name == 'ava_licensekey')
	{
		var licensekey = nlapiGetFieldValue('ava_licensekey');
		if(licensekey != null && licensekey.length > 0)
		{
			var LicenseKey = nlapiEncrypt(licensekey, 'aes', Sha256.hash('AVATAX'));
			nlapiSetFieldValue('ava_licensekey', LicenseKey, false);
		}
	}
	
	if(name == 'ava_password')
	{
		var password = nlapiGetFieldValue('ava_password');
		if(password != null && password.length > 0)
		{
			var Password = nlapiEncrypt(password, 'aes', Sha256.hash('AVATAX'));
			nlapiSetFieldValue('ava_password', Password, false);
		}
	}
	
	if(name == 'ava_enablediscount')
	{
		var displaytype = (nlapiGetFieldValue('ava_enablediscount') == 'T') ? false : true;
		nlapiDisableField('ava_discountmapping', displaytype);
		nlapiDisableField('ava_discounttaxcode', displaytype);
	}
	
	if(name == 'ava_enableusetax')
	{
		if(nlapiGetFieldValue('ava_enableusetax') == 'T' && nlapiGetContext().getFeature('advtaxengine') == false)
		{
			alert('Please enable Advanced Taxes feature to use UseTax Assessment feature.');
			nlapiSetFieldValue('ava_enableusetax', 'F');
		}
		
		var displaytype = (nlapiGetFieldValue('ava_enableusetax') == 'T') ? false : true;
		nlapiDisableField('ava_creditaccount', displaytype);
		nlapiDisableField('ava_glaccounts',    displaytype);
		if(nlapiGetFieldValue('ava_glaccounts') == 'glaccount')
		{
			nlapiDisableField('ava_debitaccount',  displaytype);
		}
	}
	
	if(name == 'ava_glaccounts')
	{
		if(nlapiGetFieldValue('ava_glaccounts') == 'glaccount')
		{
			nlapiDisableField('ava_debitaccount', false);
		}
		else
		{
			nlapiDisableField('ava_debitaccount', true);
		}
	}
	
	if(name == 'ava_enablevatin')
	{
		if(nlapiGetFieldValue('ava_enablevatin') == 'T' && nlapiGetContext().getFeature('advtaxengine') == false)
		{
			alert('Please enable Advanced Taxes feature to use Input VAT Verification feature.');
			nlapiSetFieldValue('ava_enablevatin', 'F');
		}
		
		/*var displaytype = (nlapiGetFieldValue('ava_enablevatin') == 'T') ? false : true;
		nlapiDisableField('ava_vatinputaccount',  displaytype);
		nlapiDisableField('ava_vatoutputaccount', displaytype);*/
	}
}

function AVA_DisableTaxFields(displaytype)
{
	nlapiDisableField('ava_disabletaxquote', 			displaytype);
	nlapiDisableField('ava_disabletaxsalesorder', 		displaytype);
	nlapiDisableField('ava_disableline', 				displaytype);
	nlapiDisableField('ava_taxondemand', 				displaytype);
	nlapiDisableField('ava_enablelogging', 				displaytype);
	nlapiDisableField('ava_deftaxcode', 				displaytype);
	nlapiDisableField('ava_taxrate', 					displaytype);
	nlapiDisableField('ava_decimalplaces', 				displaytype);
	if(nlapiGetContext().getFeature('accountingperiods') == true)
	{
		nlapiDisableField('ava_usepostingperiod', 		displaytype);
	}
	nlapiDisableField('ava_taxinclude', 	    		displaytype);
	nlapiDisableField('ava_enablediscount', 	    	displaytype);
	var display = (displaytype == true) ? true : ((nlapiGetFieldValue('ava_enablediscount') == 'T') ? false : true);
	nlapiDisableField('ava_discountmapping', 	   		display);
	nlapiDisableField('ava_discounttaxcode', 	    	display);
	nlapiDisableField('ava_disableloccode', 	    	displaytype);
	if(nlapiGetContext().getFeature('barcodes') == true)
	{
		nlapiDisableField('ava_enableupccode',	 	    displaytype);
	}
	nlapiDisableField('ava_abortbulkbilling', 			displaytype);
	nlapiDisableField('ava_abortuserinterfaces', 		displaytype);
	nlapiDisableField('ava_abortwebservices', 			displaytype);
	nlapiDisableField('ava_abortcsvimports', 			displaytype);
	nlapiDisableField('ava_abortscheduledscripts', 		displaytype);
	nlapiDisableField('ava_abortsuitelets', 			displaytype);
	nlapiDisableField('ava_abortworkflowactionscripts', displaytype);
}

function AVA_ConfigWizardSave()
{
	var connResult = true;

	if(nlapiGetFieldValue('ava_flag') != null && (nlapiGetFieldValue('ava_company') == null || nlapiGetFieldValue('ava_company').length == 0))
	{
		alert('Please select AvaTax Company Code/Name');
		return false;
	}
	
	if(nlapiGetFieldValue('ava_customercode') >= 3 && nlapiGetFieldValue('ava_customercode') != 6)
	{
		if(nlapiGetContext().getFeature('prm') != true)
		{
			alert('Partner information cannot be passed to service as the required features are not enabled.');
			return false;
		}
	}
	
	if(nlapiGetFieldValue('ava_enableusetax') == 'T' && nlapiGetFieldValue('ava_creditaccount') != null && nlapiGetFieldValue('ava_debitaccount') != null)
	{
		nlapiSetFieldValue('ava_glaccountstext', nlapiGetFieldValue('ava_glaccounts'));
		if(nlapiGetFieldValue('ava_creditaccount') == null || nlapiGetFieldValue('ava_creditaccount').length == 0)
		{
			alert('Please select Use Tax Payable Liability Account');
			return false;
		}
		if(nlapiGetFieldValue('ava_glaccounts') == 'glaccount' && (nlapiGetFieldValue('ava_debitaccount') == null || nlapiGetFieldValue('ava_debitaccount').length == 0))
		{
			alert('Please select Use Tax Debit Account');
			return false;
		}
	}
	
	/*if(nlapiGetFieldValue('ava_enablevatin') == 'T' && nlapiGetFieldValue('ava_vatinputaccount') != null && nlapiGetFieldValue('ava_vatoutputaccount') != null)
	{
		if(nlapiGetFieldValue('ava_vatinputaccount') == null || nlapiGetFieldValue('ava_vatinputaccount').length == 0)
		{
			alert('Please select Input VAT Account');
			return false;
		}
		if(nlapiGetFieldValue('ava_vatoutputaccount') == null || nlapiGetFieldValue('ava_vatoutputaccount').length == 0)
		{
			alert('Please select Output VAT Account');
			return false;
		}
	}*/
	
	if(nlapiGetFieldValue('ava_enablediscount') == 'T')
	{
		if(nlapiGetFieldValue('ava_discounttaxcode') == null || nlapiGetFieldValue('ava_discounttaxcode').length == 0)
		{
			alert('Please Enter Discount Tax Code');
			return false;
		}
	}
	
	if(nlapiGetFieldValue('ava_deftaxcode') != null)
	{
		if(nlapiGetFieldValue('ava_deftaxcode').length == 0)
		{
			alert('Please select Default Tax Code');
			return false;
		}
	}
	
	if(nlapiGetFieldValue('ava_deftaxcoderate') != null)
	{
		var TaxRate = nlapiGetFieldText('ava_deftaxcoderate');
		if(TaxRate.indexOf('%') == -1)
		{
			if(parseFloat(TaxRate) > 0)
			{
				alert('Default Tax Code rate selected should be equal to zero');
				return false;
			}
		}
		else
		{
			TaxRate = TaxRate.substr(0, TaxRate.indexOf('%'));
			if(parseFloat(TaxRate) > 0)
			{
				alert('Default Tax Code rate selected should be equal to zero');
				return false;
			}
		}
	}
	
	if(nlapiGetFieldValue('ava_servicetypes') != null)
	{
		connResult = AVA_ConfigTestConnection();
		nlapiSetFieldValue('ava_servicetypes', AVA_ServiceTypes);
	}
	
	// Generating Configuration Logs on AvaTax server(CPH)
	/*if(nlapiGetFieldValue('ava_servicetype') != null)
	{
		AVA_AccountValue = nlapiGetFieldValue('ava_accountvalue');
		AVA_ServiceUrl   = nlapiGetFieldValue('ava_serviceurl');
		
		var AVA_ConfigLogs = JSON.stringify(ConfigLogs);
		if(AVA_ConfigLogs != null)
		{
			AVA_ConfigLogs = AVA_ConfigLogs.replace(/"/g, "");
			AVA_ConfigLogs = AVA_ConfigLogs.replace(/,/g, " ~ ");
		}
		
		if(AVA_ConfigLogs.length > 2)
		{
			AVA_Logs('0', 'ConfigurationForm', 'StartTime', '', 'ConfigurationSetting', 'ConfigAudit', 'Informational', AVA_ConfigLogs, 'Config');
		}
	}*/

	// Generating JSON request for creating company on AvaTax Admin Console.
	if(nlapiGetFieldValue('ava_companyname') != null)
	{
		var AVA_CompanyName	 = nlapiGetFieldValue('ava_companyname');
		var AVA_AddressLine1 = nlapiGetFieldValue('ava_address1');
		var AVA_AddressLine2 = nlapiGetFieldValue('ava_address2');
		var AVA_City		 = nlapiGetFieldValue('ava_city');
		var AVA_State		 = nlapiGetFieldValue('ava_state');
		var AVA_ZipCode		 = nlapiGetFieldValue('ava_zip');
		var AVA_Country		 = nlapiGetFieldValue('ava_country');
		var AVA_CompanyCode	 = nlapiGetFieldValue('ava_companycode');
		var AVA_Email		 = nlapiGetFieldValue('ava_email');
		var AVA_FirstName	 = nlapiGetFieldValue('ava_firstname');
		var AVA_LastName	 = nlapiGetFieldValue('ava_lastname');
		var AVA_PhoneNumber	 = nlapiGetFieldValue('ava_phonenumber');
		var AVA_tinNumber	 = (nlapiGetFieldValue('ava_tinnumber') != null && nlapiGetFieldValue('ava_tinnumber').length > 0) ? nlapiGetFieldValue('ava_tinnumber') : '000000000';

		var AVA_CompanyAddr = new CompanyAddr(AVA_City, AVA_Country, AVA_AddressLine1, AVA_AddressLine2, '', AVA_State, AVA_ZipCode);
		var AVA_CompanyContact = new CompanyContact(AVA_Email, '', AVA_FirstName, AVA_LastName, '', AVA_PhoneNumber, '');
		var AVA_Company = new Company('', AVA_CompanyAddr, AVA_CompanyCode, AVA_CompanyContact, AVA_CompanyName, AVA_tinNumber);
		var AVA_CompanyRequest = new CompanyRequest(AVA_Company);
		
		var AVA_CreateCompanyBody = JSON.stringify(AVA_CompanyRequest);
		
		var AccountValue = nlapiGetFieldValue('ava_accountvalue');
		var AVA_Username = nlapiGetFieldValue('ava_username');
		var AVA_Password = nlapiDecrypt(nlapiGetFieldValue('ava_password'), 'aes', Sha256.hash('AVATAX'));
		
		if(nlapiGetFieldValue('ava_serviceurl') == '1')
		{
			var AccountType    = 'sandbox.';
			var Authentication = 'TEST/' + AVA_Username + ':' + AVA_Password;
		}
		else
		{
			var AccountType    = '';
			var Authentication = AVA_Username + ':' + AVA_Password;
		}
		
		var soapHead = {};
		soapHead['Content-Type']  = 'application/json';
		soapHead['Accept'] 		  = 'application/json';
		soapHead['Authorization'] = 'Basic ' + nlapiEncrypt(Authentication, 'base64');
		
		try
		{
			var response = nlapiRequestURL('https://' + AccountType + 'onboarding.api.avalara.com/v1/Accounts/' + AccountValue + '/Companies' , AVA_CreateCompanyBody, soapHead);
			var jsonResponse = JSON.parse(response.getBody());
			
			if(response.getCode() == 200)
			{	
				if(jsonResponse.Status == 'Success')
				{
					alert(jsonResponse.Message);
					window.opener.location.reload(); // Refresh parent window
				}
			}
			else
			{
				if(jsonResponse.Status == 'Error')
				{
					var Message = jsonResponse.Message;
					
					if(Message.search('Access denied') != -1)
					{
						alert('Company cannot be created. Please verify your credentials');
					}
					else
					{
						alert(jsonResponse.Message);
					}
					
					connResult = false;
				}
			}
		}
		catch(err)
		{
			alert("Please contact the administrator. " + err.message);
			connResult = false;
		}
	}
	
	// Generating JSON request for enabling nexus of company on AvaTax Admin Console.
	if(nlapiGetFieldValue('ava_nexusform') != null)
	{
		if(nlapiGetLineItemCount('custpage_nexuslist') > 0)
		{
			var NexusFlag = 0;
			var NexusArray = new Array();
			
			for(var i = 1; i <= nlapiGetLineItemCount('custpage_nexuslist'); i++)
			{
				if(nlapiGetLineItemValue('custpage_nexuslist', 'ava_selectnexus', i) == 'T')
				{
					NexusFlag = 1;
					NexusArray.push(new NexusAddress('', nlapiGetLineItemValue('custpage_nexuslist', 'ava_nexuscountry', i), '', '', '', nlapiGetLineItemValue('custpage_nexuslist', 'ava_nexusstate', i), ''));
				}
			}
			
			if(NexusFlag == 0)
			{
				alert('Please select atleast one nexus.');
				return false;
			}
			else
			{
				var Nexuses = new NexusList(NexusArray);
				var AVA_EnableNexusBody = JSON.stringify(Nexuses);
				
				var AccountValue = nlapiGetFieldValue('ava_accountvalue');
				var AVA_Username = nlapiGetFieldValue('ava_username');
				var AVA_Password = nlapiDecrypt(nlapiGetFieldValue('ava_pass'), 'aes', Sha256.hash('AVATAX'));
				var CompanyCode  = nlapiGetFieldValue('ava_compcode');
				
				if(nlapiGetFieldValue('ava_serviceurl') == '1')
				{
					var AccountType    = 'sandbox.';
					var Authentication = 'TEST/' + AVA_Username + ':' + AVA_Password;
				}
				else
				{
					var AccountType    = '';
					var Authentication = AVA_Username + ':' + AVA_Password;
				}
				
				var soapHead = {};
				soapHead['Content-Type']  = 'application/json';
				soapHead['Accept'] 		  = 'application/json';
				soapHead['Authorization'] = 'Basic ' + nlapiEncrypt(Authentication, 'base64');
				
				try
				{
					var response = nlapiRequestURL('https://' + AccountType + 'onboarding.api.avalara.com/v1/Accounts/' + AccountValue + '/Companies/' + CompanyCode + '/Nexuses', AVA_EnableNexusBody, soapHead);
					var jsonResponse = JSON.parse(response.getBody());
					
					if(response.getCode() == 200)
					{	
						if(jsonResponse.Status == 'Success')
						{
							window.onbeforeunload = undefined;
							alert(jsonResponse.Message);
							
							if(nlapiGetFieldValue('ava_compflag') == 'new')
							{
								window.close();
							}
						}
					}
					else
					{
						if(jsonResponse.Status == 'Error')
						{
							alert(jsonResponse.Message);
							connResult = false;
						}
					}
				}
				catch(err)
				{
					alert("Please contact the administrator. " + err.message);
					connResult = false;
				}
			}
		}
		else
		{
			return false;
		}
	}
	
	return connResult;
}

function AVA_ConfigTestConnection()
{
	AVA_ServiceTypes = '';
	var AVA_AccountValue = nlapiGetFieldValue('ava_accountvalue');
	var AVA_LicenseKey = nlapiGetFieldValue('ava_licensekey');
	var AVA_URL = (nlapiGetFieldValue('ava_serviceurl') == '1') ? AVA_DevelopmentURL : AVA_ProductionURL;
	var AVA_Username = nlapiGetFieldValue('ava_username');
	var AVA_Password = nlapiGetFieldValue('ava_password');

	if ((AVA_AccountValue.length != 0) && (AVA_LicenseKey.length != 0) && (AVA_Username.length != 0) && (AVA_Password.length != 0))
	{
		var security = AVA_BuildSecurity(AVA_AccountValue, AVA_LicenseKey);
		var headers = AVA_Header(security);
		var body = AVA_IsAuthorizedBody();
		var soapPayload = AVA_BuildEnvelope(headers + body);

		var soapHead = {};
		soapHead['Content-Type'] = 'text/xml';
		soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/IsAuthorized';

		try
		{
			var AVA_Date;
			var svcTypeUrl;
			var AVA_Expirydate = null;

			for(var svc = 1; svc <= 2; svc++)
			{
				switch(svc)
				{
					case 1: svcTypeUrl = '/tax/taxsvc.asmx';
							break;
					//case 2: svcTypeUrl = '/address/addresssvc.asmx';
							//break;
					default: svcTypeUrl = '/avacert2/avacert2svc.asmx';
							break;
				}
				
				var response = nlapiRequestURL(AVA_URL + svcTypeUrl, soapPayload, soapHead);

				if (response.getCode() == 200)
				{
					var soapText = response.getBody();
					var soapXML = nlapiStringToXML(soapText);

					var IsAuthorizedResult = nlapiSelectNode(soapXML, "//*[name()='IsAuthorizedResult']");

					var ResultCode = nlapiSelectValue(IsAuthorizedResult, "//*[name()='ResultCode']");
					
					if (ResultCode == 'Success')
					{
						AVA_Expirydate = nlapiSelectValue(IsAuthorizedResult, "//*[name()='Expires']");
						AVA_Date = AVA_DateFormat(nlapiGetFieldValue('ava_globaldateformat'), AVA_Expirydate);
						AVA_ServiceTypes += (svc == 1) ? 'TaxSvc, AddressSvc, ' : 'AvaCert2Svc';
					}
				}
			}

			if(AVA_Date != null && AVA_Date.length > 0)
			{
				if(AVA_ServiceTypes != null && AVA_ServiceTypes.length > 0)
				{
					if(AVA_UserAccountTestConnection() == false)
					{
						return false;
					}
					
					alert("License keys validated successfully. License Keys are valid till " + AVA_Date);
					return true;
				}
				else
				{
					alert("No services enabled for this account. Please contact Avalara Support.");
					return false;
				}
			}
			else
			{
				alert("Enter the correct Account Value and License key and URL provided during registration.");
				return false;
			}
		}
		catch(err)
		{
			alert("Please contact Avalara Support on (877)-780-4848");
			return false;
		}
	}
	else
	{
		alert("Not all required fields have been entered");
		if(nlapiGetFieldValue('ava_accountvalue') == null || nlapiGetFieldValue('ava_accountvalue').length == 0)
		{
			document.forms['main_form'].ava_accountvalue.focus();
		}
		else if(nlapiGetFieldValue('ava_licensekey') == null || nlapiGetFieldValue('ava_licensekey').length == 0)
		{
			document.forms['main_form'].ava_licensekey.focus();
		}
		else if(nlapiGetFieldValue('ava_username') == null || nlapiGetFieldValue('ava_username').length == 0)
		{
			document.forms['main_form'].ava_username.focus();
		}
		else if(nlapiGetFieldValue('ava_password') == null || nlapiGetFieldValue('ava_password').length == 0)
		{
			document.forms['main_form'].ava_password.focus();
		}
        
        return false;
	}
}

//Function for fetching the company from Admin Console
function AVA_CompanyFetch(Url, Username, Password, Flag)
{
	var soapCompanyHead = {};
	soapCompanyHead['Content-Type'] = 'text/xml';
	soapCompanyHead['SOAPAction'] = 'http://avatax.avalara.com/services/CompanyFetch';
	
	var security    = AVA_CompanyFetchSecurity(Username, Password);
	var headers	    = AVA_CompanyFetchHeader(security);	
	var body	    = AVA_CompanyFetchBody(Flag, '0');
	var soapPayload = AVA_CompanyFetchEnvelope(headers + body);
	
	var AVA_URL = (Url == '1') ? AVA_DevelopmentURL : AVA_ProductionURL;
	
	try
	{
		var response = nlapiRequestURL(AVA_URL + '/account/accountsvc.asmx', soapPayload, soapCompanyHead);
		if(response.getCode() == 200)
		{
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);
			var CompanyFetchResult = nlapiSelectNode(soapXML, "//*[name()='CompanyFetchResult']");
			var AVA_ResultCode = nlapiSelectValue( CompanyFetchResult, "//*[name()='ResultCode']");
			var RecordCount = nlapiSelectValue(soapXML, "//*[name()='RecordCount']");
			
			if(AVA_ResultCode == 'Success' && RecordCount > 0) 
			{
				if(Flag == 1)
				{
					var CompanyArray = nlapiSelectNodes( CompanyFetchResult, "//*[name()='Company']");
					
					for(var i = 0; CompanyArray != null && i < CompanyArray.length ; i++)
					{
						AVA_CompanyInfo[i] = new Array();
						AVA_CompanyInfo[i][0] = nlapiSelectValue( CompanyArray[i], "./*[name()='CompanyCode']");
						AVA_CompanyInfo[i][1] = nlapiSelectValue( CompanyArray[i], "./*[name()='CompanyName']");
					}
				}
				else
				{
					var CompanyNodes = nlapiSelectNode( soapXML, "//*[name()='Company']");
					
					if(nlapiSelectValue( CompanyNodes, "//*[name()='HasProfile']") == 'false')
					{
						while(nlapiSelectValue( CompanyNodes, "//*[name()='HasProfile']") == 'false')
						{
							AVA_ParentCompany = nlapiSelectValue( CompanyNodes, "//*[name()='ParentId']");
							
							var body	    = AVA_CompanyFetchBody(Flag, '1');
							var soapPayload = AVA_CompanyFetchEnvelope(headers + body);
							
							var response = nlapiRequestURL(AVA_URL + '/account/accountsvc.asmx', soapPayload, soapCompanyHead);
							if(response.getCode() == 200)
							{
								var soapText = response.getBody();
								var soapXML = nlapiStringToXML(soapText);
								var CompanyFetchResult = nlapiSelectNode(soapXML, "//*[name()='CompanyFetchResult']");
								var AVA_ResultCode = nlapiSelectValue( CompanyFetchResult, "//*[name()='ResultCode']");
								var RecordCount = nlapiSelectValue(soapXML, "//*[name()='RecordCount']");
							
								if(AVA_ResultCode == 'Success' && RecordCount > 0) 
								{
									CompanyNodes = nlapiSelectNode( soapXML, "//*[name()='Company']");
									AVA_CompCode = nlapiSelectValue( CompanyNodes, "//*[name()='CompanyCode']");
								}
								else
								{
									break;
								}
							}
							else
							{
								break;
							}
						}
					}
					else
					{
						AVA_CompCode = nlapiSelectValue( CompanyNodes, "//*[name()='CompanyCode']");
					}
				}
				
				return 1;
			}
			else
			{
				return 0;
			}
		}
		else
		{
			nlapiLogExecution('DEBUG', 'AVA_CompanyFetch', 'Please contact the administrator');
			nlapiLogExecution('DEBUG', 'Response Code', response.getCode());
			return 0;
		}
	}
	catch(err)
	{
		nlapiLogExecution('DEBUG', 'AVA_CompanyFetch Try/Catch', err.message);
		alert("Please contact Avalara Support on (877)-780-4848");
		return 0;
	}
}

function AVA_CompanyFetchSecurity(AVA_Username, AVA_Password)
{
	var soap = null;
	soap = '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\n';
		soap += '<wsse:UsernameToken>\n';
		soap += '<wsse:Username>' + AVA_Username + '</wsse:Username>\n';
		soap += '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+ nlapiDecrypt(AVA_Password, 'aes', Sha256.hash('AVATAX')) + '</wsse:Password>\n';
		soap += '</wsse:UsernameToken>\n';
	soap += '</wsse:Security>\n';
	return soap;
}

function AVA_CompanyFetchHeader(security)
{
	var soap = null;
	soap = '<soapenv:Header>\n';
	soap += security;
	soap += '<Profile>\n';
		soap += '<Name><![CDATA[' + nlapiGetContext().getName() + ']]></Name>\n';
		soap += '<Client><![CDATA[NetSuite Basic ' + nlapiGetContext().getVersion() + ' || ' + AVA_ClientAtt.substr(15) + ']]></Client>\n';
		soap += '<Adapter/>\n';
		soap += '<Machine/>\n';
	soap += '</Profile>\n';
	soap += '</soapenv:Header>\n';
	return soap;
}

function AVA_CompanyFetchBody(SingleCompanyFlag, ParentCompanyFlag)
{
	var soap = null;
	soap = '<soapenv:Body>\n';
	soap += '<CompanyFetch>\n';
		soap += '<FetchRequest>\n';
			if(SingleCompanyFlag == 2)
			{
				if(ParentCompanyFlag == 0)
				{
					soap += '<Filters>CompanyCode=\'' + AVA_CompCode + '\'</Filters>\n';
				}
				else
				{
					soap += '<Filters>CompanyId=\'' + AVA_ParentCompany + '\'</Filters>\n';
				}
				soap += '<MaxCount>0</MaxCount>\n';
				soap += '<PageIndex>0</PageIndex>\n';
				soap += '<PageSize>0</PageSize>\n';
				soap += '<RecordCount>0</RecordCount>\n';
			}
		soap += '</FetchRequest>\n';
	soap += '</CompanyFetch>\n';
	soap += '</soapenv:Body>\n';
	return soap;
}

function AVA_CompanyFetchEnvelope(actualcontents)
{
	var soap = null;
	soap = '<?xml version="1.0" encoding="utf-8"?>\n';
	soap += '<soapenv:Envelope xmlns="http://avatax.avalara.com/services" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n';
		soap += actualcontents
	soap += '</soapenv:Envelope>\n';
	return soap;
}

function AVA_ValidateShipFromAddressBody()
{
 	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<Validate xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<ValidateRequest>\n';
 				soap += '\t\t\t\t<Address>\n';
 					soap += '\t\t\t\t\t<AddressCode>1</AddressCode>\n';
 					soap += '\t\t\t\t\t<Line1><![CDATA[' + nlapiGetFieldValue('ava_def_addr1') + ']]></Line1>\n';
 					soap += '\t\t\t\t\t<Line2><![CDATA[' + nlapiGetFieldValue('ava_def_addr2') + ']]></Line2>\n';
 					soap += '\t\t\t\t\t<Line3/>\n';
 					soap += '\t\t\t\t\t<City><![CDATA[' + nlapiGetFieldValue('ava_def_city') + ']]></City>\n';
 					soap += '\t\t\t\t\t<Region><![CDATA[' + nlapiGetFieldValue('ava_def_state') + ']]></Region>\n';
 					soap += '\t\t\t\t\t<PostalCode><![CDATA[' + nlapiGetFieldValue('ava_def_zip') + ']]></PostalCode>\n';
 					soap += '\t\t\t\t\t<Country><![CDATA[' + nlapiGetFieldValue('ava_def_country') + ']]></Country>\n';
 				soap += '\t\t\t\t</Address>\n';	
 				soap += '\t\t\t\t<TextCase>Default</TextCase>\n';
 				soap += '\t\t\t\t<Coordinates>false</Coordinates>\n';
 			soap += '\t\t\t</ValidateRequest>\n';
 		soap += '\t\t</Validate>\n';
 	soap += '\t</soap:Body>\n';
 	
 	return soap;
}

function AVA_UserAccountTestConnection()
{
	var AVA_URL = (nlapiGetFieldValue('ava_serviceurl') == '1') ? AVA_DevelopmentURL : AVA_ProductionURL;
	var security = AVA_BuildSecurity(nlapiGetFieldValue('ava_username'), nlapiGetFieldValue('ava_password'));
	var headers = AVA_Header(security);
	var body = AVA_UserFetchBody();
	var soapPayload = AVA_BuildEnvelope(headers + body);

	var soapHead = {};
	soapHead['Content-Type'] = 'text/xml';
	soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/UserFetch';
	
	try
	{
		var response = nlapiRequestURL(AVA_URL + '/account/accountsvc.asmx', soapPayload, soapHead);
		if(response.getCode() == 200)
		{
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);

			var UserFetchResult = nlapiSelectNode(soapXML, "//*[name()='UserFetchResult']");

			var ResultCode = nlapiSelectValue(UserFetchResult, "//*[name()='ResultCode']");
			
			if (ResultCode == 'Success')
			{
				var ResponseUserArray = nlapiSelectNodes(UserFetchResult, "//*[name()='User']");
				
				if(ResponseUserArray != null && ResponseUserArray.length > 0)
				{
					if(nlapiGetFieldValue('ava_accountvalue') == nlapiSelectValue(ResponseUserArray[0], "./*[name()='AccountId']"))
					{
						return true;
					}
					else
					{
						alert('Username (' + nlapiGetFieldValue('ava_username') + ') is not associated with Account Number (' + nlapiGetFieldValue('ava_accountvalue') + '). Please enter correct Username and Password');
						return false;
					}
				}
			}
			else
			{
				alert(nlapiSelectValue(UserFetchResult, "//*[name()='Summary']"));
				return false;
			}
		}
		else
		{
			alert("Enter the correct Username and Password.");
			return false;
		}
	}
	catch(err)
	{
		alert("Please contact Avalara Support on (877)-780-4848");          
		return false;
	}
}

function AVA_UserFetchBody()
{
	var soap = null;
	soap = '\t<soap:Body>\n';
		soap += '\t\t<UserFetch xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<FetchRequest>\n';
				soap += '<Filters>UserName=\'' + nlapiGetFieldValue('ava_username') + '\'</Filters>\n';
			soap += '\t\t\t</FetchRequest>\n';
		soap += '\t\t</UserFetch>\n';
	soap += '\t</soap:Body>\n';
	return soap;
}

function CompanyAddr(City, Country, Line1, Line2, Line3, State, Zip)
{
	this.City	 = City; 
	this.Country = Country;
	this.Line1   = Line1;
	this.Line2   = Line2;
	this.Line3   = Line3;
	this.State   = State;
	this.Zip 	 = Zip;
}

function CompanyContact(Email, Fax, FirstName, LastName, MobileNumber, PhoneNumber, Title)
{	
	this.Email		  = Email;
	this.Fax		  = Fax;
	this.FirstName	  = FirstName;
	this.LastName	  = LastName;
	this.MobileNumber = MobileNumber;
	this.PhoneNumber  = PhoneNumber;
	this.Title 		  = Title;
}

function Company(BIN, CompanyAddr, CompanyCode, CompanyContact, CompanyName, TIN)
{	
	this.BIN 			= BIN;
	this.CompanyAddr 	= CompanyAddr;
	this.CompanyCode	= CompanyCode;
	this.CompanyContact = CompanyContact;
	this.CompanyName 	= CompanyName;
	this.TIN 			= TIN;
}

function CompanyRequest(Company)
{	
	this.Company = Company;
}

function NexusAddress(City, Country, Line1, Line2, Line3, State, Zip)
{
	this.City 	 = City;
	this.Country = Country; 
	this.Line1   = Line1; 
	this.Line2   = Line2;
	this.Line3   = Line3; 
	this.State   = State; 
	this.Zip 	 = Zip; 
}

function NexusList(NexusAddress)
{
	this.NexusAddress = NexusAddress;
}

function AVA_BundleAfterUpdate(toversion, fromversion)
{
	var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
	if(searchresult != null)
	{
		for(var i = 0; searchresult != null && i < searchresult.length; i++)
		{
			var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[i].getId());
			
			var EncryptFlag = record.getFieldValue('custrecord_ava_encryptflag');	
			if(EncryptFlag == 'F')
			{
				var licensekey = record.getFieldValue('custrecord_ava_licensekey');
				if(licensekey != null && licensekey.length <= 16)
				{
					record.setFieldValue('custrecord_ava_licensekey', nlapiEncrypt(licensekey, 'aes', Sha256.hash('AVATAX')));
				}
				else
				{
					licensekey = nlapiDecrypt(licensekey, 'base64');
					record.setFieldValue('custrecord_ava_licensekey', nlapiEncrypt(licensekey, 'aes', Sha256.hash('AVATAX')));
				}
				
				var password = record.getFieldValue('custrecord_ava_password');
				if(password !=  null && password.length > 0)
				{
					password = nlapiDecrypt(password, 'base64');
					record.setFieldValue('custrecord_ava_password', nlapiEncrypt(password, 'aes', Sha256.hash('AVATAX')));
				}
				
				record.setFieldValue('custrecord_ava_encryptflag', 'T');
			}
			
			var ServiceURL = record.getFieldValue('custrecord_ava_url');
			if(ServiceURL != null && ServiceURL.length > 1)
			{
				ServiceURL = (ServiceURL.search('development') != -1) ? '1' : '0';
				record.setFieldValue('custrecord_ava_url', ServiceURL);
			}
			
			var DefaultCompanyCode = record.getFieldValue('custrecord_ava_defcompanycode');
			if(DefaultCompanyCode == null || DefaultCompanyCode.length == 0)
			{
				record.setFieldValue('custrecord_ava_defcompanycode', nlapiGetContext().getCompany());
			}
			
			record.setFieldValue('custrecord_ava_configflag', 'T');
			
			var id = nlapiSubmitRecord(record, false);
		}
	}
}