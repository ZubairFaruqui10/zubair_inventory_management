$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
$("#wName").html( readCookie('wName') );
// $("#pageName").html(' Zubair Inventory Management');
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
$('input[name="date"]').val(new Date().toJSON().slice(0,10));//place current date as deafult
// get id
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

document.getElementById("receiveDate").disabled = true ;//for receiving item, at frost, other date not selected
	$('input[value=leadTime]').prop('checked', true);//leadtime is selected by deafult
	console.log($('input[name=receiveType]:checked').val());
    $('.dropdown-toggle').dropdown();
	var leadTime  = alasql('SELECT leadTime FROM stock WHERE id = ?', [id])[0].leadTime;//take leadtime of stock
	var normalReceivingDate = addDays($('input[name="date"]').val() ,leadTime);
	$("#leadTimeRadio").html("Lead time(" + leadTime + " days): " + normalReceivingDate);//cahnge value


// read item data
var sql = 'SELECT item.id, whouse.name, item.code, item.maker, item.detail, item.price, stock.balance, stock.item, stock.reorderPoint, stock.reorderQuant, stock.lastPurchase, stock.lastSupply, stock.leadTime  \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];

var query = alasql('SELECT  quantAvg , quantTime , levelAvg  from reorder WHERE reorder.id = ?', [ id ] ) [0] ;
var typeAr =  alasql('SELECT kind.text from kind JOIN item ON kind.id=item.kind JOIN stock ON stock.item=item.id AND stock.item = ?', [ row.item ] ) [0] ;




$('#image').attr('src', 'img/' + row.id + '.jpg');
$('#whouse').text(row.name);
$('#code').text(row.code);
$('#maker').text(row.maker);
$('#detail').text(row.detail);
$('#price').text(numberWithCommas(row.price));

$('#classification').text(typeAr.text);

$('#reorderRemain').text(row.balance - row.reorderPoint  );
$('#lastPurcahse').text(row.lastPurchase);
$('#lastSupply').text(row.lastSupply);
var totalPrice = row.balance * row.price;
$('#totalprice').text(numberWithCommas(totalPrice) );

$('#reorderQuantity').html(row.reorderQuant + "<br>" + "suggestion: " + query.quantAvg );
$('#reorderPoint').html (row.reorderPoint + "<br>" + "suggestion: " + query.levelAvg);

$('#leadTime').text(row.leadTime );

$('input[name="qty"]').val(row.reorderQuant);

//$('#systemReorderQuantity').text(query.quantAvg);
//$('#systemReorderPoint').text(query.levelAvg);

var balance = row.balance; // will be used later for graph chart
var reorderLevel = row.reorderPoint;//used after stovk update to see if balance is fallen
$('#balance').text(balance);
var tag = row.maker + " " + row.code;

var canReorder =  alasql('SELECT status from canReorder WHERE id = ?', [id])[0].status;//newly addd feature, last enrty as if user has not diasbled item to b view on reoder list
if(canReorder == 1 )  $('#canReorder').text("Active");
else  $('#canReorder').text("Outdated");


var purchaseorder = alasql('SELECT  status FROM purchaseOrder  WHERE id= ?', [id])[0].status;// mark as reordered
	if(purchaseorder == 1)
	{	$('#stockOrder').empty();
		$('#stockOrder').html("<h4>Item is already reordered and not yet received.</h4>").css("color","red");
	}
	
	var canReorder = alasql('SELECT  status FROM canReorder  WHERE id= ?', [id])[0].status;// mark as reordered
	if(canReorder == 0)
	{	$('#stockOrder').empty();
		$('#stockOrder').html("<h4>Item is outdated and cannot be reordered.</h4>").css("color","red");
	}
