var cur_pars = {
	'version': '',
};

var urls = {
	"get_data": "get_data.php",
	"glist": "list.php",
	"seq": "seq_viewer.html",
	"break": "break_viewer.php",
	"aligner": "aligner.php",
	"ranking": "ranking.php",
	"dotplot": "dotplot.php",
	"summary": "summary.php",
	"search": "search.php",
	"start_search": "search_start.php",
	"qsub": "send_qsub.php",
	"current": location.protocol + '//' + location.host + location.pathname,
};

function init_pars ( ar ) {
	for ( k in ar ) {
		cur_pars[ k ] = ar[ k ];
	}
}

function set_par( key, val ) {
	if ( key in cur_pars ) {
		if ( $.isNumeric( get_par( key ) ) ) {
			cur_pars[ key ] = parseInt( val );
		} else if ( val === "true" ) {
			cur_pars[ key ] = true;
		} else if ( val === "false" ) {
			cur_pars[ key ] = false;
		} else {
			cur_pars[ key ] = val;
		}
	} else {
		console.log( "Error: parameter key " + key + " with value " + val + " is not defined" );
		console.log( get_pars() );
		return null;
	}
}

function get_par( key ) {
	if ( key in cur_pars ) {
		return cur_pars[ key ];
	} else {
		console.log( "Error: parameter key " + key + " is not defined" );
		console.log( get_pars() );
		return null;
	}
}

function get_pars() {
	var clone = {};
	for (k in cur_pars) {
		clone[ k ] = cur_pars[ k ];
		if (clone[ k ] === null) {
			console.log( "Error in get_pars with key " + k );
		}
	}
	return clone;
}

function set_pars( pars ) {
	for ( k in pars ) {
		var status = set_par( k, pars[ k ] );
		if (status === null) {
			console.log( "Error in set_pars with key " + k );
		}
	}
}

function get_url_parameters() {
	var page_url = window.location.search.substring( 1 );
	var url_pars = page_url.split( "&" );
	var pars = {};
	// Get each parameter
	for ( p in url_pars ) {
		var s = url_pars[ p ].split( "=" );
		pars[ s[ 0 ] ] = s[ 1 ];
	}
	return pars;
}

function format_url( page, pars ) {
	// Join the parameters
	var url_pars = [];
	for ( p in pars ) {
		val = pars[ p ];
		url_pars.push( p + '=' + val );
	}
	// Put the whole string together
	var url = page + "?" + url_pars.join( "&" );
	return url;
}

function update_permalink() {
	var page = location.protocol + '//' + location.host + location.pathname;
	var url = format_url( page, get_pars() );
	$( "#permalink" ).attr( 'href', url );
}

function format_number(number) {
	number = parseInt(number);
	var sep = "<span style='padding:0.1em'></span>";
	if (number < 1000) {
		return number.toString();
	}
	if (number < 1000000) {
		var thousands = Math.floor(number/1000);
		var unities = number - thousands*1000;
		return thousands.toString() + sep + pad(unities.toString(), 3);
	}
	if (number < 1000000000) {
		var millions = Math.floor(number/1000000);
		var rest = number - millions*1000000;
		var thousands = Math.floor(rest/1000);
		var unities = rest - thousands*1000;
		return millions.toString() + sep + pad(thousands.toString(), 3) + sep + pad(unities.toString(), 3);
	}
}

function pad (number, size) {
	string = number.toString();
	return string.length < size ? pad("0" + string, size) : string;
}

