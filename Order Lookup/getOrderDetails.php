<?php
/**
 ** Copyright @ 2003-2016
 ** NetScore Technologies Private Limited
 ** All Rights Reserved.
 **
 ** This code is the confidential and proprietary information of
 ** NetScore Technologies Private Limited ("Confidential Information").
 ** You shall not disclose such Confidential Information and shall use it only in
 ** accordance with the terms of the license agreement you entered into
 ** with NetScore.
 ** Description: This PHP script is used to return the complete sales order details based on below parameters.
 **
		soid=Sales Order external id.
		storeid= Brand id.
		custid=Customer external id.
		emailid=Customer email id.
		
	NetSuite Details:
	'loginDetails.json' contains the NetSuite credentials like accountId,email,password,RESTlet URL.
	Results are returned from below NetSuite SavedSearchs:
	Name: Sales Order Lookup (Please Do Not Delete)
	Name: Sales Order Lookup Item Details (Please Do Not Delete)
	
 ** @author: Vamshi & Sirisha
 ** @dated:  06/08/2016
 ** @version: 1.0
 **************************************************************************************
 */
try
	{
	// get the parameters for the URL.
	$soExternalId = $_REQUEST["soid"];
	$custExternalId = $_REQUEST["custid"];
	$storeId = $_REQUEST["storeid"];
	$emailId = $_REQUEST["emailid"];
	// execute only if StoreId is present.
	if (!(empty($storeId)))
		{
		if (is_numeric($storeId))
			{
			// get NetSuite credentials from the file "loginDetails.json".
			$loginJsonFile = file_get_contents("loginDetails.json");
			$logins = json_decode($loginJsonFile);
			$account = $logins->account;
			$email = $logins->email;
			$pass = $logins->pass;
			$role_id = 3;
			$host = $logins->restURL;;

			// Create Header using NetSuite credentials above

			$headerString = "Authorization: NLAuth nlauth_account=" . $account . ", " . "nlauth_email=" . $email . ", " . "nlauth_signature=" . $pass . ", " . "nlauth_role=" . $role_id . "\r\n" . "Host: rest.netsuite.com \r\n" . "Content-Type:" . $content_type;
			$arrOptions = array(
				'http' => array(
					'header' => $headerString,
					'method' => "GET",
					'timeout' => 300
				)
			);
			// making a GET request to NetSuite to obtain the results.
			$context = stream_context_create($arrOptions);
			$NSResponse = file_get_contents($host . "&soExternalId=" . $soExternalId . "&custExternalId=" . $custExternalId . "&storeid=" . $storeId . "&emailid=" . $emailId, false, $context);
			if (!$NSResponse)
				{
				echo "Error: Invalid Response.";
				}
			  else
				{
				// dispaly the error message 
				if (strpos($NSResponse, 'javascript') > 0)
					{
					$errorxml = '<SalesOrders><Error>No Results Found</Error></SalesOrders>';
					echo XML2JSON($errorxml);
					}
				  else
					{
					// replacing the unformatted data from NetSuite response.
					$NSResponse = str_replace('"', "", $NSResponse);
					$NSResponse = str_replace('"', "", $NSResponse);
					$NSResponse = str_replace('\\\\', "", XML2JSON($NSResponse));
					$NSResponse = str_replace('{}', '""', $NSResponse);
					$searchString1 = '"items":{';
					$replaceString1 = '"items":[{';
					$replaceString2 = '}],"orderShipments"';
					$pos = strpos($NSResponse, $searchString1);
					if ($pos > - 1)
						{
						$NSResponse = str_replace($searchString1, $replaceString1, $NSResponse);
						$fulfillment = strpos($NSResponse, '},"orderShipments"');
						if ($fulfillment > - 1)
							{
							$NSResponse = str_replace('},"orderShipments"', $replaceString2, $NSResponse);
							}
						  else $NSResponse = str_replace('}}', '}]}', $NSResponse);
						}
					// manipulating the data for shipments and tracking numbers.
					$findSingleShipment = '"orderShipments":{';
					$replaceSingleShipment = '"orderShipments":[{';
					$shippos = strpos($NSResponse, $findSingleShipment);
					if ($shippos)
						{
						$NSResponse = str_replace($findSingleShipment, $replaceSingleShipment, $NSResponse);
						}
					$trackingNumberFind = '},"trackingNumber"';
					$trackingNumberReplace = '}],"trackingNumber"';
					$trackpos = strpos($NSResponse, $trackingNumberFind);
					if ($trackpos)
						{
						$NSResponse = str_replace($trackingNumberFind, $trackingNumberReplace, $NSResponse);
						}
					$NSResponse = str_replace('},"shipmentAddresses"', '}],"shipmentAddresses"', $NSResponse);
					if ($shippos) $NSResponse = str_replace('}}', '}]}', $NSResponse);
					$NSResponse = str_replace('"shipmentAddresses":{', '"shipmentAddresses":[{', $NSResponse);
					$NSResponse = str_replace('".00"', '"0.00"', $NSResponse);
					// return the response as a JSON.
					echo $NSResponse;
					}
				}
			}
			// return the responses
		  else
			{
			$errorxml = '<SalesOrders><Error>Please Provide Internal Id Of Store Id</Error></SalesOrders>';
			echo XML2JSON($errorxml);
			}
		}
		// return the responses
	  else
		{
		$errorxml = '<SalesOrders><Error>Store Id cannot be empty</Error></SalesOrders>';
		echo XML2JSON($errorxml);
		}
	}catch(Exception $e)
	{
	echo 'Caught exception: ', $e->getMessage() , "\n";
	}
// this function is used to convert XML data to JSON.
function XML2JSON($xmldata)
	{
	$fileContents = str_replace(array(
		"\n",
		"\r",
		"\t"
	) , '', $xmldata);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$fileContents = preg_replace('#&(?=[a-z_0-9]+=)#', '&amp;', $fileContents);
	$simpleXml = simplexml_load_string($fileContents);
	$json = str_replace('\/', '/', json_encode($simpleXml));
	return $json;
	}
?>
