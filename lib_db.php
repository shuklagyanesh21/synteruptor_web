<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("common.php");
$dbdir = get_setting("db_dir");

/**********************************************************/
// Check variable type (convert if necessary)
function parseVal($dat) {
    foreach ($dat as $key => $val) {
        if ( ctype_digit( $val ) ) {
            $dat[ $key ] = intval( $val );
        } elseif (is_numeric($val)) {
            $dat[ $key ] = floatval( $val );
        } elseif (preg_match("/^\d+,\d+$/", $val)) {
            $val = str_replace(",", ".", $val);
            $dat[ $key ] = floatval( $val );
        }
    }
    return $dat;
}

// Json dying message
function die_msg($message = '', $details = '') {
	die(json_encode(array('outcome' => false, 'message' => $message, 'details' => $details)));
}

// Get available databases
function get_available_dbs_list( $all = true , $authorised = array()) {
	global $dbdir;
	$files = scandir($dbdir);
	$hfiles = array();
	if (!$files) {
		return $hfiles;
	}
	// remove dirs
	for ($i = 0 ; $i < count($files); $i++) {
		if ($files[$i] == '.'
			or $files[$i] == '..'
			or substr($files[$i], -7) != '.sqlite'
			or (!$all and substr($files[$i], 0, 3) == 'mgn')
		) {
			continue;
		}
if (!empty($authorised) and substr($files[$i], 0, 3) == 'mgn' and !in_array(substr($files[$i], 0, 9),$authorised)){
			continue;
		}
		$hfiles[] = $files[$i];
	}
	return $hfiles;
}

// Connects to the db and returns the database handler
function get_db($version = null) {
	$allowed = get_available_dbs_list();
	if (!isset($version)) {
		if ( isset($_GET['version'])) {
			$version = $_GET['version'] . ".sqlite";
		} else {
			$version = $allowed[0];
		}
	}
	if (in_array($version, $allowed)) {
		return get_db_connection($version);
	} else {
		die_msg('Invalid database name: ' . $version, 'Undefined database name: there is no file with this name');
	}
}

