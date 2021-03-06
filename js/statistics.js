 $("head").append('<script type="text/javascript" src="js/cookieLogin.js"></script>');
// $("#pageName").html(' Zubair Inventory Management');
$("#wName").html( readCookie('wName') );
if (readCookie('wName') != 'Head')////beaciuse only main admin can have quick update
	$( "#quickUpdate" ).hide();

$('#damageTag').children('ul').show();

alasql.fn.gun = function(balance, price) { 
        
        return balance*price;
}

//UNDEFIEND FOR CENTRAl!!!!
 var wId = alasql('SELECT id from whouse WHERE name = ?', [readCookie('wName')])[0].id;
 var row = alasql('SELECT item.maker, stock.balance, item.price FROM item JOIN stock ON item.id = stock.item    WHERE stock.whouse = ? GROUP BY item.maker,   stock.balance,  item.price',[wId] );
      //, item.price

var run = 1;
var name = row[0].maker;
var sum  = row[0].balance*row[0].price;
var brandValAr =[['Brand', 'Percent value share in warehouse']];

var cnt =  row[0].balance;
var brandCntAr =[['Brand', 'Number of items in warehouse']];

for (var i = 1; i < row.length; i++){
 if (row[i].maker != row[i - 1].maker){
	run = 0;
	brandValAr.push([name, sum]);
	brandCntAr.push([name, cnt]);
 }
 if (run == 0){
	name = row[i].maker;
	sum = 0;cnt = 0;
 }
 sum += row[i].balance*row[i].price;
 cnt += row[i].balance;
 run = 1;
}
//it was bug before, las running makers wee not pushed, now solve
brandValAr.push([name, sum]);
brandCntAr.push([name, cnt]);


//now harware kind wise sql and calcaiton
awId = alasql('SELECT id from whouse WHERE name = ?', [readCookie('wName')])[0].id;
  arow = alasql('SELECT item.kind, stock.balance, item.price FROM item JOIN stock ON item.id = stock.item    WHERE stock.whouse = ? GROUP BY item.kind,   stock.balance,  item.price',[wId] );
      //, item.price
function getKindName(id){
	//id = parseInt(id);
	var ret =  alasql('SELECT text from kind WHERE id = ?', [parseInt(id)])[0].text;
	return ret;
	
}
 arun = 1;
 aname = getKindName(arow[0].kind);
 asum  = arow[0].balance*arow[0].price;
 abrandValAr =[['Brand', 'Percent value share in warehouse']];

 acnt =  arow[0].balance;
 abrandCntAr =[['Brand', 'Number of items in warehouse']];

for ( i = 1; i < arow.length; i++){
 if (arow[i].kind != arow[i - 1].kind){
	arun = 0;
	abrandValAr.push([aname, asum]);
	abrandCntAr.push([aname, acnt]);
 }
 if (arun == 0){
	aname = getKindName(arow[i].kind);
	asum = 0;acnt = 0;
 }
 asum += arow[i].balance*arow[i].price;
 acnt += arow[i].balance;
 arun = 1;
}
//it was bug before, las running makers wee not pushed, now solve
abrandValAr.push([aname, asum]);
abrandCntAr.push([aname, acnt]);

 google.charts.load('current', {'packages':['corechart']});
				  google.charts.setOnLoadCallback(piechartBrandVal);
				  function piechartBrandVal() {
			
					var data = google.visualization.arrayToDataTable(brandValAr);
			
					var options = {
					  title: 'Inventory Value By Brands'
					};
			
					var chart = new google.visualization.PieChart(document.getElementById('piechartBrandVal'));
			
					chart.draw(data, options);
					
					//now brandCntAr
					 data = google.visualization.arrayToDataTable(brandCntAr);
			
					 options = {
					  title: 'Inventory Count By Brands'
					};
			
					 chart = new google.visualization.PieChart(document.getElementById('piechartBrandCount'));
			
					chart.draw(data, options);
					
					////type val 
					//
					 data = google.visualization.arrayToDataTable(abrandValAr);//type
					
					 options = {
					  title: 'Inventory Value By Hardware Type'
					};
					
					 chart = new google.visualization.PieChart(document.getElementById('piechartTypeVal'));
					
					chart.draw(data, options);
					
					//type cnt
					 data = google.visualization.arrayToDataTable(abrandCntAr);
					
					 options = {
					  title: 'Inventory Count By Hardware Type'
					};
					
					 chart = new google.visualization.PieChart(document.getElementById('piechartTypeCount'));
					
					chart.draw(data, options);
				  }
				  
$( document ).ready(function() {
    
        //$('#damageTag').children('ul').show();

});