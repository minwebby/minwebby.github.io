function validateEmail(emailText)
{
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	return reg.test(emailText);
}

function handleSubmit() 
{
	// validate email
	var val = $("#inputEmail").val();
	if (validateEmail(val)) {
		
		$("#inputEmail").removeClass("invalidEmail");
	} else {
		$("#inputEmail").addClass("invalidEmail");
	}
}