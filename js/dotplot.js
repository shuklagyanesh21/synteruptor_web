var width_percent = 1;
var height_percent = 1;
var cached_genomes = {};
var okdb = false;
var cached_data = {};
var cached_data_ajax = null;
var cached_sp1 = '';
var cached_sp2 = '';
init_pars( {
	'sp1': '',
	'sp2': '',
	'start1' : 0,
	'end1': 10000,
	'start2': 0,
	'end2': 10000,
	'break_min1': 15,
	'break_min2': 15,
	'conditional' : 'OR',
	'show_trnas': false,
	'show_orthos': true,
	'show_goc': true,
	'show_breaks_circles': true,
	'show_breaks_rects': true,
	'breakid': '',
	'strict': 10
});
const goc = {
    left: 80,
    right: 40,
    width: 200,
    "top": 20,
    bottom: 40,
    height: 200
};
const dot_margin = {
    "top": 30,
    right: 60,
    bottom: goc.top + goc.bottom,
    left: goc.left + goc.right
};
var margin = {};

var scales = {};
var zoom_vals = {};
storage = $.localStorage;
//storage.removeAll();

function update_ranking_link() {
	var pars = {
		"sp1": get_par( "sp1" ),
		"sp2": get_par( "sp2" ),
		"break_min1": get_par( "break_min1" ),
		"break_min2": get_par( "break_min2" ),
		"conditional": get_par( "conditional" ),
		"version": get_par( "version" ),
		"strict": get_par( "strict" ),
	};
	$( "#ranking" )
		.attr('href', format_url( urls.ranking, pars ) )
		//.text( "Ranking" )
		.show();
}

function zoomed( svg, container, xAxis, yAxis ) {
	svg.select(".x.axis").call(xAxis);
	svg.select(".y.axis").call(yAxis);
	container.selectAll("line, rect, circle")
		.attr("transform", "translate(" + (d3.event.translate) + ")");
}

function in_area(point, num) {
	if (point >= get_par( 'start'+num ) &&
			point <= get_par( 'end'+num )) {
		return true;
	} else {
		return false;
	}
}

function update() {
	get_menu_pars();
	draw_plot();
}

