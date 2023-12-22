var strepdb_url = '//strepdb.streptomyces.org.uk/cgi-bin/dc3.pl?iorm=map;';
var genomes_accession = {
	'Sco' : 'AL645882',
	'Sli_1326' : 'CM001889',
};
var canvas_top = 0, canvas_left = 0;
$top_canvas = null;
var width_percent = 0.99;

var margin = {
	"top": 60,
	"left": 120,
	"bottom": 20,
	"right": 10,
	"title": 10,
	"toptext": 20,
};

var sizes = {
	"win_height": 120 + margin.top + margin.bottom,
	"win_width": $('#canvas').width() * width_percent,
	"sep": 80,
	"gene_height": 20,
};

init_pars( {
	'breakid': 0,
	'break_min1': 10,
	'break_min2': 0,
	'conditional' : 'AND',
	'strict': 10,
	'trim': 10,
});

var cached_data = {};

function prepare_genes(data) {
	coords = [];
}

function trim_block(block, trim) {
	//return block;
	max_trim = get_par( "trim" );
	new_block = block;
	
	if (trim == 'left') {
		new_block = block.splice(-max_trim, max_trim);
	} else if (trim == "right") {
		new_block = block.splice(0, max_trim);
	}
	return new_block;
}

function trim_data(data) {
	if (data['left_block']) {
		data['left_block']['block1'] = trim_block(data['left_block']['block1'], 'left');
		data['left_block']['block2'] = trim_block(data['left_block']['block2'], 'left');
	}
	if (data['right_block']) {
		data['right_block']['block1'] = trim_block(data['right_block']['block1'], 'right');
		data['right_block']['block2'] = trim_block(data['right_block']['block2'], 'right');
	}
	return data;
}

function draw_genes_rectangles(svg, scale, start, data, block, dir, num, name, col) {
	// First line or second line?
	var plane = (num == 2 ? sizes.sep : 0);
	var diff = 20;
	var height = sizes.gene_height;
	
	// Draw arrows, not rectangles
	var arrow_height = 20;
	var arrow_head_rel_width = 0.25;
	var arrow_head_rel_height = 0.5;
	
	// Prepare a polygon for each gene
	var genesar = svg.selectAll("." + name).data(data).enter().append("svg:a")
				.attr("xlink:href", function(d){ return "#" + clean_id(d.pid); }).append("polygon");
	
	// Actually draw the arrows
	var genesar_attr = genesar
			.attr("points", function(d) {
				// Heights of the arrow points
				var ytop = (dir*d.strand == -1 ? plane+diff : plane);
				var ybot = ytop + arrow_height;
				var ymid = ytop + arrow_height/2;
				var yartop = ytop - 5;
				var yarbot = ybot + 5;
				
				// Direct strand : start = loc_start (loc_end otherwise)
				var xinit = parseInt(d.loc_start);
				if (d.strand == -1) {
					xinit = parseInt(d.loc_end);
				}
				var xstart = xinit - start;
				if (dir == -1) {
					xstart = start - xinit;
				}
				
				// Same strand and direction: positive width; negative otherwise
				var width = parseInt(d.loc_length);
				if (dir * d.strand == -1) {
					width = -width;
				}
				var xend = xstart + width;
				var xmid = xstart + width*0.8;
				
				// Arrow points final coordinates
				var points = [
					(scale(xstart)) + ',' + (margin.top + ytop),
					(scale(xmid))   + ',' + (margin.top + ytop),
					//(margin.left + scale(xmid))   + ',' + (margin.top + yartop),
					(scale(xend))   + ',' + (margin.top + ymid),
					//(margin.left + scale(xmid))   + ',' + (margin.top + yarbot),
					(scale(xmid))   + ',' + (margin.top + ybot),
					(scale(xstart)) + ',' + (margin.top + ybot),
				];
				
				// Use those points as the arrow points
				return points.join(' ');
			})
			// Add specific class for non CDS genes + an id for links and highlighting
			.attr('class', function(d) {
				var classes = ['gene', name, 'rect_' + clean_id(d.pid)];
				if ( d.feat != 'CDS' ) {
					if ( d.feat == 'pseudo' ) {
						classes.push( 'pseudo' );
					} else {
						classes.push( 'noCDS' );
					}
				}
				if ( d.oid ) classes.push( 'orthoCDS' );
				if ( d.ortho_in ) classes.push( 'orthoCDS_in' );
				return classes.join( " " );
			})
			// Add title info for mouse hover
			.append('title').text(function(d) { return d.pid + " : " + (d.feat != 'CDS' ? d.feat + ' ' + d.product : d.product) + " (" + (d.feat =='CDS' ? parseInt(d.loc_length/3) + " aa" : d.loc_length + " pb") + ")"; } )
	
	// Draw a line (if there are genes here)
	if (data.length > 0) {
		var real_start = 0;
		var real_end = 0;
		if (dir == -1 && num == 2) {
			real_start = start - block['start'];
			real_end   = start - block['end'];
		} else {
			real_start = block['start'] - start;
			real_end   = block['end'] - start;
		}
		draw_line(svg, num, scale( real_start ), scale( real_end ) );
	}
}

