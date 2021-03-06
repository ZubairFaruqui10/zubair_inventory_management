
$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
   
//this is bad practice, I harcoded for at most 10 inRetailId, for saving time, 
var checkedId = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
// build sql
var stocks = alasql('SELECT incoming.id AS incomingId, incoming.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  incoming.date  \
                    FROM incoming JOIN stock ON stock.id=incoming.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
                    JOIN whouse ON whouse.id=stock.whouse \
                    WHERE incoming.status = 0  AND whouse.name = ?', [readCookie('wName')]);//load non received, so  satus =0 

function receiveInComing(){
        var cnt  = 0;
        for (var i = 0; i < 38; i++){
                if (checkedId[i] == 1)
                {
                        cnt++;   
                }
        }
        if (cnt > 0){                           
                if (confirm( "Do you want to receive "+cnt + " type of incoming hardware to warehouse.?") ){
                        for (var i = 0; i < 38; i++){
                                if (checkedId[i] == 1)
                                {
                                        alasql('UPDATE incoming SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
										//make uapdte to stock and trnascation
                                        var stockObj = alasql('SELECT stockId, amount FROM incoming WHERE id = ?', [i] )[0] ;
                                        var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [stockObj.stockId] )[0].balance; 
                                        alasql('UPDATE stock SET balance = ? WHERE id = ?', [ preVal + stockObj.amount, stockObj.stockId ]);
                                        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stockObj.stockId, new Date().toJSON().slice(0,10), stockObj.amount, preVal + stockObj.amount, "Purchased" ]);
                                        
                                        
                                        
                                        
                                        
                                        //modify last purchase and update
                                        //if ($('input[name=stockType]:checked').val() == "out" )alasql('UPDATE stock SET lastSupply = ? WHERE id = ?', [date, stockObj.stockId ]);
                                         alasql('UPDATE stock SET lastPurchase = ? WHERE id = ?', [new Date().toJSON().slice(0,10), stockObj.stockId ]);
                                        //now can again reorder when needed later  0 means eligibke for purchase
                                        alasql('UPDATE purchaseOrder SET status = 0 WHERE id = ?', [ stockObj.stockId ]);
                                                                                                                
                        }
                        }
						alert("updated");
                      window.location.assign('incoming.html' );  
                }
                else 
                        return;//location.reload();
        }
        else{
                alert("No item selected to receive");
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
	tmp.push(stock.incomingId);	
		
	tmp.push(stock.text);	//kind name
	
	tmp.push(stock.maker);    //item.maker
	tmp.push(stock.itemCode);   //item code
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
                "emptyTable": "You have no incoming product from vendors."
              }
        
};


table = $('#incoming-table').DataTable(dTableParaAr );


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

 $('#incoming-table tbody').on( 'click', 'input', function () {//checkbox event
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        //alert( data[0] +"'s salary is: "+ data[ 5 ] );
        if (checkedId[ parseInt(data[1]) ] === 0 )
                checkedId[ parseInt(data[1]) ] = 1;
        else
                checkedId[ parseInt(data[1]) ] = 0;
    } );
  $('#incoming-table tbody').on( 'click', 'button', function () {//button event within table
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


$('#incoming-tablee tbody').on('click', 'td', function () {
	
	
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