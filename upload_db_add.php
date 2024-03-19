<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("upload_db_lib.php");
$uploaded_array = array();
$errormsg = "";
$nerrors = 0;
global $final_db_path;

# Check id
if (!check_id($id)) {
	echo "Invalid id: $id";
	echo "<a href='$builder'>Start a new upload</a>";
	exit;
}

if (!isset($_FILES["new_db"])) {
	$errormsg .= "<li>Max allowed size: " . ini_get('post_max_size') . " or " . ini_get('upload_max_filesize') . "</li>";
	$nerrors++;
} else {
	if ($_FILES["new_db"]["error"] != UPLOAD_ERR_OK) {
		$errormsg .= "<li>Upload error. [".$error."] on file '".$name."'</li>";
		$nerrors++;
	} else {
		$tmp_name = $_FILES["new_db"]["tmp_name"];
		if (!$tmp_name) return;
		$name = $_FILES["new_db"]["name"];

		// Check extension
		if (!preg_match("/\.sqlite?$/", $name)) {
			$errormsg .= "<li>Wrong file type for $name (only .sqlite allowed)</li>";
			$nerrors++;
		} else {
			if ( move_uploaded_file($tmp_name, $final_db_path) ) {
				$uploaded_array[] .= "Uploaded file '".$name."'.<br/>\n";
			} else {
				$errormsg .= "<li>Could not move uploaded file '".$tmp_name."' to '".$name."'<li>";
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