//give alert 
if (balance  < reorderLevel && purchaseorder == 0){//current balacne is critical now, and not order palced yet
		console.log("low");
		//every time with  pageloading it gets boring
		//alert("Item count is below reorder point! Item need to reordered.")
}
//now if another warehouse, then remove previous and decalre that u cannt show reordre and eidting option bu u can take him to this item actual page belonigng to this waehouse
if(readCookie('wName') != row.name){//this stock is not my warehouse , is hould not be able to chebge order
	console.log("not my wraehouse");
	//but next line doesnt work for what the fuck??????
	//$('#stockOrder').css('display','none');
	$('#stockOrder').empty();
	$('#stockOrder').html("<h4>This stock info is of another warehouse. User cannot edit item info or make reorder.</h4>").css("color","red");
	$('#editStockButton').css('display','none');
	var thisWId = alasql('SELECT id FROM  whouse WHERE name = ?',[readCookie('wName') ])[0].id;
	var itemId  = alasql('SELECT stock.item FROM stock WHERE  stock.id = ?', [id])[0].item;  
	var myStockObjAr  = alasql('SELECT stock.id FROM stock  JOIN whouse ON whouse.id=stock.whouse \
							WHERE stock.item = ? AND stock.whouse= ?', [itemId, thisWId]);//[0].id;
	if(myStockObjAr.length > 0){
		$('#stockOrder').append("<h4> <a href='stock.html?id=" + myStockObjAr[0].id+ "'> Visit this item's stock of this warehouse here.</a></h4>").css("color","red");
	}
	//var stockObj = alasql('SELECT stockId, amount FROM outgoing WHERE id = ?', [i] )[0] ;
}

var changed = 0;//whether can-reorder is changed on radio

// read transaction
var rows = alasql('SELECT * FROM trans WHERE stock = ?  ', [ id ]);
rows.reverse();// fro showing eraly transsacions first
var tbody = $('#tbody-transs');
var chartAr=[];
for (var i = 0; i < rows.length; i++) {//histry
	var row = rows[i];
	var tr;
	if(row.memo=="Purchased") tr = $('<tr style="color: green;">').appendTo(tbody);
	else if(row.memo.indexOf("defect") !== -1) tr = $('<tr style="color: red;">').appendTo(tbody);
	else if(row.memo.indexOf("Repaired") !== -1) tr = $('<tr style="color: #80B31A;">').appendTo(tbody);
	else if(row.memo=="Supplied") tr = $('<tr style="color: blue;">').appendTo(tbody);//#FFA500
	else if(row.memo=="Reordered") tr = $('<tr style="color: #FF00AE;">').appendTo(tbody);
	else tr = $('<tr >').appendTo(tbody);
	tr.append('<td>' + row.date + '</td>');
	tr.append('<td>' + row.qty + '</td>');
	tr.append('<td>' + row.balance + '</td>');
	tr.append('<td >' + row.memo + '</td>');
	var t = [new Date(row.date),row.balance ];
	//only these will go in charts
	if(row.memo == "Initial Stock" || row.memo=="Purchased"|| row.memo=="Supplied")
		chartAr.push(t);
}

///////graph
$(document).ready(function(){
	google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawCurveTypes);

function drawCurveTypes() {
      var data = new google.visualization.DataTable();
      data.addColumn('date', 'X');
      data.addColumn('number', tag);
      //data.addColumn('number', 'Cats');
	
      data.addRows(chartAr);

      var options = {
        hAxis: {
          title: 'Time'
        },
        vAxis: {
          title: 'Inventory Unit'
        },
        series: {
          1: {curveType: 'function'}
        }
      };

      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(data, options);
    }
    
    //if already reorderred and not reeived or not in active reorderable list, then dont show option to treordre
	

});

//adds int days to date string
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toJSON().slice(0,10);//return date string, not js date object which is result
}

