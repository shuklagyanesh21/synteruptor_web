function select_url_database(pars) {
	if (pars[ "version" ]) {
		$( "#db" ).val( pars[ "version" ] ).attr("selected", true);
	}
}

function summary_link() {
	var db = $( "#db" ).val();
	if (db) {
		var upar = {
			'version': db,
		};
		$( "#summary" )
			.attr( "href", format_url( urls.summary, upar ) )
			.text( "(Back to this database summary)" );
		
		var rpar = {
			'version': db
		};
		var redo_link = format_url( urls.search, rpar );
		$( "h2 a" ).attr( "href", redo_link );
	}
}

function text_is_ok() {
	var textarea_value = $("#seq").val();
	return (textarea_value != '');
}


// function run_qsub(id) {
// 	// run send_qsub.php to submit job to cluster with /home/scripts/run_job_as and qsub
// 	var qsub_url = format_url( urls.qsub, { 'id': id, 'run_script': "run_blaster.sh" } );
// 	console.log(qsub_url);
// 	$.ajax({
// 		url : qsub_url
// 	 }).done(function(data){
// 		console.log(data);
// 	 });
// }

$(function() {
	var pars = get_url_parameters();
	select_url_database(pars);
	summary_link();
	
	$( "#db" ).on( "change", function() {
		summary_link();
		// redo_link();
	});
	
	$( "#clear" ).on( "click", function(d) {
		$( "#seq" ).val( "" );
	});
	
	$( "#submitter" ).on( "click", function(e) {
		e.preventDefault();
		var database = $( "#db" ).val();
		
		if (text_is_ok()) {
			// Submit the post data and retrieve
			var data = {
				'db': database,
				'seq': $("#seq").val()
			};
			console.log(data);
			var start_url = format_url( urls.start_search, { 'version': database } );
			console.log(start_url);
			$.post( start_url, data, function(ans) {
				if (ans.status == 'success' && ans.id) {
					var pars = {
						'id': ans.id,
						'version': database
					};
					var new_url = format_url( urls.search, pars );
					console.log( new_url );
					window.location = new_url;
				} else {
					console.log( Sent );
					console.log( ans );
				}
			}, "json").fail(function(ans) {
				console.log(ans);
			});
		} else {
			alert("Please enter a sequence");
		}
	});
});

