function print_db() {
	pars = {};
	pars.type = 'databases';
	var str = "in print_db";
	console.log(str);
	console.log(format_url(urls.get_data, pars));
	$.getJSON( urls.get_data, pars, function(data) {
		print_db_table(data);
	}).fail(function(){
		console.log("Failed databases retrieval");
	});
}

function get_dbs() {
	var dbs = {};
	
}

function print_db_table( dbs ) {
	var str = "in print_db_table";
	console.log(str);
	console.log(dbs);
	var table = $( "<table />" );
	table.append( write_db_head() );
	
	for ( var db in dbs ) {
		console.log( db );
		var data = dbs[ db ];
		data.db = db;
		var row = write_db_line( db, data );
		table.append( row );
	}
	$( "#databases" ).append( table );
}

var dbs_headers = {
       "db" : "Name",
       "num" : "Size",
       "description" : "Description",
       "date" : "Date",
       "author" : "Author",
};

function write_db_head() {
	var row = $( "<tr />" );
	for (head in dbs_headers) {
		var cell = $( "<th />" ).text( dbs_headers[ head ] );
		row.append( cell );
	}
	return row;
}
function write_db_line( db, data ) {
	//var row = $( "<tr />" );
	var link = urls.summary + "?" + $.param( { 'version': db } );
	var row = $( "<a />" )
	       .attr( "href", link )
	       .attr( "title", "Explore the database " + db )
	       .attr( "class", "table-row" );
	for (head in dbs_headers) {
		var content = "";
		if ( data[ head ] ) {
			content = data[ head ];
		} else if ( head == "db" ) {
			content = db;
		}
		var cell = $( "<td />" ).text( content );
		row.append( cell );
	}
	return row;
}

// First actions!
$(function() {
	if ($("#databases")) {
		print_db();
	}
});

