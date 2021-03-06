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

if( !$('#kindName').val() )
{
alert("Please fill in item classification name ");
return;}//validate
var pre = alasql('SELECT text  FROM  kind  WHERE toLower(text) = ?',[ $('#kindName').val().toLowerCase() ] );
if(pre.length > 0){//already has the maker name
	console.log(pre);
	alert("Claasification already exists! ");
	return;
}

var mxid = alasql('SELECT MAX(id) + 1 as id FROM kind')[0].id;
alasql('INSERT INTO kind(id , text ) VALUES (?,?)',[mxid,$("#kindName").val()]) ;
alert("New Item Type Successfully Added!");
window.location.href = "main.html";
            
}