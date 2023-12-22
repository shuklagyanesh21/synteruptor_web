<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("search_lib.php");
$status_path = "$workdir/status.txt";

function check_status() {
	global $status_path;
	if (file_exists($status_path)) {
		$sh = fopen($status_path, "r");
		# Get the first line
		$first = trim(fgets($sh));
		fclose($sh);
		
		# Analyze
		if ($first == 'waiting') {
			return array(
				'status' => "waiting",
				'details' => "Files are ready: submission queued",
			);
		} else if ($first == 'ongoing') {
			return array(
				'status' => "ongoing",
				'details' => "Blast in progress",
			);
		} else if ($first == 'done') {
			return array(
				'status' => "done",
				'details' => "Blast done.",
			);
		} else if ($first == 'failed') {
			return array(
				'status' => "failed",
				'details' => "The building failed: please check your files and contact the author",
			);
		} else {
			return array(
				'status' => "error",
				'details' => "Unknown status: [$first]. Please contact the author",
			);
		}
	} else {
		return array(
			'status' => 'nostatus',
			'details' => 'No status found: the database hasn\'t been started yet',
		);
	}
}

function start_status() {
	global $status_path;
	# First check if there is not already a status file
	$status = check_status();
	if ($status["status"] == 'nostatus') {
		$sh = fopen($status_path, "w");
		chmod($status_path, 0777);
		fwrite($sh, "waiting");
		fclose($sh);
		return array(
			'status' => 'started',
			'details' => 'New status created',
		);
	}
	return array(
		'status' => "error",
		'details' => "Status already exists (" . $status['status'] . ")",
	);
}

function get_db_name() {
	global $workdir;
	$dbpath = "$workdir/database.txt";
	$fp = fopen($dbpath, "r");
	$dbname = fgets($fp);
	fclose($fp);
	return $dbname;
}

function get_results() {
	$dbname = get_db_name();
	require_once('lib_db.php');
	$dbh = get_db_connection($dbname);
	global $workdir;
	$result = "$workdir/result.txt";
	$query = get_query_name();
	# Read the results file
	$hits = array();
	$fp = fopen($result,"r");
	while($line = fgets($fp)) {
		$seg = explode("\t", rtrim($line));
		$dat = array(
			'hit' => $seg[1],
			'identity' => floatval($seg[2]),
			'qstart' => intval($seg[6]),
			'qend' => intval($seg[7]),
			'hstart' => intval($seg[8]),
			'hend' => intval($seg[9]),
			'evalue' => floatval($seg[10])
		);
		if ($query == '')
			$query = $seg[0];
		// Query the db to get
		$bgene = get_breaks_gene($dbh, $dat['hit']);
		$breaks = array();
		for ($i = 0; $i < count($bgene); $i++) {
			if ($bgene[$i]['breakid']) {
				$break = array(
					'breakid' => $bgene[$i]['breakid'],
					'sp' => $bgene[$i]['sp2'],
				);
				$breaks[] = $break;
			}
			$dat['sp'] = $bgene[$i]['sp'];
			$dat['product'] = $bgene[$i]['product'];
		}
		$dat['breaks'] = $breaks;
		$hits[ $seg[0] ][] = $dat;
	}

	$res = array(
		'query' => $query,
		'version' => $dbname,
		'hits' => $hits,
	);
	fclose($fp);
	
	return $res;
}

function get_query_name() {
	global $workdir;
	$query_path = "$workdir/query.faa";
	if (file_exists($query_path)) {
		$fp = fopen($query_path, "r");
		$first = fgets($fp);
		return substr($first, 1);
	} else {
		return '';
	}
}

$status = null;
# Check id
if (!check_id($id)) {
	$status = array(
		"status" => "error",
		"details" => "Invalid id ($id)",
	);
} else if (isset($_GET["command"])) {
	$command = $_GET["command"];

	# Check for the status of the current working dir
	if ($command == "check") {
		$status = check_status();
	# Start the job (=create an empty status file)
	} else if ($command == "start") {
		$status = start_status();
	} else if ($command == "results") {
		$status = get_results();
	} else {
		$status = array(
			"status" => 'error',
			"details" => 'invalid command',
		);
	}
} else {
	$status = array(
		"status" => "error",
		"details" => "No command",
	);
}

echo json_encode($status);
?>

