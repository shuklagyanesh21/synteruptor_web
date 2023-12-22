var zoom_in = 2/3;
var zoom_out = 3/2;

$(function() {
// Rectangle zoom
	var $container = $('#canvas');
	var $selection = $('<div>').addClass('selection-box');
	
	// Trace the rectangle and use its coordinates
	$container.on('mousedown', function(e) {
		var offset = $container.offset();
		var click_x = e.pageX - offset.left,
			click_y = e.pageY - offset.top;
		
		// This is the rectangle initial point (so 0x0 for now)
		$selection.css({
		  'left':   click_x,
		  'top':    click_y,
		  'width':  0,
		  'height': 0
		}).attr( "title", "Scroll up to zoom in this region" );
		$selection.appendTo($container);
		
		// These rectangle properties will be updated at every move
		var pos = {
			'x': 0,
			'y': 0,
			'width': 0,
			'height': 0
		};
		
		// Drag the mouse to stretch the rectangle
		$container.on('mousemove', function(e) {
			// Compute the new coordinates
			var move_x = e.pageX - offset.left;
			var move_y = e.pageY - offset.top;
			
			pos.width  = Math.abs(move_x - click_x);
			pos.height = Math.abs(move_y - click_y);
			
			// The rectangle is always drawn top-to-bottom and left-to-right
			// Change initial point if the rectangle is draw to the left or the bottom
			pos.x = (move_x < click_x) ? (click_x - pos.width) : click_x;
			pos.y = (move_y < click_y) ? (click_y - pos.height) : click_y;
			
			// Update the rectangle with the new coordinates
			$selection.css({
			  'width': pos.width,
			  'height': pos.height,
			  'top': pos.y,
			  'left': pos.x
			});

			if (pos.height < 10 && pos.width < 10) {
				$selection.hide();
			} else {
				$selection.show();
			}
		}).on('mouseup', function(e) {
			// Stop drawing the rectangle when the mouse button is lifted
			$container.off('mousemove');
			rectangle_zoom( pos );
			
			// Add instruction
			$( ".zoom_instruction" ).remove();
			if (pos.height > 10 && pos.width > 10) {
				var $ins = $( "<div />" ).addClass( "zoom_instruction" );
				$ins.css({
					'top': pos.y - 20,
					'left': pos.x
				}).html( "Scroll up to zoom" );
				console.log( $ins );
				$container.append( $ins );
			}
		});
	});

	// Scroll zoom
	$container.mousewheel(function( event, delta ) {
		var offset = $container.offset();
		coord = {
			x: event.pageX - offset.left,
			y: event.pageY - offset.top
		};
		
		if ( check_position_inside( $container, coord ) ) {
			var posmouse = real_coord( $container, coord );
			event.preventDefault();
			if ( delta > 0 ) {
				if ( $selection.is( ":visible" ) ) {
					redraw_with_zoom();
				} else {
					zoom_up( posmouse );
				}
			} else {
				zoom_down( posmouse );
			}

		}
	});
});

function zoom_up( position ) {
	// New coordinates
	var width = get_par( "end1" ) - get_par( "start1" );
	var height = get_par( "end2" ) - get_par( "start2" );
	var midx = get_par( "start1" ) + width/2;
	var midy = get_par( "start2" ) + height/2;
	var newpos = {
		'start1': parseInt(midx - width/2 * zoom_in),
		'end1':   parseInt(midx + width/2 * zoom_in),
		'start2': parseInt(midy - height/2 * zoom_in),
		'end2':   parseInt(midy + height/2 * zoom_in)
	}
	newpos = check_square( newpos );
	change_all_coordinates( newpos );
	// Update the graph
	draw_plot();
}
function zoom_down( position ) {
	// New coordinates
	var width = get_par( "end1" ) - get_par( "start1" );
	var height = get_par( "end2" ) - get_par( "start2" );
	var midx = get_par( "start1" ) + width/2;
	var midy = get_par( "start2" ) + height/2;
	var newpos = {
		'start1': parseInt(midx - width/2 * zoom_out),
		'end1':   parseInt(midx + width/2 * zoom_out),
		'start2': parseInt(midy - height/2 * zoom_out),
		'end2':   parseInt(midy + height/2 * zoom_out)
	}
	newpos = check_square( newpos, zoom_out, width, height );
	change_all_coordinates( newpos );
	// Update the graph
	draw_plot();
}