// storage/retrieval
$('#update').on('click', function() {//reorder here
	
	if ($('input[name=receiveType]:checked').val() == "otherDate" ){//if otherDates radio is picked 
		
		if( $('input[name="receiveDate"]').val() ==''){//but no date is  picked
			alert("Please pick a date to receive.");
			return;
		}
		var date1 = new Date($('input[name="date"]').val());
		var date2 = new Date($('input[name="receiveDate"]').val());
		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
		console.log(diffDays);
	
		if(diffDays < 1){//bad input of recieve date earlier
			alert("please select a receiving day later than reorder to date.");
			return;
		}
		var leadDay = alasql('SELECT leadTime FROM stock WHERE id =?', [id])[0].leadTime;
				
		if(diffDays < leadDay){//quicker want actually; make ready modal for transfer
			//alert("Items need to be transferred from other warehouse.");
			var wId = alasql('SELECT id FROM  whouse WHERE name = ?',[readCookie('wName') ])[0].id;
			var itemId = alasql('SELECT item FROM stock WHERE  id = ?',[ id])[0].item;
			var stocks = alasql('SELECT * FROM stock WHERE whouse != ? AND item = ?',[wId, itemId]);
			var otherWIds = alasql('SELECT * FROM  whouse WHERE name != ?',[readCookie('wName') ]);
			
			var tbody = $('#tbody-transfer');
			$("#tbody-transfer").empty();
			for( var i = 0; i < stocks.length; i++){
				
				if(stocks[i].balance  -  parseInt($('input[name="qty"]').val()) < stocks[i].reorderPoint){//givign will cause him go below reorder
					//dont shwo
					//continue;
				}
	
				var tr = $('<tr>').appendTo(tbody);
				tr.append(' <td> <input name="selectWHouse" value="' + stocks[i].whouse+ '" id="example-select-all" type="radio"  ></td>');
				tr.append('<td class="hidden">' + stocks[i].whouse + '</td>');
				
				
				var wName = alasql('SELECT name FROM  whouse WHERE id = ?',[ stocks[i].whouse ])[0].name;//get this loop's whouse name
				if(stocks[i].balance  < stocks[i].reorderPoint )//on reorder alrady, mark name red
					tr.append('<td style="color:red" title="This warehouse is already on reroder">' + wName + '</td>');
				else tr.append('<td >' + wName + '</td>');
				
				
				if(stocks[i].balance  -  parseInt($('input[name="qty"]').val()) < stocks[i].reorderPoint){//givign will cause him go below reorder,make count red
					tr.append('<td style="color:red" title="Transferring the quantity will cause item count to go below the reorder point for selected warehouse">' + stocks[i].balance + '</td>');
				}
				else tr.append('<td >' + stocks[i].balance + '</td>');
				
				
				var neededTime = distAr[wId - 1] [ stocks[i].whouse - 1];//array is 0 indx, but whouse is not
				if(neededTime >  diffDays)//will take more time, make days red
					tr.append('<td style="color:red" title="Takes more time than you need.">' + neededTime + '</td>');
				else tr.append('<td  >' + neededTime + '</td>');
				
				var receiveOn = addDays($('input[name="date"]').val(), neededTime);
				tr.append('<td>' + receiveOn + '</td>');				
	
			}
						
			window.location.assign("stock.html?id=" + id+"#modal2" );  //bad way to load this new modal, harcoded
			//"stock.html?id=" + id+"#modal";
			return;
		}
	}
	
	//no else needed, beacuse reaching here means usual way reordrer
	
	
	
	
	alert("Order is placed to purchased department.You will soon be notified in incoming stock and delivered within lead time.")
	//just record in trans as reorder, dont increase
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;//transactioId
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, id, $('input[name="date"]').val(), parseInt($('input[name="qty"]').val()), balance , "Reordered" ]);
	alasql('UPDATE purchaseOrder SET status = 1 WHERE id= ?', [id]);// mark as reordered
	
	//NEW row in incming stock page, 3rd submission
	var incomingId = alasql('SELECT MAX(id) + 1 as id FROM incoming')[0].id;
	var leadDay = alasql('SELECT leadTime FROM stock WHERE id =?', [id])[0].leadTime;
	var nextDate = addDays( $('input[name="date"]').val(), leadDay );//addDays( new Date().toJSON().slice(0,10), leadDay );
	
	if($('input[name=receiveType]:checked').val() == "otherDate" ){//means he selected other date radio and wants even after leadtime, so just next date is his wanted date without my worry
		nextDate = $('input[name="receiveDate"]').val();
	}
	
	//adjust reorder sytem suggestion now	
	var query = alasql('SELECT  quantAvg , quantTime , levelAvg  from reorder WHERE reorder.id = ?', [ id ] ) [0] ;
	var quant = Math.ceil( (query.quantAvg * query.quantTime + parseInt($('input[name="qty"]').val()) ) / (query.quantTime + 1 ) );
	var level = Math.ceil( (query.levelAvg * query.quantTime + balance ) / (query.quantTime + 1 ) );
	alasql('UPDATE reorder SET quantAvg = ? , levelAvg = ?, quantTime = ? WHERE id = ?', [quant, level, query.quantTime + 1,  id ]);

	alasql('INSERT into incoming VALUES (?,?,?,?,?) ',[incomingId, id, parseInt($('input[name="qty"]').val()), nextDate, 0]);//(id , stockId INT, amount INT, date DATE, status INT );');
	window.location.assign('stock.html?id=' + id);
		
});