function draw_line(svg, num, start, end, clas) {
	if (num == 1) {
		height = 20;
	} else {
		height = 20 + sizes.sep;
	}
	if (clas == undefined) {
		clas = "genome_line";
	}
	var line = svg.append("line")
		.attr("x1", start)
		.attr("y1", margin.top + height)
		.attr("x2", end)
		.attr("y2", margin.top + height)
		.attr("class", clas)
}

function draw_title(group, title, num) {
	if (num == 1) {
		height = -10;
	} else {
		height = -10 + sizes.sep;
	}
	var title = group.append( "text" )
		.attr( "x", margin.title )
		.attr( "y", margin.top + height )
		.text( title )
		.attr( "class", "line_title" )
}

function draw_legend(group, stats, scale, sp1, sp2) {
	var limit1 = group.append( "rect" )
		.attr("x", margin.left)
		.attr("y", 0)
		.attr("width", scale(stats.sep_left) - margin.left)
		.attr("height", sizes.win_height)
		.attr( "class", "flank_zone" );
	var limit2 = group.append( "rect" )
		.attr("x", scale(stats.sep_right))
		.attr("y", 0)
		.attr("width", sizes.win_width - scale(stats.sep_right))
		.attr("height", sizes.win_height)
		.attr( "class", "flank_zone" );
	var lefttext = group.append( "text" )
		.attr("x", margin.left + 5)
		.attr("y", margin.toptext)
		.text("Left synteny block")
		.attr("text-anchor", "start");
	var righttext = group.append( "text" )
		.attr("x", sizes.win_width - margin.right)
		.attr("y", margin.toptext)
		.text("Right synteny block")
		.attr("text-anchor", "end");
	var breaktext = group.append( "text" )
		.attr("x", (scale(stats.sep_right + stats.sep_left) + margin.left)/2)
		.attr("y", margin.toptext)
                .text("Genomic island")
		.attr("text-anchor", "middle");
	// Scale bar
	var inbetween = (stats.sep_right - stats.sep_left) / 5;
}

function blocks_stats(block, dir) {
	var stats = {};
	
	// block 1
	var block1 = {};
	block1['size'] = block['block1'].length;
	if (block1['size'] > 0) {
		block1['start'] = parseInt(block['block1'][0]['loc_start']);
		block1['end'] = parseInt(block['block1'][ block1['size'] - 1 ]['loc_end']);
		block1['len'] = Math.abs(block1['end'] - block1['start']);
	} else {
		block1['start'] = 0;
		block1['end'] = 0;
		block1['len'] = 0;
	}
	
	// block 2
	var block2 = {};
	block2['size'] = block['block2'].length;
	if (block2['size'] > 0) {
		if (dir == 1) {
			block2['start'] = parseInt(block['block2'][0]['loc_start']);
			block2['end'] = parseInt(block['block2'][ block2['size'] - 1 ]['loc_end']);
		} else {
			block2['start'] = parseInt(block['block2'][0]['loc_end']);
			block2['end'] = parseInt(block['block2'][ block2['size'] - 1 ]['loc_start']);
		}
		block2['len'] = Math.abs(block2['end'] - block2['start']);
	} else {
		block2['start'] = 0;
		block2['end'] = 0;
		block2['len'] = 0;
	}
	
	// Diff blocks
	block1['diff'] = 0;
	block2['diff'] = 0;
	var block_diff = block2['len'] - block1['len'];
	if (block_diff > 0) {
		block1['diff'] = block_diff;
	} else {
		block2['diff'] = -1 * dir * block_diff;
	}
	
	var blocks = {
		'1' : block1,
		'2' : block2
	};
	return blocks;
}

function breaks_stats(left, right, dir) {
	var stats = {};
	
	// block 1
	var break1 = {};
	break1['start'] = left[1]['end'];
	break1['end'] = right[1]['start'];
	break1['len'] = Math.abs(break1['end'] - break1['start']);
	
	// block 2
	var break2 = {};
	if (dir == 1) {
		break2['start'] = left[2]['end']+1;
		break2['end'] = right[2]['start']-1;
	} else {
		break2['start'] = right[2]['start']-1;
		break2['end'] = left[2]['end']+1;
	}
	break2['len'] = Math.abs(break2['end'] - break2['start']);
	
	// Diff blocks
	break1['diff'] = 0;
	break2['diff'] = 0;
	var break_diff = break2['len'] - break1['len'];
	if (break_diff > 0) {
		break1['diff'] = break_diff;
	} else {
		break2['diff'] = -1 * dir * break_diff;
	}
	
	var breaks = {
		'1' : break1,
		'2' : break2
	};
	return breaks;
}