function get_db_connection($db) {
	global $dbdir;
	$dbh;
        $dbpath = $db;
        if (! preg_match("/\.sqlite$/i", $dbpath)) {
            $dbpath = "$dbpath.sqlite";
        }
        error_log('['.date('YYYY-MM-dd HH:mm:ss').']'."Get db connection to $dbpath in $dbdir");
	try {
		$dbh = new PDO("sqlite:$dbdir/" . $dbpath, '', '', array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
	}
	catch(PDOException $ex) {
		die_msg('Unable to connect to database.', $ex->getMessage());
	}
	return $dbh;
}

function get_db_data($dbh, $query, $vals = array(), $key = '') {
	try {
		$result = $dbh->prepare($query);
		$result->execute($vals);
		$result->setFetchMode(PDO::FETCH_ASSOC);
		
		$all_data = array();
		while ($data = $result->fetch()) {
			if ($key != '') {
				$all_data[ $data[$key] ] = parseVal($data);
			} else {
				$all_data[] = parseVal($data);
			}
		}
		return $all_data;
	} catch (PDOexception $e) {
//            die_msg('Query error', "''$query'' with values(" . join(', ', $vals) . ") [" . $e->getMessage()) . "]";
            return array();
	}
}

function get_condvals($conds) {
	$cond = array();
	$vals = array();
	foreach ($conds as $key => $val) {
		if (isset($val) and !is_null($val)) {
			$cond[] = $key;
			$vals[] = $val;
		} else {
			$cond[] = $key;
		}
	}
	return array($cond, $vals);
}

function get_cond($conds) {
	$cond = get_condvals($conds);
	return join(' AND ', $cond[0]);
}

function get_vals($conds) {
	$cond = get_condvals($conds);
	return $cond[1];
}

function has_table($dbh, $table) {
	$conds = array();
	$conds["type='table'"] = null;
	$conds["name=?"] = $table;
	$query = 'SELECT name FROM sqlite_master WHERE ' . get_cond($conds);
	$data = get_db_data($dbh, $query, get_vals($conds));
	return isset( $data[0] );
}

/*********************************************************/
// Retrieve the list of available databases
function get_databases_data($all = false, $authorised = array()) {
	$dbs = get_available_dbs_list( $all, $authorised );
	$data = array();
	foreach ($dbs as $db) {
		$dbh = get_db($db);
		$db = preg_replace("/.sqlite$/", "", $db);
		$data[ $db ] = get_database_data($dbh);
	}
	return $data;
}

function get_database_data($dbh) {
	if (has_table($dbh, 'info')) {
		$conds = array();
		$query = 'SELECT * FROM info';
		$data = get_db_data($dbh, $query, get_vals($conds));
		return $data[0];
	} else {
		return array();
	}
}

/*********************************************************/
// Retrieve the list of genomes + gparts
function get_genomes($dbh) {
	$query = "SELECT * FROM genomes ORDER BY name";
	return get_db_data($dbh, $query, array(), 'sp');
}

function get_genomes_orthos($dbh) {
	$query = "SELECT sp1, sp2, count(*) AS num_ortho FROM orthos_all GROUP BY sp1, sp2;";
	$raw = get_db_data($dbh, $query, array());
	
	$data = array();
	for ($i = 0; $i < count($raw); $i++) {
		$sp1 = $raw[$i]['sp1'];
		$sp2 = $raw[$i]['sp2'];
		$data[ $sp1 ][ $sp2 ] = array(
			'num_ortho' => $raw[$i]['num_ortho'],
		);
	}
	return $data;
}

function get_genomes_stats($dbh) {
	$query = "SELECT sp1, sp2, count(*) AS blocks_count, sum(block_size) AS blocks_sum FROM blocks_all GROUP BY sp1, sp2;";
	$raw = get_db_data($dbh, $query, array());
	
	$data = array();
	for ($i = 0; $i < count($raw); $i++) {
		$sp1 = $raw[$i]['sp1'];
		$sp2 = $raw[$i]['sp2'];
		$data[ $sp1 ][ $sp2 ] = array(
			'blocks_count' => $raw[$i]['blocks_count'],
			'blocks_sum' => $raw[$i]['blocks_sum'],
		);
	}
	return $data;
}

/***********************************************************
* GENE FUNCTIONS
***********************************************************/
function get_gene($dbh) {
	$conds = array();
	$conds['pid=?'] = $_GET['pid'];
	
	$query = 'SELECT * FROM genes WHERE ' . get_cond($conds);
	$data = get_db_data($dbh, $query, get_vals($conds));
	return $data[0];
}

function get_genes($dbh) {
	$conds = array();
	$conds['sp=?'] = $_GET['sp'];
	
	$from = isset($_GET['from']) ? $_GET['from'] : 0;
	if ($from < 0) { $from = 0; }
	$range = isset($_GET['range']) ? $_GET['range'] : 100;
	if ($range <= 0) {$range = 1; }
	if ($range > 1000) { $range = 1000; }
	$to = $from + $range;
	$conds['genes.pnum_all>=?'] = $from;
	$conds['genes.pnum_all<=?'] = $to;
	
	$conds['(side=1 OR side IS NULL)'] = null;
	
	$query = 'SELECT genes.*, sp2, breakid FROM genes LEFT JOIN breaks_genes ON genes.pid=breaks_genes.pid WHERE ' . get_cond($conds) . ' ORDER BY pnum_all';
	$data = get_db_data($dbh, $query, get_vals($conds));
	$data = filter_genes($data);
	return merge_genes_breaks($data);
}

function filter_genes($data) {
	for ($i = 0; $i < count($data); $i++) {
		$g = $data[$i];
		if ($g["sequence"]) {
			unset($g["sequence"]);
		}
		$data[$i] = $g;
	}
	return $data;
}

function merge_genes_breaks($data) {
	$i = 0;
	$j = -1;
	$prev = '';
	$merged = array();
	for ($i = 0; $i < count($data); $i++) {
		$g = $data[$i];

		# No break: next
		if (!$g["breakid"] || $g["breakid"] == "") {
			$j++;
			unset($g["breakid"]);
			unset($g["sp2"]);
			$merged[$j] = $g;
			$prev = '';
		}
		# Unknown pid: new break group
		else if ($g["pid"] != $prev) {
			$j++;
			$g["breaks"] = array(
				$g["sp2"] => $g["breakid"],
			);
			unset($g["breakid"]);
			unset($g["sp2"]);
			$merged[$j] = $g;
			$prev = $g["pid"];
		# Otherwise, add the break to the pid
		} else {
			$merged[$j]["breaks"][ $g["sp2"] ] = $g["breakid"];
		}
	}
	return $merged;
}

function get_breaks_gene($dbh, $pid) {
	$conds = array();
	$conds['(sp=sp1 OR sp1 IS NULL)'] = null;
	$conds['genes.pid=?'] = $pid;
	$query = 'SELECT sp, sp1, sp2, genes.product AS product, breakid FROM genes LEFT OUTER JOIN breaks_genes on genes.pid=breaks_genes.pid WHERE ' . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds));
}

function get_all_break_genes($dbh, $breakid, $sp) {
	$conds = array();
	$conds['sp=?'] = $sp;
	$conds['breakid=?'] = $breakid;
	$conds['genes.feat=?'] = "CDS";
	$query = 'SELECT genes.* FROM genes LEFT OUTER JOIN breaks_genes on genes.pid=breaks_genes.pid WHERE ' . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds));
}

