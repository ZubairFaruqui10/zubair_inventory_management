var cookieVar = readCookie('wName') ;
if (!cookieVar) {
	alert("Please Login! ");
	window.open('index.html',"_self");
}
function logoutCookie(){
	eraseCookie('wName');
	window.open('index.html',"_self");
}
//define
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
//plcaed it without documnet.ready, then it is ecxecuted isnatanlt, actually whene ver the js file is encountered serially, other wise, after loading all thses, then label changes
//adding badge label to two notification that ARE assuemd to be triggered from other client
var fileName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
if (!(fileName==="inRetailer.html" || fileName==="inMain.html" || fileName==="outRetailer.html" || fileName==="outMaintenance.html" || fileName==="newDamage.html"  ))
	$('#damageTag').parent().children('ul').hide();//for these file keep the submenu shown, for toher pages hide thissubmenu
	
if (!(fileName==="outTransfer.html" || fileName==="inTransfer.html"  ))
	$('#transferTag').parent().children('ul').hide();
	
if (!(fileName==="newClassification.html" || fileName==="newItem.html"  || fileName==="newMaker.html"))
	$('#addTag').parent().children('ul').hide();


var inRetailers = alasql('SELECT inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  \
						 FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
						 JOIN whouse ON whouse.id=stock.whouse \
						 WHERE status = 0 AND whouse.name = ?', [cookieVar]);//load non received, so  satus =0 
if(inRetailers.length == 0)
		$("#inRetailerBadge").html("");
else
		$("#inRetailerBadge").html(inRetailers.length);
		
var outBadge  = alasql('SELECT outgoing.id AS outgoingId, outgoing.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  outgoing.date  \
					   FROM outgoing JOIN stock ON stock.id=outgoing.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
					   JOIN whouse ON whouse.id=stock.whouse \
					   WHERE outgoing.status = 0 AND whouse.name = ?', [cookieVar]);//load non received, so  satus =0 
if( outBadge.length == 0 )
		$("#outgoingBadge").html("");
else
		$("#outgoingBadge").html(outBadge.length);
		
var incomingBadge = alasql('SELECT incoming.id AS incomingId, incoming.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  incoming.date  FROM incoming JOIN stock ON stock.id=incoming.stockId \
						   JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
						   JOIN whouse ON whouse.id=stock.whouse \
						   WHERE incoming.status = 0 AND whouse.name = ?', [cookieVar]);//load non received, so  satus =0       
if( incomingBadge.length == 0 )
		$("#incomingBadge").html("");
else
		$("#incomingBadge").html(incomingBadge.length);

var inMainBadge = alasql('SELECT * FROM inMain JOIN stock on stock.id=inMain.stockId JOIN whouse ON whouse.id=stock.whouse \
						 WHERE status = 0 AND whouse.name = ?', [cookieVar]);
console.log("inmian"+inMainBadge.length);
if( inMainBadge.length == 0 )
		$("#inMainBadge").html("");
else
		$("#inMainBadge").html(inMainBadge.length);

var outMainRet = alasql('SELECT outMaintenance.id AS outMaintenanceId, inretailer.id AS inretailerID, item.code AS itemCode , stock.id AS stockId , item.code, item.maker, kind.text, outMaintenance.date,  \
                    inretailer.saleId, inretailer.productId, inretailer.reason, inretailer.date  FROM inretailer JOIN stock ON stock.id=inretailer.stockId JOIN item ON \
                    item.id=stock.item JOIN kind ON kind.id=item.kind JOIN outMaintenance ON outMaintenance.inRetailerId=inretailer.id \
                    JOIN whouse ON whouse.id=stock.whouse \
                    WHERE outMaintenance.type=0 AND outMaintenance.status=0 AND whouse.name = ?', [cookieVar]);

var outMainWHouse =  alasql('SELECT outMaintenance.id AS outMaintenanceId,  item.code AS itemCode , stock.id AS stockId ,  item.maker, kind.text, \
                     outMaintenance.productId, outMaintenance.reason, outMaintenance.date  FROM outMaintenance JOIN stock ON stock.id=outMaintenance.stockId JOIN item ON \
                    item.id=stock.item JOIN kind ON kind.id=item.kind  \
                    JOIN whouse ON whouse.id=stock.whouse \
                    WHERE outMaintenance.type=1 AND outMaintenance.status=0 AND whouse.name = ?', [cookieVar]);

var outMainBadgeLength = outMainRet.length +  outMainWHouse.length;

if( outMainBadgeLength == 0 )
		$("#outMainBadge").html("");
else
		$("#outMainBadge").html(outMainBadgeLength);
		
		
var outRetailerBadge = alasql('SELECT *  FROM outRetailer   JOIN stock on stock.id=outRetailer.stockId  JOIN whouse ON whouse.id=stock.whouse \
							  WHERE status = 0  AND whouse.name = ?', [cookieVar]);
if( outRetailerBadge.length == 0 )
		$("#outRetailerBadge").html("");
else
		$("#outRetailerBadge").html(outRetailerBadge.length);

var reorderBadge = alasql('SELECT * FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN purchaseOrder ON purchaseOrder.id=stock.id \
	JOIN canReorder ON canReorder.id = stock.id 	\
	 JOIN whouse ON whouse.id=stock.whouse \
	 WHERE purchaseOrder.status = 0 	AND canReorder.status = 1 AND \
	stock.balance <= stock.reorderPoint AND whouse.name = ?  ', [cookieVar ]);
if( reorderBadge.length == 0 )
		$("#reorderBadge").html("");
else
		$("#reorderBadge").html(reorderBadge.length);

var wId = alasql('SELECT id FROM whouse WHERE name = ?', [cookieVar])[0].id;
var inTransferBadge = alasql('SELECT transfer.id AS itransferId, transfer.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  transfer.toDate, whouse.name, \
                    transfer.fromDate, transfer.fromId FROM transfer JOIN stock ON stock.id=transfer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
                    JOIN whouse ON whouse.id=transfer.fromId \
                    WHERE transfer.status = 1 AND transfer.toId = ?', [ wId ]  );
if( inTransferBadge.length == 0 )
		$("#inTransferBadge").html("");
else
		$("#inTransferBadge").html(inTransferBadge.length);


var outTransferBadge = alasql('SELECT transfer.id AS itransferId, transfer.amount,  stock.id AS stockId , item.code AS itemCode, item.maker, kind.text,  transfer.toDate, whouse.name, \
                    transfer.fromDate, transfer.fromId FROM transfer JOIN stock ON stock.id=transfer.stockId JOIN item ON item.id=stock.item JOIN kind ON kind.id=item.kind \
                    JOIN whouse ON whouse.id=transfer.toId \
                    WHERE transfer.status = 0  AND transfer.fromId = ?', [ wId ]  );//FROMID=//stsus 2 maens recevd by w1, 0 measn sent noti from w1, 1 means sent by w2 

if( outTransferBadge.length == 0 )
		$("#outTransferBadge").html("");
else
		$("#outTransferBadge").html(outTransferBadge.length);


var distAr = [
	[0, 2, 3, 4],
	[2, 0, 3, 4],
	[3, 3, 0, 4],
	[4, 4, 4, 0]
];



$('#transferTag').click( function(){
	$(this).parent().children('ul').toggle();
});
$('#addTag').click( function(){
	$(this).parent().children('ul').toggle();
});
$('#damageTag').click( function(){
	$(this).parent().children('ul').toggle();
});


//$('li:eq(5) ').click( function(){
//	$(this).children('ul').toggle();
//});
//$('li:eq(9)').click( function(){
//	$(this).children('ul').toggle();
//});
//$('li:eq(15)').click( function(){
//	$(this).children('ul').toggle();
//});

if( outTransferBadge.length +  inTransferBadge.length == 0 )
	$("#totalTransferBadge").html("");
else $("#totalTransferBadge").html( outTransferBadge.length +  inTransferBadge.length );


if( outRetailerBadge.length + inMainBadge.length + outMainBadgeLength + inRetailers.length   == 0 )
	$("#totalDamageBadge").html("");
else $("#totalDamageBadge").html( outRetailerBadge.length + inMainBadge.length + outMainBadgeLength + inRetailers.length );