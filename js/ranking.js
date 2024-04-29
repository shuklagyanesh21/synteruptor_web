var cached_data = {};
var cached_data_ajax = null;
synteruptor_version = "1.0";

init_pars( {
	"sp1" : "",
	"sp2" : "",
	'break_min1' : 15,
	'break_min2' : 15,
	'conditional' : 'OR',
	'strict': 10,
} );

// Handle CSV download link
function to_csv(data) {
	//return '';
	var csv = [];
	// print head
	var head_cols = get_head("name");
	csv[0] = '"' + head_cols.join('","') + '"';
	for (d in data) {
		var vals = [];
		for (h in head_cols) {
			vals.push(data[d][ head_cols[h] ]);
		}
		var line = '"' + vals.join('","') + '"';
		csv.push(line);
	}
	return csv.join("\n");
}

function update_csv(data) {
	$('#csv_link').attr( "href", "" );
	$('#csv_link').attr( "download", "" );
	csv = to_csv(data);
	$('#csv_link').attr('download', 'breaks_table.csv');
	$('#csv_link').attr('href', 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv));
}

function prepare_csv(data) {
	update_csv(data);
	$("#csv_link").off( "click" );
	$("#csv_link").trigger( "click" );
}

// Handle antismash download link
function to_antismash(data) {
	tool = {
		"name": "synteruptor",
		"version": synteruptor_version,
		"description": "Synteny breaks explorer",
	};
	records = {};
	for (var br of data) {
		reg_name = br["gpart1"];
		subregion = {
			"label": "break_" + br["break_sum"].substring(0, 6),
			"start": br["loc_start1"],
			"end": br["loc_end1"],
		};
		if (!records[reg_name]) {
			records[reg_name] = []
		}
		records[reg_name].push(subregion);
	}

	data_records = []
	for (reg_name in records) {
		record = {
			"name": reg_name,
			"subregions": records[reg_name],
		};
		data_records.push(record);
	}
	json_data = {
		"tool": tool,
		"records": data_records,
	}
	return JSON.stringify(json_data, null, 4);
}

function update_antismash_link(data) {
	$('#antismash_link').attr( "href", "" );
	$('#antismash_link').attr( "download", "" );
	json_data = to_antismash(data);
	$('#antismash_link').attr('download', 'breaks_table_antismash.json');
	$('#antismash_link').attr('href', 'data:application/csv;charset=utf-8,' + encodeURIComponent(json_data));
}

function prepare_antismash_link(data) {
	update_antismash_link(data);
	$("#antismash_link").off( "click" );
	$("#antismash_link").trigger( "click" );
}

// Links
function break_link(b) {
	link_pars = {
		"break_min1": get_par( "break_min1" ),
		"break_min2": get_par( "break_min2" ),
		"conditional": get_par( "conditional" ),
		"strict": get_par( "strict" ),
		'breakid' : b.breakid,
		'version': get_par( "version" )
	};
	var url = format_url( urls.break, link_pars );
	var label = b.breakid;
	if ("break_sum" in b) {
		label = b.break_sum.substr(0, 6);
	}
	lnk = $('<a />').attr('href', url).text( label );
	return lnk;
}

// Link to aligner from the diversity number
function aligner_link(b) {
	link_pars = {
		"break_min1": get_par( "break_min1" ),
		"break_min2": get_par( "break_min2" ),
		"conditional": get_par( "conditional" ),
		"strict": get_par( "strict" ),
		'breakid' : b.breakid,
		'version': get_par( "version" )
	};
	var url = format_url( urls.aligner, link_pars );
	var label = b.cycle;
	if (b.cycle_) {
		label = b.cycle_;
	}
	lnk = $('<a />').attr('href', url).html( label );
	return lnk;
}

function update_stats(data) {
	$('#nbreaks').text(data.length > 0 ? data.length : "No");
}

