function create_filter_box() {
	$box = $( "#filter_box" );
	$box.empty();
	if ( $box.length > 0 ) {
		// Create basic box
		$basic = $( "<span id='basic_box'>" );
		$basic
			.hide()
			.append( "<span>Show genomic islands of size at least <input type='number' id='break_min' value=0 min=3 max=999 step=1 style='width:3em;'></input></span>" )
			.append( "<span>&nbsp;CDS, found in <select id='filter_selection'></select></span>" )
			.append( "<span class='filter_switch' title='Change to advanced filter'>&gt;&gt;</span>" );
//                         .append(get_par( "sp1" ));
		$box.append( $basic );
		$( "#filter_selection" )
			.append( "<option value='atleast'>at least one genome</option>" )
			.append( "<option value='genome1'>" + get_par( "sp1" ) + "</option>" )
			.append( "<option value='genome2'>" + get_par( "sp2" ) + "</option>" )
			.append( "<option value='both'>both genomes</option>" );
		
		// Create advanced box
		$advanced = $( "<span id='advanced_box'>" );
		$advanced
			.hide()
			.append( "<label>Min breaks size: </label>" )
			.append( "<input type='number' id='break_min1' value=20 min=0 max=999 step=1 style='width:3em;'></input>" )
			.append( "<select id='conditional'><option>AND</option><option>OR</option></select>" )
			.append( "<input type='number' id='break_min2' value=20 min=0 max=999 step=1 style='width:3em;'></input>" )
			.append("<br /><label>Number of blocks allowed in breaks:</label><input type='number' id='strict' value=10 min=0 step=1></input>" )
			.append( "<span class='filter_switch' title='Change to basic filter'>&lt;&lt;</span>" );
		$box.append( $advanced );
		
		// Now update the advanced values with those given in argument
		$('#break_min1').val( get_par( "break_min1" ) );
		$('#break_min2').val( get_par( "break_min2" ) );
		$( "#conditional" ).val( get_par( "conditional" ) ).attr("selected", true);
		
		// Finally, fill the basic form if it can be applied
		var b1 = get_par( "break_min1" );
		var b2 = get_par( "break_min2" );
		var cond = get_par( "conditional" );
		if ( b1 == b2 ) {
			$( "#break_min" ).val( b1 );
			if ( cond == "AND" ) {
				$( "#filter_selection" ).val( "both" );
				filter_plot( "both", b1 );
			} else {
				$( "#filter_selection" ).val( "atleast" );
				filter_plot( "atleast", b1 );
			}
			$basic.show();
		} else if ( cond == "AND" && b1 * b2 == 0 ) {
			if ( b1 == 0 ) {
				$( "#filter_selection" ).val( "genome2" );
				$( "#break_min" ).val( b2 );
				filter_plot("genome2", b2);
			} else {
				$( "#filter_selection" ).val( "genome1" );
				$( "#break_min" ).val( b1 );
				filter_plot( "genome2", b1 );
			}
			$basic.show();
		} else {
			$advanced.show();
		}
		
		// Create the switch
		$( "#advanced_box .filter_switch" ).on( "click", function() {
			$basic.show();
			$advanced.hide();
			update_from_basic();
		});
		$( "#basic_box .filter_switch" ).on( "click", function() {
			$basic.hide();
			$advanced.show();
			update_from_advanced();
		});
		// Update from the basic form
		$basic.on( "change", function() {
			update_from_basic();
		});
		// Update from the advanced form
		$advanced.on( "change", function() {
			update_from_advanced();
		});
	}
}

function update_filter_plot() {
	if ($( "#basic_box" ).is(":visible")) {
		var fake = true;
		update_from_basic(fake);
	}
}

function update_from_basic(fake_update=false) {
	var val = $('#break_min').val();
	var mode = $('#filter_selection').val();
	
	if ( mode == 'both' ) {
		set_par( "break_min1", val );
		set_par( "break_min2", val );
		set_par( "conditional", 'AND' );
		$('#break_min').attr({"min": 0});
	}
	else if ( mode == 'atleast' ) {
		set_par( "break_min1", val );
		set_par( "break_min2", val );
		set_par( "conditional", 'OR' );
		$('#break_min').attr({"min": 3});
	}
	else if ( mode == 'genome1' ) {
		set_par( "break_min1", val );
		set_par( "break_min2", 0 );
		set_par( "conditional", 'AND' );
		$('#break_min').attr({"min": 0});
	}
	else if ( mode == 'genome2' ) {
		set_par( "break_min1", 0 );
		set_par( "break_min2", val );
		set_par( "conditional", 'AND' );
		$('#break_min').attr({"min": 0});
	} else {
		console.log("Unknown mode:" + mode);
	}
	// Update the buttons of the advanced form
	$( "#break_min1" ).val( get_par( "break_min1" ) );
	$( "#break_min2" ).val( get_par( "break_min2" ) );
	$( "#conditional" ).val( get_par( "conditional" ) );
	// Update the graph
	if (!fake_update) {
		update();
		$("#filter_plot").show();
	}
	filter_plot(mode, val);
}

