$("#pageName").html( $("#pageName").html() +", "+ readCookie('wName') );
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
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
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);
var maker = $.url().param('maker') || 0;//'ALL' added now handle
$('select[name="maker"]').val(maker);

// build sql
var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit, stock.reorderPoint, stock.reorderQuant, stock.lastPurchase, stock.lastSupply\
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
sql += maker && maker !='0' ? 'AND item.maker = "'+ maker +'" ' : '';

// send query
var stocks = alasql(sql, [ '%' + q3 + '%' ]);
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
	tmp.push(stock.balance  - stock.reorderPoint);//reimain
	tmp.push(stock.reorderQuant);
		
	tmp.push(stock.lastPurchase);
	tmp.push(stock.lastSupply);	
	tmp.push(numberWithCommas(stock.price));
	tmp.push(stock.balance * stock.price);
	tmp.push(stock.detail);
	//tr.append('<td style="text-align: right;">' + numberWithCommas(stock.price) + '</td>');	
	//tr.append('<td style="text-align: right;">' + stock.balance + '</td>');	
	//tr.append('<td>' + stock.unit + '</td>');
	
	//tr.appendTo(tbody);
	last.push(tmp);
	//console.log(last);
					
}

var dTableParaAr = {
        //"bFilter": false,
        data: last,
		//"dom": '<"top"f>rt<"bottom"ilpB><"clear">',
		dom: 'frtlpB',//'rtlipBf',
        buttons: [
            'colvis',
//			{ text: 'My button',
//                action: function ( e, dt, node, config ) {
//                    alert( 'Button activated' );
//                }
//			},
			//'copy', 'excel', 'pdf'
        ]
		,searchHighlight: true,
		
		 "iDisplayLength": 25,
		 "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            },			
			{
                "targets": [ 6 ],
                "visible": false,
                "searchable": false
            },
			{
                "targets": [ 8 ],
                "visible": false,
                "searchable": false
            },
			{
                "targets": [ 11 ],
                "visible": false,
                "searchable": false
            },
			{
                "targets": [ 12 ],
                "visible": false,
                "searchable": false
            },
			{
                "targets": [ 13 ],
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
			
			
		//	 {
		//		"targets": -1,
		//		"data": null,
		//		"defaultContent": '<input type="checkbox" name="vehicle" value="Car" checked>'//"<button>Click!</button>"
		//    }
		
		]
		 
		 // ,responsive: {
			
        //    details: {
        //        display: $.fn.dataTable.Responsive.display.modal( {
        //            header: function ( row ) {
        //                var data = row.data();
        //                return 'Details for '+data[0]+' '+data[1];
        //            }
        //        } ),
        //        renderer: $.fn.dataTable.Responsive.renderer.tableAll( {
        //            tableClass: 'table'
        //        } )
        //    }
        //}
        ,colReorder: true
		 ,"order": [[ 7, "asc" ]]//low item remain to reorder is hown frist
		// ,"rowCallback": function( row, data, index ) {
		//	//alert("hi");
		//	if ( data.grade == "A" ) {
		//	  $('td:eq(4)', row).html( '<b>A</b>' );
		//	}
		//}
  
		//,select: true
		,"scrollY":        "300px"//////ADEDED LATER
        //,"scrollCollapse": true,
};

if (readCookie('wName') != 'Head')//this is stupif, just showing central admin the warehouse, so have to rewite all the defintion of dataTable just by copuing previous def ut just changing one filed taht is unhiding 1st column
{
   dTableParaAr.columnDefs.push({ 
        "targets": [ 1 ],// dont show ware house now, becasue it is deafult in this current gentic views
                "visible": false,
    });
}

table = $('#stock-table').DataTable( dTableParaAr);

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

 $('#stock-table tbody').on( 'click', 'input', function () {//button add purchase
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        alert( data[0] +"'s salary is: "+ data[ 5 ] );
    } );
  $('#stock-table tbody').on( 'click', 'button', function () {//button add purchase
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        alert( data[0] +"'s salary is: "+ data[ 5 ] );
    } );
 
//new $.fn.dataTable.Responsive( table );

$('tbody > tr').css('cursor', 'pointer').hover(function() {
            var expanding = $(this);
    var timer = window.setTimeout(function () {
        expanding.data('timerid', null);

            $('#myModallllllllll').modal('show');

    }, 1500);
    //store ID of newly created timer in DOM object
    expanding.data('timerid', timer);
}, function () {
    var timerid = $(this).data('timerid');
    if (timerid != null) {
		//$('#myModal').modal('hide');
        //mouse out, didn't timeout. Kill previously started timer
        window.clearTimeout(timerid);
    }
  });
  
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


$('#stock-table tbody').on('click', 'td', function () {
	
	
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
$(document).ready(function () {
        $('.dropdown-toggle').dropdown();		
    });


function filter(){
	console.log(5);
	var q1 = $('select[name="q1"]').val();
	var q2 = $('select[name="q2"]').val();
	var maker = $('select[name="maker"]').val();
	var q3 = $('input[name="q3"]').val();
	var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit, stock.reorderPoint, stock.reorderQuant, stock.lastPurchase, stock.lastSupply\
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

	sql += (q1!=0) ? 'AND whouse.id = ' + q1 + ' ' : '';
	sql += (q2!=0) ? 'AND kind.id = ' + q2 + ' ' : '';
	sql += maker && maker !='0' ? 'AND item.maker = "'+ maker +'" ' : '';
	
	// send query
	var stocks = alasql(sql, [ '%' + q3 + '%' ]);
	
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
		last.push(tmp);

}

	table.clear().draw();
    table.rows.add(last).draw();	
}
//slow?
document.onkeydown=function(){
    if(window.event.keyCode=='13'){
		//alert(5);
        filter();
    }
}
function testForEnter(obj,evt) {//foul
    var keyCode = evt.keyCode;
    var objType = obj.type;
    if ((keyCode == 13) && (objType != "submit")) {
        evt.returnValue = false;
        evt.stopPropagation(); // this line added for firefox
        if(evt.preventDefault) evt.preventDefault();
		filter();
	}
}
$(document).ready(function () {
        $('.dropdown-toggle').dropdown();
        var inRetailers = alasql('SELECT inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind WHERE status = 0');//load non received, so  satus =0 
        if(inRetailers.length == 0)
                $("#inRetailerBadge").html("");
        else
                $("#inRetailerBadge").html(inRetailers.length);
      
      
});