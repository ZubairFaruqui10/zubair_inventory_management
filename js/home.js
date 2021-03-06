 $("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();
var wId = alasql('SELECT id FROM whouse WHERE name = ?', [readCookie('wName')])[0].id;
var reorders = alasql('SELECT stock.id, kind.text, item.code, item.maker,  stock.balance, stock.reorderPoint, stock.reorderQuant,stock.lastPurchase \
	FROM stock \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN purchaseOrder ON purchaseOrder.id=stock.id \
	JOIN canReorder ON canReorder.id = stock.id  WHERE purchaseOrder.status = 0 \
	AND canReorder.status = 1 AND stock.balance <= stock.reorderPoint AND  whouse.id = ' + wId );
if(reorders.length == 0){//empty table 
        $("#reh4").html("No Item Under Reorder Level").addClass("placeMid");;
        $("#reorder-table").hide();
}
reorders.sort(function(a, b) {//sorting json object on (a.balance - a.reorderPoint)= remainToReoder
    return ((a.balance) - (a.reorderPoint)) - ((b.balance) - (b.reorderPoint));
});
for (var i = 0;  i <reorders.length; i++){//i < 10 &&
        var tbody = $('#tbody-reorder');
        var tr = $('<tr>').appendTo(tbody);
        tr.append('<td class="hidden">' + reorders[i].id + '</td>');
         tr.append('<td >' + reorders[i].text + '</td>');
          tr.append('<td >' + reorders[i].maker + '</td>');
           tr.append('<td >' + reorders[i].code + '</td>');
            tr.append('<td >' + reorders[i].balance + '</td>');
            var rem = reorders[i].balance - reorders[i].reorderPoint  ;
            tr.append('<td style="color: red;">' + rem + '</td>');
            tr.append('<td >' + reorders[i].reorderQuant + '</td>');
            tr.append('<td >' + reorders[i].lastPurchase + '</td>');
            tr.append('<td >' + '<button type="button" class="btn btn-default btn-danger reorderButton"  id="idAddButton" onclick="reorderStockId(' + reorders[i].id +')"; "style="padding:0px"  >Reorder</button></th>' + '</td>');
}

if(reorders.length > 8){
        var more = reorders.length - 8;
	if(more == 1) $("#reorderLeft").html(more+ " more item in"+ " <a  id='ahrefreorder'  href='main.html'>" +  "Reorder Page." + "</a>");
        else
		$("#reorderLeft").html(more+ " more items in"+ " <a  id='ahrefreorder'  href='main.html'>" +  "Reorder Page." + "</a>");
}

else if(reorders.length > 0){
        $("#reorderLeft").html("Details in " + "<a id='ahrefreorder' href='main.html'>" + "Reorder Page." + "</a>");
}

//adds int days to date string
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toJSON().slice(0,10);//return date string, not js date object which is result
}