/***********************************************************
* BREAK FUNCTIONS
***********************************************************/
function get_break_data($dbh) {
	// Prepare query
	$conds = array();
	$conds['R.breakid=?'] = $_GET['breakid'];
	$conds['R.breakid=B.breakid'] = null;
	
	$query = 'SELECT * FROM breaks_all B, breaks_ranking R WHERE ' . get_cond($conds);
	$data = get_db_data($dbh, $query, get_vals($conds));
	if (count($data) == 1) {
		return $data[0];
	} else {
		die_msg("No break data", $query);
	}
}

function get_block($dbh, $block_name, $num = 0) {
	// Prepare query
	$conds = array();
	$conds['blockid=?'] = $block_name;
	
	$query = 'SELECT * FROM blocks_all WHERE ' . get_cond($conds);
	$block_data = get_db_data($dbh, $query, get_vals($conds));
	
	# Get block genes for both genomes
	if ($num == 1) {
		return get_block_genes($dbh, $block_data[0], "1");
	}
	elseif ($num == 2) {
		return get_block_genes($dbh, $block_data[0], "2");
	} else {
		$blocks = array(
			'block1' => get_block_genes($dbh, $block_data[0], "1"),
			'block2' => get_block_genes($dbh, $block_data[0], "2"),
		);
		return $blocks;
	}
}

function get_block_genes($dbh, $data, $num) {
	// Get all genes in the block
	$conds = array(
		'G.sp=?' => $data['sp' . $num],
		'S.pid=?' => $data['start' . $num],
		'E.pid=?' => $data['end' . $num],
		'G.sp=S.sp' => null,
		'G.sp=E.sp' => null,
		'G.gpart=S.gpart' => null,
		'G.gpart=E.gpart' => null,
		'S.gpart=E.gpart' => null,
		'((S.pnum_all < E.pnum_all AND G.pnum_all > S.pnum_all-1 AND G.pnum_all < E.pnum_all+1) OR (S.pnum_all > E.pnum_all AND G.pnum_all < S.pnum_all+1 AND G.pnum_all > E.pnum_all-1))' => null,
	);
	$dir = $data['direction'];
	
	$order = '';
	if ($dir == 1 or $num == 1) {
		$order = 'G.pnum_all';
	} else {
		$order = 'G.pnum_all DESC';
	}
	
	$query = 'SELECT G.* FROM genes G, genes S, genes E WHERE ' . get_cond($conds) . ' ORDER BY ' . $order;
	return get_db_data($dbh, $query, get_vals($conds));
}

function get_break($dbh, $break_data, $num) {
	$conds = array(
		'breakid=?' => $break_data['breakid'],
		'side=?' => $num
	);
	$query = 'SELECT breaks_genes.*, genes.* FROM breaks_genes LEFT JOIN genes ON breaks_genes.pid=genes.pid WHERE ' . get_cond($conds);
	$dat = get_db_data($dbh, $query, get_vals($conds));
	/*
	foreach ($dat as $k => $v) {
		if ( $dat[$k] && $dat[$k]['sequence'] ) {
			unset( $dat[$k]['sequence'] );
		}
	}
	 */
	return $dat;
}

function get_similar_breaks($dbh, $graphid, $ref) {
	$conds = array(
		"R.graphid=?" => $graphid,
		"R.breakid=B.breakid" => null,
		"B.sp1=?" => $ref,
	);
        $query = "SELECT B.* FROM breaks_ranking R, breaks_all B WHERE " . get_cond($conds);
        $data = get_db_data($dbh, $query, get_vals($conds));
        return $data;
}

function get_overlapping_breaks($dbh, $graphid, $ref) {
	$conds = array(
		"R1.graphid=?" => $graphid,
		"R2.graphid!=R1.graphid" => null,
		"R1.breakid=B1.breakid" => null,
		"R2.breakid=B2.breakid" => null,
		"B1.sp1=?" => $ref,
		"B2.sp1=?" => $ref,
		"((B1.pnum_CDS_right1 >= B2.pnum_CDS_right1 AND B1.pnum_CDS_right1 <= B2.pnum_CDS_left1) OR (B1.pnum_CDS_right1 >= B2.pnum_CDS_left1 AND B1.pnum_CDS_right1 <= B2.pnum_CDS_right1) OR (B1.pnum_CDS_left1 <= B2.pnum_CDS_left1 AND B1.pnum_CDS_right1 >= B2.pnum_CDS_right1))" => null,
	);
	$query = "SELECT B2.*, R2.graphid FROM breaks_ranking R1, breaks_all B1, breaks_ranking R2, breaks_all B2 WHERE " . get_cond($conds) . " GROUP BY B1.sp1, R2.graphid";
	$data = get_db_data($dbh, $query, get_vals($conds));
        return $data;
}