function transferRequest(){
	console.log("TRASMDFER");
	if(!$('input[name="selectWHouse"]:checked').val() ) {alert("Select a warehouse");window.location.assign("stock.html?id=" + id+"#modal2" );;return;}
	var transWId = parseInt($('input[name="selectWHouse"]:checked').val());
	var transWName = alasql('SELECT name FROM  whouse WHERE id = ?',[transWId] )[0].name;
	var thisWId = alasql('SELECT id FROM  whouse WHERE name = ?',[readCookie('wName') ])[0].id;
	var itemId = alasql('SELECT item FROM stock WHERE  id = ?',[ id])[0].item;
	var otherStock = alasql('SELECT * FROM stock WHERE whouse = ? AND item = ?',[transWId, itemId])[0];
	
	if(otherStock.balance  <  parseInt($('input[name="qty"]').val()) ){//not enuf
		alert("Not enough stock to transfer.");
		return;
	}
	if(otherStock.balance  < otherStock.reorderPoint ){//not enuf
		alert("Selected warehouse is already on reorder for the product.");
		return;
	}
	if(otherStock.balance  -  parseInt($('input[name="qty"]').val()) < otherStock.reorderPoint){//givign will cause him go below reorder
		alert("Transferring the quantity will cause item count to go below the reorder point for selected warehouse. Please select other warehouse.");
		return;
	}
	
	var date1 = new Date($('input[name="date"]').val());
	var date2 = new Date($('input[name="receiveDate"]').val());
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	var neededTime = distAr[thisWId - 1] [ transWId - 1];
	if(diffDays < neededTime){//cannot make
		alert("Transferring the quantity will take more time than you need. Please select other warehouse.");
		return;
	}
	
	//insert trnasfer table
	var nextDate = $('input[name="receiveDate"]').val();//addDays( new Date().toJSON().slice(0,10), leadDay );	
	var tarnsId = alasql('SELECT MAX(id) + 1 as id FROM transfer')[0].id;//trasnfer id
	alasql('INSERT into transfer VALUES (?,?,?,?,?,?,?,?) ',[tarnsId, transWId, thisWId, id, parseInt($('input[name="qty"]').val()), nextDate, $('input[name="date"]').val(), 0]);//(id , stockId INT, amount INT, date DATE, status INT );');
	//id INT IDENTITY, fromId INT, toId INT, stockId INT, amount INT, toDate DATE, fromDate DATE, status INT 

	//trasncation entry
	var history_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;//history_id
	var historyComment =  "Transfer request to " + transWName;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ history_id, id, $('input[name="date"]').val(), parseInt($('input[name="qty"]').val()), balance , historyComment ]);
	
	//mark as in reordr,actually in transfer
	alasql('UPDATE purchaseOrder SET status = 1 WHERE id= ?', [id]);// mark as reordered
		
	
	//adjust reorder sytem suggestion now	
	var query = alasql('SELECT  quantAvg , quantTime , levelAvg  from reorder WHERE reorder.id = ?', [ id ] ) [0] ;
	var quant = Math.ceil( (query.quantAvg * query.quantTime + parseInt($('input[name="qty"]').val()) ) / (query.quantTime + 1 ) );
	var level = Math.ceil( (query.levelAvg * query.quantTime + balance ) / (query.quantTime + 1 ) );
	alasql('UPDATE reorder SET quantAvg = ? , levelAvg = ?, quantTime = ? WHERE id = ?', [quant, level, query.quantTime + 1,  id ]);
	
	//doesnt go to incoming db, goes to trnasfer page
	window.location.assign('stock.html?id=' + id);
}