function draw_plot() {
	if (!okdb) return;
	update_permalink();
	update_ranking_link();
	$( "#svg_clone" )
		.attr( "href", "" )
		.attr( "download", "" )
		.html( "Prepare&nbsp;SVG" );
	var data = cached_data;
	win_width = Math.floor( $( '#canvas' ).width() * width_percent );
        if (win_width == 0) {
                win_width = Math.floor( $( window ).width() * width_percent );
        }
	win_height = Math.floor( $( '#canvas' ).height() * height_percent );
        if (win_height == 0) {
                win_height = Math.floor( $( window ).height() * height_percent );
        }
	var offset = $("#canvas").offset();

	var stats = {
		'orthos': 0,
		'blocks': 0,
		'breaks': 0
	};
	
	// CREATE THE SVG
	$('#canvas').empty();
        var svg = d3.select( "#canvas" )
		.append( "svg" )
		.attr( "id", "dotplot" )
		.attr( "width", win_width )
		.attr( "height", win_height );
	var svg_style = svg.append('style')
		.attr('type','text/css');
	svg.append("g").attr("name", "svgbg")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", win_width)
		.attr("height", win_height)
		.attr( { "fill" : "transparent"});

        // Change margins if we need to draw the GOC lines
        margin = {
            "left": dot_margin.left,
            "right": dot_margin.right,
            "top": dot_margin.top,
            "bottom": dot_margin.bottom,
        };
        
        // Shift the dotplot to make way for the GOC plots
        if (get_par("show_goc")) {
            margin.left += goc.width;
            margin.bottom += goc.height;
        }
	
	// Scale data to the plot
	scales['x'] = d3.scale.linear().domain( [ get_par( 'start1' ), get_par( 'end1'   ) ] ).range( [ 0, win_width  - margin.left - margin.right  ] );
	scales['y'] = d3.scale.linear().domain( [ get_par( 'end2'   ), get_par( 'start2' ) ] ).range( [ 0, win_height - margin.top  - margin.bottom ] );
	scales['xback'] = d3.scale.linear().domain( [ 0, win_width  - margin.left - margin.right  ] ).range( [ get_par( 'start1' ), get_par( 'end1' )   ] );
	scales['yback'] = d3.scale.linear().domain( [ 0, win_height - margin.top  - margin.bottom ] ).range( [ get_par( 'end2'   ), get_par( 'start2' ) ] );
	scales['width']  = d3.scale.linear().domain( [ 0, get_par( 'end1' ) - get_par( 'start1' ) ] ).range( [ 0, win_width - margin.left - margin.right  ] );
	scales['height'] = d3.scale.linear().domain( [ 0, get_par( 'end2' ) - get_par( 'start2' ) ] ).range( [ 0, win_height -margin.top - margin.bottom ] );
	
	var container = svg.append("g")
		.attr("name", "drawing")
		.attr("id", "drawing")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	container.append( "rect" )
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", win_width - margin.left - margin.right )
		.attr("height", win_height - margin.top - margin.bottom )
		.attr( { "fill" : "white"});

	// Draw grid
	var gparts = container.append("g").attr("name", "gparts");

	gparts.append("g")
		.selectAll( "line" )
		.data( cached_genomes.gparts[ get_par( 'sp1' ) ] )
		.enter()
		.append( "line" )
		.filter(function(d) { return d.max >= get_par( 'start1' ) && d.max <= get_par( 'end1' ) })
		.attr("x1", function(d) { return scales.x( d.max ) })
		.attr("x2", function(d) { return scales.x( d.max ) })
		.attr("y1", scales.y( get_par( 'start2' ) ))
		.attr("y2", scales.y( get_par( 'end2' ) ))
		.attr("class", "gpart_line");
		
	gparts.append("g")
		.attr("name", "gparts")
		.selectAll( "line" )
		.data( cached_genomes.gparts[ get_par( 'sp2' ) ] )
		.enter()
		.append( "line" )
		.filter(function(d) { return d.max >= get_par( 'start2' ) && d.max <= get_par( 'end2' ) })
		.attr("y1", function(d) { return scales.y( d.max ) })
		.attr("y2", function(d) { return scales.y( d.max ) })
		.attr("x1", scales.x( get_par( 'start1' ) ))
		.attr("x2", scales.x( get_par( 'end1' ) ))
		.attr("class", "gpart_line");
	
	// Draw trnas
	var trnas = container.append("g").attr("id", "trnas_lines");
	if (get_par( 'show_trnas' ) == false) {
		trnas.style({ "display": "none" });
	}

	trnas.append("g")
		.selectAll( "line" )
		.data( cached_data.trnas[1] )
		.enter()
		.append( "line" )
		.filter(function(d) { return d.pnum_display >= get_par( 'start1' ) && d.pnum_display <= get_par( 'end1' ) })
		.attr("x1", function(d) { return scales.x( d.pnum_display ) })
		.attr("x2", function(d) { return scales.x( d.pnum_display ) })
		.attr("y1", scales.y( get_par( 'start2' ) ))
		.attr("y2", scales.y( get_par( 'end2' ) ))
		.attr("class", "trna_line");
	trnas.append("g")
		.selectAll( "line" )
		.data( cached_data.trnas[2] )
		.enter()
		.append( "line" )
		.filter(function(d) { return d.pnum_display >= get_par( 'start2' ) && d.pnum_display <= get_par( 'end2' ) })
		.attr("y1", function(d) { return scales.y( d.pnum_display ) })
		.attr("y2", function(d) { return scales.y( d.pnum_display ) })
		.attr("x1", scales.x( get_par( 'start1' ) ))
		.attr("x2", scales.x( get_par( 'end1' ) ))
		.attr("class", "trna_line");
	
	// Draw break rectangles
	var grects = container
		.append("g")
		.attr("id", "break_rectangles");
	if (get_par( 'show_breaks_rects' ) == false) {
		grects.style({ "display": "none" });
	}
	var rects = grects
		.selectAll( "rect" )
		.data( d3.keys( data.breaks ) )
		.enter()
		.append("svg:a")
			.attr("xlink:href", function(d) {
				var break_pars = {
					'breakid': data.breaks[d].breakid,
					'break_min1': get_par( "break_min1" ),
					'break_min2': get_par( "break_min2" ),
					'conditional': get_par( "conditional" ),
					'version': get_par( "version" )
				};
				return format_url( urls.break, break_pars );
		       })
			.attr("title", function(d) { return get_label( data.breaks[d] ); })
		.append( "rect" )
		.filter(function(d) {
			dat = data.breaks[d];
			return (
					in_area( dat.pnum_display_left1, 1) && in_area( dat.pnum_display_left2, 2 ) ||
					in_area( dat.pnum_display_left1, 1) && in_area( dat.pnum_display_right2, 2 ) ||
					in_area( dat.pnum_display_right1, 1) && in_area( dat.pnum_display_left2, 2 ) ||
					in_area( dat.pnum_display_right1, 1) && in_area( dat.pnum_display_right2, 2 )
				)
		});
	var rects_attr = rects
		.filter(function(d) {
		return break_filter( data.breaks[ d ] );
		})
		.attr('x', function(d) { return scales.x( data.breaks[d].pnum_display_left1 < data.breaks[d].pnum_display_right1 ? data.breaks[d].pnum_display_left1 : data.breaks[d].pnum_display_right1 ); })
		.attr('y', function(d) { return scales.y( data.breaks[d].pnum_display_left2 > data.breaks[d].pnum_display_right2 ? data.breaks[d].pnum_display_left2 : data.breaks[d].pnum_display_right2 ); })
		.attr('width', function(d) { return scales.width( Math.abs( data.breaks[d].pnum_display_left1 - data.breaks[d].pnum_display_right1 ) ); })
		.attr('height', function(d) { return scales.height( Math.abs( data.breaks[d].pnum_display_left2 - data.breaks[d].pnum_display_right2 ) ); })
		.attr('id', function(d) { stats.breaks++; return "r" + data.breaks[d].breakid; })
		.attr('name', function(d) { return get_label(data.breaks[d]); })
		.attr('class', "break_rect");
	
	// Add bubble
	var breaksr = $(".break_rect").each(function() {
		$( this ).mouseover(function(e) {
			$bub = $('<div>').attr('id', 'bubble');
			$bub.css({'top' : e.pageY - 40 -offset.top, 'left' : e.pageX + 10 - offset.left});
			name = $(this).attr('name');
			nameid = $(this).attr('id').substring(1);
			dat = data.breaks[ nameid ];
			$bub.append('<span>Break ' + name + ':<br />' + dat.break_size2 + ' CDS in ' + get_par( 'sp1' ) + '<br />' + dat.break_size1 + ' CDS in ' + get_par( 'sp2' ) + '</span>');
			$bub.appendTo('#canvas');
		}).mouseout(function(e) {
			$('#bubble').remove();
		});
	});
	
	// Draw orphan orthologs points
	var pointsg = container
		.append( "g" )
		.attr("id", "orthos_points");
	if (get_par( 'show_orthos' ) == false) {
		pointsg.style({ "display": "none" });
	}
	
	var points = pointsg
		.selectAll( "circle" )
		.data( d3.keys( data.orthos ) )
		.enter()
		.append( "circle" )
		.filter(function(d) {
			return in_area( data.orthos[d].pnum_display1, 1)
				&& in_area( data.orthos[d].pnum_display2, 2 )
		});
	var points_attr = points
		.attr('cx', function(d) { return scales.x( data.orthos[d].pnum_display1 ); })
		.attr('cy', function(d) { return scales.y( data.orthos[d].pnum_display2 ); })
		.attr('r', 3)
		.attr('class', "ortho_points")
		.attr('name', function(d) { stats.orthos++; return data.orthos[d].oid; });
	// Add bubble
	var points = $("#orthos_points").children().each(function() {
		$( this ).mouseover(function(e) {
			$bub = $('<div>').attr('id', 'bubble');
			$bub.css({'top' : e.pageY - 40 - offset.top, 'left' : e.pageX + 10 - offset.left});
			name = $(this).attr('name');
			var dat = data.orthos[ name ];
			$bub.append('<span>' + dat.pid1 + " = " + dat.product1 + "<br />" + dat.pid2 + " = " + dat.product2 + '</span>');
			$bub.appendTo('#canvas');
		}).mouseout(function(e) {
			$('#bubble').remove();
		});
	});
	
	// Draw block lines
	var lines = container
		.append( "g" )
		.attr( "name", "block_lines" )
		.selectAll( "line" )
		.data( data.blocks )
		.enter()
		.append( "line" )
		.filter(function(d) {
			return (
					in_area( d.pnum_display_start1, 1)
					&& in_area( d.pnum_display_start2, 2 )
				) || (
					in_area( d.pnum_display_end1, 1)
					&& in_area( d.pnum_display_end2, 2 )
				)

		});
	var lines_attr = lines
		.attr('x1', function(d) { return scales.x( d.pnum_display_start1 ); })
		.attr('y1', function(d) { return scales.y( d.pnum_display_start2 ); })
		.attr('x2', function(d) { return scales.x( d.pnum_display_end1 ); })
		.attr('y2', function(d) { return scales.y( d.pnum_display_end2 ); })
		.attr('name', function(d) { stats.blocks++; return d.blockid; })
		.attr('class', "block_lines");
	
	// Draw break circles
	var circlesg = container
		.append("g")
		.attr( "id", "breaks_circles" );
	if (get_par( 'show_breaks_circles' ) == false) {
		circlesg.style({ "display": "none" });
	}

	var circles = circlesg
		.selectAll( "circle" )
		.data( d3.keys( data.breaks ) )
		.enter()
		.append("svg:a")
			.attr("xlink:href", function(d) {
				var break_pars = {
					"break_min1": get_par( "break_min1" ),
					"break_min2": get_par( "break_min2" ),
					"conditional": get_par( "conditional" ),
					'breakid': data.breaks[d].breakid,
					'version': get_par( "version" )
				};
				return format_url( urls.break, break_pars );
		       })
		.append( "circle" )
		.filter(function(d) {
			dat = data.breaks[d];
			return in_area( (dat.pnum_display_left1 + dat.pnum_display_right1)/2, 1) &&
				in_area( (dat.pnum_display_left2 + dat.pnum_display_right2)/2, 2)
		});
	
	var circle_attr = circles
		.filter(function(d) {
			return break_filter( data.breaks[ d ] );
		})
		.attr('cx', function(d) { return scales.x( (data.breaks[d].pnum_display_left1 + data.breaks[d].pnum_display_right1) / 2 ); })
		.attr('cy', function(d) { return scales.y( (data.breaks[d].pnum_display_left2 + data.breaks[d].pnum_display_right2) / 2 ); })
		.attr('r', function(d) { return 3*Math.log((data.breaks[d].break_size2 + data.breaks[d].break_size1)+1); })
		.attr('id', function(d) { return "c" + data.breaks[d].breakid; })
		.attr('name', function(d) { return get_label(data.breaks[d]); })
		.attr('class', "break_circle");
	// Add bubble
	var breaksc = $(".break_circle").each(function() {
		$( this ).mouseover(function(e) {
			$bub = $('<div>').attr('id', 'bubble');
			$bub.css({'top' : e.pageY - 40 - offset.top, 'left' : e.pageX + 10 - offset.left});
			name = $(this).attr('name');
			nameid = $(this).attr('id').substring(1);
			dat = data.breaks[ nameid ];
			$bub.append('<span>Break ' + name + ':<br />' + dat.break_size2 + ' CDS in ' + get_par( 'sp1' ) + '<br />' + dat.break_size1 + ' CDS in ' + get_par( 'sp2' ) + '</span>');
			$bub.appendTo('#canvas');
		}).mouseout(function(e) {
			$('#bubble').remove();
		});
	});
	
	// Highlight break and circle if a breakid is given
	if ( get_par( "breakid" ) != "" ) {
		d3.select('#canvas').select( "#r" + get_par( "breakid" ) ).classed('bselected', true);
		d3.select('#canvas').select( "#c" + get_par( "breakid" ) ).classed('cselected', true);
	}
	
	// Add a frame
	var frames = svg.append("g").attr("id", "svgframe");
	frames.append("rect").attr( { 'x': 0, 'y': 0, 'width': margin.left, height: win_height });
	frames.append("rect").attr( { 'x': win_width - margin.right, 'y': 0, 'width': margin.right, height: win_height });
	frames.append("rect").attr( { 'x': 0, 'y': 0, 'width': win_width, height: margin.top });
	frames.append("rect").attr( { 'x': 0, 'y': win_height - margin.bottom, 'width': win_width, height: margin.bottom });
	
	// Add X axis
	var axes = svg.append("g")
		.attr( "name", "svg_axes" )
		.attr( "class", "svg_axes" )

	var xAxis = d3.svg.axis().scale( scales.x ).orient( "bottom" );
	axes.append("g")
		.attr("transform", "translate(" + margin.left + "," + (win_height - margin.bottom) + ")")
		.attr("class", "x axis")
		.call(xAxis);
	var xAxist = d3.svg.axis().scale( scales.x ).orient( "top" );
	axes.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("class", "x axis")
		.call(xAxist);

	// Add Y axis left
	var yAxis = d3.svg.axis().scale(scales.y).orient( "left" );
	axes.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("class", "y axis")
		.call( yAxis );
	// Add Y axis right
	var yAxisr = d3.svg.axis().scale( scales.y ).orient( "right" );
	axes.append("g")
		.attr("transform", "translate(" + (win_width - margin.right) + "," + margin.top + ")")
		.attr("class", "y axis")
		.call( yAxisr );
	
	// Add axis labels
	var texts = svg.append("g");
	
	texts.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "middle")
		.attr("x", (win_width - margin.left - margin.right) / 2 + margin.left)
		.attr("y", win_height)
		.text( cached_genomes.genomes[ get_par( 'sp1' ) ].name );
	texts.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "middle")
		.attr("y", 25)
		.attr("x", -((win_height - margin.top - margin.bottom) / 2 + margin.top))
		.attr("transform", "rotate(-90)")
		.text( cached_genomes.genomes[ get_par( 'sp2' ) ].name );

    //////////////////////////////////////////////////////
	// Draw GOC lines
	var goc_container = svg.append("g")
		.attr("name", "goc_drawing")
		.attr("id", "goc_drawing");
        
        var gocy_container = goc_container.append("g")
		.attr("transform", "translate(" + goc.left + "," + margin.top + ")");
	gocy_container.append( "rect" )
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", goc.width )
		.attr("height", win_height - margin.top - margin.bottom )
		.attr( { "fill" : "white"});

        var gocx_container = goc_container.append("g")
		.attr("transform", "translate(" + margin.left + "," + (win_height - margin.bottom + goc.top) + ")");
	gocx_container.append( "rect" )
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", win_width - margin.left - margin.right )
		.attr("height", goc.height )
		.attr( { "fill" : "white"});

    ////////////////////////////////////////////////////////
       // Lines
	const gocx_lines = gocx_container
		.append( "g" )
		.attr("id", "gocx_lines");
	const gocy_lines = gocy_container
		.append( "g" )
		.attr("id", "gocy_lines");

	if (get_par( 'show_goc' ) == false) {
		gocx_container.style({ "display": "none" });
		gocy_container.style({ "display": "none" });
	}

        // FIlter data
        const goc1 = data.gocs[get_par("sp1")].filter(function(d) { return d.pos >= get_par( 'start1' ) && d.pos <= get_par( 'end1' ) });
        const goc2 = data.gocs[get_par("sp2")].filter(function(d) { return d.pos >= get_par( 'start2' ) && d.pos <= get_par( 'end2' ) });

        const gocx_scale = d3.scale.linear().domain( [0, 1] ).range( [goc.height, 0] );
        const gocy_scale = d3.scale.linear().domain( [0, 1] ).range( [0, goc.width] );

        var gocx_lineFunction = d3.svg.line()
            .x(function(d) { return scales.x( d.pos ); })
            .y(function(d) { return gocx_scale( d.score ); })
                .interpolate("linear");
        var gocy_lineFunction = d3.svg.line()
            .x(function(d) { return gocy_scale( d.score ); })
            .y(function(d) { return scales.y( d.pos ); })
                .interpolate("linear");

        gocx_lines.append("path")
            .attr("d", gocx_lineFunction( goc1 ) )
            .attr("stroke", "blue")
            .attr("stroke-width", "2")
            .attr("fill", "none");

        gocy_lines.append("path")
            .attr("d", gocy_lineFunction( goc2 ) )
            .attr("stroke", "blue")
            .attr("stroke-width", "2")
            .attr("fill", "none");

	// Add GOC X axes
	const gocx_axes = gocx_container.append("g")
		.attr( "name", "gocx_axes" )
		.attr( "class", "svg_axes" )

	const gocx_xAxis = d3.svg.axis().scale( scales.x ).orient( "bottom" );
	gocx_axes.append("g")
		.attr("transform", "translate(" + 0 + "," + goc.height + ")")
		.attr("class", "x axis")
		.call(gocx_xAxis);

	const gocx_yAxis = d3.svg.axis().scale( gocx_scale ).orient( "left" );
	gocx_axes.append("g")
		.attr("class", "y axis")
		.call(gocx_yAxis);
	const gocx_yAxis_right = d3.svg.axis().scale( gocx_scale ).orient( "right" );
	gocx_axes.append("g")
		.attr("transform", "translate(" + (win_width - margin.left - margin.right) + "," + 0 + ")")
		.attr("class", "y axis")
		.call(gocx_yAxis_right);

	// Add GOC Y axes
	const gocy_axes = gocy_container.append("g")
		.attr( "name", "gocy_axes" )
		.attr( "class", "svg_axes" )

	const gocy_yAxis = d3.svg.axis().scale( scales.y ).orient( "left" );
	gocy_axes.append("g")
		.attr("class", "y axis")
		.call(gocy_yAxis);

	const gocy_xAxis = d3.svg.axis().scale( gocy_scale ).orient( "bottom" );
	gocy_axes.append("g")
		.attr("transform", "translate(" + 0 + "," + (win_height - margin.top - margin.bottom) + ")")
		.attr("class", "y axis")
		.call(gocy_xAxis);

	const gocy_xAxis_top = d3.svg.axis().scale( gocy_scale ).orient( "top" );
	gocy_axes.append("g")
		.attr("class", "y axis")
		.call(gocy_xAxis_top);

