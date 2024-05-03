<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Database summary</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/summary.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.storageapi.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/summary.js"></script>

	</head>
	<?php require_once("common.php"); ?>
	<nav>
		<?php 
				print_sidebar(); 
		?>
	</nav>
	<body>
		<?php 
			print_header("viewer");
		?>
		<div id="content">
			<h3>Genome characteristics</h3>
			<table id="genomes" style="display:none"></table>
			<div id="links" style="display:none"><ul></ul></div>
			<div class="centered_box">
			<h3>Analysis of the synteny breaks in the database</h3>
			<p>Pairwise comparison of all genomes, with links to the breaks dotplot and the genomic islands ranking of each comparison.</p>
			</div>
			<table id="links_table" style="display:none"></table>
			<div class="centered_box">
				<span id="loading"></span>
				<div class="infobox">
				<ul>
				<li><img src="css/dotplot_32.png" alt="Show dotplot icon"> = Dotplot</li>
				<li><img src="css/ranking_32.png" alt="Show rankings icon"> = List of the genomic islands</li>
				<li>"synt: xx%" indicates the level of synteny between two genomes (number of orthologs in synteny blocks / number of orthologs between two genomes).</li>
				</ul>
				<button id="clear_cache" type="button">Clear cache</button>
				</div>
			</div>
		</div>
	</body>
</html>

