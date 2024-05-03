var cached_data = {};
init_pars( {
	"sp" : "",
	"from": 0,
	"range": 100,
	"pid": "",
} );
var jumped = false;

// Write the whole list_table
function update_table(data) {
	if (data['outcome'] && data['outcome'] == false) {
		$('#message').text('List query error.');
	} else {
		console.log(data);
		var $table = $('#list');
		
		if (!data || !data.genes || data.genes.length == 0) {
			return;
		}
		
		// Header
		var sp = get_par( "sp" );
		$header = $('<tr />');
		
		var heads = [
			{
				"name": "pnum_all",
				"title": "Num",
				"desc": "Ordered position of the gene in the genome",
			},
			{
				"name": "blast",
				"title": "BLAST against...",
				"desc": "Blast this sequence against either the whole current database, or against NCBI databases",
			},
			{
				"name": "pid",
				"title": "Gene ID",
				"desc": "Unique gene identifier in the genome. The link leads to the sequence in fasta format.",
			},
			{
				"name": "loc_start",
				"title": "Start",
				"desc": "Genomes coordinates of the start of the gene",
			},
			{
				"name": "loc_end",
				"title": "End",
				"desc": "Genomes coordinates of the start of the gene",
			},
                        {
                                "name": "strand",
                                "title": "Strand",
                                "desc": "Strand of the gene: sense = +, antisense = -"
                        },
			{
				"name": "loc_length",
				"title": "Length",
				"desc": "Length of the gene, in base pairs",
			},
			{
				"name": "product",
				"title": "Predicted product",
				"desc": "Product predicted for this gene",
			},
			{
				"name": "delta_GC",
				"title": "Diff GC ratio",
				"desc": "Difference between the GC ratio of the whole genome with the GC of each gene",
			},
			{
				"name": "breaks",
				"title": "Breaks that include this gene",
				"desc": "List the breaks where the gene can be found",
			},
		];
		for (i in heads) {
			$header.append( $('<th />').html( "<abbr title='" + heads[i].desc + "'>" + heads[i].title + "</abbr>" ) );
		}
		$head_tag = $('<thead />');
		$head_tag.append($header);
		$table.append($head_tag);
		
		$body_tag = $('<tbody />');
		// Add 1 row = 1 break
		var rank = 0;
		for (b in data.genes) {
			bdata = data.genes[b];
			rank++;
			bdata.rank = rank;
			$row = $('<tr />');

			for (h in heads) {
				var name = heads[h].name;
				var $cell = $('<td />');
				var val = bdata[ name ];
				if (name == "breaks" && val) {
					var breaks = [];
					for (sp2 in val) {
						breaks.push(make_break_link(val[sp2], sp2, get_par("version")));
					}
					val = breaks.join(", ");
				}
				else if (name == "blast") {
					val = make_blast_link({"pid": bdata.pid }, true);
				}
				else if (name == "pid") {
					val = make_seq_link(bdata.pid);
					val = val + "<span id='" + bdata.pid + "' />";
				}
				else if (name == "delta_GC") {
					val = format_GC(val);
				}
				else if (name == "loc_start" || name == "loc_end") {
					val = format_number(val);
				}
				else if (name == "strand") {
                                        val = format_strand(val);
				}
				else if (name == "loc_length") {
                                        val = format_length(bdata["feat"], val);
				}
				$cell.html(val);
				$row.append($cell);
			}
			
			$body_tag.append($row);
		}
		$table.append($body_tag);
		$table.show();
		
		$('tr').hover(function(e) {
			$(this).css('background', '#FFA');
		}, function(e) {
			$(this).css('background', '');
		});
	}
}