// #### EDIT IN PROGRESS               
        // Add GOC labels
	var texts = svg.append("g");
	
	// Horizontal GOC label
	texts.append("text")
		.attr("class", "y_goc label")
		.attr("text-anchor", "middle")
		.attr("x", (margin.left * 0.8))
		.attr("y", win_height - margin.bottom * 0.2)
		.text( "GOC" );

	// Vertical GOC label
	texts.append("text")
		.attr("class", "x_goc label")
		.attr("text-anchor", "middle")
        .attr("y", -margin.left * 0.3)
        .attr("x", win_height - margin.bottom * 0.8)
		.attr("transform", "rotate(90)")
		.text( "GOC" );
// #####                
                
	// When the graph is drawn, prepare a file to dowload it
	update_download_link( svg_style );
	update_stats( stats );
}

function update_stats( stats ) {
	for (s in stats) {
		$( "#n" + s ).text( stats[ s ] );
	}
}

function update_download_link( svg_style ) {
	return $.get("css/dotplot_svg.css", function(css_text) {
		svg_style.html(css_text);
		
		// Add link to save image
		var html = d3.select("svg#dotplot")
			.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.attr('xmlns:xmlns:xlink', "http://www.w3.org/1999/xlink")
			.node().parentNode.innerHTML;
		var title = get_par( "sp1" ) + "_" + get_par( "sp2" ) + ".svg";
		$('#svg_clone')
			.attr('href', 'data:image/svg+xml;base64,'+ btoa(html))
			.attr('download', title)
			.text( "Download image")
	});
}

