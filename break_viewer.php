<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Genomic island viewer</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/break_viewer.css">
		<link rel="stylesheet" type="text/css" href="css/break_svg.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/jquery/d3.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/break_viewer.js"></script>
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
$name = "Break";
if (isset($_GET["breakid"])) {
	$name .= " #" . $_GET["breakid"];
}
print_header("viewer", $name);
?>
	<div id="content">
		<h2 id="break_title">Genomic island viewer</h2>
		<div id="loading"></div>
		<div id="message"></div>
		<div id ="data_content">
		<div id="intro" style="display: none;">
			<div id="links">
				<button type="button" class="swap" style="float: left;">Swap genomes</button>
			</div>
		</div>
		<div id="canvas"></div>
		<div>
			<table id="infos">
				<tr>
					<td id="description1"></td>
					<td id="description2"></td>
				</tr>
			</table>
			<table id="infos_similar">
				<tr>
					<td>
						<h4>List of genomes grouped by genes content similarity</h4>
						<span><a id="aligner_link" href="">View breaks alignment</a></span><br />
						<ol id="united_nodes"></ol>
						<span id="similar_num">Similar breaks:</span><select id="similar_breaks"></select>
						<br><button type="button" class="swap">Swap genomes</button>
						<br><br>
						<h4>Overlapping breaks</h4>
						<ul id="overlapping_breaks"></ul>
					</td>
					<td id="united_graph">
						<h4>Breaks graph <span class="information" title="This graph represents the same break found in various genome at the same position. When two genomes share a link, then there is a break between them. When two genomes have no break at this position between them, they are grouped in a single node (names separated by /). All the links can be explored further in the list of breaks on the left.">?</span></h4>
					</td>
				</tr>
			</table>
		</div>
		<div id="genes_tables">
			<h2>Left synteny block</h2>
			<table id="left_block" style="display: none; clear: both; background: inherit;">
			<tr>
				<td><table id="left1" class="genes"></table></td>
				<td><table id="left2" class="genes"></table></td>
			</table>
			<div style="clear: both;"></div>
			<h2>Genomic island</h2>
			<table id="breaks" style="display: none; clear: both">
			<tr>
				<td><table id="break1" class="genes"></table></td>
				<td><table id="break2" class="genes"></table></td>
			</tr>
			</table>
			<div style="clear: both;"></div>
			<h2>Right synteny block</h2>
			<table id="right_block" style="display: none; clear: both">
			<tr>
				<td><table id="right1" class="genes"></table></td>
				<td><table id="right2" class="genes"></table></td>
			</tr>
			</table>
		</div>
		</div>
		<div id="footer" style="clear:both; padding: 2em;"></div>
	</div>
	</body>
</html>
