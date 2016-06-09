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
 ** Description: This PHP script is used to return the only order summary details based on below parameters.
 **
		soid=Sales Order external id.
		storeid= Brand id.
		custid=Customer external id.
		emailid=Customer email id.
		
	NetSuite Details:
	'loginDetails.json' contains the NetSuite credentials like accountId,email,password,RESTlet URL.
	Results are returned from below NetSuite SavedSearchs:
	Name: Sales Order Lookup Headers (Please Do Not Delete)
	
 ** @author: Vamshi &Sirisha
 ** @dated:  06/08/2016
 ** @version: 1.0
 **************************************************************************************
 */
try{
	// get the parameters for the URL.
	$soExternalId = $_REQUEST["soid"];
	$custExternalId = $_REQUEST["custid"];
	$storeId = $_REQUEST["storeid"];
	$emailId = $_REQUEST["emailid"];
	// execute only if StoreId is present.
	if (!(empty($storeId)))
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
		$response = file_get_contents($host . "&soExternalId=" . $soExternalId . "&custExternalId=" . $custExternalId . "&storeid=" . $storeId . "&emailid=" . $emailId, false, $context);
		
		// dispaly the messages if no response
		if (!$response)
			{
			$errorxml = '<SalesOrders><Error>No Results Found</Error></SalesOrders>';
			echo XML2JSON($errorxml);
			}
		  elseif ($response == '[]')
			{
			$errorxml = '<SalesOrders><Error>No Results Found</Error></SalesOrders>';
			echo XML2JSON($errorxml);
			}
		  else
			{
			// manipulate the data from the NetSuite resposne.
			$response = str_replace('trandate', "date", $response);
			$response = str_replace('formulatext', "customerExternalId", $response);
			$response = str_replace('class', "brand", $response);
			$response = str_replace('tranid', "documentNumber", $response);
			$response = str_replace('externalid', "externalId", $response);
			$response = str_replace('transactionnumber', "transactionNumber", $response);
			$response = str_replace('statusref', "status", $response);
			$response = str_replace('formulanumeric', "subTotal", $response);
			$response = str_replace('<br />', '|', $response);
			$response = str_replace('formulacurrency', 'shippingAmount', $response);
			$response = str_replace('taxtotal', 'taxAmount', $response);
			$temp = json_decode($response, true);
			$converted = array2xml($temp, 'SalesOrders');
			$jsonconverted = XML2JSON($converted);
			$response = str_replace('entity', "name", $jsonconverted);
			$response = str_replace('internalid', "brandId", $response);
			$response = str_replace('{}', '""', $response);
			$response = str_replace('trackingnumbers', "trackingNumbers", $response);
			$response = str_replace('custbody_order_discount', "orderDiscount", $response);
			$response = str_replace('["0.00",', "", $response);
			$response = str_replace('"]', '"', $response);
			$response = str_replace('externalId', 'soExternalId', $response);
			
			// return the response as a JSON.
			echo $response;
			}
		}
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
	try
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
		}catch(Exception $e)
		{
		echo 'Caught exception: ', $e->getMessage() , "\n";
		}
	}
// this fnction is used to manipuate the tags returned from NetSuite
function array2xml($array, $tag)
	{
	function ia2xml($array)
		{
		$xml = "";
		foreach($array as $key => $value)
			{
			$value = str_replace('&', 'And', $value);
			if (is_array($value))
				{

				// Removes all Array integers i.e 0,1,2....

				if (is_int($key))
					{
					$key = "salesOrder";
					}

				$value = str_replace('&', 'And', $value);

				// Removes all these Nodes from XMl

				$xml.= "<$key>" . ia2xml($value) . "</$key>";
				if ($key == 'name') $xml.= ia2xml($value);
				}
			  else
				{
				if (is_int($key))
					{
					$key = "salesOrder";
					}

				$value = str_replace('&', 'And', $value);

				// Removes all these Nodes from XMl

				if ($key != 'internalid' && $key != 'name') $xml.= "<$key>" . $value . "</$key>";
				if ($key == 'name') $xml.= $value;
				if ((strpos($xml, 'custbody_order_discount') === false) && $key != 'custbody_order_discount')
					{
					$xml.= '<custbody_order_discount>0.00</custbody_order_discount>';
					}
				}
			}
		return $xml;
		}
	return "<$tag>" . ia2xml($array) . "</$tag>";
	}
?>
