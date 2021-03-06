
$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
   


alasql.fn.dif = function(stock, reorederPoint) { 
        
        return stock- reorederPoint ;
}
 alasql.fn.getDate = function(date) { 
        
        return new Date( date);
}
 alasql.fn.getTotalPrice = function(price, balance) { 
        
        return price*balance;
}

function parseText(t){
    var retAr = [];
    
     if(t.split("<=").length >1 ) {
        retAr.push(2);
        var tmp = t.split("<=");
        retAr.push(parseInt(tmp[1]));
    }
    if(t.split("<").length >1 ) {
        retAr.push(1);
        var tmp = t.split("<");
        retAr.push(parseInt(tmp[1]));
    }
    
    else if(t.split(">=").length >1 ) {
        retAr.push(4);
        var tmp = t.split(">=");
        retAr.push(parseInt(tmp[1]));
    }
    else if(t.split(">").length >1 ) {
        retAr.push(5);
        var tmp = t.split(">");
        retAr.push(parseInt(tmp[1]));
    }
    else if(t.split("=").length >1 ) {
        retAr.push(3);
        var tmp = t.split("=");
        retAr.push(parseInt(tmp[1]));
    }
    else if(t.split("-").length >1 ) {
        retAr.push(6);
        var tmp = t.split("-");
        retAr.push(parseInt(tmp[0]));
        retAr.push(parseInt(tmp[1]));
    }
    else if(t.length > 0 ){//has actually some text 
        retAr.push(7);
        retAr.push(parseInt(t));
    }
    else {//empty string, did not type anything
        retAr.push(8);      
    }
    
    return retAr;
    
}


// create search box
var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.name);
	$('select[name="q1"]').append(option);
   	if (readCookie('wName') == row.name){
		$('select[name="q1"]').val(row.id);//default warehouse is login warehouse as selected now
		//console.log($('select[name="q1"]').val() + "here");
	}
}

var rows = alasql('SELECT * FROM kind;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.text);
	$('select[name="q2"]').append(option);
}
var rows = alasql('SELECT * FROM maker ;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.makerName);
	option.text(row.makerName);
	$('select[name="maker"]').append(option);
}

// get search params
//var q1 = parseInt($.url().param('q1') || '0');
//$('select[name="q1"]').val(q1);// not needed the url extraction , we go for my warehiuse first
var q1 = parseInt( $('select[name="q1"]').val() ); // now i have forcefully extracted ths warehouse namer and appende d as my deafuut selected warehouse, and to incorporate with past code now setting q1 as this

var q2 = parseInt($.url().param('q2') || '0');
$('select[name="q2"]').val(q2);
//var q3 = $.url().param('q3') || '';
//$('input[name="q3"]').val(q3);
var maker = $.url().param('maker') || 0;//'ALL' added now handle
$('select[name="maker"]').val(maker);

// build sql
var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit, stock.reorderPoint, stock.reorderQuant, stock.lastPurchase, stock.lastSupply\
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
        JOIN canReorder ON canReorder.id=stock.id \
        WHERE canReorder.status=1 \
	AND stock.id >= 0 ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
sql += maker && maker !='0' ? 'AND item.maker = "'+ maker +'" ' : '';

