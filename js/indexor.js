var globalVar = "cannot signin";
console.log("definigg indx js globalvar");

function loginCheck(){
	
	//console.log( $('#userName  input').val() );
	//console.log( $('#password  input').val() );
	 var userName = document.getElementById("userName");
	 var password = document.getElementById("password");
	
	 /*function to check userid & password*/
        /*the following code checkes whether the entered userid and password are matching*/
        if(userName.value == "a" ){
        	console.log( userName.value );
        	if( password.value == "a") {
        		globalVar = "Can signin";
        		createCookie('wName', 'Tokyo', 1);
        		window.open('home.html',"_self")/*opens the target page while Id & password matches*/
        	}
        }
        else if(userName.value == "b" ){
        	console.log( userName.value );
        	if( password.value == "b") {
        		globalVar = "Can signin";
        		createCookie('wName', 'Shanghai', 1);
        		window.open('home.html',"_self")/*opens the target page while Id & password matches*/
        	}
        }
        else if(userName.value == "c" ){
        	console.log( userName.value );
        	if( password.value == "c") {
        		globalVar = "Can signin";
        		createCookie('wName', 'Singapore', 1);
        		window.open('home.html',"_self")/*opens the target page while Id & password matches*/
        	}
        }
        else if(userName.value == "d" ){
        	console.log( userName.value );
        	if( password.value == "d") {
        		globalVar = "Can signin";
        		createCookie('wName', 'Delhi', 1);
        		window.open('home.html',"_self")/*opens the target page while Id & password matches*/
        	}
        }
        else if(userName.value == "e" ){
        	console.log( userName.value );
        	if( password.value == "e") {
        		globalVar = "Can signin";
        		createCookie('wName', 'Head', 1);
        		window.open('home.html',"_self")/*opens the target page while Id & password matches*/
        	}
        }
        else {
            alert("Error Password or Username")/*displays error message*/
        }
        

	
}
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
 //var perm = [0,0,0,0];
 //var take = [0,0,0,0];
 //var at = 0;
 //function fun(at){
 //    if (at ==4 ){
 //         console.log(perm);
 //         return;
 //    }
 //    for(var i = 0; i < 4; i++){
 //         if (take [i] == 0){
 //              take[i] = 1;
 //              perm[at] = i;
 //              fun(at + 1);
 //              take[i] = 0;
 //         }
 //    }
 //}
 //fun(0);