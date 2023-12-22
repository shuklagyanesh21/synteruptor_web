<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Contact</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/list.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.stickytableheaders.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.storageapi.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/list.js"></script>
	</head>
<?php
	require_once("common.php");
	?>
	<nav>
		<?php 
				print_sidebar(); 
		?>
	</nav>
	<body>
<?php
print_header("viewer", "Genes list");
?>
<div id="content">
<div class="centered_box">
	<h2>Contact</h2>
	<p>If you want to ask questions:</p>
	<ul>
		<li>about Synteruptor (program or site)</li>
		<li>file a bug</li>
		<li>ask to build a Synteruptor database with more genomes than allowed on this site</li>
		<li>or ask that a database generated on this site be made public on the front page</li>
	</ul>
	<p>please contact us at the following address:</p>
	<ul>
		<li><?php echo get_mail() ?></li>
	</ul>
	</div>
</div>
</body>
	</html>

