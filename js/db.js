var DB = {};

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// Classes
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// Items
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item( id INT IDENTITY, code STRING, kind INT, detail STRING, maker STRING, price INT, unit STRING, length INT, width INT, height INT, weight INT); ');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?,?,?,?,?);', item);//11 attributes
		}
	});

	// Warehouses
	alasql('DROP TABLE IF EXISTS whouse;');
	alasql('CREATE TABLE whouse(id INT IDENTITY, name STRING, addr STRING, tel STRING, adminName STRING);');
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSE-WHOUSE.csv", {headers: true})').then(
			function(whouses) {
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?,?);', whouse);//5 attirbutes
				}
			});

	// Inventories
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, whouse INT, balance INT, leadTime INT, reorderPoint INT, reorderQuant INT, lastPurchase DATE, lastSupply DATE);');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCK-STOCK.csv", {headers: true})').then(
			function(stocks) {
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?,?,?);', stock);//9 atrri
				}
			});

	// Transaction
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT, date DATE, qty INT, balance INT, memo STRING);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANS-TRANS.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?);', trans);
				}
			});
	
	//incoming damanegd proeduc from rateiler
	console.log('INRET START');
	alasql('DROP TABLE IF EXISTS inretailer;');
	alasql('CREATE TABLE inretailer(id INT IDENTITY, stockId INT, productId STRING, saleId INT, reason STRING, date DATE, status INT );');
	
	console.log('INRET CREATE');
	var pvinrets = alasql.promise('SELECT MATRIX * FROM CSV("data/INRET-INRET.csv", {headers: true})').then(
			function(vinrets) {
				console.log(vinrets);
				for (var i = 0; i < vinrets.length; i++) {
					var vinret = vinrets[i];
					alasql('INSERT INTO inretailer VALUES(?,?,?,?,?,?,?);', vinret);
					console.log('vinret1');
				}
			});
	console.log('INRET CREATE OPR COMPLETED');
	
	//ougoing damanegd proeduc to maintneace
	console.log('ouMAin START');
	alasql('DROP TABLE IF EXISTS outMaintenance;');
	alasql('CREATE TABLE outMaintenance(id INT IDENTITY, type INT, inRetailerId INT, stockId INT, productId STRING, reason STRING,  status INT, date DATE );');
	//type maens 0->from inRteailer, 1 means defected here; inRetailerId active with type 0; else we neesd stockId, productId, status 0 measn stillhere, 1 means it is sent
	//date is enabled when statsu 0,menas it is sent and when sent
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [1, 1, 0 ,1, "ICX412", "broken" ,0 , "2016-09-22"] );
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [2, 1, 0 ,3, "QW125", "broken" ,0 , "2016-09-21"] );
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [3, 1, 0 ,4, "ZX230", "broken" ,0 , "2016-09-20"] );
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [4, 1, 0 ,6, "ZX503", "broken" ,0 , "2016-09-19"] );
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [5, 1, 0 ,5, "VC503", "broken" ,0 , "2016-09-22"] );
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [6, 1, 0 ,7, "NDC2010", "broken" ,0 , "2016-09-18"] );
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [7, 0, 10 ,14, "DMC5303", "broken" ,0 , "2016-09-22"] );//carfuuly took twovalues from INRET csv files that were marked as sent
		alasql('INSERT INTO outMaintenance VALUES(?,?,?,?,?,?,?,?);', [8, 0, 11 ,9, "IUPC2010", "broken" ,0 , "2016-09-18"] );
				
			
	console.log('ouMAin COMPLETED');
	
	alasql('DROP TABLE IF EXISTS incoming;');
	alasql('CREATE TABLE incoming(id INT IDENTITY, stockId INT, amount INT, date DATE, status INT );');//0 menas not recived, 1 menas taken care of
	//type maens 0->from inRteailer, 1 means defected here; inRetailerId active with type 0; else we neesd stockId, productId, status 0 measn stillhere, 1 means it is sent
	//date is enabled when statsu 0,menas it is sent and when sent
		alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [1, 1, 20 ,  "2016-09-20", 0] );
		alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [2, 2, 30 , "2016-09-20", 0] );
		alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [3, 3, 50 , "2016-09-22", 0] );
		alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [4, 4, 50 , "2016-09-22", 0] );
		alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [5, 5, 60 , "2016-09-19", 0] );
		alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [6, 6, 40 , "2016-09-19", 0] );
		//alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [7, 7, 20 ,  "2016-09-18", 0] );
		//alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [8, 8, 30 , "2016-09-18", 0] );
		//alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [9, 9, 40 , "2016-09-19", 0] );
		//alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [10, 10, 50 , "2016-09-21", 0] );
		//alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [11, 11, 60 , "2016-09-18", 0] );
		
		//alasql('INSERT INTO incoming VALUES(?,?,?,?,?);', [12, 12, 40 , "2016-09-22", 0] );
		
	alasql('DROP TABLE IF EXISTS outgoing;');
	alasql('CREATE TABLE outgoing(id INT IDENTITY, stockId INT, amount INT, date DATE, status INT );');
	//type maens 0->from inRteailer, 1 means defected here; inRetailerId active with type 0; else we neesd stockId, productId, status 0 measn stillhere, 1 means it is sent
	//date is enabled when statsu 0,menas it is sent and when sent
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [1, 1, 50 ,  "2016-09-20", 0] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [2, 2, 50 , "2016-09-19", 0] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [3, 3, 70 , "2016-09-19", 0] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [4, 4, 12 , "2016-09-19", 0 ] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [5, 5, 15 , "2016-09-18", 0] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [6, 6, 10 , "2016-09-18", 0] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [7, 7, 8 ,  "2016-09-20", 0] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [8, 8, 12 , "2016-09-20" , 0]);
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [9, 9, 15 , "2016-09-20" , 0]);
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [10, 10, 8 , "2016-09-20" , 0]);
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [11, 11, 10 , "2016-09-20", 0] );
		alasql('INSERT INTO outgoing VALUES(?,?,?,?,?);', [12, 12, 5 , "2016-09-19" , 0]);
		
	//bad pratise, witout making new entrybelow for each new stock entry, I am just making hundred hardcoded entry for stokcs assuming they are shown for reorder unless changed by user(when item is outdated)
	alasql('DROP TABLE IF EXISTS canReorder;');
	alasql('CREATE TABLE canReorder(id INT IDENTITY, status INT );');//0 measn no, 1 meas can
	for (var i = 0; i < 100; i++) {
		alasql('INSERT INTO canReorder VALUES(?,?);', [i, 1] );//100 yes reorder entry
	}
	
	
	alasql('DROP TABLE IF EXISTS purchaseOrder;');
	alasql('CREATE TABLE purchaseOrder(id INT IDENTITY, status INT , amount INT,  date DATE);');//0 measn not plced or receved,, 1 meas expecting to be delivered
	for (var i = 0; i < 7; i++) {
		alasql('INSERT INTO purchaseOrder VALUES(?,?,?,?);', [i, 1, 0, "2016-09-16" ] );//first hunderd are taken to have been rerodered/dummy date,it is becase of incoming dataBase
	}
	for (var i = 7; i <100; i++) {
		alasql('INSERT INTO purchaseOrder VALUES(?,?,?,?);', [i, 0, 0, "2016-09-16" ] );//next are not reordred,dummy date
	}
		
	//incoimg repaired item form manintenance
	alasql('DROP TABLE IF EXISTS inMain;');
	alasql('CREATE TABLE inMain(id INT IDENTITY, outMainId INT, stockId INT, itemtype STRING, code STRING, maker STRING, productId STRING, sendDate DATE, receiveDate DATE, status INT, type INT );');//statsu o measn not not received, 1 means recied, type 0 means it came from retialer, 1 mean it belongs to whouse only
		alasql('INSERT INTO inMain VALUES  (?,?,?,?,?,?,?,?,?,?,?);', [1, 7, 1,  "CPU","CPU01", "Intel", "ZAS036", "2016-09-16", "2016-09-21", 0, 0] );//fake,no trace of this item coming from retialer, but now assume it is for returnng to retialer 
		alasql('INSERT INTO inMain VALUES (?,?,?,?,?,?,?,?,?,?,?);', [2, 8, 2, "CPU", "CPU02", "Intel", "ZAS038", "2016-09-16", "2016-09-21", 0, 1] );
		alasql('INSERT INTO inMain VALUES (?,?,?,?,?,?,?,?,?,?,?);', [3, 8, 3, "CPU", "CPU03", "Intel", "BWD038", "2016-09-16", "2016-09-21", 1, 0] );
		
		
	//outgoing repaired item to retialer form manintenance
	alasql('DROP TABLE IF EXISTS outRetailer;');
	alasql('CREATE TABLE outRetailer(id INT IDENTITY, inMain INT, stockId INT, itemtype STRING, code STRING, maker STRING, productId STRING,  receiveDate DATE, status INT );');//statsu o measn not not received, 1 means recied,
	//insert at least one dummy to find max id
	alasql('INSERT INTO outRetailer VALUES  (?,?,?,?,?,?,?,?,?);', [1, 3, 3,  "CPU","CPU03", "Intel", "BWD038",  "2016-09-21", 0] );
	
	
	//transfer
	alasql('DROP TABLE IF EXISTS transfer;');
	alasql('CREATE TABLE transfer(id INT IDENTITY, fromId INT, toId INT, stockId INT, amount INT, toDate DATE, fromDate DATE, status INT );');//stsus 2 maens recevd by w1, 0 measn sent noti from w1, 1 means sent by w2 
	alasql('INSERT INTO transfer VALUES  (?,?,?,?,?,?,?,?);', [1, 1, 2,  1, "2016-09-18",  "2016-09-21", 1] );
	
	// Reload page
	Promise.all([ pkind, pitem, pwhouse, pstock, ptrans, pvinrets ]).then(function() {
		alasql('DROP TABLE IF EXISTS maker;');
		alasql('CREATE TABLE maker(id INT IDENTITY, makerName string, makerTel string);');
		var ms = alasql('SELECT  maker FROM item GROUP BY maker');
				
		for (var i = 0; i < ms.length; i++) {
			var trans = ms[i].maker;
			alasql('INSERT INTO maker VALUES(?,?,?)', [i,trans,]);//third parameter is NULL, previously 0)
		}
		
		
		alasql('DROP TABLE IF EXISTS reorder;');//reoder avg record
		alasql('CREATE TABLE reorder(id INT IDENTITY, quantAvg INT, quantTime INT, levelAvg INT, levelTime INT);');//only quantTime matters as how many times it was reordered, levelTime is of no use
		var ms = alasql('SELECT * FROM  stock');
				
		for (var i = 0; i < ms.length; i++) {/////////////making avg database record of reorrder
			var trans = ms[i];
			alasql('INSERT INTO reorder VALUES(?,?,?,?,?)', [trans.id, trans.reorderQuant, 1, trans.reorderPoint, 1]);//first time count is 1
		}
		window.location.reload(true);
	});
	
	
	
};

DB.remove = function() {
	if (window.confirm('are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// add commas to number
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