function draw_genes(data) {
	// Remove any previous svg
	$('#canvas svg').remove();
	
	// Create a new one
	sizes.win_width = Math.floor($('#canvas').width() * width_percent);
	if (sizes.win_width == 0) {
		sizes.win_width = Math.floor($(window).width() * width_percent);
	}
	var svg = d3.select("#canvas").append("svg").attr("width", sizes.win_width).attr("height", sizes.win_height);
	var svg_style = svg.append('style')
		.attr('type','text/css')
	
	// Get coordinates for all blocks
	
	// LEFT
	var lefts = blocks_stats(data['left_block'], data.break.direction);
	
	// RIGHT
	var rights = blocks_stats(data['right_block'], data.break.direction);
	
	// BREAKS
	var breaks = breaks_stats(lefts, rights, data.break.direction);
	
	// WHOLE
	var length1 = lefts[1]['len'] + breaks[1]['len'] + rights[1]['len'];
	var length2 = lefts[2]['len'] + breaks[2]['len'] + rights[2]['len'];
	var best_left = d3.max([lefts[1]['len'], lefts[2]['len']]);
	var best_break = d3.max([breaks[1]['len'], breaks[2]['len']]);
	var best_right = d3.max([rights[1]['len'], rights[2]['len']]);
	var max_len = best_left + best_break + best_right;
	
	// Start of left and right blocks
	var start1 = lefts[1]['start'] - lefts[1]['diff'];
	var start2 = lefts[2]['start'] - lefts[2]['diff'];
	
	var start1b = start1 - breaks['1']['diff']/2;
	var start2b = start2 - breaks['2']['diff']/2;
	
	var start1c = start1 - breaks['1']['diff'];
	var start2c = start2 - breaks['2']['diff'];
	
	var stats = {
		'left1L' : lefts[1]['len'],
		'breaks1L' : breaks[1]['len'],
		'right1L' : rights[1]['len'],
		'left2L' : lefts[2]['len'],
		'breaks2L' : breaks[2]['len'],
		'right2L' : rights[2]['len'],
		'length1' : length1,
		'length2' : length2,
		'start1'  : start1,
		'start1b'  : start1b,
		'start1c'  : start1c,
		'start2'  : start2,
		'start2b'  : start2b,
		'start2c'  : start2c
	};
	// Then draw all rectangles
	var range = [ margin.left, Math.floor(sizes.win_width - margin.right)];
	var scale = d3.scale.linear().domain([ 0, max_len ]).range(range);
	
	stats.sep_left = Math.abs(lefts[1].end - start1);
	stats.sep_right = Math.abs(rights[1].start - start1c);
	
	// Legend
	var svg_legend = svg.append("g")
		.attr("id", "legend");
	draw_legend(svg_legend, stats, scale, data.break.sp1, data.break.sp2);
	
	// Genome 1
	var svg_genome1 = svg.append("g")
		.attr("id", "genome1");
	if (data.break.direction == -1) {
		draw_line(svg_genome1, 1, scale(start2b - breaks[2]['start']), scale(start2b - breaks[2]['end']), 'break_linker');
	} else {
		draw_line(svg_genome1, 1, scale(breaks[2]['start'] - start2b), scale(breaks[2]['end'] - start2b), 'break_linker');
	}
	draw_title(svg_genome1, data.break.sp1, 1);
	draw_genes_rectangles(svg_genome1, scale, start1, data.left_block.block1, lefts[1], 1, 1, 'left_block1', '#FAA');
	draw_genes_rectangles(svg_genome1, scale, start1b, data.break1, breaks[1], 1, 1, 'break1', '#AAF');
	draw_genes_rectangles(svg_genome1, scale, start1c, data.right_block.block1, rights[1], 1, 1, 'right_block1', '#FAA');
	
	// Genome 2
	var svg_genome2 = svg.append("g")
		.attr("id", "genome2");
	draw_title(svg_genome2, data.break.sp2, 2);
	draw_line(svg_genome2, 2, scale(breaks[1]['start'] - start1b), scale(breaks[1]['end'] - start1b), 'break_linker');
	draw_genes_rectangles(svg_genome2, scale, start2, data.left_block.block2, lefts[2], data.break.direction, 2, 'left_block2', '#FAA');
	draw_genes_rectangles(svg_genome2, scale, start2b, data.break2, breaks[2], data.break.direction, 2, 'break2', '#AAF');
	draw_genes_rectangles(svg_genome2, scale, start2c, data.right_block.block2, rights[2], data.break.direction, 2, 'right_block2', '#FAA');
	
	$(".gene").mouseenter(function() {
		d3.select(this).classed('rect_select', true);
		
		var href = $(this).parent().attr('href');
		$line = $(href).parent().parent().addClass('line_select');
	}).mouseleave(function() {
		d3.select(this).classed('rect_select', false);
		$('.line_select').removeClass('line_select');
	});
	
	$(".gene").parent().click(function(e) {
		e.preventDefault();
		
		// Color the corresponding gene and line as "clicked"
		var remove = false;
		if (d3.select(this).select('.gene').classed('rect_clicked')) {
			remove = true;
		}
		d3.select('.rect_clicked').classed('rect_clicked', false);
		
		if (!remove) {
			d3.select(this).select('.gene').classed('rect_clicked', true);
			// Move the focus in the center of the page, not at the top or wheresnot
			var o = $($(this).attr('href')).focus().offset().top;
			var $w = $(window);
			var diff = ($w.height() / 2);
			$w.scrollTop(o - diff);
		}
		
		var href = $(this).attr('href');
		$('.line_clicked').removeClass('line_clicked');
		if (!remove) {
			$line = $(href).parent().parent().addClass('line_clicked');
		}
	});
	
	// Add css style to the svg file + create a link to download it
	$.get("css/break_svg.css", function(css_text) {
			svg_style.html(css_text);
	
		// Add link to save image
		var html = d3.select("#canvas svg")
			.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.attr('xmlns:xmlns:xlink', "http://www.w3.org/1999/xlink")
			.node().parentNode.innerHTML;
		var $dlink = $('<a />')
			.attr('id', 'svg_clone')
			.attr( "download", get_par( "version" ) + "_break_" + data.break.breakid + ".svg" )
			.text('Download Image (SVG)')
			.css( { 'float': 'right' } );
		if ($('#svg_clone').length == 0) {
			$('#links').append( $dlink );
		}
		$('#svg_clone').attr('href', 'data:image/svg+xml;base64,'+ btoa(html)); //.attr('download', 'break.svg');
	});
}

