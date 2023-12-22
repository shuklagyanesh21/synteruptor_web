<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Breaks alignment</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/aligner.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/jquery/d3.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/aligner.js"></script>
	</head>
<nav>
		<?php
			require_once("common.php");
			print_sidebar();
		?>		
	</nav>
	<body>
<?php
$name = "Breaks alignment ";
if (isset($_GET["breakid"])) {
	$name .= " #" . $_GET["breakid"];
}
print_header("aligner", $name);
?>
	<div id="content">
	<h2>Breaks alignment</h2>
		<div id="links">
		</div>
		<div id="loading"></div>
		<div id="message"></div>
		<div id ="data_content">
		<div id="intro" style="display: none;">
		</div>
		<div id="canvas"></div>
		<div class="infobox legend_box">
			<h3>Legend</h3>
			<ul>
				<li><span class="legend_ortho">CDS with orthologs</span></li>
				<li><span class="legend_pseudo">Pseudogenes</span></li>
				<li><span class="legend_other">Other genes (RNAs)</span></li>
				<li>In the break of the reference genome:<ul>
					<li><span class="legend_noortho1">CDS without ortholog</span></li>
					<li><span class="legend_ortho1">CDS with ortholog found outside of the break</span></li>
				</ul></li>
				<li>In the break of the compared genomes:<ul>
					<li><span class="legend_noortho2">CDS without ortholog</span></li>
					<li><span class="legend_ortho2">CDS with ortholog found outside of the break</span></li>
				</ul></li>
		</ul>
		</div>
		<div id="footer" style="clear:both; padding: 2em;"></div>
	</div>
	</body>
</html>