// send query
var stocks = alasql(sql);//, [ '%' + q3 + '%' ]);
var last=[];
var tmp=[];
// build html table
var tbody = $('#tbody-stocks');
for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	tmp=[];
	//var tr = $('<tr dataa-href="stock.html?id=' + stock.id + '"></tr>');
	tmp.push(stock.id);	
	tmp.push(stock.name);//wname	
	tmp.push(stock.text);	//kind name
	tmp.push(stock.code);   //item code
	tmp.push(stock.maker);    //item.maker
	tmp.push(stock.balance);
	tmp.push(stock.reorderPoint);
	tmp.push(stock.balance - stock.reorderPoint );//reimain
	tmp.push(stock.reorderQuant);
		
	tmp.push(stock.lastPurchase);
	tmp.push(stock.lastSupply);	
	tmp.push(numberWithCommas(stock.price));
	tmp.push(stock.balance * stock.price);
	tmp.push(stock.detail);

	//tr.appendTo(tbody);
	last.push(tmp);
	//console.log(last);
					
}
var dTableParaAr = {
        //"bFilter": false,
        data: last,
		//"dom": '<"top"f>rt<"bottom"ilpB><"clear">',
		dom: 'rtlipB',
        buttons: [
            'colvis',
//			{ text: 'My button',
//                action: function ( e, dt, node, config ) {
//                    alert( 'Button activated' );
//                }
//			},
			'copy', 'excel', 'pdf'
        ],
	searchHighlight: true,
		
	"iDisplayLength": 25,
	"columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            }
            
            ,{
                "targets": 7,//remain to reorder
                "createdCell": function (td, cellData, rowData, row, col) {
                    if ( cellData < 1 ) {
                        $(td).css('color', 'red')
                    }
                }
            }
            ,{
                "targets": [ 13 ],
                "visible": false,
                "searchable": false
            }
            ,{
                "targets": 3,//item id
                "createdCell": function (td, cellData, rowData, row, col) {
                    {
                        $(td).css({'color':'blue','text-decoration':'underline'});
                        //$(td).css('text-decoration', 'underline');
                    }
                }
                
                ,"render": function ( data, type, full, meta ) {
                        return '<a id="myLink" title="Show/Edit Details" href="javascript:myFun();" >' +data+ '</a>' ;//'<a href="'+data+'">Download</a>';
                }
                
                
    
            }
            
            ,{"className": "dt-center", "targets": "_all"}//added later to center text
            //,{
            //    "targets": [ 1 ],// dont show ware house now, becasue it is deafult in this current gentic views
            //    "visible": false,
            //    "searchable": false
            //}
            
		//	 {
		//		"targets": -1,
		//		"data": null,
		//		"defaultContent": '<input type="checkbox" name="vehicle" value="Car" checked>'//"<button>Click!</button>"
		//    }
		
	]
         
        //"createdRow": function ( row, data, index ) {//make every item id cell highlight
        //   //console.log(index, data[index]);
        //   if ( data[7] * 1 <= 0 ) {// if reoreder remain is less, coor the cell
        //       //console.log(data[7]);
        //       //$('td:eq(5)', row).addClass('highlightt');//actually its 8th clumn, bur row has stockid invinsble, only $data has all comulmns, so hardcoded
        //   }
        //}
		 
	,"order": [[ 7, "asc" ]]	//low item remain to reorder is hown frist
        ,colReorder: true
		 
		// ,"rowCallback": function( row, data, index ) {
		//	//alert("hi");
		//	if ( data.grade == "A" ) {
		//	  $('td:eq(4)', row).html( '<b>A</b>' );
		//	}
		//}
  
		//,select: true
        
        ,fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {//get click
        // Row click
            //$(nRow).on('click', function() {
            //    console.log('Row Clicked. Look I have access to all params, thank You closures.', this, aData, iDisplayIndex, iDisplayIndexFull);
            //});
            
            // Cell click//now handling thorugh rendring function of cell
            //$('td:eq(1)', nRow).on('click', function() {//maing specifc cell,2nd only click event
            $('td', nRow).on('click', function() {//getting any td click and its stockid which is nvsble
                //console.log('Col Clicked.', this, aData, iDisplayIndex, iDisplayIndexFull);//get everything from aDAta
                //console.log('Col Clicked.', $(this).html());//show cell data
                //console.log("sockid= "+ aData[0])
                fun(aData[0]);//I fill up the modal
                //$('#myModal').modal('show');
                //$('#editStockModal').modal('show');
            });                        
        }
        
        //,"scrollY":        "200px"//////ADEDED LATER
        //,"scrollCollapse": true,
         ,"language": {
                "emptyTable": "Sorry. The filtering criteria does not match any product."
              }
        
};

if (readCookie('wName') != 'Head')//this is stupif, just showing central admin the warehouse, so have to rewite all the defintion of dataTable just by copuing previous def ut just changing one filed taht is unhiding 1st column
{
   dTableParaAr.columnDefs.push({ 
        "targets": [ 1 ],// dont show ware house now, becasue it is deafult in this current gentic views
                "visible": false,
    });
}

table = $('#stock-table').DataTable(dTableParaAr );

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

