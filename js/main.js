$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
	
$("#history").hide();//without click, dont show htsry
$("#chartCaption").hide();
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
	JOIN purchaseOrder ON purchaseOrder.id=stock.id \
	JOIN canReorder ON canReorder.id = stock.id \
	WHERE purchaseOrder.status = 0 \
	AND canReorder.status = 1 \
	AND stock.balance <= stock.reorderPoint \
	AND item.code LIKE ? ';

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
	tmp.push(0);//dummy chkbox
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
		dom: 'rtlpB',//'rtlipBf',
        buttons: [
            //'colvis',
//			{ text: 'My button',
//                action: function ( e, dt, node, config ) {
//                    alert( 'Button activated' );
//                }
//			},
			//'copy', 'excel', 'pdf'
        ]
		,searchHighlight: true,
		
		 "iDisplayLength": 10,
		 "columnDefs": [
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
				
            },			
			{
                "targets": [ 7 ],
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
                "targets": [ 13],
                "visible": false,
                "searchable": false
            }
			,{
                "targets": [ 2 ],//not even waergouse
                "visible": false,
                "searchable": false
				,width: 20
            }
			,{
                "targets": [ 14 ],
                "visible": false,
                "searchable": false
				,width: 20
            }
			,{
                "targets": 8,//remain to reorder
                "createdCell": function (td, cellData, rowData, row, col) {
                    if ( cellData < 1 ) {
                        $(td).css('color', 'red')
                    }
                }
            }
			,{
				"targets": 0,
				"data": null,
                                'orderable':false,
                                'className': 'dt-body-center',
				"defaultContent": '<input id="check" type="checkbox" name="vehicle" value="Car" >'//"<button>Click!</button>"
		    }
			
			
		//	 {
		//		"targets": -1,
		//		"data": null,
		//		"defaultContent": '<input type="checkbox" name="vehicle" value="Car" checked>'//"<button>Click!</button>"
		//    }
		
		,{"className": "dt-center", "targets": "_all"}//added later to center text
		
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
		 ,"order": [[ 8, "asc" ]]//low item remain to reorder is hown frist
		// ,"rowCallback": function( row, data, index ) {
		//	//alert("hi");
		//	if ( data.grade == "A" ) {
		//	  $('td:eq(4)', row).html( '<b>A</b>' );
		//	}
		//}
  
		//,select: true
		,"scrollY":        "400px"//////ADEDED LATER
        ,"scrollCollapse": true
		 ,"language": {
                "emptyTable": "You have no item below reorder point that has been requested for purchase or in active reorder list."
              }
};

if (readCookie('wName') != 'Head')//this is stupif, just showing central admin the warehouse, so have to rewite all the defintion of dataTable just by copuing previous def ut just changing one filed taht is unhiding 1st column
{
   dTableParaAr.columnDefs.push({ 
        "targets": [ 1 ],// dont show ware house now, becasue it is deafult in this current gentic views
                "visible": false,
    });
}

table = $('#stock-table').DataTable( dTableParaAr);

