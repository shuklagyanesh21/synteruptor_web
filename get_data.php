<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once('common.php');
require_once('lib_db.php');

/**************************************************************/
//Functions to retrieve data from the database
function get_genomes_list($dbh) {
	return array(
		'genomes' => get_genomes($dbh),
		'genomes_stats' => get_genomes_stats($dbh),
		'gparts' => get_all_gparts($dbh),
		'can_search' => get_setting("can_search"),
	);
}

function get_genomes_num_ortho($dbh) {
	return array(
		'num_ortho' => get_genomes_orthos($dbh),
	);
}

function get_a_gene($dbh) {
	if (isset($_GET['pid'])) {
		return get_gene($dbh);
	} else {
		die_msg('Gene pid needed.');
	}
}

function get_ranking_list($dbh) {
	if (isset($_GET['sp1']) and isset($_GET['sp2'])) {
		return get_ranking_data($dbh);
	} else {
		die_msg('Ranking data needs genomes names');
	}
}

function get_break_genes($dbh) {
	if (isset($_GET['breakid']) and isset($_GET['sp'])) {
		$break_data = get_break_data($dbh);
		$data = array(
			'break'			=> $break_data,
			'break_genes'		=> get_break_genes_by_id($dbh, $_GET['breakid'], $_GET['sp']),
		);
		return $data;
	} else {
		die_msg('Missing valid breakid + sp');
	}
}

function get_break_genes_by_id($dbh, $breakid, $sp) {
	if (isset($breakid) && isset($sp)) {
		return get_all_break_genes($dbh, $breakid, $sp);
	} else {
		die_msg('Missing valid breakid + sp');
	}
}

function get_breaks_group($dbh) {
	if (isset($_GET['breakid'])) {
		// Retrieve the data of this break
		$ref_data = get_break_data($dbh);
		$ref_sp = $ref_data[ "sp1" ];
		// Then, retrieve the list of similar breaks
		$group = get_similar_breaks($dbh, $ref_data['graphid'], $ref_sp);
		
		// Now, retrieve the content of all genomes for each break
		$group_breaks = array();
		foreach ($group as $break) {
			$group_breaks[ $break[ "sp2" ] ] = array(
				'genes' => array(
					'break' => 	get_break($dbh, $break, 2),
					'left'		=> get_block($dbh, $break['left_block'], 2),
					'right'		=> get_block($dbh, $break['right_block'], 2),
				),
				'data' => $break
			);
		}
		$group_breaks[ $ref_sp ] = array(
			'genes' => array(
				'break' => 	get_break($dbh, $ref_data, 1),
				'left'		=> get_block($dbh, $ref_data['left_block'], 1),
				'right'		=> get_block($dbh, $ref_data['right_block'], 1),
			),
			'data' => $ref_data,
		);
		$data = array(
			'ref' => $ref_sp,
			'genomes' => $group_breaks
		);
		return $data;
	} else {
		die_msg('Missing valid breakid');
	}
}

function get_break_lists($dbh) {
	if (isset($_GET['breakid']) and $_GET['breakid'] != '') {
		$break_data = get_break_data($dbh);
		
		if ($break_data['left_block'] and $break_data['right_block']) {
			$data = array(
				'break'			=> $break_data,
				'left_block'		=> get_block($dbh, $break_data['left_block']),
				'right_block'		=> get_block($dbh, $break_data['right_block']),
				'break1'		=> get_break($dbh, $break_data, 1),
				'break2'		=> get_break($dbh, $break_data, 2),
				'similar_breaks'	=> get_similar_breaks($dbh, $break_data['graphid'], $break_data["sp1"]),
				'overlapping_breaks'	=> get_overlapping_breaks($dbh, $break_data['graphid'], $break_data["sp1"]),
				'graph'			=> get_graph_data($dbh, $break_data['graphid']),
				'can_search'		=> get_setting("can_search"),
			);
			return $data;
		} else {
			die_msg('No left or right block found');
		}
	} else {
		die_msg('Missing valid breakid');
	}
}

function get_dotplot_lists($dbh) {
	if (isset($_GET['sp1']) AND isset($_GET['sp2'])) {
		$data = array(
			'blocks' => get_all_blocks($dbh),
			'breaks' => get_all_breaks($dbh),
			'orthos' => get_all_orthos($dbh),
			'gocs'   => get_all_gocs($dbh),
			'trnas' => array(
				'1' => get_all_trnas($dbh, 1),
				'2' => get_all_trnas($dbh, 2)
			),
		);
		return $data;
	} else {
		die_msg('Dotplot data needs genomes names');
	}
}

function get_genes_list($dbh) {
	if (isset($_GET['sp'])) {
		$data = array(
			'genes' => get_genes($dbh),
		);
		return $data;
	} else {
		die_msg('sp needed');
	}
}

function get_databases($all = false, $authorised = array()) {
	$data = get_databases_data($all, $authorised);
	return $data;
}

/****************************************************************/
// Map functions to the type of data needed
$functions = array(
	'genomes' => 'get_genomes_list',
	'genomes_ortho' => 'get_genomes_num_ortho',
	'gene' => 'get_a_gene',
	'break_genes' => 'get_break_genes',
	'ranking' => 'get_ranking_list',
	'break' => 'get_break_lists',
	'break_group' => 'get_breaks_group',
	'dotplot' => 'get_dotplot_lists',
	'genes_list' => 'get_genes_list',
);

/****************************************************************/
// MAIN
// Special: list of all databases 
if (isset($_GET['type']) && $_GET['type'] == 'databases') {
	$all = false;
	$authorised = array();
	if (isset($_GET['userdb']) && $_GET['userdb']=='true'){
		$all = true;
		$authorised = $_SESSION['db_ids'];
	}
	$data = get_databases($all, $authorised);
	print json_encode($data);
} else {
	$dbh = get_db();

	if (!$dbh) {
		die_msg("Can't join database");
	}

	// Check if the type is declared
	if (!isset($_GET['type'])) {
		die_msg('Type of data needed');
	}
	$type = $_GET['type'];
	if (!isset($functions[$_GET['type']])) {
		die_msg('Type of query is not declared');
	}
	else {
		// Get the data for the requested type
		$data = call_user_func($functions[$type], $dbh);
		print json_encode($data);
	}
}
?>

