
$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
    
    $('#damageTag').children('ul').show();//SHOW SUBMENU UNDER IT, COOCKELOGIN HIES THEM BY DEFAULT
    
    
  //gloab filter for all dataTbale 
function fiveDayLater(days) {//days plus current date
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result.toJSON().slice(0,10);//return date string, not js date object which is result
}
var checkedId = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
// build sql
var stocks = alasql('SELECT outMaintenance.id AS outMaintenanceId, inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, outMaintenance.date,  \
                    inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON \
                    item.id=stock.item JOIN kind ON kind.id=item.kind JOIN outMaintenance ON outMaintenance.inRetailerId=inretailer.id \
                    JOIN whouse ON whouse.id=stock.whouse \
                    WHERE outMaintenance.type=0 AND outMaintenance.status=0 AND whouse.name = ?', [readCookie('wName')]);//load non received, so  satus =0 
function sendDamage(){
        var cnt  = 0;
        for (var i = 0; i < 38; i++){
                if (checkedId[i] == 1)
                {
                        cnt++;
                        //alasql('UPDATE outMaintenance SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
                        //var outMainId = alasql('SELECT MAX(id) + 1 as id FROM outMaintenance')[0].id;
                        //alasql('INSERT INTO outMaintenance VALUES (?,?,?,?,?,?,?,?)', [outMainId, 0, i, 0, 0, "fromRetailer", 0, "2000-01-01"]);// id , type , inRetailerId , stockId , productId , reason ,  status , date ) )')[0].id;                                                
                }
        }
        if (cnt > 0){
                if(confirm("Do you want to send "+ cnt + " number of defected hardware to Maintenance department?") ){
                        for (var i = 0; i < 38; i++)
                         {       if (checkedId[i] == 1)
                                {
                checkedId[i] = 0;//reset
                alasql('UPDATE outMaintenance SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
                var outObj =alasql('SELECT outMaintenance.id AS outMaintenanceId, outMaintenance.type, inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, stock.balance, \
                    inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON \
                    item.id=stock.item JOIN kind ON kind.id=item.kind JOIN outMaintenance ON outMaintenance.inRetailerId=inretailer.id \
                    WHERE   outMaintenance.id=?', [i] )[0];//will have ntry if it is from retailer
                console.log(outObj);
                if(outObj && outObj.type == 0){//if it was meant for retialer, then add to retial type n inMain
                        console.log(outObj.itemCode + "ret");
                        var inMainId = alasql('SELECT MAX(id) + 1 as id FROM inMain')[0].id;//inset to outret now
                        alasql('INSERT INTO inMain VALUES (?,?,?,?,?,?,?,?,?,?,?)', [inMainId, i, outObj.stockId, outObj.text, outObj.itemCode, outObj.maker,outObj.productId,  new Date().toJSON().slice(0,10), fiveDayLater(5) , 0, 0]);// id , type , inRetailerId , stockId , productId , reason ,  status , date ) )')[0].id;
                        //now record in hirstry that u sent to maintenance and it was from retailer
                         var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, outObj.stockId, new Date().toJSON().slice(0,10), 1, outObj.balance , "Retailer defect sent to maintenance" ]);//Warehouse Defect== importnant tag
                }
                
                //now cahnge outObj to see if it from this whouse only
                outObj = alasql('SELECT outMaintenance.id AS outMaintenanceId, outMaintenance.type,  item.code AS itemCode , stock.id AS stockId ,  item.maker, kind.text, stock.balance, \
                     outMaintenance.productId, outMaintenance.reason, outMaintenance.date  FROM outMaintenance JOIN stock ON stock.id=outMaintenance.stockId JOIN item ON \
                    item.id=stock.item JOIN kind ON kind.id=item.kind  \
                    WHERE outMaintenance.type=1  AND outMaintenance.id=?', [i] )[0];
                console.log(outObj);
                 if(outObj && outObj.type == 1){//if it was meant for whouse, then add to retial type n inMain
                        console.log(outObj.itemCode + "whuse");
                        var inMainId = alasql('SELECT MAX(id) + 1 as id FROM inMain')[0].id;//inset to outret now
                        alasql('INSERT INTO inMain VALUES (?,?,?,?,?,?,?,?,?,?,?)', [inMainId, i, outObj.stockId, outObj.text, outObj.itemCode, outObj.maker,outObj.productId,  new Date().toJSON().slice(0,10), fiveDayLater(5) , 0, 1]);// id , type , inRetailerId , stockId , productId , reason ,  status , date ) )')[0].id;
                        //now record in hirstry that u sent to maintenance and it was found in warehouse
                         var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, outObj.stockId, new Date().toJSON().slice(0,10), 1, outObj.balance , "Warehouse defect sent to maintenance" ]);//Warehouse Defect== importnant tag
                
                }
                //var outMainId = alasql('SELECT MAX(id) + 1 as id FROM outMaintenance')[0].id;
                //alasql('INSERT INTO outMaintenance VALUES (?,?,?,?,?,?,?,?)', [outMainId, 0, i, 0, 0, "fromRetailer", 0, "2000-01-01"]);// id , type , inRetailerId , stockId , productId , reason ,  status , date ) )')[0].id;                                                
                                }
                         }
                        
                      window.location.assign('outMaintenance.html' );  
                }
                else{
                        return;
                }
                
                
        }
        else{
                alert("No item selected to receive");
                return;
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
	tmp.push(stock.outMaintenanceId);	
		
	tmp.push(stock.text);	//kind name
	
	tmp.push(stock.maker);    //item.maker
        tmp.push(stock.itemCode);   //item code
        tmp.push(stock.productId);
        tmp.push(stock.date);
        tmp.push(stock.reason);
	
        
	last.push(tmp);
	//console.log(last);
					
}
var dTableParaAr = {
        //"bFilter": false,
        data: last,
		//"dom": '<"top"f>rt<"bottom"ilpB><"clear">',
		dom: 'rt',//'rtlipBf',
        buttons: [
            //'colvis',
//			{ text: 'Send items from retailer',
//                action: function ( e, dt, node, config ) {
//                    sendDamage();
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
            

            
        //	 ,{
        //		"targets": -1,
        //		"data": null,
        //		"defaultContent": '<input type="checkbox" name="vehicle" value="Car" >'//"<button>Click!</button>"
        //        }
                    
                ,{
                        'targets': 0,
                        'searchable':false,
                        'orderable':false,
                        'className': 'dt-body-center',
                        'render': function (data, type, full, meta){
                            return '<input type="checkbox" name="id[]" value="' + $('<div/>').text(data).html() + '">';
                        }
                        
                }
                ,{"className": "dt-center", "targets": "_all"}//added later to center text
		
	]
        ,"language": {
                "emptyTable": "You have no outgoing damaged product from retailers."
              }
              ,"order": [[ 6, "asc" ]]//date
 
        
};