$('tbody > tr').css('cursor', 'pointer');//
$('#stock-table tbody').on('click', 'td', function () {
	
	
	if(this.innerHTML != '<input id="check" name="vehicle" value="Car" type="checkbox">')//cell vaule is button, so do nothing
	//made sure it is not the checkbox :p
	{
		//var data = table.row( this ).data();//full row value in array
		if($(this).index() != 0)
			//window.location.href = "stock.html?id=" + table.row( this ).data()[0];//open stokc page
			showHistory(table.row( this ).data()[1],  table.row( this ).data()[3], table.row( this ).data()[4]);//stocid, kind,code
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
	JOIN purchaseOrder ON purchaseOrder.id=stock.id \
	JOIN canReorder ON canReorder.id = stock.id 	WHERE purchaseOrder.status = 0 	AND canReorder.status = 1 AND stock.balance <= stock.reorderPoint AND item.code LIKE ? ';

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
		tmp.push(0);//dummy chkbox
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

//global filter for all dataTbale 
//having one search box for  table's gloab seacrh
 $("#Search_All").keyup(function () {//#Search_All is a simple input type text
                  
                   table.search( this.value ).draw();
                   //table2.search( this.value ).draw();
});
 
 
//this is bad practice, I harcoded for at most 10 inRetailId, for saving time, 
var checkedId = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

$('#stock-table tbody').on( 'click', 'input', function () {//checkbox event
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        //alert( data[0] +"'s salary is: "+ data[ 5 ] );
        if (checkedId[ parseInt(data[1]) ] === 0 )
                checkedId[ parseInt(data[1]) ] = 1;
        else
                checkedId[ parseInt(data[1]) ] = 0;
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
   


function reorder(){
	console.log("inrdoer");
	var tbody = $('#tbody-reorder');
	$("#tbody-reorder").empty();//empty previous one
	var cnt  = 0;
	for (var i = 0; i < 40; i++){
			if (checkedId[i] == 1)
			{
				cnt++;   
			}
	}
	console.log("2");
	if (cnt > 0){                           
		
		for (var i = 0; i < 40; i++){
				if (checkedId[i] == 1)
				{
					var obj = alasql('SELECT item.code, stock.reorderQuant, reorder.quantAvg FROM stock JOIN item ON item.id=stock.item JOIN reorder ON reorder.id=stock.id WHERE stock.id = ?', [i])[0]; 
					
					var tr = $('<tr>').appendTo(tbody);
					tr.append('<td class="hidden">' + i + '</td>');
					tr.append('<td>' + obj.code + '</td>');
					tr.append('<td>' + '<input id="amount' + i +'"' + '" type="text" width="18" value="'+ obj.reorderQuant + '" title="System suggestion= ' + obj.quantAvg+ '">' +'</td>');
					//alasql('UPDATE inretailer SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
					//var outMainId = alasql('SELECT MAX(id) + 1 as id FROM outMaintenance')[0].id;//inset to outmain now
					//alasql('INSERT INTO outMaintenance VALUES (?,?,?,?,?,?,?,?)', [outMainId, 0, i, 0, 0, "fromRetailer", 0, "2000-01-01"]);// id , type , inRetailerId , stockId , productId , reason ,  status , date ) )')[0].id;
					// 
					// var stockObj = alasql('SELECT stockId FROM inretailer WHERE id = ?', [i] )[0] ;
					// var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [stockObj.stockId] )[0].balance;
					// var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
					//alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stockObj.stockId, new Date().toJSON().slice(0,10), 1, preVal , "Retailer Defect" ]);
					////no stck chenage only tarns update
						
				}
		}
		console.log("3");
		window.location.assign('main.html#modal' );  //baje wy to load, harcoded
		//$("a").attr("href");
		//////hidden for ow, will undo
		//$('#myModal').modal('show');
			  //window.location.assign('outMaintenance.html' );  
	
	}
	else{
			alert("No item selected to send");
	}
	
        
}

//adds int days to date string
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toJSON().slice(0,10);//return date string, not js date object which is result
}


function confirmReorder(){
	for (var i = 0; i < 40; i++){
		if (checkedId[i] == 1){
			console.log(i);
			alasql('UPDATE purchaseOrder SET status = 1 , amount = ? , date = ? WHERE id = ?', [parseInt($('#amount'+i).val()), new Date().toJSON().slice(0,10), i])//all id of amount filed is amountt+id
			
			
			//should include an transaction history as this is reordered!!!!!!!!!!
			var bal = alasql("SELECT balance FROM stock WHERE id= ?",[i])[0].balance;
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, i, new Date().toJSON().slice(0,10), parseInt($('#amount'+i).val()) , bal , "Reordered" ]);
			
			//why the fuck did you not update the incoming page and system suggestion limit for thresholds befpre? who does that? your mamaa? jsut kididng. yoou do yourself
			var id = i;//beacse cod ebelow had id
			var incomingId = alasql('SELECT MAX(id) + 1 as id FROM incoming')[0].id;
			var leadDay = alasql('SELECT leadTime FROM stock WHERE id =?', [id])[0].leadTime;
			var nextDate = addDays( new Date().toJSON().slice(0,10), leadDay );
			
			//adjust reorder sytem suggestion now	
			var query = alasql('SELECT  quantAvg , quantTime , levelAvg  from reorder WHERE reorder.id = ?', [ id ] ) [0] ;
			var quant = Math.ceil( (query.quantAvg * query.quantTime + parseInt($('#amount'+i).val()) ) / (query.quantTime + 1 ) );
			var level = Math.ceil( (query.levelAvg * query.quantTime + bal ) / (query.quantTime + 1 ) );
			alasql('UPDATE reorder SET quantAvg = ? , levelAvg = ?, quantTime = ? WHERE id = ?', [quant, level, query.quantTime + 1,  id ]);
			alasql('INSERT into incoming VALUES (?,?,?,?,?) ',[incomingId, id, parseInt($('#amount'+i).val()), nextDate, 0]);//(id , stockId INT, amount INT, date DATE, status INT );');
			
		
		}
		
		
	}
	window.location.assign('main.html' ); //location.realod makes modal get loaded because modal is appeared by ahref link
	
}
var chartAr=[];
var tag;
function drawGraph(){///////graph

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
    
  
}

function showHistory(ind, kind, code){//stocid, kind,code
	//histry
	chartAr=[];
	$("#historyTitle").html(kind + " "+ "<b>"+code +"</b>"+ "  history");
	var rows = alasql('SELECT * FROM trans WHERE stock = ?  ', [ ind ]);
	rows.reverse();// fro showing eraly transsacions first
	var tbody = $('#tbody-transs');
	tbody.empty();
	
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
	
	//console.log(chartAr);
	tag = code;
	$("#chart_div").show();
	$("#history").show();
	$("#chartCaption").show();
	drawGraph();//2d array pass
	
}

$(document).ready(function () {
        $('.dropdown-toggle').dropdown();
//        var inRetailers = alasql('SELECT inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind WHERE status = 0');//load non received, so  satus =0 
//        if(inRetailers.length == 0)
//                $("#inRetailerBadge").html("");
//        else
//                $("#inRetailerBadge").html(inRetailers.length);
//			//$('html').css('overflow', 'hidden');//vetrical double bar???
//			//it fucking stays checked,i dunt know why//okay now i know why, beacuse chekced atribute ,easns checked, =fasle doesnt help
//			document.getElementById("example-select-all").checked = false; 
//		
     
});
$(document).mouseup(function (e)
{
    var container = $("#stock-table");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $("#chart_div").hide();
		$("#history").hide();
		$("#chartCaption").hide();
    }
});
