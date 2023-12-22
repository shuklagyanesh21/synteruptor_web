<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("common.php");
$max_gbks = 6;
$max_size = ini_get('post_max_size');
$dbdir = get_setting("db_dir");
$basedir = get_setting("search_dir");
$builder = "search.php";
$id = get_id();
$workdir = "";
$status_file = check_status_file();

if ($id) {
	$workdir = "$basedir/$id";
}

function get_id() {
	if (isset($_GET["id"])) {
		return $_GET["id"];
	} else {
		return "";
	}

}

function check_id($id) {
	# Check for format (only ASCII letters and digits)
	if ( !preg_match( '/^[A-z0-9]+$/', $id ) ) {
		return false;
	}
	# Check	if the directory actually exists
	global $basedir;
	if ( !file_exists( $basedir . "/" . $id . "/" ) ) {
		return false;
	}
	return true;
}

function check_status_file() {
	global $basedir, $id;
	if (file_exists($basedir . "/" . $id . "/status.txt" )) {
		return true;
	} else {
		return false;
	}
}

function list_dbs( $authorised = array() ) {
	global $dbdir;
	$files = scandir($dbdir);
	$dbs = array();
	for ($i = 0; $i < count($files); $i++) {
		if (preg_match("/\.sqlite?$/", $files[$i])){
			$dbname = str_replace(".sqlite", "", $files[$i]);
		 	if (!empty($authorised) and preg_match("/^mgn/", $dbname) and !in_array($dbname, $authorised)) {
				continue;
			}
			if (empty($authorised) and preg_match("/^mgn/", $dbname)){
				continue;
			}
			$dbs[] = $dbname;
		}
	}
	# DB from url?
	if (isset($_GET['version']) && file_exists("$dbdir/" . $_GET['version'] . ".sqlite") && !in_array($_GET['version'], $dbs)) {
		array_unshift($dbs, $_GET['version']);
	}
	return $dbs;
}

function print_select($name, $list) {
	$options = array();
	for ($i = 0; $i < count($list); $i++) {
		$options[] = "<option>$list[$i]</option>";
	}
	return "<select name='$name' id='$name'>" . join("\n", $options) . "</select>";
}
?>