function aligner_link() {
	var id = get_par("breakid");
	if (id) {
		url = urls.aligner + "?" + $.param( get_pars() );
		$( '#aligner_link' ).attr('href', url);
	}
}

function update_linked_width() {
	$('a').each(function(e) {
		var old_link = $(this).attr('href') || '';
		if (old_link == '') { return }
		var new_width = Math.floor($(window).width() * 0.8);
		var new_link = old_link.replace(/width=[0-9]+/, 'width=' + new_width);
		$(this).attr('href', new_link);
	});
}

function build_table (data, block, num, direction) {
	id = block + num;
	var antinum = (num == 1) ? 2 : 1;
	var genome = data.break[ "sp" + num ];
	var genes = [];
	if (block == "break") {
		genes = data[ block + num ];
	} else {
		genes  = data[ block + "_block" ][ "block" + num ];
	}
	// Reverse order if direction is reversed
	if ( block == "break" && num == 2 && data.break.direction == -1 ) {
		genes.reverse();
	}
	
	// Prepare orthos table
	var orthos = [];
	if ( block == "break" ) {
		var antigenes = data[ block + antinum ];
		for (g in antigenes) {
			if ( antigenes[g].pid ) {
				orthos.push( antigenes[g].pid );
			}
		}
	}
	
	// Table for a list of genes
	var $table = $( "#" + id );
	
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
		"name": "product",
		"title": "Predicted product",
		"desc": "Product predicted for this gene",
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
                "name": "loc_orientation",
                "title": "Strand",
                "desc": "Strand of the gene: sense = +, antisense = -"
        },
	{
		"name": "loc_length",
		"title": "Length",
		"desc": "Length of the gene, in amino-acids if it codes a protein, in base pairs otherwise",
	},
	{
		"name": "delta_GC",
		"title": "Diff GC ratio",
		"desc": "Difference between the GC ratio of the whole genome with the GC of each gene",
	},
	];
	colnames = ['Num', 'Blast<br />against', 'Gene ID', 'Product', 'Length', 'Start', 'End', '<abbr title="Difference between the GC of this sequence and the mean GC of the genome">dGC</abbr>'];
	
	// First header
	$header1 = $('<tr class="genome_header">');
	$header1.append($('<th colspan="' + heads.length + '">' + '<a class="tab_title">' + genome + '</a>' + '</th>'));
	$table.append( $header1 );
	
	// Second header
	$header2 = $('<tr>');
	for (h in heads) {
		var col = heads[h];
		$header2.append( $('<th>').html( "<abbr title='" + col.desc + "'>" + col.title + "</abbr>" ) );
	}
	$header2
		.find( "th:contains('search')" )
		.addClass("blast_col");
	$table.append( $header2 );
	
	// Count
	var min_loc = 99999999999;
	var max_loc = 0;
	
	// Add 1 row = 1 gene
	for (g in genes) {
		gene_data = genes[g];
                gene_data['loc_start'] = parseInt(gene_data['loc_start']);
		gene_data['loc_end'] = parseInt(gene_data['loc_end']);
		
		// Min, max
		if (min_loc > gene_data['loc_start']) {
			min_loc = gene_data['loc_start'];
		}
		if (min_loc > gene_data['loc_end']) {
			min_loc = gene_data['loc_end'];
		}
		if (max_loc < gene_data['loc_start']) {
			max_loc = gene_data['loc_start'];
		}
		if (max_loc < gene_data['loc_end']) {
			max_loc = gene_data['loc_end'];
		}
		if (max_loc < min_loc) {
			console.log("Warning: somehow min_loc and max_loc are reversed!");
		}
		
		// Product of the gene
		var product_name = gene_data['product'] ? gene_data['product'] : '-';
		var product_text = gene_data['feat'] == 'CDS' ? product_name : gene_data['feat'] + ' ' + product_name;
		var product = "<span class='product'>" + product_text + "</span>";
		// Length of protein or gene
                len_str = format_length(gene_data['feat'], gene_data['loc_length']);

		// Strand of the gene
		var dir = format_strand(gene_data['strand']);
                var dir_sign = dir.text();
                
		var seqid = make_seqid(gene_data, orthos);
		var blast_link = make_blast_link(gene_data, data.can_search);
		var gcbox = format_GC(gene_data.delta_GC);
		
                if (dir_sign == '+') {
                        temp_start_loc = format_number(gene_data['loc_start']);
                        temp_end_loc = format_number(gene_data['loc_end']);
                        
                } else if (dir_sign == '-') {
                        temp_start_loc = format_number(gene_data['loc_end']);
                        temp_end_loc = format_number(gene_data['loc_start']);
                }
                
		// Data list
		var list = [
			gene_data['pnum_all'],
			blast_link,
			seqid,
			product,
                        temp_start_loc,
                        temp_end_loc,
                        dir,
                        len_str,
			gcbox
		];
		
		$trow = $('<tr />');
		for (l in list) {
			var $td = $('<td />');
			$td.html(list[l]);
			if (l == 1) {
				$td.addClass("blast_col");
			}
			$trow.append($td);
		}
		if (gene_data['feat'] == 'tRNA') {
			$trow.addClass('trna');
		}
		if (!gene_data.product ||
			       gene_data.product.search(/^(conserved )?(hypothetical|putative|predicted) protein$/i) != -1) {
			$trow.find('.product').parent().addClass('putative');
		}
		$table.append($trow);
	}
	
	return $table;
}

