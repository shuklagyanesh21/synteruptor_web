<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Genes list</title>
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
		print_sidebar();
	?>
	<body>
<?php
print_header("viewer", "Genes list");
$site_name = $_GET["sp"];
?>
	<div id="content">
		<h2>Genes list</h2>
		<p>This page shows all the genes in the genome <?php echo $site_name ?>, ordered by their position. The right-hand column lists the breaks in which a gene may be found against one or several other genomes.</p>
		<div id="message" style="display:none"></div>
		<div>Genome: <select id="sp" name="select"></select></div>
		<div>Start: <input type="number" id="from" value=0 min=0 max=99999 step=1 size=4 /> Range: <input type="number" id="range" value=100 min=1 max=1000 step=1 size=3 /></div>
		<div id="loading"></div>
		<div class="navbuttons">
			<input type="button" class="prev" value="Previous" />
			<input type="button" class="next" value="Next" />
		</div>
		<table id="list" class="tablesorter" style="display:none;"></table>
		<div class="navbuttons">
			<input type="button" class="prev" value="Previous" />
			<input type="button" class="next" value="Next" />
		</div>
	</div>
	</body>
	</div>
</html>

