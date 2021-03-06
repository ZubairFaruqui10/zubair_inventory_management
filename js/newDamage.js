$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
	
$('#damageTag').children('ul').show();//SHOW SUBMENU UNDER IT, COOCKELOGIN HIES THEM BY DEFAULT

var ok = 0;//check for existinfg item before adding
alasql.fn.toLower = function(s) { 
        
        return s.toLowerCase(); 
}
function addFun(){//add item
	var stockId = 0;//dummy
	var stockObj =alasql('SELECT stock.id FROM stock JOIN item ON stock.item=item.id AND toLower(item.code) = ?', [$("#itemCode").val().toLowerCase() ]);
	if(stockObj.length <= 0){
		alert("Invalid Item Code!");
		return;
	}
	else 
		stockId = stockObj[0].id;
	var outMainId = alasql('SELECT MAX(id) + 1 as id FROM outMaintenance')[0].id;//inset to outmain now
	alasql('INSERT INTO outMaintenance VALUES (?,?,?,?,?,?,?,?)', [outMainId, 1, 0, stockId, $("#productId").val(), $("#description").val(), 0, "2000-01-01"]);//fixdate, it should be when this is added, but currently ignored// id , type , inRetailerId , stockId , productId , reason ,  status , date ) )')[0].id;
	 
	 
	 var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [stockId] )[0].balance;
	 if (preVal <=0 ){
		alert("But you have no stock for this hardware!");
		return;
	 }
	 //now reduce stokc leevl by one
	alasql('UPDATE stock SET balance = ? WHERE id = ?', [ preVal - 1, stockId ]);
	// now wnter this record in trans histry
	 var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stockId, new Date().toJSON().slice(0,10), 1, preVal - 1 , "Warehouse defect found" ]);//Warehouse Defect== importnant tag
	
	if (confirm( "Succefuuly added defect info to stock level and outgoing maintenance record. Do you want to open outgoing maintenance page?") ){
		 window.location.assign('outMaintenance.html' );  
	}
	else
		location.reload();
}
	

$( document ).ready(function() {
//    $('input').change(function() {//after laoding, user agin changed anything as input tag, description was textarea before//[name="itemCode"] 
//				ok = 0;// so check again is same code exists
//				//alert("Things have changed!");
//			});
});