function make_paralist(text) {
	var paras = text.split(/, */);
	for (var i = 0 ; i < paras.length ; i++ ) {
		var line = paras[i].split(/ /);
		line[0] = make_seq_link( line[0] );
		paras[i] = line.join(' ');
	}
	var equal = '<span class="paralog" title="A paralog">paralog: </span>';
	return equal + paras.join('<br />' + equal)
}

function make_seqid( gene_data, orthos ) {
	var seqid = $( "<span />" )
			.addClass( "geneid" )
			.attr( "id", clean_id(gene_data['pid']) );
	var seq_link = make_seq_link( gene_data.pid );
	var list_link = make_list_link(gene_data, "(list)");
	
	seqid.append( seq_link );
	seqid.append( " " );
	seqid.append( list_link );
	
	if (gene_data.paralogs_n > 0 || gene_data.ortho) {
		var addition = $("<div />").addClass("addition");
		if ( gene_data.paralogs_n > 0 ) {
			var pclass = "paralogs";
			var paralist = make_paralist(gene_data.paralogs);
			var para = '<span class="' + pclass + '">' + paralist + "</span>";
			addition.append( para );
		}

		if ( gene_data.ortho ) {
			var oclass = "ortho_out";
			if (orthos.indexOf( gene_data.ortho ) >= 0) {
				oclass = "ortho_in";
			}
			//var ortho = "<br /><span class='" + oclass + "'><span title='Best ortholog in the other genome'>↳&nbsp;</span>" + make_seq_link( gene_data.ortho );
			var ortho = "<br /><span class='" + oclass + "'><span title='Best ortholog in the other genome'>ortholog: </span>" + make_seq_link( gene_data.ortho );
			addition.append( ortho );
		}
		seqid.append( addition );
	}

	return $( "<div />" ).append( seqid.clone() ).html();
}

function build_tables( data) {
	build_table( data, "left", 1 );
	build_table( data, "left", 2 );
	build_table( data, "break", 1 );
	build_table( data, "break", 2 );
	build_table( data, "right", 1 );
	build_table( data, "right", 2 );
	$('#left_block').show();
	$('#breaks').show();
	$('#right_block').show();
}