// $('#stock-table tbody').on( 'click', 'input', function () {//checkbox event
//        var data = table.row( $(this).parents('tr') ).data();
//		//$('#myModal').modal('show');
//        alert( data[0] +"'s salary is: "+ data[ 5 ] );
//    } );
//  $('#stock-table tbody').on( 'click', 'button', function () {//button event
//        var data = table.row( $(this).parents('tr') ).data();
//		//$('#myModal').modal('show');
//        alert( data[0] +"'s salary is: "+ data[ 5 ] );
//    } );
 


//$('#stock-tablee tbody').on('click', 'td', function () {
//	
//	
//	if(this.innerHTML != '<input name="vehicle" value="Car" checked="" type="checkbox">')//cell vaule is button, so do nothing
//	//made sure it is not the checkbox :p
//	{
//		//var data = table.row( this ).data();//full row value in array
//		if($(this).index() != 0)
//			window.location.href = "stock.html?id=" + table.row( this ).data()[0];// + '"';
//		//console.log( this  );
//		//console.log(table.cell( this  ));
//		//console.log(table.cell( this ).data() );
//		//console.log(table.row( this ).data());
//		
//        //
//		//alert( 'Row index: '+table.row( this ).index() );
//	}
//	
//} );


function filter(){
               
	//console.log(5);
	var q1 = $('select[name="q1"]').val();
	var q2 = $('select[name="q2"]').val();
	var maker = $('select[name="maker"]').val();
	var q3 = $('input[name="q3"]').val();
	var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit, stock.reorderPoint, stock.reorderQuant, stock.lastPurchase, stock.lastSupply\
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
        JOIN canReorder ON canReorder.id=stock.id \
	 WHERE stock.id >= 0 ';
    
	sql += (q1!=0) ? 'AND whouse.id = ' + q1 + ' ' : '';
	sql += (q2!=0) ? 'AND kind.id = ' + q2 + ' ' : '';
	sql += maker && maker !='0' ? 'AND item.maker = "'+ maker +'" ' : '';
	
    if( $('input[name="itemCount"]').val() )
    {
        var itemCountAr = parseText( $('input[name="itemCount"]').val() );
        var arg1 = itemCountAr[1]; var arg2 = itemCountAr[2];			
        if (itemCountAr[0] == 1 )
            sql +=  'AND stock.balance < ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 2 )
                sql +=  'AND stock.balance <= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 3 )
                sql +=  'AND stock.balance == ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 4 )
                sql +=  'AND stock.balance >= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 5 )
                sql +=  'AND stock.balance > ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 6 )
                sql +=  'AND stock.balance >= ' + arg1 + ' AND stock.balance <= ' + arg2 + ' ';
            else if (itemCountAr[0] == 7 )
                sql +=  'AND stock.balance == ' + arg1 + ' ';	
    }
    
    if( $('input[name="reorderPoint"]').val() )
    {
        var itemCountAr = parseText( $('input[name="reorderPoint"]').val() );
        var arg1 = itemCountAr[1]; var arg2 = itemCountAr[2];			
        if (itemCountAr[0] == 1 )
            sql +=  'AND stock.reorderPoint < ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 2 )
                sql +=  'AND stock.reorderPoint <= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 3 )
                sql +=  'AND stock.reorderPoint == ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 4 )
                sql +=  'AND stock.reorderPoint >= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 5 )
                sql +=  'AND stock.reorderPoint > ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 6 )
                sql +=  'AND stock.reorderPoint >= ' + arg1 + ' AND stock.reorderPoint <= ' + arg2 + ' ';
            else if (itemCountAr[0] == 7 )
                sql +=  'AND stock.reorderPoint == ' + arg1 + ' ';
    }
     
    if( $('input[name="reorderRemain"]').val() )
    {
        var itemCountAr = parseText( $('input[name="reorderRemain"]').val() );
        var arg1 = itemCountAr[1]; var arg2 = itemCountAr[2];			
        if (itemCountAr[0] == 1 )
            sql +=  'AND dif(stock.balance, stock.reorderPoint) < ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 2 )
                sql +=  'AND dif(stock.balance, stock.reorderPoint) <= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 3 )
                sql +=  'AND dif(stock.balance, stock.reorderPoint) == ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 4 )
                sql +=  'AND dif(stock.balance, stock.reorderPoint) >= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 5 )
                sql +=  'AND dif(stock.balance, stock.reorderPoint) > ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 6 )
                sql +=  'AND dif(stock.balance, stock.reorderPoint) >= ' + arg1 + ' AND dif(stock.balance, stock.reorderPoint) <= ' + arg2 + ' ';
            else if (itemCountAr[0] == 7 )
                sql +=  'AND dif(stock.balance, stock.reorderPoint) == ' + arg1 +  ' ';
    }
    
    if( $('input[name="lastPurchase"]').val() )
    {
;
        var arg1 =  $('input[name="lastPurchase"]').val() ;
        //sql +=  'AND DATE(stock.lastPurchase) > ? ';// + new Date(arg1) + ' ' ;
        sql +=  'AND DATE(stock.lastPurchase) <= ' + ' new Date("' + (arg1) + '")'  + ' ' ;//IMPORTANT HOW TO COMARE DATE, I WRITE MY OWN AFTER ONE HOUR DEBUGGING
            
    }
    if( $('input[name="lastSupply"]').val() )
    {
        var arg1 =  $('input[name="lastSupply"]').val() ;
        //sql +=  'AND DATE(stock.lastPurchase) > ? ';// + new Date(arg1) + ' ' ;
        sql +=  'AND DATE(stock.lastSupply) <= ' + ' new Date("' + (arg1) + '")'  + ' ' ;//IMPORTANT HOW TO COMARE DATE, I WRITE MY OWN AFTER ONE HOUR DEBUGGING
            
    }
    
    if( $('input[name="unitPrice"]').val() )
    {
        var itemCountAr = parseText( $('input[name="unitPrice"]').val() );
        var arg1 = itemCountAr[1]; var arg2 = itemCountAr[2];			
        if (itemCountAr[0] == 1 )
            sql +=  'AND item.price < ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 2 )
                sql +=  'AND item.price <= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 3 )
                sql +=  'AND item.price == ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 4 )
                sql +=  'AND item.price >= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 5 )
                sql +=  'AND item.price > ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 6 )
                sql +=  'AND item.price >= ' + arg1 + ' AND item.price <= ' + arg2 + ' ';
            else if (itemCountAr[0] == 7 )
                sql +=  'AND item.price == ' + arg1 +  ' ';
                console.log(sql);
    }
    
    if( $('input[name="totalPrice"]').val() )
    {
        var itemCountAr = parseText( $('input[name="totalPrice"]').val() );
        var arg1 = itemCountAr[1]; var arg2 = itemCountAr[2];			
        if (itemCountAr[0] == 1 )
            sql +=  'AND getTotalPrice(item.price,stock.balance) < ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 2 )
                sql +=  'AND getTotalPrice(item.price,stock.balance) <= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 3 )
                sql +=  'AND getTotalPrice(item.price,stock.balance) == ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 4 )
                sql +=  'AND getTotalPrice(item.price,stock.balance) >= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 5 )
                sql +=  'AND getTotalPrice(item.price,stock.balance) > ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 6 )
                sql +=  'AND getTotalPrice(item.price,stock.balance) >= ' + arg1 + ' AND getTotalPrice(item.price,stock.balance) <= ' + arg2 + ' ';
            else if (itemCountAr[0] == 7 )
                sql +=  'AND getTotalPrice(item.price,stock.balance) == ' + arg1 +  ' ';
    }
    if( $('input[name="reorderQuantity"]').val() )
    {
        var itemCountAr = parseText( $('input[name="reorderQuantity"]').val() );
        var arg1 = itemCountAr[1]; var arg2 = itemCountAr[2];			
        if (itemCountAr[0] == 1 )
            sql +=  'AND stock.reorderQuant < ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 2 )
                sql +=  'AND stock.reorderQuant <= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 3 )
                sql +=  'AND stock.reorderQuant == ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 4 )
                sql +=  'AND stock.reorderQuant >= ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 5 )
                sql +=  'AND stock.reorderQuant > ' + arg1 + ' ' ;
            else if (itemCountAr[0] == 6 )
                sql +=  'AND stock.reorderQuant >= ' + arg1 + ' AND stock.reorderQuant <= ' + arg2 + ' ';
            else if (itemCountAr[0] == 7 )
                sql +=  'AND stock.reorderQuant == ' + arg1 +  ' ';
    }
    if($('select[name="status"]').val() == 0){//active
        sql +=  'AND canReorder.status = 1 '  ;
    }
    else if($('select[name="status"]').val() == 1){//outdated
        sql +=  'AND canReorder.status = 0 '  ;
    }
    else if ($('select[name="status"]').val() == 2){//all
   
    }
    else
     sql +=  'AND canReorder.status = 1 '  ;
    
    
    
	// send query
    //var stocks = alasql(sql,[ new Date( $('input[name="lastPurchase"]').val() )] );//, [ '%' + q3 + '%' ]);
	var stocks = alasql(sql);
	
	var last=[];
	var tmp=[];
	// build html table
	var tbody = $('#tbody-stocks');
	for (var i = 0; i < stocks.length; i++) {
		var stock = stocks[i];
		tmp=[];
		//var tr = $('<tr dataa-href="stock.html?id=' + stock.id + '"></tr>');
		tmp.push(stock.id);	
		tmp.push(stock.name);//wname	
		tmp.push(stock.text);	//kind name
		tmp.push(stock.code);   //item code
		tmp.push(stock.maker);    //item.maker
		tmp.push(stock.balance);
		tmp.push(stock.reorderPoint);
		tmp.push(stock.balance - stock.reorderPoint  );//reimain
		tmp.push(stock.reorderQuant);
			
		tmp.push(stock.lastPurchase);
		tmp.push(stock.lastSupply);	
		tmp.push(numberWithCommas(stock.price));
		tmp.push(numberWithCommas( stock.balance * stock.price) );
		tmp.push(stock.detail);
		last.push(tmp);

    }
        if( $('select[name="q1"]').val() === "0" )//all whouse seleted
     {           table.column( 1 ).visible( true );//'show all warehouse' will trigger warehouse column to unhide
                //console.log("her");
     }
     else{
        table.column( 1 ).visible( false );      
     }
     
        table.clear().draw();
    table.rows.add(last).draw();
    
     
}
//global filter is now my custom filter as attahced
 $("#Search_All").keyup(function () {//#Search_All is a simple input type text
                  
                   table.search( this.value ).draw();
                   //table2.search( this.value ).draw();
});
function fun(stockId){//with each row clcik do make modal ready ,bad practise
        
   $("#lineModalLabel").html("Hardware Details");
   var sql = 'SELECT item.id, whouse.name, item.code, item.maker, item.detail, item.price, stock.balance, stock.item, stock.reorderPoint, stock.reorderQuant, stock.lastPurchase, stock.lastSupply, stock.leadTime  \
      FROM stock \
      JOIN whouse ON whouse.id = stock.whouse \
      JOIN item ON item.id = stock.item \
      JOIN kind ON kind.id = item.kind \
      WHERE stock.id = ?';
     var row = alasql(sql, [ stockId ])[0];
     
     var query = alasql('SELECT  quantAvg , quantTime , levelAvg  from reorder WHERE reorder.id = ?', [ stockId ] ) [0] ;
     var typeAr =  alasql('SELECT kind.text from kind JOIN item ON kind.id=item.kind JOIN stock ON stock.item=item.id AND stock.item = ?', [ row.item ] ) [0] ;
     
     $('#stockId').text(stockId);
     $('#whouse').text(row.name);
     $('#code').text(row.code);
     $('#maker').text(row.maker);
     $('#detail').text(row.detail);
     $('#price').text(numberWithCommas(row.price));
     
     $('#classification').text(typeAr.text);
     
     $('#reorderRemain').text(row.balance - row.reorderPoint  );
     $('#leadTime').text(row.leadTime  );
     $('#lastPurcahse').text(row.lastPurchase);
     $('#lastSupply').text(row.lastSupply);
     $('#totalprice').text(numberWithCommas(row.balance * row.price) );
     
     $('#reorderQuantity').html(row.reorderQuant + "<br>" + "suggestion: " + query.quantAvg );
     $('#reorderPoint').html (row.reorderPoint + "<br>" + "suggestion: " + query.levelAvg);
     
    
     $('#balance').text(row.balance);
      
      //modal 1 can reorder value set
        var canReorder =  alasql('SELECT status from canReorder WHERE id = ?', [parseInt( $('#stockId').html())])[0].status;//newly addd feature, last enrty as if user has not diasbled item to b view on reoder list
        if(canReorder == 1 )  $('#canReorder').text("Active");
        else  $('#canReorder').text("Outdated");
      if(row.name != readCookie('wName') ){//this row's wname is not y warehouse, so ccna tedit
         $('#editStockButton').hide();
      }
      else{//my whouse, show edit button
        $('#editStockButton').show();
      }

}

 function openStock(){//upadte stok on modal
   window.location.href = "stock.html?id=" + $('#stockId').html();
 }
 


 function editStock(){//ready modal 2  and then enter to edit stcik info
     //$('#myModal').modal('hide');
     var rUser =  alasql('SELECT  leadTime, reorderPoint, reorderQuant FROM stock  WHERE id = ?', [parseInt( $('#stockId').html() ) ] )[0];
     
     
     var rSystem =  alasql('SELECT   levelAvg, quantAvg FROM reorder  WHERE id = ?', [parseInt( $('#stockId').html() ) ] )[0];
     
     //$("#reorderQuantitySet").attr("placeholder", "user:" + rUser.reorderQuant + "   System suggestion: " + rSystem.quantAvg);
     //$("#reorderPointSet").attr("placeholder", "user:" + rUser.reorderPoint  + "   System suggestion: " + rSystem.levelAvg );
     //$("#leadTimeSet").attr("placeholder", rUser.leadTime );
     //
     $("#reorderQuantitySet").attr("value",  rUser.reorderPoint );
     $("#reorderQuantitySet").attr("title",  "   System suggestion: " + rSystem.quantAvg );
     
     $("#reorderPointSet").attr("value",  rUser.reorderPoint );
     $("#reorderPointSet").attr("title",  "   System suggestion: " + rSystem.levelAvg );
     
     $("#leadTimeSet").attr("value",  rUser.leadTime );
     $("#leadTimeSet").attr("title",  "Time in days to reach "  );
     
     var can = alasql('SELECT  status FROM canReorder  WHERE id = ?', [  parseInt( $('#stockId').html()) ] )[0].status ;
     if(can == 1)
	$('input[value=yes]').prop('checked', true);//  check the checkbox with value = yes//LEARN
     else  $('input[value=no]').prop('checked', true);
     
     console.log("editStockMOdal2");
     
     $('#editStockModal').modal('show');
     
 }
 function updateStock(){//from second modal save stockHard level
   console.log("upading");
   if(  !$("#reorderQuantitySet").val() || !$("#reorderPointSet").val() || !$("#leadTimeSet").val() ){//all field must be input
        alert("please fill all the fields.");
        return;
   }
   //check whether intger input is given
   if (+$("#reorderQuantitySet").val() !== parseInt($("#reorderQuantitySet").val()) || +$("#reorderPointSet").val() !== parseInt($("#reorderPointSet").val()) || +$("#leadTimeSet").val() !== parseInt($("#leadTimeSet").val()) )
  {	alert("Please input NUMBER only.");
	return;
   }
   
   alasql('UPDATE stock SET leadTime = ?, reorderPoint = ?, reorderQuant = ? WHERE id = ?', [ parseInt($('#leadTimeSet').val()),parseInt($('#reorderPointSet').val()),parseInt($('#reorderQuantitySet').val()), parseInt( $('#stockId').html() ) ] ) ;
   
   if ($('input[name=canReorder]:checked').val() == "no" )
	   alasql('UPDATE canReorder SET status = 0 WHERE id = ?', [  parseInt( $('#stockId').html())   ] ) ;
   else
	alasql('UPDATE canReorder SET status = 1 WHERE id = ?', [  parseInt( $('#stockId').html())   ] ) ;
        
   alert("Stock information successfully updated");
   location.reload();
 }

$(document).ready(function () {
        $('.dropdown-toggle').dropdown();
        
         $('[data-toggle="tooltip"]').tooltip();   

      
      
});
document.onkeydown=function(){
    if(window.event.keyCode=='13'){
		//alert(5);
        filter();
    }
}
function myFun(){
       
       $('#myModal').modal('show'); 
}


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
//$(".dataTables_filter").css({ "background" :"blue" });//finalyy done wiht fixed css