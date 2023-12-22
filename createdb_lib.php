<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("common.php");
$settings = parse_ini_file("settings.ini");
$max_gbks = $settings["max_genomes"];
$max_size = ini_get('post_max_size');
$dbdir = get_setting("dbdir"); #"db";
$basedir = get_setting("upload_dir");
$builder = "createdb.php";
$id = get_id();
$workdir = "";
$config_path = "";

if ($id) {
	define_id_paths($id);
}

function define_id_paths($new_id) {
	global $basedir, $workdir, $config_path;
	$workdir = "$basedir/$new_id";
	$config_path = "$workdir/conf.txt";
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
	set_config($new_config);
}

function set_config($new) {
	global $config_path;
	
	# First get the config file if it exists
	$config = array();
	if (file_exists($config_path)) {
		$config = json_decode(file_get_contents($config_path), true);
	}
	# Then set it
	foreach ($new as $key => $val) {
		$config[$key] = $val;
	}
	# And write it back (create it if it does not exist)
	file_put_contents($config_path, json_encode($config));
	chmod($config_path, 0777);
}

function get_config() {
	global $config_path;
	if (file_exists($config_path)) {
		$config = json_decode(file_get_contents($config_path), true);
		return $config;
	}
}

function check_status_file() {
	global $basedir, $id;
	if (file_exists($basedir . "/" . $id . "/status.txt" )) {
		return true;
	} else {
		return false;
	}
}

function scan_gbks() {
	global $workdir;
	$files = scandir($workdir);
	$gbks = array();
	for ($i = 0; $i < count($files); $i++) {
		if (preg_match("/\.(gb(k|ff)?|dat|embl)(\.gz|\.zip)?$/", $files[$i])) {
			$gbks[] = $files[$i];
		}
	}
	return $gbks;
}

function print_gbks($gbks) {
	if (count($gbks) > 0) {
		for ($i = 0; $i < count($gbks); $i++) {
			echo "<li>$gbks[$i]</li>";
		}
	}
}
?>