function set_highlight_actions() {
	// Set hovering highlighting
	$('.genes tr').hover(function(e) {
		if ($(this).find('th').length == 0) {
			$(this).addClass('line_select');
		}
		
		// Get corresponding gene rectangle
		var id = $(this).find(".geneid").attr('id');
		d3.select('#canvas').select('.rect_' + id).classed('rect_select', true);
	}, function(e) {
		$(this).removeClass('line_select');
		d3.select('.rect_select').classed('rect_select', false);
	});
	
	// Set clicked highlighting
	$('.genes tr').click(function(e) {
		var remove = false;
		if ($(this).hasClass('line_clicked') || $(this).find('th').length > 0) {
			remove = true;
		}
		$('.line_clicked').removeClass('line_clicked');
		if (!remove) {
			$(this).addClass('line_clicked');
		}
		
		// Get corresponding gene rectangle
		d3.select('.rect_clicked').classed('rect_clicked', false);
		if (!remove) {
			var id = $(this).find(".geneid").attr('id');
			d3.select('#canvas').select('.rect_' + id).classed('rect_clicked', true);
		}
	});
}

function display_all(data) {
	// Only keep a limited number of blocks genes
	data = trim_data( data );

	draw_genes( data );
	build_tables( data );
	set_highlight_actions();
}

function dotplot_rectangle( data ) {
	// Get starts
	var lengths = {
		'left1': data.left_block.block1.length,
		'right1': data.right_block.block1.length,
		'left2': data.left_block.block2.length,
		'right2': data.right_block.block2.length,
	}
	var g1 = [
		data.left_block.block1[0].pnum_display,
		data.left_block.block1[ lengths.left1 - 1 ].pnum_display,
		data.right_block.block1[0].pnum_display,
		data.right_block.block1[ lengths.right1 - 1 ].pnum_display,
	];
	var g2 = [
		data.left_block.block2[0].pnum_display,
		data.left_block.block2[ lengths.left2 - 1 ].pnum_display,
		data.right_block.block2[0].pnum_display,
		data.right_block.block2[ lengths.right2 - 1 ].pnum_display,
	];
	
	var rect = {
		'start1': parseInt( d3.min( g1 ) ) - 50,
		'end1': parseInt( d3.max( g1 ) ) + 50,
		'start2': parseInt( d3.min( g2 ) ) - 50,
		'end2': parseInt( d3.max( g2 ) ) + 50,
	};
	
	return rect;
}

function text_stats(data) {
	var sp1 = data.break.sp1;
	var sp2 = data.break.sp2;
	var gpart1 = data.break.gpart1;
	var gpart2 = data.break.gpart2;
	var label = get_label(data.break);
	
	if (sp1 && sp2) {
		// Data used for the whole dotplot
		var dot_pars = {
			'sp1': sp1,
			'sp2': sp2,
			"break_min1": get_par( "break_min1" ),
			"break_min2": get_par( "break_min2" ),
			"conditional": get_par( "conditional" ),
			"strict": get_par( "strict" ),
			'version': get_par( "version" )
		};
		// Data used for the dotplot centered on the break
		var break_pars = $.extend( {}, dot_pars );
		break_pars.breakid = get_par( "breakid" );
		// Add the zoom on the dotplot, based on the break
		var break_dot_pars = dotplot_rectangle( data );
		$.extend( break_dot_pars, break_pars );
		
		// Add the link to the dotplot centered on the break
		$dot = $('<a />')
			.attr('href', format_url( urls.dotplot, break_dot_pars ) )
			.text('Dotplot of this break')
		$('#links')
			.append( $dot );
		
		// Add the link to the whole dotplot
		$dotmain = $('<a />')
			.attr('href', format_url( urls.dotplot, dot_pars ) )
			.text('Whole dotplot')
			.css( { 'margin-left': '2em' } );
		$('#links')
			.append( $dotmain );

		// Add the link to the ranking list
		$rank = $('<a />')
			.attr('href', format_url( urls.ranking,  break_pars ) )
			.text( 'General ranking' )
			.css( { 'margin-left': '2em' } );
		$('#links')
			.append( $rank )
			.show();
		$('#break_title').html('Synteny break <span title="' + get_par( "breakid" ) + '">' + label + '</span> between ' + sp1 + ' and ' + sp2);
		
		// Add some stats
		var nleft1 = data['left_block']['block1'].length;
		var nright1 = data['right_block']['block1'].length;
		
		var break_info1 = {
			"sp": sp1,
			"gpart": gpart1,
			"ngenes": data.break1.length,
			"nCDS": data.break.break_size2,
			"no_orthos": data.break.real_size2,
			"orthos": data.break.break_size2 - data.break.real_size2,
			"paros": data.break.paralogs1,
			"others": data.break1.length - data.break.break_size2,
			"content": data.break.content1,
			"delta_GC": data.break.delta_GC1,
		};
		
		// Break 1
		break_info(break_info1, 1);
		
		var break_info2 = {
			"sp": sp2,
			"gpart": gpart2,
			"ngenes": data.break2.length,
			"nCDS": data.break.break_size1,
			"no_orthos": data.break.real_size1,
			"orthos": data.break.break_size1 - data.break.real_size1,
			"paros": data.break.paralogs2,
			"others": data.break2.length - data.break.break_size1,
			"content": data.break.content2,
			"delta_GC": data.break.delta_GC2,
		};
		break_info(break_info2, 2);
		
		$("#intro").show();

		// Add the similar breaks
		for ( s in data.similar_breaks ) {
			var br = data.similar_breaks[ s ];
			var name = br.sp1 + " vs " + br.sp2 + " (" + br.break_size2 + " vs " + br.break_size1 + ")";
			var $opt = $( "<option />" ).val( br.breakid ).text( name );
			if ( br.breakid == get_par( "breakid" ) ) {
				$opt.attr( "selected", true );
			}
			$( "#similar_breaks" ).append( $opt );
		}
		var numsim = data.similar_breaks.length;
		if ( numsim == 1 ) {
			$( "#similar_num" ).text( "No similar breaks" );
			$( "#similar_breaks" ).hide();
		} else {
			$( "#similar_num" ).text( (numsim - 1) + " similar breaks:" );
		}

		// Add the list of overlapping breaks
		for ( n in data.overlapping_breaks ) {
			over_break = data.overlapping_breaks[n]
			var over_break_pars = $.extend( {}, dot_pars );
			over_break_pars.breakid = over_break.breakid;
			overlap_break_text = over_break.sp2 + " ("+ over_break.break_size2 + " vs " + over_break.break_size1 + " genes)"
			over_link = $('<a />')
				.attr('href', format_url( urls.break,  over_break_pars ) )
				.text( overlap_break_text )
			var $li = $( "<li />" ).append( over_link );
			$( "#overlapping_breaks" ).append( $li );
		}
		
		// Add link to the alignment page
		aligner_link();
		
		// Add the list of united nodes
		var graph_nodes = {};
		for ( n in data.graph ) {
			graph_nodes[ data.graph[n].from_name ] = 1;
		}
		for ( node in graph_nodes ) {
			name = node.replace(/ /g, " / ");
			var $li = $( "<li />" ).text( name );
			$( "#united_nodes" ).append( $li );
		}
		
		// Info: cycle or node
		if (data.break.cycle > 0) {
			// Todo when I have the clique info, not just cycle
		}
	}
	
	update_graph(data);
}