function change_all_coordinates( position ) {
	for( k in position ) {
		set_par( k, position[ k ] );
		$( "#" + k ).val( position[ k ] );
	}
}

function real_coord( $container, coord ) {
	var position = rescale_position( $container, coord );
	return check_mouse_position( position );
}

function rescale_position( $container, coord ) {
	var position = {
		'x': parseInt( scales.xback( coord.x - margin.left - $container.position().left ) ),
		'y': parseInt( scales.yback( coord.y - margin.top - $container.position().top ) )
	};
	return position;
}

function check_mouse_position( position ) {
	var new_position = {
		x: position.x,
		y: position.y
	};
	if ( new_position.x < get_par( "start1" ) ) new_position.x = get_par( "start1" );
	if ( new_position.x > get_par( "end1" ) )   new_position.x = get_par( "end1" );
	if ( new_position.y < get_par( "start2" ) ) new_position.y = get_par( "start2" );
	if ( new_position.y > get_par( "end2" ) )   new_position.y = get_par( "end2" );
	return new_position;
}

function check_position_inside( $container, coord ) { 
	var rescaled = rescale_position( $container, coord );
	var corrected = check_mouse_position( rescaled );
	
	// If the position was corrected, then it must have been out of bounds
	return ( corrected.x == rescaled.x && corrected.y == rescaled.y );
}

function check_position( position ) { 
	var max1 = cached_genomes.genomes[ get_par( 'sp1' ) ].max_pnum_display;
	var max2 = cached_genomes.genomes[ get_par( 'sp2' ) ].max_pnum_display;
	if ( position.x < 0 ) position.x = 0;
	if ( position.x > max1 )   position.x = max1;
	if ( position.y < 0 ) position.y = 0;
	if ( position.y > max2 )   position.y = max2;
	return position;
}

function check_square( coord, zoom, width, height) {
	if (zoom) {
		var max1 = cached_genomes.genomes[ get_par( 'sp1' ) ].max_pnum_display;
		var max2 = cached_genomes.genomes[ get_par( 'sp2' ) ].max_pnum_display;
		// Expand the view if at a border
		if (coord.start1 < 0) {
			coord.start1 = 0;
			coord.end1 = parseInt(width * zoom);
		}
		if (coord.start2 < 0) {
			coord.start2 = 0;
			coord.end2 = parseInt(height * zoom);
		}
		if (coord.end1 > max1) {
			coord.end1 = max1;
			coord.start1 = max1 - parseInt(width * zoom);
		}
		if (coord.end2 > max2) {
			coord.end2 = max2;
			coord.start2 = max2 - parseInt(height * zoom);
		}
	}
	// Check all 4 corners and change the coordinates if out of bound
	var xval = ['start1', 'end1'];
	var yval = ['start2', 'end2'];
	for ( var i in xval ) {
		for ( var j in yval ) {
			var pos = {
				'x': coord[ xval[i] ],
				'y': coord[ yval[j] ]
			};
			pos = check_position( pos );
			coord[ xval[i] ] = pos.x;
			coord[ yval[j] ] = pos.y;
		}
	}
	// Don't zoom to a 0x0 square!
	if ( Math.abs( coord[ 'start1' ] - coord[ 'end1' ] ) < 10 ) {
		if (coord[ 'start1' ] > 0) {
			coord[ 'start1' ] = coord[ 'start1' ] - 10;
		} else {
			coord[ 'end1' ] = coord[ 'end1' ] + 10;
		}
	}
	if ( Math.abs( coord[ 'start2' ] - coord[ 'end2' ] ) < 10 ) {
		if (coord[ 'start2' ] > 0) {
			coord[ 'start2' ] = coord[ 'start2' ] - 10;
		} else {
			coord[ 'end2' ] = coord[ 'end2' ] + 10;
		}
	}
	return coord;
}

