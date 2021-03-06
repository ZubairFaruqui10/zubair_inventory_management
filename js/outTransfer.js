
$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();


$('#transferTag').children('ul').show();//SHOW SUBMENU UNDER IT, COOCKELOGIN HIES THEM BY DEFAULT


var thisWId = alasql('SELECT id FROM  whouse WHERE name = ?',[readCookie('wName') ])[0].id;
//this is bad practice, I harcoded for at most 10 inRetailId, for saving time, 
var checkedId = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
// build sql
var stocks = alasql('SELECT transfer.id AS itransferId, transfer.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  transfer.toDate, whouse.name, \
                    transfer.fromDate, transfer.fromId FROM transfer JOIN stock ON stock.id=transfer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
                    JOIN whouse ON whouse.id=transfer.toId \
                    WHERE transfer.status = 0  AND transfer.fromId = ?', [ thisWId ]  );//FROMID=//stsus 2 maens recevd by w1, 0 measn sent noti from w1, 1 means sent by w2 

function receiveInComing(){
        var cnt  = 0;
        for (var i = 0; i < 38; i++){
                if (checkedId[i] == 1)
                {
                        cnt++;   
                }
        }
        if (cnt > 0){                           
                if (confirm( "Do you want to transfer "+cnt + " type of  hardware to other warehouse.?") ){
                        for (var i = 0; i < 38; i++){
                                if (checkedId[i] == 1)
                                {           //id INT IDENTITY, fromId INT, toId INT, stockId INT, amount INT, toDate DATE, fromDate DATE, status INT 
                                        
										//make uapdte to stock and trnascation                                             
                                        
                                        var amount = alasql('SELECT amount FROM transfer WHERE id = ?', [i] )[0].amount ;
                                        var otherStockId = alasql('SELECT stockId FROM transfer WHERE id = ?', [i] )[0].stockId ;
                                        var itemId  = alasql('SELECT stock.item FROM stock WHERE  stock.id = ?', [otherStockId])[0].item;  
                                        var myStockId  = alasql('SELECT stock.id FROM stock  JOIN whouse ON whouse.id=stock.whouse \
                                                                WHERE stock.item = ? AND stock.whouse= ?', [itemId, thisWId])[0].id;
                                        //var stockObj = alasql('SELECT stockId, amount FROM outgoing WHERE id = ?', [i] )[0] ;
                                         var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [myStockId] )[0].balance;
                                         if(preVal < amount){//wil never happen, becuse trnafer request respects that
                                                
                                         }
                                        //alasql('UPDATE outgoing SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
                                        //make uapdte to stock and trnascation
                                        var otherWId = alasql('SELECT toId FROM transfer WHERE id = ?', [i])[0].toId;
                                        var otherWName = alasql('SELECT name FROM whouse WHERE id = ?', [otherWId])[0].name;
                                       var historyComment = "Transfer sent to " + otherWName;
                                        alasql('UPDATE stock SET balance = ? WHERE id = ?', [ preVal - amount, myStockId ]);
                                        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, myStockId, new Date().toJSON().slice(0,10), amount, preVal - amount, historyComment ]);
                                       
                                        //modify last purchase and update
                                        
                                         alasql('UPDATE stock SET lastSupply = ? WHERE id = ?', [new Date().toJSON().slice(0,10), myStockId ]);
                                         //finally mark that trnaferred
                                         alasql('UPDATE transfer SET status = 1 WHERE id = ?', [i]);//item received by w1, manes syatus 3
                                                                                                                
                              }
                        }
						alert("Sent to transfer");
                      location.reload();//window.location.assign('incoming.html' );  
                }
                else 
                        return;//location.reload();
        }
        else{
                alert("No item selected to transfer");
        }
        
}

var last=[];
var tmp=[];
// build html table

for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	tmp=[];
	//var tr = $('<tr dataa-href="stock.html?id=' + stock.id + '"></tr>');
        tmp.push(0); //for check box, dunno what to give so dumyy 0
	tmp.push(stock.itransferId);	
		
	tmp.push(stock.text);	//kind name
	tmp.push(stock.itemCode);   //item code
	tmp.push(stock.maker);    //item.maker
	
	//tmp.push(stock.toDate);
               tmp.push(stock.fromDate);
               tmp.push(stock.amount);   //item code
               tmp.push(stock.name);   //wname code
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
            //,{
            //    "targets": 3,//item id
            //    "createdCell": function (td, cellData, rowData, row, col) {
            //        {
            //            $(td).css({'color':'blue','text-decoration':'underline'});
            //            //$(td).css('text-decoration', 'underline');
            //        }
            //    }
            //}
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
                    
                    ,{"className": "dt-center", "targets": "_all"}
		
		]
         ,"order": [[ 6, "asc" ]]
//         ,"createdRow": function ( row, data, index ) {//make every item id cell highlight
//            //console.log(index, data[index]);
//            if ( data[7] * 1 <= 0 ) {// if reoreder remain is less, coor the cell
//                //console.log(data[7]);
//                $('td:eq(5)', row).addClass('highlightt');//actually its 8th clumn, bur row has stockid invinsble, only $data has all comulmns, so hardcoded
//            }
//        }
//		 
//	,"order": [[ 7, "asc" ]]	//low item remain to reorder is hown frist
//        ,colReorder: true
//		 
//		// ,"rowCallback": function( row, data, index ) {
//		//	//alert("hi");
//		//	if ( data.grade == "A" ) {
//		//	  $('td:eq(4)', row).html( '<b>A</b>' );
//		//	}
//		//}
//  
//		//,select: true
//        
//        ,fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {//get click
//        // Row click
//            //$(nRow).on('click', function() {
//            //    console.log('Row Clicked. Look I have access to all params, thank You closures.', this, aData, iDisplayIndex, iDisplayIndexFull);
//            //});
//            
//            // Cell click
//            $('td:eq(1)', nRow).on('click', function() {//maing specifc cell click event
//                //console.log('Col Clicked.', this, aData, iDisplayIndex, iDisplayIndexFull);//get everything from aDAta
//                console.log('Col Clicked.', $(this).html());//show cell data
//                fun(aData[0]);
//                $('#myModal').modal('show');
//                //$('#editStockModal').modal('show');
//            });                        
//        }
//        
//        ,"scrollY":        "200px"//////ADEDED LATER
//        ,"scrollCollapse": true,
 ,"language": {
                "emptyTable": "You have no outging product as transfer."
              }
        
};


table = $('#inTransfer-table').DataTable(dTableParaAr );


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

 $('#inTransfer-table tbody').on( 'click', 'input', function () {//checkbox event
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        //alert( data[0] +"'s salary is: "+ data[ 5 ] );
        if (checkedId[ parseInt(data[1]) ] === 0 )
                checkedId[ parseInt(data[1]) ] = 1;
        else
                checkedId[ parseInt(data[1]) ] = 0;
    } );
  $('#inTransfer-table tbody').on( 'click', 'button', function () {//button event within table
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


$('#inTransfer-tablee tbody').on('click', 'td', function () {
	
	
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