function init_parameters() {
	var url_pars = get_url_parameters();
	set_pars( url_pars );
	$( "#conditional" ).val( get_par( "conditional" ) ).attr("selected", true);
	
	if (okdb) {
		if (get_par( 'sp1' ) == '') {
			set_par( "sp1", Object.keys( cached_genomes.genomes )[ 0 ]);
		}
		if (get_par( 'sp2' ) == '') {
			set_par( "sp2", Object.keys( cached_genomes.genomes )[ 1 ]);
		}

		// Default max values for genomes coordinates
		if ( !( 'end1' in url_pars ) ) 	reinit_genomes_coordinates( 1 );
		if ( !( 'end2' in url_pars ) ) 	reinit_genomes_coordinates( 2 );
	}
	prepare_genome_menu( 1 );
	prepare_genome_menu( 2 );
}

function reinit_genomes_coordinates( num ) {
	set_par( 'end' + num, cached_genomes.genomes[ get_par( 'sp' + num ) ].max_pnum_display );
}

function get_cached_genomes( cname ) {
	var deferred = $.Deferred();
	cached_genomes = storage.get( cname );
	console.log(cached_genomes);
	deferred.resolve();
	return deferred.promise();
}

function prepare_genomes() {
	// Cached data?
	var version = get_par( 'version' );
	var cname = version + ".genomes";
	if ( storage.isSet( cname )) {
		okdb = true;
		console.log("Get cached data for " + cname);
		return get_cached_genomes( cname );
	} else {
		var pars = {
			'type': 'genomes',
			'genomes': 1,
			'version': version
		};
		loading_on();
		return $.getJSON( urls.get_data, pars, function(genomes) {
			loading_off();
			// Check response
			if (genomes.outcome == false) {
				console.log("No database with this name!");
				storage.removeAll();
				okdb = false;
				return;
			}
			okdb = true;
			
			console.log("Cache data for " + cname);
			console.log( genomes );
			cached_genomes = genomes;
			try {
				storage.set( cname, genomes );
			} catch (e) {
				console.log("Data cache is full: purging.");
				storage.removeAll();
				try {
					storage.set( cname, genomes );
				} catch(e) {
					console.log("Can't cache");
				}
			}
		}).fail(function() {
			loading_off();
		});
	};
}