function update_from_advanced() {
	var b1 = $('#break_min1').val();
	var b2 = $('#break_min2').val();
	var cond = $('#conditional').val();
	
	set_par( "break_min1", b1 );
	set_par( "break_min2", b2 );
	set_par( "conditional", cond );
	update();
	$("#filter_plot").hide();
}

function filter_plot(mode, break_min) {
	$.when( cached_data_ajax ).then(function() {
		if (cached_data != null ) {
			var sequence = plot_sequence(mode);
			draw_filter_plot(sequence, break_min);
		} else {
			setTimeout(function() {
				var sequence = plot_sequence(mode);
				draw_filter_plot(sequence, break_min);
			}, 2000);
		}
	});
}

function plot_sequence(mode) {
	var data;
	if ("breaks" in cached_data) {
		data = cached_data.breaks;
	} else {
		data = cached_data[ get_par("sp1") + get_par("sp2") ];
	}
	// Get the list of break sizes
	var list = [];
	if (mode == "genome1") {
		for (b in data) {
			list.push( data[b].break_size2 );
		}
	} else if (mode == "genome2") {
		for (b in data) {
			list.push( data[b].break_size1 );
		}
	} else if (mode == "both") {
		for (b in data) {
			list.push( Math.min( data[b].break_size1, data[b].break_size2 ) );
		}
	} else if (mode == "atleast") {
		for (b in data) {
			list.push( Math.max( data[b].break_size1, data[b].break_size2 ) );
		}
	} else {
		console.log("Unknown mode: " + mode);
	}
	// Now count
	var count = {};
	for (b in list) {
		if (count[ list[b] ]) {
			count[ list[b] ]++;
		} else {
			count[ list[b] ] = 1;
		}
	}
	// Put in array
	var cols = [];
	for (var i = 0; i <= Math.max.apply( null, Object.keys(count) ); i++) {
		if (count[ i ]) {
			cols[ i ] = count[ i ];
		} else {
			cols[ i ] = 0;
		}
	}
	
	// Now sum
	var sum = 0;
	var sumcols = [];
	for (c in cols.reverse()) {
		sum += cols[ c ];
		sumcols.push( sum );
	}
	sumcols = sumcols.reverse();
	
	return sumcols;
}

function draw_filter_plot(sequence, break_min) {
	// Prepare the data for a d3 structure
	var struct = [];
	for (var i in sequence) {
		var s = {
		"bsize": i,
		"bcount": sequence[ i ]
		};
		struct.push(s);
	}
	
	var margin = {
		top: 5,
		right: 5,
		bottom: 30,
		left: 40
	};
	var curwidth = 300;
	if ( $( "#params" ).length > 0 ) {
		curwidth = $( "#params" ).width() - 30;
	}
	var width = curwidth - margin.left - margin.right;
	var height = 160 - margin.top - margin.bottom;
	
	// Ranges
	var maxX = struct.length - 1;
	var maxY = d3.max( struct, function(d) { return d.bcount});
	var x = d3.scale.linear().range( [0, width] ).domain([ 0,  maxX]);
	var y = d3.scale.linear().range( [0, height] ).domain([ maxY, 0 ]);
	
	// Axis
	var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(6);
	var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
	
	// Create the graph
	$( "#filter_plot" ).empty();
	var svg = d3.select("#filter_plot").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	$("#filter_plot svg").attr("title", "Horizontal axis: size of breaks (number of CDS). Vertical axis: number of breaks with this size.");
	
	// Show the current filter position
	var curx =  x(break_min);
	var cury = y(sequence[ break_min ]);
	var current = svg.append("g")
		.attr("class", "current");
	var crossw = 10;
	current
		.append("line")
		.attr("x1", curx - crossw)
		.attr("x2", curx + crossw)
		.attr("y1", cury)
		.attr("y2", cury);
	current
		.append("line")
		.attr("x1", curx)
		.attr("x2", curx)
		.attr("y1", cury - crossw)
		.attr("y2", cury + crossw);
	
	// Draw the plot
	var valueline = d3.svg.line()
		.x(function(d) { return x(d.bsize); })
		.y(function(d) { return y(d.bcount); });
	svg.append("g").
		append("path")
		.attr("class", "line")
		.attr("d", valueline(struct));

	// Add the X Axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
	// And its legend
	svg.append("text")
		.attr("class", "axis_legend")
		.attr("x", x( maxX/2 ) )
		.attr("y", y( 0 ) + 27 )
		.attr("text-anchor", "middle")
		.text( "Minimum size of genomic islands" );

	// Add the Y Axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	// And its legend
	svg.append("text")
		.attr("class", "axis_legend")
		.attr("x", -65 )
		.attr("y", -25 )
		.attr("transform", "rotate(-90)" )
		.attr("text-anchor", "middle")
		.text( "Number of breaks" );
	
	// Add legend
	var legend = svg.append("g")
		.attr("class", "legend");
	legend
		.append("text")
		.attr("x", x(maxX))
		.attr("y", y(maxY) + 20)
		.attr("text-anchor", "end")
		.text(sequence[ break_min ] + " breaks");
}

$(window).resize(function(e) {
	if ($( "#basic_box" ).is(":visible")) {
		var fake = true;
		update_from_basic(fake);
	}
});

