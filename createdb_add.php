<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("createdb_lib.php");
$uploaded_array = array();
$errormsg = "";
$nerrors = 0;

# Check id
if (!check_id($id)) {
	echo "Invalid id: $id";
	echo "<a href='$builder'>Start a new project</a>";
	exit;
}

if (!isset($_FILES["genomes"])) {
	#$errormsg .= "<li>Wrong file type (only gb, gbk files allowed)</li>";
	$errormsg .= "<li>Max allowed size: " . ini_get('post_max_size') . " or " . ini_get('upload_max_filesize') . "</li>";
	$nerrors++;
} else {
	foreach ($_FILES["genomes"]["error"] as $key => $error)
	{
		$tmp_name = $_FILES["genomes"]["tmp_name"][$key];
		if (!$tmp_name) continue;

		$name = basename($_FILES["genomes"]["name"][$key]);

		// Check extension
		if (!preg_match("/\.(gb(k|ff)?|dat|embl)(\.gz|\.zip)?$/", $name)) {
			$errormsg .= "<li>Wrong file type for $name (only gb, gbk, gbff, dat, embl files allowed, with compression gz and zip permitted)</li>";
			$nerrors++;
		} else {
			if ($error == UPLOAD_ERR_OK) {
				if ( move_uploaded_file($tmp_name, $workdir . "/" . $name) ) {
					$uploaded_array[] .= "Uploaded file '".$name."'.<br/>\n";
				} else {
					$errormsg .= "<li>Could not move uploaded file '".$tmp_name."' to '".$name."'<li>";
					$nerrors++;
				}
			} else {
				$errormsg .= "<li>Upload error. [".$error."] on file '".$name."'</li>";
				$nerrors++;
			}
		}
	}
}

if ($nerrors == 0) {
	header("Location: $builder?id=$id");
} else {
	echo "Errors, please check:<ul>$errormsg</ul>\n";
	echo "<a href='$builder?id=$id'>Go back</a>";
}
?>