function prepare_genome_menu( num ) {
	var $sp_select = $( "#sp" + num );
	for (sp in cached_genomes.genomes) {
		$( "<option />", { value: sp, text: cached_genomes.genomes[sp].name } ).appendTo( $sp_select );
	}
	select_genome( num );
	$( "#start" + num ).val( get_par( 'start' + num ) );
	$( "#end" + num ).val( get_par( 'end' + num ) );
	$( "#break_min"+num ).val( get_par( 'break_min'+num ) );
	$( "#strict" ).val( get_par( 'strict' ) );

	// Print genome parts
	update_gparts( num );
}

function update_gparts( num ) {
	if (okdb) {
		var gpart = cached_genomes.gparts[ get_par( 'sp' + num ) ];
		var $g = $( "#gparts" + num );
		$g.empty();
		var size = gpart.length;
		$g.append('<span>' + size + " " + (size > 1 ? "contigs":  "contig") + " in " + get_par('sp' + num) + ':</span>');
		var $ul = $( '<ul />' );
		for (l in gpart) {
			$li = $( "<li />" ).text( gpart[l].gpart + ' ' + gpart[l].min + ' - ' + gpart[l].max );
			$ul.append( $li );
		}
		$g.append( $ul );
	}
}

function select_genome( num ) {
	if (okdb) {
		var $sp_select = $( "#sp" + num );
		// Select default genome
		var default_genome = Object.keys( cached_genomes.genomes )[ num - 1 ];
		if (get_par( 'sp' + num )) {
			default_genome = get_par( 'sp' + num );
		}
		$sp_select.val( default_genome ).attr( "selected", true );
	}
}