// Zoom the drawing zone based on the drawn rectangle
function rectangle_zoom(pos) {
	if (! ('x' in pos && 'y' in pos && 'width' in pos && 'height' in pos) || typeof pos.x == 'undefined' || typeof pos.y == 'undefined' || typeof pos.width == 'undefined' || typeof pos.height == 'undefined' ||
	(pos.width < 10 && pos.height < 10)) {
		$("selection-box").hide();
		zoom_vals = {};
		return;
	}
	
	var $container = $('#canvas');
	var loc = {	
		'start1': pos.x - margin.left - $container.position().left,
		'end1':   pos.x + pos.width - margin.left - $container.position().left,
		'start2': pos.y - margin.top - $container.position().top,
		'end2':   pos.y + pos.height - margin.top - $container.position().top
	};
	
	var nloc = {
		'start1': parseInt( scales.xback( loc.start1 ) ),
		'end1':   parseInt( scales.xback( loc.end1 ) ),
		'start2': parseInt( scales.yback( loc.start2 ) ),
		'end2':   parseInt( scales.yback( loc.end2 ) )
	};
	if (nloc.start1 > nloc.end1) {
		var s1 = nloc.start1;
		nloc.start1 = nloc.end1;
		nloc.end1 = nloc.start1;
	}
	if (nloc.start2 > nloc.end2) {
		var s2 = nloc.start2;
		nloc.start2 = nloc.end2;
		nloc.end2   = s2;
	}
	
	// Check limits
	var max1 = cached_genomes.genomes[ get_par( 'sp1' ) ].max_pnum_display;
	var max2 = cached_genomes.genomes[ get_par( 'sp2' ) ].max_pnum_display;
	if ( nloc.start1 < 0 ) { nloc.start1 = 0; }
	if ( nloc.start2 < 0 ) { nloc.start2 = 0; }
	if ( nloc.end1 > max1) { nloc.end1 = max1; }
	if ( nloc.end2 > max2) { nloc.end2 = max2; }
	
	// Update coordinates
	zoom_vals = nloc;
}

// Scale a vertical coordinate in the plotdiv to the R plot
function scale_to_Rx(x) {
	var $container = $('#canvas');
	
	// First change from the coordinates of the page to those of the plotdiv
	new_x = x - $container.position().left;
	
	// Then change to the coordinates of the drawing zone
	new_x = new_x - scale["margin_left"];
	
	// Finally scale to the R graph
	var draw_zone_width = $container.width() - scale["margin_left"] - scale["margin_right"];
	var real_width = scale["current_end1"] - scale["current_start1"];
	var xscale =  real_width / draw_zone_width;
	var rx = Math.floor(scale["current_start1"] + new_x * xscale);
	
	return rx;
}

// Scale any horizontal coordinate in the plotdiv to the R plot
function scale_to_Ry(y) {
	var $container = $('#plotdiv');
	
	// First change from the coordinates of the page to those of the plotdiv
	new_y = y - $container.position().top;
	
	// Then change to the coordinates of the drawing zone
	new_y = new_y - scale["margin_top"];
	
	// Don't forget to reverse: R is bottom-to-top!
	var draw_zone_height = $container.height() - scale["margin_top"] - scale["margin_bottom"];
	new_y = draw_zone_height - new_y;
	
	// Finally scale to the R graph
	var real_height = scale["current_end2"] - scale["current_start2"];
	var yscale =  real_height / draw_zone_height;
	var ry = Math.floor(scale["current_start2"] + new_y * yscale);
	
	return ry;
}

// Scale an R plot horizontal coordinate to a page coordinate
function scale_from_Rx(rx) {
	var $container = $('#plotdiv');
	
	// First scale to the plot drawing zone
	var draw_zone_width = $container.width() - scale["margin_left"] - scale["margin_right"];
	var real_width = scale["current_end1"] - scale["current_start1"];
	var xscale =  real_width / draw_zone_width;
	var new_x = (rx - scale["current_start1"]) / xscale;
	
	// Then Change to the plotdiv coordinates
	new_x = new_x + scale["margin_left"];
	
	// Finally change to the coordinates of the page
	new_x = new_x + $container.position().left;
		
	return Math.floor(new_x);
}

// Scale an R plot vertical coordinate to a page coordinate
function scale_from_Ry(ry) {
	var $container = $('#plotdiv');
	
	// First scale to the plot drawing zone
	var draw_zone_height = $container.height() - scale["margin_top"] - scale["margin_bottom"];
	var real_height = scale["current_end2"] - scale["current_start2"];
	var yscale =  real_height / draw_zone_height;
	var new_y = (ry - scale["current_start2"]) / yscale;
	
	// Then reverse
	new_y = draw_zone_height - new_y;
	
	// Then Change to the plotdiv coordinates
	new_y = new_y + scale["margin_top"];
	
	// Finally change to the coordinates of the page
	new_y = new_y + $container.position().top;
		
	return Math.floor(new_y);
}
