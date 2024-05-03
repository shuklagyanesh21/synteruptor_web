storage = $.localStorage;

// Write the genomes table
function genomes_table(data) {
	if (data['outcome'] && data['outcome'] == false) {
		$("#message").text("Break query error.");
	} else if (!data.genomes || data.genomes.length == 0) {
		$("#message").text("No database available with this name.");
	} else {
		$("#genomes").show();
		$("#links").show();
		var sps = Object.keys(data.genomes);
		var tab = $("#genomes");
		
		// Header
		var head = $("<tr />");
		
		var first_head_cols = [
			'sp',
			'name',
			'genes',
			'ngparts',
			'GC',
		];

		var first_head_names = [
			"<abbr title='Genome identifier'>Id</abbr>",
			"Genome name",
			"<abbr title='Number of genes annotated in this genome, with a link to the list of genes'>Number of genes</abbr>",
			"<abbr title='Number of contigs for the genomes, in case the genome has multiple replicons or is still in a draft state'>Number of contigs</abbr>",
			"<abbr title='GC ratio = (G+C)/(A+T+G+C), calculated over all the aminoacid sequences of the genome'>GC ratio</abbr>",
		];
		header_list = first_head_names;
		for (i in header_list) {
			var col = $("<th>"+ header_list[i] +"</th>");
			head.append(col);
		}
		head_tag = $('<thead />').append(head);
		tab.append(head_tag);
		
		body_tag = $('<tbody />');
		
		// Content
		for (i in sps) {
			var line = $("<tr />");
			
			// First part: genomes data
			bdata = data.genomes[sps[i]];
			bdata.ngparts = data.gparts[sps[i]].length;
			bdata.genes = $("<a />")
				.text(bdata.max_pnum_display)
				.attr("title", "Link to the list of genes of the genome " + bdata.sp)
				.attr("href", format_url(urls.glist, {'version': get_par("version"), 'sp': bdata.sp}));
			for (h in first_head_cols) {
				var col = first_head_cols[ h ];
				var val = bdata[ col ];
				
				if (col == 'GC') {
					val = (val*100).toFixed(1) + "%";
				}
				
				$cell = $('<td />').html(val);
				line.append($cell);
			}
			body_tag.append(line);
		}
		tab.append(body_tag);
		tab.show();
	}
	links(data.can_search);
}

function links_table(data) {
	if (data['outcome'] && data['outcome'] == false) {
		$("#message").text("Break query error.");
	} else if (!data.genomes || data.genomes.length == 0) {
		$("#message").text("No database available with this name.");
	} else {
		$("#links_table").show();
		var sps = Object.keys(data.genomes);
		var tab = $("#links_table");
		
		// Header
		var head = $("<tr />");
		
		var first_header = [''];
		var header_list = first_header.concat(sps);
		for (i in header_list) {
			var col = $("<th>"+ header_list[i] +"</th>");
			head.append(col);
		}
		head_tag = $('<thead />').append(head);
		tab.append(head_tag);
		
		body_tag = $('<tbody />');
		
		// Content
		for (i in sps) {
			var line = $("<tr />");
			var val = sps[i];
			$cell = $('<th />').html(val);
			line.append($cell);
			
			// Second part: genomes comparisons
			line:for (j in sps) {
				col = $("<td />");
				if (j == 0) {
					col.addClass("left-border");
				}
				if (i != j) {
					if (!(sps[i] in data.genomes_stats && sps[j] in data.genomes_stats[ sps[i] ])){
						col.append("No orthologs found");
						line.append(col);
						continue line;
					}
					var stats = data.genomes_stats[ sps[i] ][ sps[j] ];
					var northo = data.num_ortho[ sps[i] ][ sps[j] ].num_ortho;
					var text = stats.blocks_count + "<br>" + (stats.blocks_sum/stats.blocks_count).toFixed(1);
					var mean1 = (stats.blocks_sum / northo * 100).toFixed(0);
					//var mean1 = (stats.blocks_sum / data.genomes[ sps[i] ].max_pnum_display * 100).toFixed(0);
					//var mean2 = (stats.blocks_sum / data.genomes[ sps[j] ].max_pnum_display * 100).toFixed(0);
					col.append("<abbr title='Synteny level'>synt: " + mean1 + "% </abbr><br>");
					//col.append(mean2 + "%<br>");
					
					// Dotplot link
					var dlink = format_url(urls.dotplot, {'version':get_par('version'), 'sp1': sps[i], 'sp2': sps[j]});
					var da = $("<a href='" + dlink + "'></a>");
					da.html("<img src='css/dotplot_32.png'/>");
					da.attr("title", "Genomes dotplot " + sps[i] + " vs " + sps[j]);
					da.css({"margin-right": "5px"});
					col.append(da);
					
					// Ranking link
					var rlink = format_url(urls.ranking, {'version':get_par('version'), 'sp1': sps[i], 'sp2': sps[j]});
					var ra = $("<a href='" + rlink + "'></a>");
					ra.html("<img src='css/ranking_32.png'/>");
					ra.attr("title", "Breaks ranking " + sps[i] + " vs " + sps[j]);
					col.append(ra);
				} else {
					col.addClass("ident");
				}
				line.append(col);
			}
			body_tag.append(line);
		}
		tab.append(body_tag);
		tab.show();
	}
}