table = $('#outMain-table').DataTable(dTableParaAr );

 $('#outMain-table tbody').on( 'click', 'input', function () {//checkbox event
        var data = table.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        //alert( data[0] +"'s salary is: "+ data[ 1 ] );
        if (checkedId[ parseInt(data[1]) ] === 0 )
                checkedId[ parseInt(data[1]) ] = 1;
        else
                checkedId[ parseInt(data[1]) ] = 0;
    } );
 
  $('#outMain-table2 tbody').on( 'click', 'input', function () {//checkbox event
        var data = table2.row( $(this).parents('tr') ).data();
		//$('#myModal').modal('show');
        //alert( data[0] +"'s salary2 is: "+ data[ 1 ] );
        if (checkedId[ parseInt(data[1]) ] === 0 )
                checkedId[ parseInt(data[1]) ] = 1;
        else
                checkedId[ parseInt(data[1]) ] = 0;
    } );
 
 


var stocks2 = alasql('SELECT outMaintenance.id AS outMaintenanceId,  item.code AS itemCode , stock.id AS stockId ,  item.maker, kind.text, \
                     outMaintenance.productId, outMaintenance.reason, outMaintenance.date  FROM outMaintenance JOIN stock ON stock.id=outMaintenance.stockId JOIN item ON \
                    item.id=stock.item JOIN kind ON kind.id=item.kind  \
                    JOIN whouse ON whouse.id=stock.whouse \
                    WHERE outMaintenance.type=1 AND outMaintenance.status=0 AND whouse.name = ?', [readCookie('wName')]);//load non received, so  satus =0 , type = 1 measn in this warehosue the product got damaaged