function reorderStockId( id){
	if(confirm("Do you want to reorder this item?") === false){
		return;
	}
        console.log(id);
        var rows = alasql('SELECT   stock.balance, stock.reorderPoint, stock.reorderQuant,stock.lastPurchase \
                FROM stock  WHERE stock.id=? ', [id] )[0];
        
        alasql ('UPDATE purchaseOrder SET status = 1 , amount = ? , date = ? WHERE id = ?', [rows.reorderQuant, new Date().toJSON().slice(0,10), id])//all id of amount filed is amountt+id						
        //should include an transaction history as this is reordered!!!!!!!!!!
        var bal = alasql("SELECT balance FROM stock WHERE id= ?",[id])[0].balance;//=rows.balance
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, id, new Date().toJSON().slice(0,10), rows.reorderQuant , rows.balance , "Reordered" ]);
        
        //why the fuck did you not update the incoming page and system suggestion limit for thresholds befpre? who does that? your mamaa? jsut kididng. yoou do yourself
        //var id = i;//beacse cod ebelow had id
        var incomingId = alasql('SELECT MAX(id) + 1 as id FROM incoming')[0].id;
        var leadDay = alasql('SELECT leadTime FROM stock WHERE id =?', [id])[0].leadTime;
        var nextDate = addDays( new Date().toJSON().slice(0,10), leadDay );
        
        //adjust reorder sytem suggestion now	
        var query = alasql('SELECT  quantAvg , quantTime , levelAvg  from reorder WHERE reorder.id = ?', [ id ] ) [0] ;
        var quant = Math.ceil( (query.quantAvg * query.quantTime +  rows.reorderQuant  ) / (query.quantTime + 1 ) );
        var level = Math.ceil( (query.levelAvg * query.quantTime + bal ) / (query.quantTime + 1 ) );
        alasql('UPDATE reorder SET quantAvg = ? , levelAvg = ?, quantTime = ? WHERE id = ?', [quant, level, query.quantTime + 1,  id ]);
        alasql('INSERT into incoming VALUES (?,?,?,?,?) ',[incomingId, id,  rows.reorderQuant , nextDate, 0]);//(id , stockId INT, amount INT, date DATE, status INT );');
        location.reload();
	
}
//ougoginf jow
var outs = alasql('SELECT outgoing.id AS outgoingId, outgoing.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  outgoing.date, stock.balance  \
		  FROM outgoing JOIN stock ON stock.id=outgoing.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
		  JOIN whouse ON whouse.id=stock.whouse \
		WHERE outgoing.status = 0  AND whouse.name = ?', [readCookie('wName')]);//load non received, so  satus =0
if(outs.length == 0){//empty table 
        $("#outh4").html("No Item To Send To Retailer").addClass("placeMid");
        $("#out-table").hide();
}
outs.sort(function(a, b) {//sorting json object on (a.balance - a.reorderPoint)= remainToReoder
    return new Date(a.date).getTime() - new Date(b.date).getTime();
});
for (var i = 0;  i <outs.length && i < 8; i++){//i < 10 &&
        var tbody = $('#tbody-out');
        var tr = $('<tr>').appendTo(tbody);
        tr.append('<td class="hidden">' + outs[i].outgoingId + '</td>');
        tr.append('<td class="hidden">' + outs[i].stockId + '</td>');
        tr.append('<td >' + outs[i].text + '</td>');
        tr.append('<td >' + outs[i].maker + '</td>');
        tr.append('<td >' + outs[i].itemCode + '</td>');
        tr.append('<td >' + outs[i].balance + '</td>');
        tr.append('<td >' + outs[i].amount + '</td>');
        tr.append('<td >' + outs[i].date + '</td>');
        tr.append('<td >' + '<button type="button" class="btn btn-default btn-primary reorderButton"  id="idOutButton" onclick="outStockId(' + outs[i].outgoingId +')"; "style="padding:0px"  >Send</button></th>' + '</td>');
}
if(outs.length > 8){
        var more = outs.length - 8;
	if(more == 1) $("#outLeft").html(more+ " more item in"+ " <a  id='ahrefOuts'  href='outgoing.html'>" +  "Outgoing Page." + "</a>");
        else
		$("#outLeft").html(more+ " more items in"+ " <a  id='ahrefOuts'  href='outgoing.html'>" +  "Outgoing Page." + "</a>");
}

else if(outs.length > 0){
        $("#outLeft").html("Details in " + " <a id='ahrefOuts' href='outgoing.html'>" + "Outgoing Page." + "</a>")
}
function outStockId( i){//outId=i
	if( confirm("Do you want to send this hardware to retail shop?") === false ){			
		return;
	}
        var stockObj = alasql('SELECT stockId, amount FROM outgoing WHERE id = ?', [i] )[0] ;
	var preVal =  alasql('SELECT balance FROM stock WHERE id = ?', [stockObj.stockId] )[0].balance;
	if(preVal < stockObj.amount){//not enuf to supply, ignore and store now to show that they were missed
		if( confirm("Not enough stock to supply the amount. Do you want to take care of the supply from Outgoing Page?")){
			window.location.assign('outgoing.html' );
			return;
		}
		else return;	       
	}
       alasql('UPDATE outgoing SET status = 1 WHERE id = ?', [i]);//item received, manes syatus 1
       //make uapdte to stock and trnascation
       
      
       alasql('UPDATE stock SET balance = ? WHERE id = ?', [ preVal - stockObj.amount, stockObj.stockId ]);
       var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
       alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stockObj.stockId, new Date().toJSON().slice(0,10), stockObj.amount, preVal - stockObj.amount, "Supplied" ]);
      
       //modify last purchase and update
       
	alasql('UPDATE stock SET lastSupply = ? WHERE id = ?', [new Date().toJSON().slice(0,10), stockObj.stockId ]);
	
        window.location.reload();
}


