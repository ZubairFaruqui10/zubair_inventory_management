
$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
   
//this is bad practice, I harcoded for at most 10 inRetailId, for saving time, 
var checkedId = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
// build sql
var stocks = alasql('SELECT outgoing.id AS outgoingId, outgoing.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  outgoing.date, stock.balance  \
                    FROM outgoing JOIN stock ON stock.id=outgoing.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
                    JOIN whouse ON whouse.id=stock.whouse \
                        WHERE outgoing.status = 0 AND whouse.name = ?',[readCookie('wName')]);//load non received, so  satus =0 
lessStock=[];//empty
function sendOutgoing(){
        var cnt  = 0;
        for (var i = 0; i < 38; i++){
                if (checkedId[i] == 1)
                {
                        cnt++;   
                }
        }
        lessStock=[];
        if (cnt > 0){                           
                if (confirm( "Do you want to send "+cnt + " type of outgoing hardware to warehouse.?") ){
                        for (var i = 0; i < 38; i++){
                                if (checkedId[i] == 1)//i is outid too
                                {
                                         var stockObj = alasql('SELECT stockId, amount FROM outgoing WHERE id = ?', [i] )[0] ;
                                         var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [stockObj.stockId] )[0].balance;
                                         if(preVal < stockObj.amount){//not enuf to supply, ignore and store now to show that they were missed
                                                var itemCode= alasql('SELECT item.code FROM item JOIN stock ON stock.item=item.id JOIN outgoing ON  stock.id=outgoing.stockId WHERE outgoing.stockId =?', [i])[0].code;
                                                //alert(itemCode+ " has not enough stock to provide to retailer.");
                                                lessStock.push([i,stockObj.stockId, itemCode, preVal, stockObj.amount]);
                                                console.log("not enuf=" + itemCode);
                                                continue;//do not precess now
                                         }
                                        alasql('UPDATE outgoing SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
                                        //make uapdte to stock and trnascation
                                        
                                       
                                        alasql('UPDATE stock SET balance = ? WHERE id = ?', [ preVal - stockObj.amount, stockObj.stockId ]);
                                        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stockObj.stockId, new Date().toJSON().slice(0,10), stockObj.amount, preVal - stockObj.amount, "Supplied" ]);
                                       
                                        //modify last purchase and update
                                        
                                         alasql('UPDATE stock SET lastSupply = ? WHERE id = ?', [new Date().toJSON().slice(0,10), stockObj.stockId ]);
                                                                                                                
                                }
                        }
                        if(lessStock.length > 0){
                                alert("Some items are not enough in stock. Send all in stock now and make a reorder form purchase.");
                                showLessModal();                               
                        }

			else			//modal on display,not reload
                                location.reload(); 
                }
                else //user doesnt want to send
                        return;//location.reload();
        }
        else{
                alert("No item selected to receive");
        }
        
}

function showLessModal(){//items that were not enuf to supply, show them
        $('#tbody-reorder').empty();
        for(var i =0; i < lessStock.length; i++){
                var tr = $('<tr>').appendTo($('#tbody-reorder'));
                tr.append('<td class="hidden">' + lessStock[i][1] + '</td>');
                tr.append('<td>' + lessStock[i][2] + '</td>');
                tr.append('<td>' + lessStock[i][3] + '</td>');
                tr.append('<td>' + lessStock[i][4] + '</td>');               
        }      
        $('#myModal').modal('show');
}

//adds int days to date string
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toJSON().slice(0,10);//return date string, not js date object which is result
}