$(document).ready(function () {
	
	console.log(distAr[1][3]);
	//i cannnot disable the dta picker by html, so on reday dping this
	
		
	$('input[name=receiveType]').change(function(){//if other date is selectd then enable dae picker
		console.log($('input[name=receiveType]:checked').val());
	if ($('input[name=receiveType]:checked').val() == "otherDate" )
	{	document.getElementById("receiveDate").disabled = false ;
		$("#leadTimeRadio").addClass("disabler");//make deafulr lead time date look disabled
	}
	else if($('input[name=receiveType]:checked').val() == "leadTime" ){
		document.getElementById("receiveDate").disabled = true ;
		$("#leadTimeRadio").removeClass("disabler");//make deafulr lead time date look enbaled
	}
	
   });
	
	$('input[name=canReorder]').change(function(){
		console.log($('input[name=canReorder]:checked').val());
		changed = 1;
	
   });
			
		//if( parseInt( $('#reorderRemain').text() ) <= 0 ) 
		//   $('#myModal').modal('show');
});

//$(function() { $( ".datepicker" ).datepicker({ dateFormat: 'yy-mm-dd' }); });


function editStock(){//configuring modal values befere showing the cahnge  option of details;upadte stok on modal
     //$('#myModal').modal('hide');
     var rUser =  alasql('SELECT  leadTime, reorderPoint, reorderQuant FROM stock  WHERE id = ?', [ id ] )[0];
     
     
     var rSystem =  alasql('SELECT   levelAvg, quantAvg FROM reorder  WHERE id = ?', [ id ] )[0];
     

     
     $("#reorderQuantitySet").attr("value",  rUser.reorderPoint );
     $("#reorderQuantitySet").attr("title",  "   System suggestion: " + rSystem.quantAvg );
     
     $("#reorderPointSet").attr("value",  rUser.reorderPoint );
     $("#reorderPointSet").attr("title",  "   System suggestion: " + rSystem.levelAvg );
     
     $("#leadTimeSet").attr("value",  rUser.leadTime );
     $("#leadTimeSet").attr("title",  "Time in days to reach "  );
     
     var can = alasql('SELECT  status FROM canReorder  WHERE id = ?', [  id  ] )[0].status ;
     if(can == 1)
	 $('input[value=yes]').prop('checked', true);//  check the checkbox with value = yes//LEARN
     else  $('input[value=no]').prop('checked', true);
           
     console.log("editStock");
	 
	 window.location.assign("stock.html?id=" + id+"#editStockModal" );  //baje wy to load, harcoded//showing modal
     //$('#editStockModal').modal('show');
     
     
 }

 
 function updateStock(){//stokc info chnaged, now recording in db
   
   
   //check whether all input is proided
   if(  !$("#reorderQuantitySet").val() || !$("#reorderPointSet").val() || !$("#leadTimeSet").val() ){
        if( changed == 0 )//radio not changed 
        {
			alert("please fill all the fields.");
			return;
        }
        else{//nothing other is iout, but radio box is canged, so save only it
	if ($('input[name=canReorder]:checked').val() == "no" )
	   alasql('UPDATE canReorder SET status = 0 WHERE id = ?', [  id  ] ) ;
	else
	alasql('UPDATE canReorder SET status = 1 WHERE id = ?', [  id  ] ) ;
	
	 window.location.assign("stock.html?id=" + id);//location.reload();;//no more reload, modals are here :()
        }
   }
   
    
   //check whether intger input is given
   if (+$("#reorderQuantitySet").val() !== parseInt($("#reorderQuantitySet").val()) || +$("#reorderPointSet").val() !== parseInt($("#reorderPointSet").val()) || +$("#leadTimeSet").val() !== parseInt($("#leadTimeSet").val()) )
  {	
		alert("Please input NUMBER only.");
		return;
	
   }

   alasql('UPDATE stock SET leadTime = ?, reorderPoint = ?, reorderQuant = ? WHERE id = ?', [ parseInt($('#leadTimeSet').val()),parseInt($('#reorderPointSet').val()),parseInt($('#reorderQuantitySet').val()), id  ] ) ;
	window.location.assign("stock.html?id=" + id);//location.reload();;//no more reload, modals are here :()

   if ($('input[name=canReorder]:checked').val() == "no" )
	   alasql('UPDATE canReorder SET status = 0 WHERE id = ?', [  id  ] ) ;
   else
	alasql('UPDATE canReorder SET status = 1 WHERE id = ?', [  id  ] ) ;

 }

 