//incmojng ow
var ins = alasql('SELECT incoming.id AS incomingId, incoming.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  incoming.date  \
		 FROM incoming JOIN stock ON stock.id=incoming.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
		 JOIN whouse ON whouse.id=stock.whouse \
		WHERE incoming.status = 0 AND whouse.name = ?', [readCookie('wName')]);//load non received, so  satus =0
if(ins.length == 0){//empty table 
        $("#inh4").html("No Item To Receive From Vendors.").addClass("placeMid");;
        $("#in-table").hide();
}
ins.sort(function(a, b) {//sorting json object on (a.balance - a.reorderPoint)= remainToReoder
    return new Date(a.date).getTime() - new Date(b.date).getTime();
});
for (var i = 0;  i <ins.length && i < 8; i++){//i < 10 &&
        var tbody = $('#tbody-in');
        var tr = $('<tr>').appendTo(tbody);
        tr.append('<td class="hidden">' + ins[i].incomingId + '</td>');
        tr.append('<td class="hidden">' + ins[i].stockId + '</td>');
        tr.append('<td >' + ins[i].text + '</td>');
        tr.append('<td >' + ins[i].maker + '</td>');
        tr.append('<td >' + ins[i].itemCode + '</td>');
        tr.append('<td >' + ins[i].amount + '</td>');
	tr.append('<td >' + ins[i].date + '</td>');
        tr.append('<td >' + '<button type="button" class="btn btn-default btn-success reorderButton"  id="idOutButton" onclick="inStockId(' + ins[i].incomingId +')"; "style="padding:0px"  >Receive</button></th>' + '</td>');
}
if(ins.length > 8){
        var more = ins.length - 8;
	if (more == 1){$("#inLeft").html(more+ " more item in"+ " <a  id='ahrefIns'  href='incoming.html'>" +  "Incoming Page." + "</a>");}
	else
		$("#inLeft").html(more+ " more items in"+ " <a  id='ahrefIns'  href='incoming.html'>" +  "Incoming Page." + "</a>");
}

else if(ins.length > 0){
        $("#inLeft").html("Details in " + " <a id='ahrefIns' href='incoming.html'>" + "Incoming Page." + "</a>");
}

function inStockId( i){//i = inId
	console.log("recieving" + i);
	if(confirm("Have you received this item?") == false){
		return;
	}
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
	
	location.reload();
        
}
					
var trans = alasql('SELECT * FROM trans JOIN  stock ON trans.stock=stock.id JOIN whouse ON whouse.id = stock.whouse AND whouse.id = ?',[wId]);
trans.reverse();// fro showing eraly transsacions first
for (var i = 0; i < 8 ; i++) {//histry
        var tbody = $('#tbody-tran');
	row =trans[i];
        var codeObj =  alasql('SELECT item.code FROM item  JOIN stock On item.id=stock.item JOIN  trans ON trans.stock=stock.id  \
			   JOIN whouse ON whouse.id = stock.whouse   AND whouse.id = ? AND trans.id=?',[wId, trans[i].id ]);//[0].code;
	if(codeObj.length <= 0) continue;
	else code = codeObj[0].code;
	/*if(row.memo=="Purchased") tr = $('<tr style="color: green;">').appendTo(tbody);
	else if(row.memo=="Warehouse Defect" || row.memo=="Retailer Defect") tr = $('<tr style="color: red;">').appendTo(tbody);
	else if(row.memo=="Supplied") tr = $('<tr style="color: blue;">').appendTo(tbody);//#FFA500
	else if(row.memo=="Reordered") tr = $('<tr style="color: #FF00AE;">').appendTo(tbody);
	else*/
	tr = $('<tr >').appendTo(tbody);
	
        tr.append('<td class="hidden">' + trans[i].id + '</td>');
        tr.append('<td class="hidden">' + trans[i].stock + '</td>');
        tr.append('<td>' + code + '</td>');
	tr.append('<td>' + row.qty + '</td>');
	tr.append('<td>' + row.balance + '</td>');
        tr.append('<td>' + row.date + '</td>');
	
	if(row.memo=="Purchased") tr.append('<td style="color: green;">' + row.memo + '</td>');
	else if(row.memo.indexOf("defect") !== -1) tr.append('<td style="color: red;">' + row.memo + '</td>');
	else if(row.memo.indexOf("Repaired") !== -1) tr.append('<td style="color: #80B31A;">' + row.memo + '</td>'); 
	else if(row.memo=="Supplied") tr.append('<td style="color: blue;">' + row.memo + '</td>');
	else if(row.memo=="Reordered") tr.append('<td style="color: FF00AE;">' + row.memo + '</td>');
	else tr.append('<td >' + row.memo + '</td>');
}
if(trans.length == 0){//empty table 
        $("#tranh4").html("No Recent History To Show For This Warehouse.").addClass("placeMid");;
        $("#tran-table").hide();
}

$(document).ready(function(){
	console.log("Ever hrere?");
    //$(this).scrollTop(100);//on load show tabls 100 pixels down in y
});