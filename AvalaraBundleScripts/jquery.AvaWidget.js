
var onAvaTaxCompanyCreatedCallback;
var onFinishButtonClicked;

(function ($) {
    jQuery.fn.AvaWidget = function (options) {
        //default settings:
        var defaults = {
            InheritCss: false,
            CssLinks: GetCssURLs(),
            AvalaraOnboardingObject: new AvalaraOnboarding("Test Connector", "company_name", "000000000", "address_line_1", "address_line_2", "address_line_3", "address_city", "", "state", "zipCode", "email", "firstname", "lastname", "phone",""),
            RedirectUrl: window.location.href,
            FinishButton: { Visible: false, Caption: "Finish Setup", onFinishClicked: function (data) { }},
            // We define an empty anonymous function so that
            // we don't need to check its existence before calling it.
            onAvaTaxCompanyCreated: function (obData) { }
        };

        var settings = $.extend({}, defaults, options);
        //assigned callback to global variable so that it can be called after Iframe send onboarding data
        onAvaTaxCompanyCreatedCallback = settings.onAvaTaxCompanyCreated;
        onFinishButtonClicked = settings.FinishButton.onFinishClicked;
        var publicKey = "";
        return this.each(function () {
            // Plugin code 
            var elem = $(this);
            var htmlToSet = "processing";
            Authenticate(function (data) {
                if (data.IsAuthenticated) {
                    settings.AccessToken = data.AccessToken;
                    settings.AvalaraIdentity = data.AvalaraIdentity;
                    htmlToSet = '<iframe src="https://provisioningforavatax.com/onboarding/defaultIndex" frameborder="0" scrolling="yes" style="width:100%;height:100%" id="myFrame" onload="javascript:sendMessage(\'' + encodeURI(JSON.stringify(settings)) + '\',\'' + publicKey + '\');">';
                    elem.html(htmlToSet);
                } else {
                    htmlToSet = "<h3>you are not authenticated user</h3>";
                    elem.html(htmlToSet);
                }
            });
            elem.html(htmlToSet);
        });
    };


    window.onload = function () {

        // A function to process messages received by the window.
        function receiveMessage(e) {
            // Check to make sure that this message came from the correct domain.
            //if (e.origin !== "http://localhost:8080")
            //    return;
            if (e.data.eventType == "OnboardingCompletedEvent")
                onAvaTaxCompanyCreatedCallback(e.data.response);
            else if(e.data.eventType == "SetupFinishedEvent")
                onFinishButtonClicked(e.data.response);
            //var arrData = e.data.split("|");
        }

        // Setup an event listener that calls receiveMessage() when the window
        // receives a new MessageEvent.
        window.addEventListener('message', receiveMessage);
    }

}(jQuery));

// A function to handle sending messages.
function sendMessage(options, publicKey) {
    var receiver = document.getElementById('myFrame').contentWindow;
    options = eval("(" + decodeURI(options) + ")");
    receiver.postMessage(options, "https://provisioningforavatax.com/onboarding/defaultIndex");
}
function GetCssURLs() {
    var cssLinks = [];
    for (var i = 0; i < document.styleSheets.length; i++) {
        cssLinks.push(document.styleSheets[i].href);
    }
    return cssLinks;
}

function Authenticate(callbackFunction) {

    var AuthenticateAjax = NS.jQuery.ajax({
        type: "POST",
        url: "https://provisioningforavatax.com/AvaAuthenticator/Authentcate",
        data: JSON.stringify({ AvalaraIdentity: '+Z+rHmh0X8lzr9gloFiTA7Eye70d1y8Fdz9NZBmXDBCtdgFNnSawup87Ysz70rSHglamIYVTV9W77fixeF4SKzgTexe3fkcP'}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        accept: 'application/json',
        success: function (data) {
            InvokeCallbackAuthenticate(callbackFunction, data);
        },
        failure: function (errMsg) {
            alert(errMsg);
        }
    });

    NS.jQuery(window).unload(function () { AuthenticateAjax.abort(); });

}

function InvokeCallbackAuthenticate(callback, data) {

    if (callback && typeof (callback) === "function") {
        callback(data);
    }
}

function AvalaraOnboarding(connectorName, companyName, tin, addressLine1, addressLine2, addressLine3, addressCity, country, state, zipCode, email, firstname, lastname, phone,userPassword) {

    this.ConnectorName = connectorName;
    this.Company = new function CompanyDetails() {
        this.CompanyAddr = new function CompanyAddress() {
            this.City = addressCity;
            this.Country = country;
            this.Line1 = addressLine1;
            this.Line2 = addressLine2;
            this.Line3 = addressLine3;
            this.State = state;
            this.Zip = zipCode;
        };
        this.CompanyContact = new function ContactDetails() {
            this.Email = email;
            this.FirstName = firstname;
            this.LastName = lastname;
            this.PhoneNumber = phone;
        };
        this.CompanyName = companyName;
        this.TIN = tin;
    };
    this.UserPassword=userPassword
}

function SetDefaultValue(dataToBeVerified) {

    var returnValue = dataToBeVerified;
    if (dataToBeVerified == null || dataToBeVerified == undefined || dataToBeVerified == "undefined" || dataToBeVerified == "null") {

        returnValue = " ";
    } else {

        returnValue = dataToBeVerified;
    }

    return returnValue;
}
