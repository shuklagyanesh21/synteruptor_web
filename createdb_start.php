<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once('createdb_lib.php');

function temp_dir() {
	global $basedir;
	
	$tempdir = tempnam($basedir, 'mgn');
	echo $tempdir;
	if (is_file($tempdir)) {
		unlink($tempdir);
		mkdir($tempdir);
		if (is_dir($tempdir)) {
			chmod($tempdir, 0777);
			$id = basename($tempdir);
			new_config($id);
			if(!in_array($id,$_SESSION["db_ids"])){$_SESSION["db_ids"][]=$id;}
			return $id;
		}
	}
	return null;
}

function new_config($new_id) {
	$new_config = array(
		'status' => 'preparation',
	);
	init_config($new_id, $new_config);
}

// Create an empty folder with a unique random name
$tempdir = temp_dir();

if (isset($tempdir)) {
	// Use the dir name as an id
	header("Location: $builder?id=$tempdir");
} else {
	echo "Error: invalid generated id. Please refresh the page.";
}
?>

