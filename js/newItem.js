$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();

$('#addTag').children('ul').show();//SHOW SUBMENU UNDER IT, COOCKELOGIN HIES THEM BY DEFAULT

var rows = alasql('SELECT * FROM kind;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.text);
	$('select[name="type"]').append(option);
}
var rows = alasql('SELECT * FROM maker ;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.makerName);
	option.text(row.makerName);
	$('select[name="maker"]').append(option);
}
alasql.fn.toLower = function(s) { 
        
        return s.toLowerCase(); 
}
var ok = 0;//check for existinfg item before adding 
function addFun(){//add item
	var checkCode = alasql('SELECT * FROM item WHERE toLower(code) = ?', [$("#itemCode").val().toLowerCase() ]);//if same item code ie item exists alert//toLower beacuse string comapriseon
	if( !ok && checkCode.length > 0 ) {
	
		if (confirm("Item already exists in item list! Do you want to load item information ?") == true) {
			$("#itemCode").val(checkCode[0].code); $('select[name="type"]').val(checkCode[0].kind); $('select[name="maker"]').val(checkCode[0].maker); $("#itemPrice").val(checkCode[0].price);
			 $("#description").val(checkCode[0].detail);
			 ok = 1;//now can add
			 //alert("Item infromation loaded.")
			 $('input').change(function() {//after laoding, user agin changed anything as input tag, description was textarea before//[name="itemCode"] 
				ok = 0;// so check again is same code exists
				//alert("Things have changed!");
			});
		}
		return;
	}
	else{
		ok = 1;//unique code given, no check from ow		
	}
	if( ok == 0 ) addFun();//  after loading from matched code, he changed something again
	
	if(!$("#itemCode").val() || !$('select[name="type"]').val() || !$('select[name="maker"]').val() || !$("#description").val() || !$("#itemPrice").val())
		{alert("Please fill in all the information to introduce an item");ok = 0; return;}//validate to fill all
		
	 //check whether intger input is given
	if (  +$("#itemPrice").val() !== parseInt($("#itemPrice").val()))
   {	
		 alert("Please input NUMBER only for item price.");
		 return;
	 
	}
	
	
	//3 case . totally new, new to my warehouse, already in my warehouse, just loaded from there(worst)
	
	var checkCode = alasql('SELECT * FROM item WHERE toLower(code) = ?', [$("#itemCode").val().toLowerCase() ]);//if same item code ie item exists alert//toLower beacuse string comapriseon
	if(  checkCode.length <= 0 ) {//totally new, so insert in item list
		var mxid = alasql('SELECT MAX(id) + 1 as id FROM item')[0].id;
		alasql('INSERT INTO item(id , code , kind , detail , maker , price , unit, length , width , height , weight )  VALUES (?,?,?,?,?,?,?,?,?,?,?)',
		[mxid,$("#itemCode").val(), $('select[name="type"]').val(), $("#description").val(),$('select[name="maker"]').val(), $("#itemPrice").val(),"Pcs", $("#lenght").val() || 1 ,  $("#width").val() || 1 ,$("#height").val() || 1, $("#weight").val() || 1] )  ;
	
		
	}
	if(readCookie('wName') == 'Head'){
		alert("Item is introduced for all warehouses, individual admins can initialize stock.");
		ok = 0;
		return;
	}
	
	//item ixists etiher my house or other house
	var wId = alasql('SELECT id from whouse WHERE name = ?', [readCookie('wName')])[0].id;//warehouse id
	var itemId = alasql('SELECT * FROM item WHERE code = ?',[$("#itemCode").val()])[0].id;//inseted or matehc item code's id
	var stockIdAr = alasql('SELECT *  FROM stock WHERE whouse = ?  AND item = ?',[wId, itemId ]);//see if stcok is alredy there
	if (stockIdAr.length <= 0){//no stock was there,let him see stock inrduce info input modal ,
		//but set values as suggestion fisrt
		//takes average of this type item's same makers 80% and other maker 20 percent, for lead time same maker average,
		//taken for allwarehouse , should have this warehouse more weight
		var typeId = $('select[name="type"]').val();
		var maker = $('select[name="maker"]').val();
		var kindRerorders = alasql('SELECT * FROM stock JOIN item ON item.id=stock.item WHERE item.kind = ? AND item.maker = ?',[parseInt($('select[name="type"]').val()), maker]);
		var kindSumQuant = 0, kindSumLevel = 0, leadSum = 0, otherSumQuant = 0, otherSumLevel = 0;
		for( var i =0; i < kindRerorders.length; i++ ){
			kindSumQuant  += kindRerorders[i].reorderQuant;
			kindSumLevel += kindRerorders[i].reorderPoint;
			leadSum += kindRerorders[i].leadTime;
		}
		var otherRerorders = alasql('SELECT * FROM stock JOIN item ON item.id=stock.item WHERE item.kind = ? AND item.maker != ?',[parseInt($('select[name="type"]').val()), maker]);
		for( var i =0; i < otherRerorders.length; i++ ){
			otherSumQuant  += otherRerorders[i].reorderQuant;
			otherSumLevel += otherRerorders[i].reorderPoint;
		}
		if(kindRerorders.length > 0){
			kindSumQuant = Math.ceil( kindSumQuant / kindRerorders.length);
			kindSumLevel = Math.ceil( kindSumLevel / kindRerorders.length);
			leadSum =      Math.ceil( leadSum / kindRerorders.length);			
		}
		
		if(otherRerorders.length > 0){
			otherSumQuant = Math.ceil( otherSumQuant / otherRerorders.length);
			otherSumLevel = Math.ceil( otherSumLevel / otherRerorders.length);		
		}
		
		$('#leadTime').val( leadSum);//Math.ceil(    )
		$('#reorderPoint').val(Math.ceil( otherSumLevel*.2 + kindSumLevel*.8  ));//Math.ceil(    )
		$('#reorderQuantity').val(Math.ceil( otherSumQuant*.2 + kindSumQuant*.8  ));//Math.ceil(    )
		//now that vals are set, show modal
		$('#myModal').modal('show');
		ok = 0;
	}
	else{//there was some stock in this house
		if (confirm("Item is in already stock  in this wareHouse. Do you want to have a look at?") == true) {
			//console.log( stockIdAr[0].id);
			window.location.href = "stock.html?id=" + stockIdAr[0].id;// + '"';
		}			 
	}
    ok = 0; //again check for existinfg item code before adding                                                                  
}
function insertStock(){
	if(!$('#initialStock').val() || !$('#leadTime').val() || !$("#reorderPoint").val() || !$("#reorderQuantity").val() )//validate to fill all
	{alert("Please fill in all the information.");return;}
	
	 //check whether intger input is given
	if (+$("#initialStock").val() !== parseInt($("#initialStock").val()) || +$("#leadTime").val() !== parseInt($("#leadTime").val()) || +$("#reorderPoint").val() !== parseInt($("#reorderPoint").val()) ||  +$("#reorderQuantity").val() !== parseInt($("#reorderQuantity").val()))
   {	
		 alert("Please input NUMBER only.");
		 return;
	 
	}
	
	//no, check which item expliclty, not always inseerted ite if it was there brefore;var mxitemId = alasql('SELECT MAX(id)  as id FROM item')[0].id;//last inserted items's id
	var itemId = alasql('SELECT * FROM item WHERE code = ?',[$("#itemCode").val()])[0].id;//inseted or matehc item code's id
	
	var mxid = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
	var wId = alasql('SELECT id from whouse WHERE name = ?', [readCookie('wName')])[0].id;//warehouse id
	alasql('INSERT INTO stock(id, item , whouse , balance , leadTime , reorderPoint , reorderQuant , lastPurchase , lastSupply  )  VALUES (?,?,?,?,?,?,?,?,?)',
	[mxid, itemId, wId, parseInt($('#initialStock').val()), parseInt($('#leadTime').val()), parseInt($("#reorderPoint").val()), parseInt($("#reorderQuantity").val()), new Date().toJSON().slice(0,10),  new Date().toJSON().slice(0,10) ]);
	
	//update reorertoo
	alasql('INSERT INTO reorder (id , quantAvg , quantTime , levelAvg , levelTime ) VALUES (?,?,?,?,?)',[mxid, parseInt($("#reorderQuantity").val()), 1, parseInt($("#reorderPoint").val()), 1 ]);
    
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, mxid, new Date().toJSON().slice(0,10), parseInt($('#initialStock').val()), parseInt($('#initialStock').val()), "Initial Stock" ]);
	
	if (confirm("Successfully updated stock with new item. Do you wan to open stock?") == true) {
			window.location.href = "stock.html?id=" + mxid// + '"';
	}
	//alert("Successfully updated stock with new item.");
	else
	{
		$('#myModal').modal('hide');
		$("#itemCode").val("") ; $('select[name="type"]').val(""); $('select[name="maker"]').val("") ; $("#description").val("") ; $("#itemPrice").val("");//emptying input box
	}
                                    
}

$( document ).ready(function() {
    $('input').change(function() {//after laoding, user agin changed anything as input tag, description was textarea before//[name="itemCode"] 
				ok = 0;// so check again is same code exists
				//alert("Things have changed!");
		});
});