// Write the whole ranking_table
function update_table(data) {
	if (data['outcome'] && data['outcome'] == false) {
		$('#message').text('Break query error.');
	} else {
		var $table = $('#ranking');
		
		// Header
		var sp1 = get_par( "sp1" );
		var sp2 = get_par( "sp2" );
		$header = $('<tr />');
		
		var head_names = get_head("title");
		var head_desc = get_head("desc");
		for (i in head_names) {
			var h = $( "<abbr title='" + head_desc[i] + "'>" + head_names[i] + "</abbr>" );
			$header.append( $('<th />').append( h ) );
		}
		$head_tag = $('<thead />');
		$head_tag.append($header);
		$table.append($head_tag);
		
		$body_tag = $('<tbody />');
		// Add 1 row = 1 break
		var head_cols = get_head("name");
		var rank = 0;
		for (b in data) {
			bdata = data[b];
			rank++;
			bdata.rank = rank;
			$row = $('<tr />');
			
			for (h in head_cols) {
				var col = head_cols[ h ];
				var val_ = bdata[ col + '_' ];
				var val = val_ ? val_ : bdata[ col ];
				$cell = $('<td />');
				
				// Conditional style
				if (val == 0) {
					$cell.addClass('zero');
				}
				if (col == 'tRNA_both' && bdata.both_trnas ||
						col == 'tRNA_both_ext' && bdata.both_trnas_ext) {
					$cell.addClass('trna');
				}
				if (col == 'delta_GC1' || col == 'delta_GC2') {
					val = format_GC(val);
				}
				if (col == 'score') {
					val = val.toFixed(0);
				}
				$cell.html(val);
				$row.append($cell);
			}
			
			$body_tag.append($row);
		}
		$table.append($body_tag);
		$table.show();
		$table.stickyTableHeaders();
		$table.tablesorter();
	
		$('tr').hover(function(e) {
			$(this).css('background', '#FFA');
		}, function(e) {
			$(this).css('background', '');
		});
	}
}

function update() {
	console.log("UPDATE");
	var pars = get_pars();
	
	
	// Cached?
	if (cached_data[ pars.sp1 + pars.sp2 ]) {
		console.log("Retrieve cached data.");
		update_page( cached_data[ pars.sp1 + pars.sp2 ] );
		update_links();
	} else {
		var rankpars = {
			"sp1": get_par( "sp1" ),
			"sp2": get_par( "sp2" ),
			"version": get_par( "version" ),
			"type": "ranking",
		};
		console.log(rankpars);
		// Retrieve all data between the genomes
		console.log("Download data.");
		loading_on();
                
		cached_data_ajax = $.getJSON( urls.get_data, rankpars, function(data) {
			var predata = preprocess_data(data);
			cached_data[ pars.sp1 + pars.sp2 ] = predata;
			console.log(predata);
			loading_off();
			update_page(predata);
		}).fail(function() {
			loading_off();
		});
	}
}

function update_page(init_data) {
	// First, filter data
	var data = filter_data(init_data);
	
	// Then, sort it
	data = sort_data(data);
	
	$('#message').empty();
	$('#nbreaks').val("No");
	$('#ranking').stickyTableHeaders('destroy');
	$('#ranking').empty();
	if (data['outcome'] == false) {
		$error = $('<span />').text('Error: ' + data['message']).attr('title', data['details']);
		$('#message').append($error);
		$('#message').show();
	} else {
		update_permalink();
		update_links();
		update_stats( data );
		update_table( data );
		update_filter_plot();
		$( "#csv_link" )
			.attr( "href", "" )
			.attr( "download", "" )
			.on( "click", function() {
			prepare_csv( data );
		});
		$( "#antismash_link" )
			.attr( "href", "" )
			.attr( "download", "" )
			.on( "click", function() {
			prepare_antismash_link( data );
		});
	}
}

function preprocess_data(data) {
	for (b in data) {
		var bdata = data[b];
		bdata.breakid_ = break_link(bdata);
		bdata.both_trnas = false;
		if (bdata.tRNA_both) {
			if (bdata.tRNA_both == 2) {
				bdata.both_trnas = true;
				bdata.tRNA_both_ = '<span class="sortvisible">2</span>both';
			} else {
				bdata.tRNA_both_ = '<span class="sortvisible">1</span>one';
			}
		} else {
			bdata.tRNA_both_ = '<span class="sortvisible">0</span>';
		}
		if (bdata.tRNA_both_ext) {
			if (bdata.tRNA_both_ext == 2) {
				bdata.both_trnas_ext = true;
				bdata.tRNA_both_ext_ = '<span class="sortvisible">2</span>both';
			} else if (bdata.tRNA_both_ext == 1) {
				bdata.tRNA_both_ext_ = '<span class="sortvisible">1</span>one';
			} else {
				bdata.tRNA_both_ext_ = '<span class="sortvisible">' + bdata.tRNA_both_ext + '</span>one';
			}
		} else {
			bdata.tRNA_both_ext_ = '<span class="sortvisible">0</span>';
		}
		bdata.noorthos1 = bdata.real_size2;
		bdata.noorthos2 = bdata.real_size1;
                
                bdata['fromto1'] = bdata['left1'] + ' - ' + bdata['right1'];
		bdata['fromto2'] = bdata['left2'] + ' - ' + bdata['right2'];
		bdata['cycle_'] = (bdata['cycle'] > 2 ? bdata['cycle'] : "<span class='insignificant'>2</span>");
		bdata['cycle_'] = aligner_link(bdata);
		data[b] = bdata;
	}
	return data;
}