function update_graph(data) {
	//$('#united_graph').hide();
	var width = 600,
	    height = 250;
	var svg = d3.select('#united_graph')
		.append('svg')
		.attr('width', width)
		.attr('height', height);
	
	var nodes = {};
	var links = [];
	var nodes_names = {};
	var n = 0;
	for (node in data.graph) {
		noded = data.graph[node];
		var link = {
			source: noded.from_name,
			target: noded.to_name,
			value: 1,
		};
		links[ n ] = link;
		n++;
	}
	/*
	var m = 0;
	for (id in nodes_names) {
		console.log( id );
		var node = {
			id: id,
			name: nodes_names[ id ],
			reflexive: true
		};
		nodes[ id ] = node;
		m++;
	}
	*/
	
	links.forEach(function(link) {
		link.source = nodes[link.source] || 
			(nodes[link.source] = {name: link.source});
		link.target = nodes[link.target] || 
			(nodes[link.target] = {name: link.target});
		link.value = +link.value;
	});
	
	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.links(links)
		.size([width*1/2, height])
		.charge(-120)
		.linkDistance(120)
		.start();
	
	var link = svg.selectAll( ".link" )
		.data( force.links() )
		.enter()
		.append( "line" )
		.attr( "class", "link" );
	
	var node = svg.selectAll( ".node" )
		.data( force.nodes() )
		.enter()
		.append( "g" )
		.call( force.drag );
	
	var circle = node
		.append( "circle" )
		.attr( "class", "node" )
		.attr( "r", 5 );
	
	var text = node.append( "text" )
		.attr( "x", 10 )
		.attr( "dy", ".35em" )
		.text(function(d) { return d.name.replace(/ /g, ' / '); });
	
	node.append( "title" )
		.text(function(d) { return d.name.replace(/ /g, ' / '); });
	
	force.on("tick", function() {
	    
	    link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	});
}