function reinit_coordinates( num ) {
	var sp = $("#sp" + num).val();
	
	if ( cached_genomes.genomes[ sp ] ) {
		set_par( 'start' + num, 0 );
		set_par( 'end' + num, cached_genomes.genomes[ sp ].max_pnum_display );
		$("#start" + num).val( get_par( 'start' + num ) );
		$("#end" + num).val( get_par( 'end' + num ) );
	}
}

function get_cached_data( cname ) {
	var deferred = $.Deferred();
	cached_data = storage.get( cname );
	deferred.resolve();
	return deferred.promise();
}

function prepare_data() {
	var pars = {
		'sp1': get_par( 'sp1' ),
		'sp2': get_par( 'sp2' ),
		'type': 'dotplot',
		'version': get_par( 'version' ),
	};
	
	// Cached data?
	var cname = get_par( "version" ) + "." + get_par( "sp1" ) + '.' + get_par("sp2");
	if ( storage.isSet( cname )) {
		console.log("Get cached data for " + cname);
		return get_cached_data( cname );
	} else {
		console.log("Get new data for " + cname);
		console.log( pars );
		console.log( urls.get_data + $.param(pars) );
		loading_on();
		cached_data_ajax =$.getJSON( urls.get_data, pars, function(data) {
			loading_off();
			if (data['outcome'] == false) {
				$error = $('<span />').text('Error: ' + data['message']).attr('title', data['details']);
				$('#message').append($error);
				$('#message').show();
			} else {
				cached_data = data;
				console.log( "Data download completed. Caching." );
				try {
					storage.set( cname, data );
				} catch (e) {
					console.log("Data cache is full: purging.");
					storage.removeAll();
					try {
						storage.set( cname, data );
					} catch(e) {
						console.log("Can't cache");
					}
				}
			}
		});
		return cached_data_ajax;
	}
}

