<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("common.php");
$settings = parse_ini_file("settings.ini");
$max_size = ini_get('post_max_size');
$dbdir = get_setting("db_dir"); #"db";
$basedir = get_setting("upload_dir");
$builder = "upload_db.php";
$id = get_id();
$final_db_path = "";

if ($id) {
	define_id_paths($id);
}

function define_id_paths($new_id) {
	global $dbdir, $final_db_path;
	$final_db_path = "$dbdir/$new_id.upload.sqlite";
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

function init_config($new_id, $new_config) {
	define_id_paths($new_id);
}

function scan_sqlite() {
	global $final_db_path;
	if (file_exists($final_db_path)) {
		$db_name = str_replace(".sqlite", "", basename($final_db_path));
		return $db_name;
	}
}
?>