function filter_data(data) {
	var filtered = [];
	
	for (b in data) {
		if (break_filter( data[b] ) ) {
			filtered.push(data[b]);
		}
	}
	
	return filtered;
}

function sort_data(data) {
	data = sort_score(data);
	var sort = [{ 'name': 'score', 'type': 'int', 'order': false }];
	data.sort(sort_by(sort));
	return data;
}

function create_menus(data) {
	genomes = data.genomes;
	console.log(genomes);
	var sp1 = get_par( "sp1" );
	var sp2 = get_par( "sp2" );
	
	// Init menu
	var i = 0;
	defsp = [];
	for(var g in genomes) {
		var sp = genomes[g].sp;
		$("#sp1").append( $( "<option />", { value: sp, text: genomes[sp].name } ) );
		$("#sp2").append( $( "<option />", { value: sp, text: genomes[sp].name } ) );
		defsp.push(sp);
		i++;
	}
	
	if (!sp1 && !sp2) {
		sp1 = defsp[0];
		sp2 = defsp[1];
		set_par( "sp1", sp1 );
		set_par( "sp2", sp2 );
	}
	$('#sp1').val(sp1).attr("selected", true);
	$('#sp2').val(sp2).attr("selected", true);
	
	// Init break number
	$('#break_min1').val( get_par( "break_min1" ) );
	$('#break_min2').val( get_par( "break_min2" ) );
	$( "#conditional" ).val( get_par( "conditional" ) ).attr("selected", true);
	$( "#strict" ).val( get_par( "strict" ) );
	
	// Change event
	$('#sp1').change(function(event) {
		set_par( "sp1", $('#sp1').val() );
		create_filter_box();
		update();
	});
	$('#sp2').change(function(event) {
		set_par( "sp2", $('#sp2').val() );
		create_filter_box();
		update();
	});
	$('#strict').change(function(event) {
		set_par( "strict", $('#strict').val() );
		create_filter_box();
		update();
	});
	
	$("#swapper").click(function(event) {
		// Reverse sp selection
		var s1 = $("#sp1").val();
		var s2 = $("#sp2").val();
		
		$('#sp1').val(s2);
		$('#sp2').val(s1);
		set_par( "sp1", s2 );
		set_par( "sp2", s1 );
		create_filter_box();
		update();
	});
	update_links();
}

function update_links() {
	// Update dotplot link
	var dotpars = {
		"sp1": get_par( "sp1" ),
		"sp2": get_par( "sp2" ),
		"break_min1": get_par( "break_min1" ),
		"break_min2": get_par( "break_min2" ),
		"conditional": get_par( "conditional" ),
		"version": get_par( "version" ),
		"strict": get_par( "strict" ),
	};
	$( "#dotplot_link").attr('href', format_url( urls.dotplot, dotpars ) );
}

// First actions!
$(function() {
	// Init the parameters
	pars = get_url_parameters();
	set_pars( pars );
	console.log( get_pars() );
	
	build_sort_table(sort_vals);
	$( "#sortlist input" ).on("change", function() {
		set_custom_sort_vals();
		update();
	});
	
	$( "#reset_sort" ).on("click", function(e) {
		e.preventDefault();
		set_default_sort_vals();
		build_sort_table();
		$( "#sortlist input" ).on("change", function() {
			set_custom_sort_vals();
			update();
		});
		update();
	});
	
	// Get all the genomes names for the menu
	pars.type = 'genomes';
	$.getJSON( urls.get_data, pars, create_menus )
	.then( update ).then( create_filter_box );
});