function confirmReorder(){//from modal's conirm button
        $('#myModal').modal('hide');//modal function is off, confirmed is hit
        
    for(var i =0; i < lessStock.length; i++){
        if(lessStock[i][3] == 0){//balance is 0
                //give the alert after reorder check
                //alert(lessStock[i][2] + " is 0 in balance. Cannot send any.");//Wait to recieve and then send remaining.")
        }
        else{//record thta u send
                var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;        
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, lessStock[i][1], new Date().toJSON().slice(0,10), lessStock[i][3], 0, "Supplied" ]);
                alasql('UPDATE stock SET lastSupply = ? WHERE id = ?', [new Date().toJSON().slice(0,10), lessStock[i][1] ]);
                alasql('UPDATE stock SET balance = ? WHERE id = ?', [ 0, lessStock[i][1] ]);//preVal - stockObj.amount, stockObj.stockId
        }
        
        var isPurchased  = alasql('SELECT  status FROM purchaseOrder  WHERE id= ?', [lessStock[i][1]])[0].status;
        if(isPurchased == 1){//already in reorder and not recieved
                if(lessStock[i][3] > 0)//can send some now
                        alert(lessStock[i][2] + " is already in reorder. Sending all in stock now. Wait to recieve and then send remaining.")
                else//balance is zeero :(
                        alert(lessStock[i][2] + " is already in reorder. Stock has nothing to send. Wait to recieve and then send remaining.")
        }
        else{//take care of reorder
                var reorderQuant = alasql('SELECT reorderQuant FROM stock WHERE id= ?', [lessStock[i][1] ])[0].reorderQuant;
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, lessStock[i][1], new Date().toJSON().slice(0,10), reorderQuant, 0, "Reordered" ]);
                alasql('UPDATE purchaseOrder SET status = 1 WHERE id= ?', [lessStock[i][1]]);// INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, lessStock[i][1], new Date().toJSON().slice(0,10), reorderQuant, 0, "Reordered" ]);
        
                //NEW row in incming stock page, 3rd submission
                var incomingId = alasql('SELECT MAX(id) + 1 as id FROM incoming')[0].id;
                var leadDay = alasql('SELECT leadTime FROM stock WHERE id =?', [ lessStock[i][1] ])[0].leadTime;
                var nextDate = addDays( new Date().toJSON().slice(0,10) , leadDay );
                alasql('INSERT into incoming VALUES (?,?,?,?,?) ',[incomingId, lessStock[i][1], reorderQuant, nextDate, 0]);//(id , stockId INT, amount INT, date DATE, status INT );');
                 
                 //adjust reorder sytem suggestion now	
                var query = alasql('SELECT  quantAvg , quantTime , levelAvg  from reorder WHERE reorder.id = ?', [ lessStock[i][1] ] ) [0] ;
                var quant = Math.ceil( (query.quantAvg * query.quantTime + lessStock[i][4] ) / (query.quantTime + 1 ) );
                var level = Math.ceil( (query.levelAvg * query.quantTime + lessStock[i][3] ) / (query.quantTime + 1 ) );
                alasql('UPDATE reorder SET quantAvg = ? , levelAvg = ?, quantTime = ? WHERE id = ?', [quant, level, query.quantTime + 1,  lessStock[i][1] ]);

      
                if(lessStock[i][3] == 0){//balance is 0
                        //no alert forthis was given
                        alert(lessStock[i][2] + " is 0 in balance. Cannot send any.");//Wait to recieve and then send remaining.")
                }
                
        }
        //alasql('UPDATE outgoing SET status = 1 WHERE id = ?', [lessStock[i][0]]);//item received, manes syatus 1
        alasql('UPDATE outgoing SET amount = ? WHERE id = ?', [lessStock[i][4] - lessStock[i][3], lessStock[i][1] ] );//still inmlist, but snedlable amnt is needed - balance
         
    }
    //alert("Sent to retailers and placed an reorder request");
    
    window.location.assign('outgoing.html' ); 
}
function rejectReorder(){//from modal's reject button
         window.location.assign('outgoing.html' ); 
}
var last=[];
var tmp=[];
// build html table

for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	tmp=[];
	//var tr = $('<tr dataa-href="stock.html?id=' + stock.id + '"></tr>');
        tmp.push(0); //for check box, dunno what to give so dumyy 0
	tmp.push(stock.outgoingId);	
		
	tmp.push(stock.text);	//kind name
	
	tmp.push(stock.maker);    //item.maker
	tmp.push(stock.itemCode);   //item code
        tmp.push(stock.balance);   //item code
	tmp.push(stock.amount);   //item code
    
	tmp.push(stock.date);
     
	last.push(tmp);
	//console.log(last);
					
}
var dTableParaAr = {
        //"bFilter": false,
        data: last,
		//"dom": '<"top"f>rt<"bottom"ilpB><"clear">',
		dom: 'rt',
        buttons: [
            //'colvis',
//			{ text: 'Receive',
//                action: function ( e, dt, node, config ) {
//                    receiveDamage();
//                }
//			}
			//,'copy', 'excel', 'pdf'
        ],
		searchHighlight: true,
		
		 "iDisplayLength": 25,
		 "columnDefs": [
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
            }
            
            //,{
            //    "targets": 7,//remain to reorder
            //    "createdCell": function (td, cellData, rowData, row, col) {
            //        if ( cellData < 1 ) {
            //            $(td).css('color', 'red')
            //        }
            //    }
            //}
            ,{
                "targets": 6,//quant
                "createdCell": function (td, cellData, rowData, row, col) {
                    {
                        $(td).css( {'font-weight':'bold'});
                        //$(td).css('text-decoration', 'underline');
                    }
                }
            }
            //,{
            //    "targets": [ 1 ],// dont show ware house now, becasue it is deafult in this current gentic views
            //    "visible": false,
            //    "searchable": false
            //}
            
                ,{
                       "targets": 0,
                       "data": null,
                       'orderable':false,
                       'className': 'dt-body-center',
                       "defaultContent": '<input type="checkbox" name="vehicle" value="Car" >'//"<button>Click!</button>"
           }
           ,{"className": "dt-center", "targets": "_all"}//added later to center text
		
		]
        ,"order": [[ 7, "asc" ]]

 ,"language": {
                "emptyTable": "You have no outgoing request from retailers for now."
              }
        
};


