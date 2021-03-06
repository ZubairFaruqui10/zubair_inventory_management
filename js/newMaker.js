$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('Head') );
if (readCookie('wName') != 'cenral')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
$('#addTag').children('ul').show();//SHOW SUBMENU UNDER IT, COOCKELOGIN HIES THEM BY DEFAULT

alasql.fn.toLower = function(s) { 
        
        return s.toLowerCase(); 
}
function addFun(){
                                     //alert("fun");
if( !$('#makerName').val() )
{
alert("Please fill in maker name ");
return;}//validate
var pre = alasql('SELECT makerName  FROM  maker WHERE toLower(makerName) = ?',[ $('#makerName').val().toLowerCase() ] );
if(pre.length > 0){//already has the maker name
	console.log(pre);
	alert("Maker name alreay exists! ");
	return;
}
var mxid = alasql('SELECT MAX(id) + 1 as id FROM maker')[0].id;
alasql('INSERT INTO maker(id , makerName , makerTel )VALUES (?,?,?)',[mxid,$("#makerName").val(),$("#makerTel").val()]) ;
alert("New Brand Successfully Added!");
window.location.href = "main.html";

}