function links(can_search) {
	var $ul = $('#links ul');
	
	// Blast search
	if (can_search) {
		var $gsearch = $("<a />")
			.text("BLAST against this database")
			.attr("href", urls.search + "?version=" + get_par("version"));
		var li = $("<li />")
			.html($gsearch)
			.attr( "title", "Search sequences in the database " + get_par("version") + " with a sequence of your own" );

		$ul.append( li );
	}
	
	// Download the database file
	var $download = $("<a />")
		.text("Download this database")
		.attr("href", "db/" + get_par("version") + ".sqlite");
	var li = $("<li />")
		.html($download)
		.attr( "title", "Retrieve the database file for " + get_par("version") + " in SQLite format" );
	$ul.append( li );

	$("#links").append($ul);
        
}

function get_cached_data( cname ) {
	cached_data = storage.get( cname );
	console.log("CACHED = ");
}

function create_table(pars) {
	// Get all the genomes names for the menu
	pars.type = 'genomes';
	$.getJSON( urls.get_data, pars, function(data) {
		genomes_table(data);

		// Also get all the genomes orthologs numbers
		pars.type = 'genomes_ortho';
		loading_on();

		// Get from cache
		cname = "summary_" + get_par("version") + "_numorthos";
		if ( storage.isSet( cname )) {
			orthos = storage.get( cname );
			data.num_ortho = orthos.num_ortho;
			links_table(data);
			loading_off();
		} else {
			console.log(pars);
			console.log(urls.get_data);
			$.getJSON( urls.get_data, pars, function(orthos) {
				loading_off();
				if (orthos['outcome'] == true) {
					console.log("Can't get ortho data");
				} else {
					try {
						storage.set( cname, orthos );
					} catch (e) {
						console.log("Data cache is full: purging.");
						storage.removeAll();
						try {
							storage.set( cname, orthos );
						} catch(e) {
							console.log("Can't cache");
						}
					}
					console.log("Data stored in " + cname);
					data.num_ortho = orthos.num_ortho;
					console.log(data);
					links_table(data);
				}
			});
		}
	});
}

// First actions!
$(function() {
	// Init the parameters
	pars = get_url_parameters();
	set_pars( pars );
	console.log( get_pars() );
	if (get_par("version") && get_par("version") != "") {
		create_table(pars);
	} else {
		$("#message").text("No database name provided.");
	}
	$('#clear_cache').click(function(event) {
		event.preventDefault();
		console.log("Clear cache...");
		storage.removeAll();
	});
});