table = $('#outgoing-table').DataTable(dTableParaAr );


//global filter for all dataTbale 
//having one search box for multiple search in two tables simlutaneously
 $("#Search_All").keyup(function () {//#Search_All is a simple input type text
                  
                   table.search( this.value ).draw();
                   //table2.search( this.value ).draw();
});
 
 
//new $.fn.dataTable.Buttons( table, {
//    buttons: [
//        'copy', 'excel', 'pdf'
//    ]
//} );

//table.on( 'draw', function () {
//        var body = $( table.table().body() );
// 
//        body.unhighlight();
//        body.highlight( table.search() );  
//    } );

 $('#outgoing-table tbody').on( 'click', 'input', function () {//checkbox event
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        //alert( data[0] +"'s salary is: "+ data[ 5 ] );
        if (checkedId[ parseInt(data[1]) ] === 0 )
                checkedId[ parseInt(data[1]) ] = 1;
        else
                checkedId[ parseInt(data[1]) ] = 0;
    } );
  $('#outgoing-table tbody').on( 'click', 'button', function () {//button event within table
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        alert( data[0] +"'s salary is: "+ data[ 5 ] );
    } );
 
//new $.fn.dataTable.Responsive( table );

//$('tbody > tr').css('cursor', 'pointer').hover(function() {//modal sho on hover long
//            var expanding = $(this);
//    var timer = window.setTimeout(function () {
//        expanding.data('timerid', null);
//            //appendTo("body");//
//            $('#myModallll').modal('show');
//            
//
//    }, 1500);
//    //store ID of newly created timer in DOM object
//    expanding.data('timerid', timer);
//}, function () {
//    var timerid = $(this).data('timerid');
//    if (timerid != null) {
//		//$('#myModal').modal('hide');
//        //mouse out, didn't timeout. Kill previously started timer
//        window.clearTimeout(timerid);
//    }
//  });
  
/*
$('#stock-table tbody ').css('cursor', 'pointer').on( 'click', 'td', function () {
    
    
	var whouse= ($(this).parent().find('td:eq(0)').html().trim());//find('td:eq(2)');
	var code = ($(this).parent().find('td:eq(2)').html().trim());//find('td:eq(2)');
	var stocks = alasql('SELECT stock.id \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code = ? AND whouse.name = ?', [code, whouse ]);
	var dataahref="stock.html?id=" + stocks[0].id + '"';
    //window.location.href = "stock.html?id=" + stocks[0].id + '"';
    
    //var win = window.open(dataahref);
    //win.focus();  //in new tab  
    
    //window.location.href = 'emp.html?id=' + empId.id;//same window
	$('#myModal').modal('show');
});
*/


$('#outgoing-tablee tbody').on('click', 'td', function () {
	
	
	if(this.innerHTML != '<input name="vehicle" value="Car" checked="" type="checkbox">')//cell vaule is button, so do nothing
	//made sure it is not the checkbox :p
	{
		//var data = table.row( this ).data();//full row value in array
		if($(this).index() != 0)
			window.location.href = "stock.html?id=" + table.row( this ).data()[0];// + '"';
		//console.log( this  );
		//console.log(table.cell( this  ));
		//console.log(table.cell( this ).data() );
		//console.log(table.row( this ).data());
		
        //
		//alert( 'Row index: '+table.row( this ).index() );
	}
	
} );

// Handle click on "Select all" control on table1
   $('#example-select-all').on('click', function(){
      // Check/uncheck all checkboxes in the table
      var rows = table.rows({ 'search': 'applied' }).nodes();//it gets all row where search is enbaled
      $('input[type="checkbox"]', rows).prop('checked', this.checked);//it toggles header checkbox status
      
      var dataObjAr = table.rows({ 'search': 'applied' }).data();//all the rows' data as array of object
      
      if ($('input[type="checkbox"]', rows).prop('checked') ){//if now main header checkbox  is selcted, make each checkedid array's index no:(row's first column,which is outmain id) = 1
        for( var i =0; i < dataObjAr.length; i++){
        
                checkedId[ parseInt(dataObjAr[i][1]) ] = 1;
        }
      }
      else{
         for( var i =0; i < dataObjAr.length; i++){
        
                checkedId[ parseInt(dataObjAr[i][1]) ] = 0;//make all 0, as header is unchecked
        }
      }
      
   });

$(document).ready(function () {
        $('.dropdown-toggle').dropdown();
        var inRetailers = alasql('SELECT inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind WHERE status = 0');//load non received, so  satus =0 
        if(inRetailers.length == 0)
                $("#inRetailerBadge").html("");
        else
                $("#inRetailerBadge").html(inRetailers.length);
      
      
});
document.onkeydown=function(){
//    if(window.event.keyCode=='13'){
//		//alert(5);
//        filter();
//    }
}
//$(".dataTables_filter").css({ "background" :"blue" });//finalyy done wiht fixed css