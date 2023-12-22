var canvas_top = 0, canvas_left = 0;
$top_canvas = null;
var width_percent = 0.99;

var margin = {
	"top": 10,
	"left": 10,
	"bottom": 10,
	"right": 10,
	"top_draw": 20,
};

var size = {
	'width': {
		'canvas': 0,
		'canvas_pc': 0.99,
		'draw_zone': 0,
		'legend': 0,
		'legend_pc': 0.10,
		'left': 0,
		'left_pc': 0.10,
		'break': 0,
		'break_pc': 0.70,
		'right': 0,
		'right_pc': 0.10,
	},
	'height': {
		'canvas': 0,
		'draw_zone': 0,
		'seq': 60,
		'sep': 10,
		'gene': 20,
	}
};

init_pars( {
	'break_min1': 0,
	'break_min2': 0,
	'conditional': 'AND',
	'strict': 0,
	'breakid': 0,
	'trim': 10,
});

function best_ratio(data) {
	// First, get max seq
	var max = 0;
	for( i in data.genomes ) {
		var diff = get_max(data.genomes[i].genes.break);
		if (diff > max) {
			max = diff;
		}
	}
	// The ratio is this max / length of the window
	var ratio = max / size.width.break;
	return ratio;
}

function get_max(genes) {
	if (genes.length == 0) {
		return 0;
	}
	var min = genes[0].loc_start, max = genes[0].loc_end;
	for (var g in genes) {
		if( genes[g].loc_start < min ) {
			min = genes[g].loc_start;
		}
		if( genes[g].loc_end > max ) {
			max = genes[g].loc_end;
		}
	}
	return max - min;
}

function draw_alignment(data) {
	console.log(data);
	// Number of sequences in the alignment
	var num = Object.keys(data.genomes).length;
	
	// Remove any previous svg
	$('#canvas svg').remove();
	
	// Canvas width: whole screen
	size.width.canvas = Math.floor($('#canvas').width() * size.width.canvas_pc);
	if (size.width.canvas == 0) {
		size.width.canvas = Math.floor($(window).width() * size.width.canvas_pc);
	}
	size.width.draw_zone = size.width.canvas - margin.left - margin.right;
	size.width.legend = size.width.draw_zone * size.width.legend_pc;
	size.width.left = size.width.draw_zone * size.width.left_pc;
	size.width.right = size.width.draw_zone * size.width.right_pc;
	size.width.break = size.width.draw_zone * size.width.break_pc;
	
	// Height: based on the number of sequences to align
	size.height.draw_zone = num * (size.height.seq) + (num - 1) * size.height.sep;
	size.height.canvas = size.height.draw_zone + margin.top + margin.bottom;
	
	// Scale: find the ratio to draw all genes at the same best scale
	var ratio = best_ratio(data);
	
	// Create a new svg
	var svg = d3
		.select("#canvas")
		.append("svg")
		.attr("width", size.width.canvas)
		.attr("height", size.height.canvas);
	svg.append('style').attr('type','text/css');
	
	// Create the draw_zone
	var draw_zone = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	draw_zone
		.append( "rect" )
		.attr("class", "draw_zone")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", size.width.draw_zone)
		.attr("height", size.height.draw_zone);
	
	// Add background
	canvas_background(draw_zone);
	
	// Order
	var order = [ data.ref ];
	for (g in data.genomes) {
		if (g != order[0]) {
			order.push( g );
		}
	}
	
	// Draw each sequence in turn
	var i = 0;
	for (var g in order) {
		// Draw zone of the sequence
		var y_trans = i * (size.height.seq + size.height.sep);
		var seq = draw_zone.append("g")
			.attr("transform", "translate(0," + y_trans + ")");
		if (i === 0) {
			seq.attr("class", "genome1");
		} else {
			seq.attr("class", "genome2");
		}
		
		// Draw left, break and right parts
		draw_parts(seq, data.genomes[order[g]], ratio);
		i++;
	}
	
	// Add legends
	draw_legends(draw_zone, data.genomes, order);
	draw_margins(svg);
}

function draw_parts(seq, data, ratio, direction) {
	var types = ["left", "break", "right"];
	for (t in types) {
		var direction = seq.attr("class") == "genome1" ? 1 : data.data.direction;
		draw_part(seq, data, ratio, types[t], direction);
	}
}