last=[];//empty it
for (var i = 0; i < stocks2.length; i++) {
	var stock = stocks2[i];
	tmp=[];
	//var tr = $('<tr dataa-href="stock.html?id=' + stock.id + '"></tr>');
        tmp.push(0); //for check box, dunno what to give so dumyy 0
	tmp.push(stock.outMaintenanceId);	
		
	tmp.push(stock.text);	//kind name
	
	tmp.push(stock.maker);    //item.maker
        tmp.push(stock.itemCode);   //item code
        tmp.push(stock.productId);
        tmp.push(stock.date);
        tmp.push(stock.reason);
	
        
	last.push(tmp);
	//console.log(last);
					
}
var dTableParaAr2 = {
        //"bFilter": false,
        data: last,
		//"dom": '<"top"f>rt<"bottom"ilpB><"clear">',
		dom: 'rt',//'rtlipBf',
        buttons: [
            //'colvis',
//			{ text: 'Send items from warehouse',
//                action: function ( e, dt, node, config ) {
//                    sendDamage();
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
            
         
//                ,{
//                       "targets": -1,
//                       "data": null,
//                       'className': 'dt-body-center',
//                       "defaultContent": '<input type="checkbox" name="vehicle" value="Car" >'//"<button>Click!</button>"
//		}
                ,{
                        'targets': 0,
                        'searchable':false,
                        'orderable':false,
                        'className': 'dt-body-center',
                        'render': function (data, type, full, meta){
                            return '<input type="checkbox" name="id[]" value="' + $('<div/>').text(data).html() + '">';
                        }
                        
                }
                ,{"className": "dt-center", "targets": "_all"}//added later to center text
		
		]
                ,"language": {
                "emptyTable": "You have no outgoing damaged product from this warehouse."
              }
              ,"order": [[ 6, "asc" ]]
      
};


table2 = $('#outMain-table2').DataTable(dTableParaAr2 );

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
  // Handle click on "Select all" control on table2 
   $('#example-select-all2').on('click', function(){
      // Check/uncheck all checkboxes in the table
      var rows = table2.rows({ 'search': 'applied' }).nodes();
      $('input[type="checkbox"]', rows).prop('checked', this.checked);
      
      var dataObjAr = table2.rows({ 'search': 'applied' }).data();//all the rows' data as array of object 
      
      //for( var i =0; i < dataObjAr.length; i++){
      //  if (checkedId[ parseInt(dataObjAr[i][0]) ] === 0 )//dataObjAr[i][0] is outMain id=first hidden colun value of each row in table 2
      //          checkedId[ parseInt(dataObjAr[i][0]) ] = 1;
      //  else
      //          checkedId[ parseInt(dataObjAr[i][0]) ] = 0;
      //}
      if ($('input[type="checkbox"]', rows).prop('checked')){//if now main hheader checkbox  is selcted, make everytinhg 1
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
   
//global filter for all dataTbale 
//having one search box for multiple search in two tables simlutaneously
 $("#Search_All").keyup(function () {//#Search_All is a simple input type text
                  
                   table.search( this.value ).draw();
                   table2.search( this.value ).draw();
});
 
 
$(document).ready(function () {
        $('.dropdown-toggle').dropdown();
        //var inRetailers = alasql('SELECT inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind WHERE status = 0');//load non received, so  satus =0 
        //if(inRetailers.length == 0)
        //        $("#inRetailerBadge").html("");
        //else
        //        $("#inRetailerBadge").html(inRetailers.length);
      
      
});
document.onkeydown=function(){
    if(window.event.keyCode=='13'){
		//alert(5);
        filter();
    }
}
//$(".dataTables_filter").css({ "background" :"blue" });//finalyy done wiht fixed css