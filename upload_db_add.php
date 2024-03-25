<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("upload_db_lib.php");
require_once("lib_db.php");
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
		} else if (filesize($tmp_name) == 0) {
			$errormsg .= "<li>File is empty</li>";
			$nerrors++;
		} else {
			# Check there is data in the database
			try {
				$dbh = get_db_connection($tmp_name);
				if (!check_db($dbh)) {
					throw new DbException("Content of the db doesn't look right");
				}
			} catch(Exception $e) {
				$errormsg .= "<li>Exception: ".$e->getMessage()."</li>";
				$nerrors++;
			}

			if ($nerrors == 0) {
				# Just in case, to avoid collisions
				$num = 1;
				$new_id = $id;
				$new_db_path = $final_db_path;
				while(file_exists($new_db_path)) {
					$new_id = $id . "_" . $num;
					$new_db_path = str_replace("$id.sqlite", "$new_id.sqlite", $final_db_path);
					$num++;
					if ($num > 10) {
						$errormsg .= "<li>ID collision detected with $new_id in $new_db_path.<li>";
						$nerrors++;
						break;
					}
				}
				if ($nerrors == 0) {
					if ( move_uploaded_file($tmp_name, $new_db_path) ) {
						$uploaded_array[] .= "Uploaded file '".$name."'.<br/>\n";
					} else {
						$errormsg .= "<li>Could not move uploaded file '".$tmp_name."' to '".$name."'<li>";
						$nerrors++;
					}
				}
			}
		}
	}
}

if ($nerrors == 0) {
	header("Location: $builder?id=$new_id");
} else {
	echo "Errors, please check:<ul>$errormsg</ul>\n";
	echo "<a href='$builder?id=$id'>Go back</a>";
}
?>
