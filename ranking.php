<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>List of the genomic islands</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/ranking.css">
		<link rel="stylesheet" type="text/css" href="css/filter.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.stickytableheaders.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.tablesorter.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.storageapi.min.js"></script>
		<script type="text/javascript" src="js/jquery/d3.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/ranking_sort.js"></script>
		<script type="text/javascript" src="js/ranking.js"></script>
		<script type="text/javascript" src="js/filter.js"></script>
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
print_header("viewer", "List of the genomic islands");
?>
	<div id="content">
		<h2>List of the genomic islands</h2>
		<a id="dotplot_link" href="dotplot.php">Dotplot</a>
		<div id="message" style="display:none"></div>
		<div id="stats">
			<div class="field1">
				<h4>Genome selection</h4>
				Genome 1: <select id="sp1" name="select1"></select><br />
				Genome 2: <select id="sp2" name="select2"></select><br />
				<button id="swapper" type="button">Swap the genomes</button>
			</div>
			<div class="field2" id="params">
				<h4>Filter<span class="information" title="Limit the number of breaks displayed with a filter on the size of the breaks in both genomes.">?</span></h4>
				<span id="filter_box"></span>
				<div style='border: 1px solid black;' id='filter_plot'></div>
			</div>
		</div>
		<div id="custom">
			<p>Custom score and legend</p>
			<div id="custom_hidden" style="display: none">
				<table id="sortlist"></table>
				<button id="reset_sort">Reset values</button>
			</div>
		</div>
		<a id="csv_link" href="">Download Table (CSV)</a><br />
		<span><span id="nbreaks">No</span> breaks</span>
		<div id="loading" style="display:inline;"></div>
		<div id="ranking_box">
			<table id="ranking" class="tablesorter" style="display:none;"></table>
		<div>
	</body>
	</div>
</html>
