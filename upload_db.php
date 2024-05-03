<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<?php
require_once("common.php");
require_once("upload_db_lib.php");
?>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title><?php site_name(); ?> database creator</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/upload.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="https://ajax.aspnetcdn.com/ajax/jquery.validate/1.13.1/jquery.validate.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
	</head>
<nav>
		<?php 
				print_sidebar(); 
		?>
	</nav>
	<body>
<?php
print_header("upload");
?>
<div id="content">
<div class="centered_box">
<h2><?php site_name(); ?> database upload</h2>
<p>This page helps to upload <?php site_name(); ?> database (in sqlite3 format) to this website.</p>
<?php

if (isset($_GET["id"])) {
	echo '<div class="infobox">';
	echo '<h3>Restrictions</h3>';
	echo '<ul>';
	echo '<li>Only one file</li>';
	echo "<li>The file has to be smaller than $max_size.</li>";
	echo "<li>Database suffix must be .sqlite</li>";
	echo "</ul>";
	echo "For bigger databases you should contact us directly, see the <a href='contact.php'>contact page</a>.";
	echo "</div>";
	
	echo '<div class="upload_box">';
	echo "<h3>Database file upload</h3>";
	
	# Check id
	if (!check_id($id)) {
		echo "Invalid id ($id)<br>";
		echo "</div>";
		echo "<div class='button_container'><a href='upload_db_upload.php'><div class='button_link'>Start the upload</div></a></div>";
		exit;
	}

	# Get the database file
	$new_db = scan_sqlite();
	if ($new_db) {
		echo "Uploaded the database file to <a href=\"summary.php?version=$new_db\">$new_db</a>";
		if(!in_array($new_db, $_SESSION["db_ids"])){$_SESSION["db_ids"][]=$new_db;}
	} else {
		echo '<form id="uploader" action="upload_db_add.php?id=' . $id . '" method="post" enctype="multipart/form-data">';
		echo " <input type='file' name='new_db' />";
		echo '<input type="submit" value="Send" /></li>';
	}
	echo "</div>";
} else {
	echo "<div class='button_container'><a href='upload_db_start.php'><div class='button_link'>Upload a new database</div></a></div>";
}
?>
</div>
</div>
<div id="tail" />
</body>
</html>