function get_graph_data($dbh, $graphid) {
	$conds = array(
		'graphid=?' => $graphid,
	);
	$query = "SELECT from_name, to_name FROM breaks_graph WHERE " . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds));
}

function get_ranking_data($dbh) {
	$cond = array();
	$vals = array();
	
	// sp1 and 2
	if (isset($_GET['sp1'])) {
		$cond[] = 'sp1=?';
		$vals[] = $_GET['sp1'];
	}
	if (isset($_GET['sp2'])) {
		$cond[] = 'sp2=?';
		$vals[] = $_GET['sp2'];
	}

	$size1 = '';
	$size2 = '';
	if (isset($_GET['break_min1'])) {
		$n = $_GET['break_min1']-1;
		if ($n > -2 && $n < 10000) {
			$size1 = "real_size2 > $n";
		}
	}
	if (isset($_GET['break_min2'])) {
		$n = $_GET['break_min2']-1;
		if ($n > -2 && $n < 10000) {
			$size2 = "real_size1 > $n";
		}
	}
	$conditional = 'OR';
	if (isset($_GET['conditional'])) {
		if ($_GET['conditional'] == 'OR') {
			$conditional = 'OR';
		} else if ($_GET['conditional'] == 'AND') {
			$conditional = 'AND';
		}
	}
	
	if ($size1 and $size2) {
		$cond[] = "($size1 $conditional $size2)";
	} else if ($size1) {
		$condt[] = $size1;
	} else if ($size2) {
		$condt[] = $size2;
	}
	$cond[] = "real_size1 + real_size2 > 0";
	
	$ord = array('tRNA_both DESC', 'real_size2 DESC', 'real_size1 DESC', 'cycle DESC');
	$limit = ' LIMIT 10000';
	$condition = join(' AND ', $cond);
	$order = ' ORDER BY ' . join(', ', $ord);
	$query = 'SELECT *, (real_size2 * 100.0 / (real_size1 + real_size2)) AS diff FROM breaks_ranking LEFT JOIN breaks_all ON breaks_ranking.breakid=breaks_all.breakid WHERE ' . $condition . $order . $limit;
	return get_db_data($dbh, $query, $vals);
}

/************************************************************
* DOTPLOT DATA
************************************************************/
function get_all_blocks($dbh) {
	$conds = array(
		'sp1=?' => $_GET['sp1'],
		'sp2=?' => $_GET['sp2']
	);
	$query = "SELECT blockid, pnum_display_start1, pnum_display_end1, pnum_display_start2, pnum_display_end2 FROM blocks_all WHERE " . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds));
}

function get_all_breaks($dbh) {
	$conds = array(
		'sp1=?' => $_GET['sp1'],
		'sp2=?' => $_GET['sp2'],
		'A.breakid=R.breakid' => null
	);
	
	# Get blocks
	$query = "SELECT A.breakid AS breakid, A.*, pnum_display_left1, pnum_display_right1, pnum_display_left2, pnum_display_right2, break_size1, break_size2, real_size1, real_size2, direction, inblocks1, inblocks2 FROM breaks_all A, breaks_ranking R WHERE " . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds), 'breakid');
}

function get_all_orthos($dbh) {
	$conds = array(
		'sp1=?' => $_GET['sp1'],
		'sp2=?' => $_GET['sp2'],
		'noblock' => null,
	);
	$query = "SELECT oid, pid1, pid2, pnum_display1, pnum_display2, product1, product2 FROM orthos_all WHERE " . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds), 'oid');
}

function get_all_trnas($dbh, $num) {
	$conds = array(
		'sp=?' =>  $_GET['sp'.$num],
		'feat=?' => 'tRNA'
	);
	$query = "SELECT pid, pnum_display, product FROM genes WHERE " . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds));
}

function get_all_gparts($dbh) {
	# Get genome parts
	$query = "SELECT sp, gpart, min, max FROM genome_parts";
	$data = get_db_data($dbh, $query);
	$gparts = array();
	for ($i = 0; $i < count($data); $i++) {
		$gpart = $data[$i];
		$gparts[ $gpart["sp"] ][] = $gpart;
	}
	return $gparts;
}

function get_all_gocs($dbh) {
    $sp1 = $_GET['sp1'];
    $sp2 = $_GET['sp2'];
        $data = array(
        $sp1 => get_gocs($dbh, $sp1, $sp2),
        $sp2 => get_gocs($dbh, $sp2, $sp1),
    );
    return $data;
}

function get_gocs($dbh, $sp1, $sp2) {
	$conds = array(
		'sp1=?' =>  $sp1,
		'sp2=?' => $sp2,
	);
	$query = "SELECT pos, score FROM goc WHERE " . get_cond($conds);
	return get_db_data($dbh, $query, get_vals($conds));
}


?>

