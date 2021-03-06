
$("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
  //gloab filter for all dataTbale
  
$('#damageTag').children('ul').show();//SHOW SUBMENU UNDER IT, COOCKELOGIN HIES THEM BY DEFAULT

var retailerPageLoad = 0;//usualyy just finish with reolading this page
var checkedId = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
// build sql
var stocks = alasql('SELECT inMain.id ,  inMain.code  , inMain.itemtype, inMain.maker, inMain.productId, inMain.receiveDate, inMain.sendDate FROM inMain  JOIN stock on stock.id=inMain.stockId  \
                    JOIN whouse ON whouse.id=stock.whouse \
                    WHERE status = 0 AND type = 0  AND whouse.name = ?',[readCookie('wName')]);//staus 0 means not recd, and type 0 means for retiaer
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
                if(confirm("Have you received "+ cnt + " number of repaired hardware from Maintenance department?") ){
                        for (var i = 0; i < 38; i++)
                         {       if (checkedId[i] == 1)
                                {
                                        checkedId[i] = 0;//reset
                                        var inObj = alasql('SELECT * FROM inMain WHERE id = ?', [i] )[0] ;
                                        alasql('UPDATE inMain SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
                                        if(inObj.type == 0){//if it was meant for retialer, then add to trasn,add to outret, but count is same in stock
                                                retailerPageLoad = 1;//it measn promp user to go to retailer page after finish
                                                var outRetId = alasql('SELECT MAX(id) + 1 as id FROM outRetailer')[0].id;//inset to outret now
                                                alasql('INSERT INTO outRetailer VALUES (?,?,?,?,?,?,?,?,?)', [outRetId, i, inObj.stockId, inObj.itemtype, inObj.code, inObj.maker,inObj.productId,  new Date().toJSON().slice(0,10), 0]);// id , type , inRetailerId , stockId , productId , reason ,  status , date ) )')[0].id;
                                                //hstry
                                                var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [inObj.stockId] )[0].balance;
                                                var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                                                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, inObj.stockId, new Date().toJSON().slice(0,10), 1, preVal , "Repaired received for retailer" ]);
                                        }
                                        else{//it is for whouse, so count++ and updat trans hstry
                                                console.log("whouse");
                                                var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [inObj.stockId] )[0].balance;
                                                //now increase item count as it decreased before
                                                alasql('UPDATE stock SET balance = ? WHERE id = ?', [preVal + 1, inObj.stockId] );
                                                var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                                                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, inObj.stockId, new Date().toJSON().slice(0,10), 1, preVal + 1 , "Repaired received for warehouse" ]);
                                        //another trasn is added when item is semt for retialer after rpair
                                        }
                                }    
                         }
                         if(retailerPageLoad == 1){
                                if (confirm("Items successfully updated as received. Do you want to visit page for sending repaired items to retailer?"))
                                {
                                        window.location.assign('outRetailer.html' );//go to send to retailer page
                                }
                                else window.location.assign('inMain.html' ); //reload
                                
                         }
                         else
                                window.location.assign('inMain.html' );  
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
	tmp.push(stock.id);	
		
	tmp.push(stock.itemtype);	//kind name
	
	tmp.push(stock.maker);    //item.maker
        tmp.push(stock.code);   //item code
        tmp.push(stock.productId);
        //tmp.push("from retailer");
        //tmp.push(stock.reason);
        tmp.push(stock.sendDate);
	tmp.push(stock.receiveDate);
        
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
                "emptyTable": "You have no incoming repaired item for retailers."
              }
        ,"order": [[ 7, "asc" ]]
 
        
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
 
 


var stocks2 = alasql('SELECT inMain.id , inMain.code , inMain.itemtype, inMain.maker, inMain.productId, inMain.receiveDate, inMain.sendDate FROM inMain JOIN stock ON inMain.stockId=stock.id \
        JOIN whouse ON whouse.id=stock.whouse \
        WHERE status = 0 AND type = 1  AND whouse.name = ?', [readCookie('wName')]);
last=[];//empty it
for (var i = 0; i < stocks2.length; i++) {
	var stock = stocks2[i];
	tmp=[];
	//var tr = $('<tr dataa-href="stock.html?id=' + stock.id + '"></tr>');
        tmp.push(0); //for check box, dunno what to give so dumyy 0
	tmp.push(stock.id);	
		
	tmp.push(stock.itemtype);	//kind name
	
	tmp.push(stock.maker);    //item.maker
        tmp.push(stock.code);   //item code
        tmp.push(stock.productId);
        //tmp.push("from retailer");
        //tmp.push(stock.reason);
        tmp.push(stock.sendDate);
	tmp.push(stock.receiveDate);
        
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
                "emptyTable": "You have no incoming repaired product from this warehouse."
              }
              ,"order": [[ 7, "asc" ]]//receve date
      
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
        
      
      
});
document.onkeydown=function(){
    if(window.event.keyCode=='13'){
		//alert(5);
        
    }
}
//$(".dataTables_filter").css({ "background" :"blue" });//finalyy done wiht fixed css