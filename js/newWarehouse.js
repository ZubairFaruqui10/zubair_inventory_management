$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('Head') );
if (readCookie('wName') != 'central')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
function addFun(){
                                     
                                    var mxid = alasql('SELECT MAX(id) + 1 as id FROM whouse')[0].id;
			alasql('INSERT INTO whouse(id , name , addr , tel )VALUES (?,?,?,?)',[mxid,$("#wName").val(),$("#wAddr").val(), $("#wTel").val()]) ;
	alert("Warehouse Successfully Added!");
	window.location.href = "main.html";
            
}