function get_menu_pars() {
	set_par('sp1', $("#sp1").val() || "");
	set_par('sp2', $("#sp2").val() || "");
	set_par('start1', parseInt($("#start1").val()) || 0);
	set_par('end1',  parseInt($("#end1").val()) || scale['max_sp1']);
	set_par('start2', parseInt($("#start2").val()) || 0);
	set_par('end2', parseInt($("#end2").val()) || scale['max_sp2']);
	set_par('break_min1', parseInt($("#break_min1").val()));
	set_par('break_min2', parseInt($("#break_min2").val()));
	console.log( get_pars() );
}

function redraw_with_zoom() {
	if ('start1' in zoom_vals) {
		for (k in zoom_vals) {
			set_par( k, zoom_vals[ k ] );
		}
		$( "#start1" ).val( get_par( 'start1' ) );
		$( "#start2" ).val( get_par( 'start2' ) );
		$( "#end1" ).val( get_par( 'end1' ) );
		$( "#end2" ).val( get_par( 'end2' ) );
		zoom_vals = {};
	}
	get_menu_pars();
	draw_plot();
}

function define_menus_actions() {
	$('#sp1').change(function(event) {
		set_par( 'sp1', $( this ).val() );
		if ( get_par( 'sp1' ) != get_par( 'sp2' ) ) {
			$( "#message" ).hide();
			prepare_data().then(function() {
				reinit_coordinates( 1 );
				update_gparts( 1 );
			}).then( draw_plot );
		} else {
			$( "#message" ).text("Please select two different genomes").show();
		}
	});
	$('#sp2').change(function(event) {
		set_par( 'sp2', $( this ).val() );

		if ( get_par( 'sp1' ) != get_par( 'sp2' ) ) {
			$( "#message" ).hide();
			prepare_data().then(function() {
				reinit_coordinates( 2 );
				update_gparts( 2 );
			}).then( draw_plot );
		} else {
			$( "#message" ).text("Please select two different genomes").show();
		}
	});

	$("#params").submit(function(event) {
		event.preventDefault();
		redraw_with_zoom();
	});
	$(".submitbutton").on("click", function(event) {
		event.preventDefault();
		redraw_with_zoom();
	});
	
	// Add clear coordinates buttons
	// For X...
	$('#clear1').click(function(event) {
		event.preventDefault();
		reinit_coordinates( 1 );
		draw_plot();
	});
	
	// ...and for Y
	$('#clear2').click(function(event) {
		event.preventDefault();
		reinit_coordinates( 2 );
		draw_plot();
	});
	$('#conditional').change(function(event) {
		set_par( "conditional", $('#conditional').val() );
		draw_plot();
	});
	
	$('#strict').change(function(event) {
		set_par( "strict", $( "#strict" ).val() );
		draw_plot();
	});
	$('#break_min1').change(function(event) {
		set_par( "break_min1", $( "#break_min1" ).val() );
		draw_plot();
	});
	$('#break_min2').change(function(event) {
		set_par( "break_min2", $( "#break_min2" ).val() );
		draw_plot();
	});
	
	$("#swapper").click(function(event) {
		event.preventDefault();
		var sp1 = get_par( 'sp1' );
		var sp2 = get_par( 'sp2' );
		set_par( 'sp1', sp2 );
		set_par( 'sp2', sp1 );

		// Reverse coordinates
		var start1 = get_par( 'start1' );
		var start2 = get_par( 'start2' );
		var end1 = get_par( 'end1' );
		var end2 = get_par( 'end2' );
		set_par( 'start1', start2 );
		set_par( 'start2', start1 );
		set_par( 'end1', end2 );
		set_par( 'end2', end1 );
		$( "#start1" ).val( get_par( 'start1' ) );
		$( "#start2" ).val( get_par( 'start2' ) );
		$( "#end1" ).val( get_par( 'end1' ) );
		$( "#end2" ).val( get_par( 'end2' ) );

		// Reverse break_mins
		var brm1 = $( "#break_min1" ).val();
		var brm2 = $( "#break_min2" ).val();
		set_par( "break_min1", brm2 );
		set_par( "break_min2", brm1 );
		$( "#break_min1" ).val( brm2 );
		$( "#break_min2" ).val( brm1 );
		
		select_genome( 1 );
		select_genome( 2 );
		update_gparts( 1 );
		update_gparts( 2 );

		prepare_data().then( draw_plot );
	});

	show_hide_button( "show_trnas", "trnas_lines", "tRNA lines" );
	show_hide_button( "show_orthos", "orthos_points", "free orthologs (not in synteny blocks)" );
	show_hide_button( "show_goc", "goc_lines", "GOC lines" );
	show_hide_button( "show_breaks_circles", "breaks_circles", "breaks markers (circles)" );
	show_hide_button( "show_breaks_rects", "break_rectangles", "breaks limits (rectangles)" );

	$('#clear_cache').click(function(event) {
		event.preventDefault();
		console.log("Clear cache...");
		storage.removeAll();
	});
}

function show_hide_button( parname, elementid, label ) {
	$( "#" + parname ).click(function(event) {
		event.preventDefault();
		if (get_par( parname ) === true) {
			set_par( parname, false );
			$( "#" + elementid ).hide();
			$( this ).text( "Show " + label );
		} else {
			set_par( parname, true );
			$( "#" + elementid ).show();
			$( this ).text( "Hide " + label );
		}
		update_permalink();

                if (elementid == "goc_lines") {
                    console.log("Rebuild dotplot after after toggling GOC");
                    draw_plot();
                }
	
	});
}

function hide_boxes() {
	$(".boxcontent").hide();
	$(".boxtitle").on('click', function() {
		$(this).parent().find(".boxcontent").toggle();
	});
}

$(function() {
	hide_boxes();
	$('#clearall').click(function(event) {
		event.preventDefault();
		reinit_coordinates( 1 );
		reinit_coordinates( 2 );
		draw_plot();
	});
	set_pars( get_url_parameters() );
	prepare_genomes()
		.then( init_parameters )
		.then(function() {
			return prepare_data();
		})
		.then( define_menus_actions )
		.then( draw_plot )
		.then( create_filter_box )
		.then(function() {
			$(window).resize(function(e) {
				draw_plot();
			});
		});
});