function break_info(info, num) {
	var $break = $('#description' + num).text( 'Genomic island in ' + info.sp + ' (part ' + info.gpart + '):' );
	var $ul = $('<ul />');

	var genes = 'no genes';
	if ( info.ngenes == 1 ) {
		genes = "1 gene";
	} else if (info.ngenes > 1) {
		genes = info.ngenes + " genes";
	}
	$ul.append( $('<li />').text( genes ) );
	var $ul2 = $( '<ul />' );
	var nCDS = "no CDS";
	if (info.nCDS > 0) {
		nCDS = info.nCDS + " CDS";
	}
	$ul2.append( $('<li />').text( nCDS ) );
	if (info.nCDS > 0) {
		$cds_ul = $( '<ul />' );
		$cds_ul.append( $('<li />').html( info.no_orthos + " <span class='legend_noortho" + num + "'>CDS without ortholog</span>" ) );
		$cds_ul.append( $('<li />').html( info.orthos + " <span class='legend_ortho" + num + "'>CDS with ortholog</span>" ) );
		if (info.paros > 0) {
			$cds_ul.append( $('<li />').html( info.paros + " <span class='legend_paro" + num + "'>CDS with paralogs</span>" ) );
		}
		$ul2.append( $cds_ul );
	}
	
	if (info.others > 0) {
		var nothers = "1 other gene (including <span class='legend_other'>RNAs</span> and <span class='legend_pseudo'>pseudogenes</span>)";
		if (info.others > 1) {
			nothers = info.others + " other genes (including <span class='legend_other'>RNAs</span> and <span class='legend_pseudo'>pseudogenes</span>)";
		}
		$ul2.append( $('<li />').html( nothers ) );
	}
	$ul.append($ul2);
	
        if (info.content) {
                const array_gene_add = ['CRISPR', 'phage', 'regulatory', 'resistance', 'transport'];
                const array_element_add = ['mobile'];
                const array_no_add = ['SM', 'tRNA'];
                var new_info = [];
                var handler_info = info.content;
                var array_info = handler_info.split( "," );
                for (var item in array_info) {
                        var handler = array_info[item].split( " " );
                        // remove space
                        if (handler.length == 3){
                                handler.shift();
                        }
                        // plural
                        var plural = ''
                        if (handler[0] > 1){
                                var plural = 's';
                        }
                        if (array_gene_add.includes(handler[1])) {
                                var handler = handler.concat('gene' + plural);
                        }
                        else if (array_element_add.includes(handler[1])) {
                                var handler = handler.concat('element' + plural);
                        }
                        var new_handler = handler.join(' ');
                        new_info.push(new_handler);
                }
                var temp_info = new_info.join( ', ' )
                $ul.append( $('<li />').html( "Notable content: " +  temp_info) );
        }
        
	if (info.nCDS > 0) {
		// Add GC content stats
		var $gc_line = $("<li />");
		console.log(info);
		var gc = 'GC content diff: ' + (info.delta_GC > 0 ? "+" : '') + (info.delta_GC * 100).toFixed(1) + "%";
		$gc_line.append(gc);
		$ul.append( $gc_line );
		
		// Add link to fasta sequences
		var $fasta_line = $("<li />");
		var $fasta_link = $("<a>All protein sequences in fasta</a>").attr("href", format_url(urls.seq, {
			'breakid': get_par( "breakid" ),
			'sp': info.sp,
			'version': get_par( "version" ),
		}));
		$fasta_line.append( $fasta_link );
		$ul.append( $fasta_line );
	}
	$break.append( $ul );
}

function hide_content() {
}

$(function() {
	// First get the url parameters
	set_pars( get_url_parameters() );
	
	// Then retrieve the data for this break
	if ( get_par( "breakid" ) ) {
		var pars = get_pars();
		pars['type'] = 'break';
		loading_on();
		$("#data_content").hide();
		$.getJSON( urls.get_data, pars, function( data ) {
			// Error
			if (data['outcome'] == false) {
				$error = $('<span />').text('Error: ' + data['message']).attr('title', data['details']);
				$('#message').append($error);
				$('#message').show();
			// Create the page with the data
			} else {
				cached_data = data;
				console.log(data);
				$("#data_content").show();
				text_stats(data);
				display_all(data);
				$(window).resize(function(e) {
					update_linked_width();
					draw_genes(data);
				});
			}
			loading_off();
		}).fail(function() {
			$( "#message" ).text("Error: data retrieval failed");
			console.log(urls.get_data + '?' + $.param(pars));
			loading_off();
		});
	}
	
	// Keep the canvas at the top of the page
	$(window).on('scroll', function() {
		$canvas = $('#canvas');
		if (canvas_top == 0 || canvas_left == 0) {
			canvas_top = $canvas.offset().top;
			canvas_left = $canvas.offset().left;
			$top_canvas = $('<div />').height($canvas.height());
		}
		
		if ($(window).scrollTop() > canvas_top) {
			// Leave the top canvas behind
			$canvas.before($top_canvas);
			$canvas.addClass('top_canvas').css({
				'margin-left' : canvas_left
			})
		} else {
			$top_canvas.remove();
			$canvas.removeClass('top_canvas').removeAttr('style');
		}
	});

	$( ".swap" ).click(function(event) {
		event.preventDefault();
		var swap = cached_data;
		if (cached_data.break.opposite) {
			change_break(cached_data.break.opposite);
		} else {
			$( this ).hide();
		}
	});
	$( "#similar_breaks" ).change(function(event) {
		event.preventDefault();
		change_break( $( this ).val(), true );
	});
});

function change_break( breakid, new_window ) {
	var url_pars = get_url_parameters();
	url_pars.breakid = breakid;
	var new_url = format_url(urls.current, url_pars);
	console.log("Changing to break " + breakid + " : " + new_url);
	if (new_window ) {
		window.open( new_url );
	} else {
		window.location.replace( new_url );
	}
}