function draw_part(seq, data, ratio, type, direction) {
	// determine the scale based on the ratio
	var rescale = part_rescale(data, ratio, type, direction);
	
	var part = seq.append("g").attr("class", type);
	if (type == "break") {
		part.attr("transform", "translate(" + (size.width.legend + size.width.left) + "," + size.height.seq/2 + ")");
	} else if (type == "left") {
		part.attr("transform", "translate(" + size.width.legend + "," + size.height.seq/2 + ")");
	} else if (type == "right") {
		part.attr("transform", "translate(" + (size.width.legend + size.width.left + size.width.break) + "," + size.height.seq/2 + ")");
	}
	// Draw the genes
	draw_genes(part, data.genes[type], rescale.scale, type, direction);
	// Add a background line
	if (type == "break") {
		draw_break_line(part);
	}
	draw_line(part, rescale.range);
	return part;
}

function part_rescale(data, ratio, type, direction) {
	var genes = data.genes[type];
	var ext = get_ext(genes, type);
	
	var range = [];
	var domain = [ext.min, ext.max];
	var length = ext.max - ext.min;
	var diff = 0;
	if (type == "break") {
		// Default full range
		range = [0, size.width.break];
		// Adapt the range to have the same scale in every graph
		var sizedom = domain[1] - domain[0];
		var sizeran = range[1] - range[0];
		var actualW = sizedom / ratio;
		// Center
		range = [(sizeran - actualW)/2, (sizeran + actualW)/2 ];
		length = actualW;
	} else if (type == "left") {
		range = [0, size.width.left];
		var sizedom = domain[1] - domain[0];
		var sizeran = range[1] - range[0];
		var actualW = sizedom / ratio;
		// Align to right
		range = [(sizeran - actualW), sizeran ];
		length = actualW;
	} else if (type == "right") {
		range = [0, size.width.right];
		var sizedom = domain[1] - domain[0];
		var sizeran = range[1] - range[0];
		var actualW = sizedom / ratio;
		// Align to left
		range = [0, actualW ];
		length = actualW;
		diff = 0;
	}
	// Reverse range if the break is reversed
	if (direction == -1) {
		range = range.reverse();
	}
	
	var scale = d3.scale.linear().domain( domain ).range( range );
	var rescale = {
		'scale': scale,
		'size': length,
		'diff': diff,
		'range': range
	};
	return rescale;
}

function get_ext(data, type) {
	var genes = data;
	var ext = { "min":0, "max":0 };
	if (!genes || !genes[0]) {
		return ext;
	} else {
	       	ext.min = genes[0].loc_start;
		ext.max = genes[0].loc_end;
	}
	for (var g in genes) {
		if (genes[g].loc_start < ext.min) {
			ext.min = genes[g].loc_start;
		}
		if (genes[g].loc_end > ext.max) {
			ext.max = genes[g].loc_end;
		}
	}
	return ext;
}

function draw_line(part, range) {
	// Draw_line
	part.append("line")
		.attr("class", "genome_line")
		.attr("x1", range[0])
		.attr("x2", range[1])
		.attr("y1", 0)
		.attr("y2", 0);
}

function draw_break_line(part) {
	// Draw_line
	part.append("line")
		.attr("class", "break_linker")
		.attr("x1", 0)
		.attr("x2", size.width.break)
		.attr("y1", 0)
		.attr("y2", 0);
}


function draw_part_line(part, type, diff) {
	if (type == "break") {
		
	}
	// Draw_line
	part.append("line")
		.attr("class", "genome_line")
		.attr("x1", 0)
		.attr("x2", size.width[type])
		.attr("y1", 0)
		.attr("y2", 0);
}

