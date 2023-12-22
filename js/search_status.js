urls.stat = 'search_status.php';
var wait_delay = 10000;

function status_checker(id) {
	if (id) {
		var pars = {
			"id": id,
			"command": "check",
		};
		
		// Check the status a first time to see if the building is already started/finished
		$.getJSON( urls.stat, pars, function( stat ) {
			console.log("Current status: " + stat.status);
			if (stat.status == 'nostatus') {
				// Do nothing: waiting for the form to be submitted
			} else {
				continuous_check(id);
			}
		});
	}
}

function start_button(id) {
	console.log("Start button created");
	$button = $("<button type='button' />")
		.text("Search")
		.on("click", function(e) {
			e.preventDefault();
			$(this).attr("disabled", "disabled");
			start(id);
		});
	$("#building").append($button);
}

function start(id) {
	var pars = {
		"id": id,
		"command": "start",
	};
	$.get( urls.stat, pars, function( stat ) {
		continuous_check(id);
	});
}

function continuous_check(id) {
	console.log("Continuous check for " + id);
	var pars = {
		"id": id,
		"command": "check",
	};
	$.getJSON( urls.stat, pars, function( stat ) {
		$('#results')
			.empty()
			.html("Status: " + stat.status + " [" + stat.details + "]");
		if (stat.status == 'done') {
			finish(id);
		} else if (stat.status == "error") {
			console.log("Error encountered: " + stat.details);
			// Don't continue!
		} else {
			window.setTimeout(function() {
				continuous_check(id);
			}, wait_delay);
		}
	});
}

function separate(data) {
	var sdata = {};
	for (h in data.hits) {
		//
	}
	return data;
}

function make_break_link(b, version) {
	return "<a href='" + urls.break + "?breakid=" + b.breakid + "&version=" + version + "'>" + b.sp + "</a>";
}

function finish(id) {
	$("#results")
		.empty()
		.html("<p>Generating results...</p>");
	
	var pars = {
		"id": id,
		"command": "results",
	};
	// Ask the API to give the result in JSON
	$.getJSON( urls.stat, pars, function( data ) {
		console.log(data);
		if (Object.keys(data.hits).length > 0) {
			$("#results").empty();
			
			// Separate data for each sequence query
			for (q in data.hits) {
				$("#results_table")
					.append( $("<p />")
					.html("The query '"+ q +"' had " + data.hits[q].length + " hits in the <a href='" + urls.summary + "?version=" + data.version + "'>" + data.version + " database</a>:") );
				// Create the table
				$table = $("<table />");
				$head = $("<tr />");
				heads = ['Identity', 'Genome', 'Gene', 'Description', 'Found in a break?'];
				conts = ['identity', 'sp', 'hit', 'product', 'breaks'];
				for (h in heads) {
					$h = $("<th />").text(heads[h]);
					$head.append($h);
				}
				$table.append($head);
				$("#results_table").append($table);
				
				for ( g in data.hits[q] ) {
					var hit = data.hits[q][g];
					console.log(hit);
					
					var breaks = [];
					var brlist = hit.breaks;
					if (brlist.length > 0) {
						for (b in brlist) {
							var br = make_break_link(brlist[b], data.version);
							breaks.push(br);
						}
					}
					hit.breaks = breaks.join(", ");
					hit.identity = hit.identity + " %";
					
					$l = $( "<tr >" );
					for (c in conts) {
						$val = $( "<td />" ).html( hit[ conts[c] ] );
						$l.append($val);
					}
					$table.append($l);
				}
			}
		} else {
			$("#results").empty()
				.append("No match found for the query '" + data.query + "' in the <a href='" + urls.summary + "?version=" + data.version + "'>" + data.version + " database</a>.");
		}
		var redo_url = format_url( urls.search, { 'version': data.version } );
		var $redo = $( "<p><a href='" + redo_url + "'>Start another search</a></p>" );
		$( "#results" ).append($redo);
	});
	console.log("Check over");
}

jQuery(function() {
	var pars = get_url_parameters();
	var id = pars.id;
	
	// Not enough genomes = no need to check
	if ($("#results_table")) {
		// Start the status checker
		status_checker(id);
	} else {
		console.log("No search launched yet");
	}
});