function update() {
	console.log("UPDATE");
	$('#list').empty();
	var pars = get_pars();
	
	// Cached?
	if (cached_data[ pars.sp ]) {
		console.log("Retrieve cached data.");
		update_page( cached_data[ pars.sp ] );
	} else {
		var rankpars = {
			"sp": get_par( "sp" ),
			"from": get_par( "from" ),
			"range": get_par( "range" ),
			"version": get_par( "version" ),
			"type": "genes_list",
		};
		console.log(rankpars);
		// Retrieve all data between the genomes
		console.log("Download data.");
		loading_on();
		$.getJSON( urls.get_data, rankpars, function(data) {
			var predata = preprocess_data(data);
			loading_off();
			//cached_data[ pars.sp ] = predata;
			update_page(predata);
			jump_to();
		}).fail(function() {
			loading_off();
		});
	}
}

function update_page(data) {
	$('#message').empty();
	$('#nbreaks').val("No");
	$('#list').stickyTableHeaders('destroy');
	$('#list').empty();
	if (!data) {
		$error = $('<span />').text('Error: no data');
		$('#message').append($error);
		$('#message').show();
		
	} else if (data['outcome'] == false) {
		$error = $('<span />').text('Error: ' + data['message']).attr('title', data['details']);
		$('#message').append($error);
		$('#message').show();
	} else {
		update_permalink();
		update_table( data );
	}
	$('#list').stickyTableHeaders();
}

function preprocess_data(data) {
	for (b in data) {
		var bdata = data[b];
		data[b] = bdata;
	}
	return data;
}

function create_menus(data) {
	genomes = data.genomes;
	console.log(genomes);
	var sp = get_par( "sp" );
	
	// Init menu
	var i = 0;
	for(var g in genomes) {
		var gsp = genomes[g].sp;
		$("#sp").append( $( "<option />", { value: gsp, text: genomes[gsp].name } ) );
		i++;
	}
	
	$('#sp').val(sp).attr("selected", true);
	// Change selected species
	$('#sp').change(function(event) {
		set_par( "sp", $('#sp').val() );
		update();
		update_links();
	});
	
	// From
	var from = get_par( "from" );
	if (!from || from < 0) {
		from = 0;
	}
	$('#from').val(from);
	$('#from').change(function(event) {
		set_par( "from", $('#from').val() );
		update();
		update_links();
	});
	
	// Range
	var range = get_par( "range" );
	if (!range || range < 0 || range > 1000) {
		range = 100;
	}
	$('#range').val(range);
	$(".prev").val("Previous " + range);
	$(".next").val("Next " + range);
	$('#range').change(function(event) {
		new_range = $('#range').val();
		set_par( "range", new_range);
		$(".prev").val("Previous " + new_range);
		$(".next").val("Next " + new_range);
		update();
		update_links();
	});
	update_links();
	
	// Also create the next/prev buttons
	$(".prev").on("click", function(e) {
		e.preventDefault();
		var from = get_par("from");
		var range = get_par("range");
		var diff = from - range;
		if (diff < 0) { diff = 0; }
		set_par( "from", diff);
		$("#from").val(diff);
		update();
		update_links();
	});
	$(".next").on("click", function(e) {
		e.preventDefault();
		var from = get_par("from");
		var range = get_par("range");
		var diff = from + range;
		set_par( "from", diff);
		$("#from").val(diff);
		update();
		update_links();
	});
}

function update_links() {
	// Update dotplot link
	var dotpars = {
		"sp": get_par( "sp" ),
		"version": get_par( "version" ),
	};
	$( "#dotplot_link").attr('href', format_url( urls.dotplot, dotpars ) );
}

function jump_to() {
	// Move the focus in the center of the page, not at the top or wheresnot
	var pid = get_par( "pid" );
	if (pid && !jumped) {
		console.log("Scroll!" + pid);
		var o = $("#" + pid).focus().offset().top;
		var $w = $(window);
		var diff = ($w.height() / 2);
		$w.scrollTop(o - diff);
		$("#" + pid).parent().parent().addClass("line_selected");
	}
	jumped = true;
}

// First actions!
$(function() {
	// Init the parameters
	pars = get_url_parameters();
	set_pars( pars );
	console.log( get_pars() );
	
	// Get all the genomes names for the menu
	pars.type = 'genomes';
	$.getJSON( urls.get_data, pars, create_menus )
		.then( update );
});