function draw_genes(part, genes, scale, type, direction) {
	var gdata = part.selectAll("polygon")
		.data(genes)
		.enter()
		.append("polygon");
	var arrow_height = 20;
	gdata
			.attr("points", function(d) {
				
				// Backward?
				var back = false;
				if (d.strand == -1) {
					back = true;
				}
				
				var ytop = 0;
				var ybot = -arrow_height;
				var ymid = -arrow_height / 2;
				//var yartop = ytop - 5;
				//var yarbot = ybot + 5;
				if (back && direction == 1 || !back && direction == -1) {
					ybot = -ybot;
					ymid = -ymid;
					//yartop = -yartop;
					//yarbot = -yarbot;
				}
				
				// Same strand and direction: positive width; negative otherwise
				var width = parseInt( scale( d.loc_end ) - scale( d.loc_start ));
				
				// X positions (=direction of the arrow)
				var xstart = back ? width : 0;
				var xend = back ? xstart - width : xstart + width;
				var xmid = back ? xstart - width*0.8 : xstart + width*0.8;
				
				// Arrow points final coordinates
				var points = [
					xstart + ',' + ytop,
					xmid   + ',' + ytop,
					//(margin.left + scale(xmid))   + ',' + (margin.top + yartop),
					xend   + ',' + ymid,
					//(margin.left + scale(xmid))   + ',' + (margin.top + yarbot),
					xmid   + ',' + ybot,
					xstart + ',' + ybot,
				];
				
				// Use those points as the arrow points
				return points.join(' ');
			})
			.attr("transform", function(d) {
				return "translate(" + scale(d.loc_start) + ",0)";
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
}

function canvas_background(svg) {
	svg
		.append( "rect" )
		.attr("class", "flank_zone")
		.attr("x", size.width.legend)
		.attr("y", 0)
		.attr("width", size.width.left)
		.attr("height", size.height.draw_zone);
	svg
		.append( "rect" )
		.attr("class", "flank_zone")
		.attr("x", size.width.legend + size.width.left + size.width.break)
		.attr("y", 0)
		.attr("width", size.width.right)
		.attr("height", size.height.draw_zone);
	return svg;
}

function draw_legends(svg, data, order) {
	// Legend background
	svg
		.append( "rect" )
		.attr("class", "white")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", size.width.legend)
		.attr("height", size.height.draw_zone);
	
	var legend = svg.append("g").attr("class", "legend");
	var i = 0;
	for (g in order) {
		var diff = i * (size.height.seq + size.height.sep) + size.height.seq/2;
		var bid = data[order[g]].data.breakid;
		var sp1 = data[order[g]].data.sp1;
		var sp2 = data[order[g]].data.sp2;
		var pars = get_pars();
		pars.breakid = bid;
		var url = urls.break + "?" + $.param( pars );
		var link = legend
			.append("svg:a")
			.attr("xlink:href", url)
			.attr( "class", "line_title" )
			.attr( "x", 0 )
			.attr( "y", 0 )
			.attr( "transform", "translate(0," + diff + ")" )
			.attr("title", "View this break in detail: " + sp1 + " vs " + sp2);
		link
			.append("text")
			.text( order[g] );
		i++;
	}
}

function draw_margins(svg) {
	// Left margin
	svg
		.append( "rect" )
		.attr("class", "white")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", margin.left)
		.attr("height", size.height.canvas);
	svg
	// Right margin
		.append( "rect" )
		.attr("class", "white")
		.attr("x", size.width.canvas - margin.right)
		.attr("y", 0)
		.attr("width", margin.right)
		.attr("height", size.height.canvas);
	// Top margin
	svg
		.append( "rect" )
		.attr("class", "white")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", size.width.canvas)
		.attr("height", margin.top);
	// Top margin
	svg
		.append( "rect" )
		.attr("class", "white")
		.attr("x", 0)
		.attr("y", size.height.canvas - margin.bottom)
		.attr("width", size.width.canvas)
		.attr("height", margin.bottom);
}

$(function() {
	// First get the url parameters
	set_pars( get_url_parameters() );
	
	// Create a breaks alignment
	if ( get_par( "breakid" ) ) {
		var pars = get_pars();
		pars['type'] = 'break_group';
		loading_on();
		// Add link back to the ranking
		$rank = $('<a />')
			.attr('href', format_url( urls.ranking,  get_pars() ) )
			.text( 'General ranking' )
			.css( { 'margin-left': '2em' } );
		$('#links')
			.append( $rank )
			.show();
		$.getJSON( urls.get_data, pars, function( data ) {
			// Error
			if (data['outcome'] == false) {
				$error = $('<span />').text('Error: ' + data['message']).attr('title', data['details']);
				$('#message').append($error);
				$('#message').show();
			// Create the page with the data
			} else {
				cached_data = data;
				draw_alignment(data);
				
				$(window).resize(function(e) {
					draw_alignment(data);
				});
			}
			loading_off();
		}).fail(function() {
			$( "#message" ).html("<span>Error: data retrieval failed.</span>");
			console.log(urls.get_data + '?' + $.param(pars));
			loading_off();
		});
	}
});

