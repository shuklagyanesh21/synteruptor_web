<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once('upload_db_lib.php');

function temp_file() {
	global $basedir;
	if (!$basedir) {
		return null;
	}
	
	$tempfile = tempnam($basedir, 'mgn');
	$id = basename($tempfile);
	if(!in_array($id,$_SESSION["db_ids"])){$_SESSION["db_ids"][]=$id;}
	return $id;
}

// Create an empty folder with a unique random name
$tempfile = temp_file();

if (isset($tempfile)) {
	// Use the dir name as an id
	header("Location: $builder?id=$tempfile");
} else {
	echo "Error: invalid generated id. Please refresh the page.";
}
?>
