<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE HTML>
<html>
<?php
require_once('common.php');
?>
<head>
	<meta charset="UTF-8">
	<title><?php site_name(); ?> tools</title>
	<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
	<link rel="stylesheet" type="text/css" href="css/common.css">
	<link rel="stylesheet" type="text/css" href="css/index.css">
</head>
<?php	print_sidebar(); ?>

<body>
<?php	print_header(); ?>
<div id="content">
	<div class="centered_box">
		<div class='index_box'>
		<h2>Download <?php echo $site_name ?></h2>
		<p><?php $site_name ?> is a combination of a set of scripts that create a synteny breaks database based on a set of genomes, and a web viewer to explore the data in a breaks database.</p>
			<div class='box'>
				Downloads:<br />
				<ul>
				<li><a href='dl/synteruptor.tar.gz'><?php echo $site_name ?> scripts</a></li>
				<li><a href='dl/synteruptor_web.tar.gz'><?php echo $site_name ?> website</a></li>
				</ul>
			</div>
			<a href="index.php">&lt; Back to Main Page</a>
		</div>
	</div>
</div>
</body>
</html>