function clean_id(name) {
	var id= name.replace(/[\(\)\[\]"]/g, "_");
	//console.log([name, id]);
	return id;
}

function set_backtop() {
	if ($("#backtop").length) {
		toggle_backtop();
		$(window).on('scroll', toggle_backtop);
		$("#backtop").on('click', function(e) {
			e.preventDefault();
			console.log("Back to top?");
			$('html,body').animate({ scrollTop: 0 }, 'fast');
		});
	}
}

function toggle_backtop() {
	var trigger = 100;
	var scroll = $(window).scrollTop();
	if (scroll > trigger) {
		$("#backtop").show();
	} else {
		$("#backtop").hide();
	}
}

$(function() {
	set_backtop();
});

function make_blast_link(gene_data, can_search) {
	var url_pars = {
		"blast" : "ncbi",
		"pid": gene_data.pid,
		"version" : get_par( "version" ),
	};
	var blast_link = $( "<div />" ).addClass( "search" );
	// BLAST Synteruptor
	if (can_search) {
		url_pars.blast = "db";
		var blast_db_button = $( "<a />" )
			.attr( "target", "_blank" )
			.attr( "title", "Blast this sequence in the current database" )
			.attr( "href", format_url( urls.seq, url_pars ) )
			.html( "<img src='css/Synteruptor_logo.png' width=20 title='Synteruptor: blast this sequence against the current database (" + get_par( "version" ) + ").'></img>" );
		blast_link.append( blast_db_button );
		blast_link.append( " " );
	}
	// BLAST NCBI
	url_pars.blast = "ncbi"; // CQ: added this to enable ncbi blast when can_search=True (otherwise, it's not useful to have 2 buttons)
	var blast_ncbi_button = $( "<a />" )
		.attr( "target", "_blank" )
		.attr( "title", "Blast this sequence in the ncbi databases" )
		.attr( "href", format_url( urls.seq, url_pars ) )
		.html( "<img src='css/NCBI_logo.png' width=20 title='NCBI: blast this sequence against various databases on the NCBI website.'></img>" );
	blast_link.append( blast_ncbi_button );
	return blast_link;
}

function make_seq_link(pid) {
	var pid_text = pid.replace(/_/g, " ");
	var seq_link = $( "<a />" )
		.attr( "target", "_blank" )
		.attr( "title", "See this sequence" )
		.attr( "href", format_url( urls.seq, {
			"pid" : pid,
			"version" : get_par( "version" )
	       }))
		.html( pid_text );
	// Return the selector: return the child of a temporary div parent...
	return $('<div />').append( seq_link ).html();
}

function make_break_link(breakid, sp, version) {
	return "<a title='This gene was found in a break with " + sp +  ": click to view the break details' href='" + urls.break + "?breakid=" + breakid + "&version=" + version + "'>" + sp + "</a>";
}

function make_list_link(gene_data, name) {
	if (!name || name == "") {
		name = "(list)";
	}
	var sp = gene_data.sp;
	if (!sp || sp == "") {
		if (gene_data.side == 1) {
			sp = gene_data.sp1;
		} else {
			sp = gene_data.sp2;
		}
	}
	var url_pars = {
		"from": gene_data.pnum_all - 50,
		"sp": sp,
		"version" : get_par( "version" ),
		"pid": gene_data.pid,
	};
	var $link = $("<a />")
		.attr("href", format_url(urls.glist, url_pars))
		.html(name);
	return $link;
}

function format_GC(val) {
	var gc = (val * 100).toFixed(0);
	gcbox = $("<p />").text(( gc > 0 ? "+" : "" ) + gc + "%");
	gcbox.addClass("gcbox");
	if (gc == 0 || Math.abs(gc) < 0.5) {
		gcbox.addClass("gc_zero");
	}
	if (gc > 2) {
		gcbox.addClass("gc_vhigh");
	}
	else if (gc > 0) {
		gcbox.addClass("gc_high");
	}
	if (gc < -2) {
		gcbox.addClass("gc_vlow");
	}
	else if (gc < 0) {
		gcbox.addClass("gc_low");
	}
	return gcbox;
}

function format_strand(val) {
    var dir_sign = (val == -1 ? '-' : '+');
    var dir = $('<p />')
        .text(dir_sign)
        .attr( "class", "strand_sign" );
    return dir;
}

function format_length(feat, loc_length) {
    len_str = ''
    if (feat == 'CDS') {
        len_str = Math.floor(loc_length/3) + '&nbsp;aa';
    } else {
        len_str = loc_length + '&nbsp;bp'
    }
    var len = $('<p />')
        .html(len_str)
        .attr( "class", "loc_length" );
    return len;
}

function loading_on(text) {
	var $l = $("#loading");
	$l.empty();
	if (!text) {
		text = 'Loading data...';
	}
	var message = $("<span />").html(text);
	message.append("<image src='css/24px-spinner-0645ad.gif' />");
	$l.append(message);
	$l.show();
}

function loading_off() {
	$("#loading")
		.hide()
		.empty();
}

function break_filter( data ) {
	if (strict_filter( data )) {
		var filter1 = data.break_size1 >= get_par( 'break_min2' );
		var filter2 = data.break_size2 >= get_par( 'break_min1' );
		if ( get_par( "conditional" ) == "AND" ) {
			return filter1 && filter2;
		} else {
			return filter1 || filter2;
		}
	} else {
		return false;
	}
}

function strict_filter( data ) {
	if ( data.inblocks1 <= get_par( 'strict' ) && data.inblocks2 <= get_par( 'strict' )) {
		return true;
	} else {
		return false;
	}
}

function get_label(b) {
	var label = b.breakid;
	if ("break_sum" in b) {
		label = b.break_sum.substr(0, 6);
	}
	return label;
}

