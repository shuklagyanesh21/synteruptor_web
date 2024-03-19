<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<?php
require_once("common.php");
require_once("createdb_lib.php");
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
		<script type="text/javascript" src="js/createdb.js"></script>
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
<h2><?php site_name(); ?> database creator</h2>
<p>This page helps to create a <?php site_name(); ?> database (in sqlite3 format) based on genomes uploaded by the user.</p>
<p> The final database can be downloaded for local analyzis, or it can be explored on the <?php site_name(); ?> site.</p>
<p>Alternatively you can <a href="upload_db.php">upload a Synteruptor database</a> directly if you have generated a database yourself.</p>
<?php

if (isset($_GET["id"])) {
	echo '<div class="infobox">';
	echo '<h3>Restrictions</h3>';
	echo '<ul>';
	echo '<li>The files must be in Genbank format (.gb, .gbk, .gbff), or EMBL format (.dat, .embl), including the genomic sequences.</li>';
	echo '<li>The files can be compressed with gzip or zip for faster upload (.gz, .zip).</li>';
	echo "<li>The files have to be smaller than $max_size.</li>";
	echo "<li>At most $max_gbks genomes can be uploaded.</li>";
	echo "<li>The files must include the nucleotide sequences and structural annotations.</li>";
	echo "</ul>";
	echo "For bigger databases or genomes, you can run the scripts locally or ask us to do it for you, see the <a href='contact.php'>contact page</a>.";
	echo "</div>";
	
	echo '<div class="upload_box">';
	echo "<h3>Genomes upload</h3>";
	
	# Check id
	if (!check_id($id)) {
		echo "Invalid id ($id)<br>";
		echo "</div>";
		echo "<div class='button_container'><a href='createdb_start.php'><div class='button_link'>Start a new project</div></a></div>";
		exit;
	}

	# List the genome files in the dir
	$gbks = scan_gbks();
	$ngbks = count($gbks);
	echo "$ngbks uploaded genomes:";
	echo "<ol>";
	print_gbks($gbks);
	$config = get_config();
	if ($ngbks < $max_gbks && (!isset($config) || $config['status'] == 'preparation')) {
		$diff = $max_gbks - $ngbks;
		echo '<form id="uploader" action="createdb_add.php?id=' . $id . '" method="post" enctype="multipart/form-data">';
		echo $diff == 1 ? "<li>You can add one last genome: " : "<li>You can add up to $diff more genomes: ";
		echo " <input type='file' name='genomes[]' />";
		echo '<input type="submit" value="Send" /></li>';
	}
	echo "</ol>";

	if ($ngbks < 2) {
		echo "<span class='warning'>Not enough genomes to create a database ($ngbks < 2).</span>";
	} else {
		echo "<div id='building'></div>";
	}
	echo "</div>";
	
	$sitename = get_setting("site_name");
	echo '<div class="infobox">';
	echo '<h3>Information about the data provided and generated</h3>';
	echo "<ul>";
	echo "<li>The job will send you an e-mail (mandatory) when the database creation starts and when it ends. You can also check the progress by bookmarking this page: <a href='$builder?id=$id'>$site_name job: $id</a>.</li>";
	echo "<li>The mail provided will only be used to send the progress information.</li>";
	echo "<li>The files uploaded will be conserved until the database has been built, and they will then be deleted from our servers.</li>";
	echo "<li>The created database is not made public and can only be accessed with the random id created for it ($id).</li>";
	echo "<li>To make the created database public, <a href='contact.php'>please contact us</a>.</li>";
	echo "<li>Only the link provided in the the e-mail (or in the present page) can be used to access the generated database.</li>";
	echo "</ul>";
	echo "</div>";
} else {
	echo "<div class='button_container'><a href='createdb_start.php'><div class='button_link'>Start a new project</div></a></div>";
}
?>
</div>
</div>
<div id="tail" />
</body>
</html>

