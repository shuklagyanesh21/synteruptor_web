<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html>
<html>
	<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<title>Dotplot</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.storageapi.min.js"></script>
		<script type="text/javascript" src="js/jquery/d3.min.js"></script>
		<script type="text/javascript" src="js/jquery/jquery.mousewheel.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/filter.js"></script>
		<script type="text/javascript" src="js/dotplot.js"></script>
		<script type="text/javascript" src="js/zoom.js"></script>
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/dotplot.css">
		<link rel="stylesheet" type="text/css" href="css/dotplot_svg.css">
		<link rel="stylesheet" type="text/css" href="css/filter.css">
	</head>
<?php require_once("common.php");?>
	<nav>
		<?php 
				print_sidebar(); 
		?>
	</nav>  
	<body>
<?php
print_header("viewer", "Dotplot");
?>
	<div id="content">
<div class="centered_box">
		<div id="leftcol">
			<h2>Dotplot</h2>
			<a id="ranking">List of the genomic islands</a>
			<div id="loading"></div>
			<div id="links"></div>
			<span id="message" style="display: none;"></span>
			<form id="params">
				<div class="field1">
				<h4>Genome 1</h4>
					<select id="sp1" name="select1"></select><br />
					<input type="number" id="start1" value=0 min=0 step=1><input type="number" id="end1" value=0 min=0 step=1><button type="submit" class="submitbutton">Update</button><br>
					<button type="button" id="clear1">Reset coordinates</button>
				<hr>
				<h4>Genome 2</h4>
				<select id="sp2" name="select2"></select><br />
				<input type="number" id="start2" value=0 min=0 step=1><input type="number" id="end2" value=0 min=0 step=1><button type="submit" class="submitbutton">Update</button><br/>
				<button type="button" id="clear2">Reset coordinates</button>
				<hr>
				<button id="swapper" type="button">Swap genomes</button>
				<hr>
				<button type="button" id="clearall">Reset both coordinates</button>
				</div>
				<div class="field2" id="params">
				<h4>Filter<span class="information" title="Limit the number of breaks displayed with a filter on the size of the genomic islands in both genomes.">?</span></h4>
				<span id="filter_box"></span>
				<div id='filter_plot'></div>
				</div>
			</form>
			<div class="subbox">
				<div class="boxtitle">Advanced display options...</div>
				<div class="boxcontent">
				<button id="show_goc">Hide GOC lines</button>
				<button id="show_trnas">Show tRNAs lines</button>
				<button id="show_orthos">Hide free orthologs (not in synteny blocks)</button>
				<button id="show_breaks_circles">Hide breaks markers (circles)</button>
				<button id="show_breaks_rects">Hide breaks limits (rectangles)</button>
				</div>
			</div>
			<div class="subbox" id="informations">
			<div class="boxtitle">More stats and information...</div>
			<div class="boxcontent">
				<a id="svg_clone" href="">Make SVG</a>
				<div class="subbox" id="stats"><b>Displayed data:</b><br />
					<span title="Orthologs not inside blocks">Free orthologs (not in synteny blocks)</span>: <span id="northos">...</span><br />
					Blocks: <span id="nblocks">...</span><br />
					Breaks: <span id="nbreaks">...</span><br />
				</div>
				<div class="subbox">
				<div class="boxtitle"><b>List of contigs</b></div>
				<div class="boxcontent">
					<div id="gparts1"></div>
					<div id="gparts2"></div>
				</div>
				</div>
			</div>
			</div>
			<div class="subbox" id="help">
				<div class="boxtitle">Dotplot help...</div>
				<div class="boxcontent">
					<ul>
						<li><svg style="width:1px; height: 10px"><g><rect x="10" y="10"/></g></svg>The red circles pinpoint the breaks (zoom-independant)</li>
						<li>The breaks themselves are represented as rectangles (zoom usually necessary)</li>
						<li>The GOC is a local estimator of the synteny between two chromosomes. It corresponds to the number of adjacent orthologs divided by the number of CDS in a sliding window measuring 3% of the genome size</li>
						<li>To zoom:<ul>
							<li>Scrool up with the mouse to zoom in (the zoom will be centered on the image)</li>
							<li>Scrool down with the mouse to zoom out (the zoom will be centered on the image)</li>
							<li>Draw a rectangle over a region of interest and scroll up with the mouse, to zoom in this exact region</li>
							<li>Write the coordinates in the genomes fields and update the graph</li>
						</ul></li>
					</ul>
				</div>
			</div>
			<button id="clear_cache" type="button">Clear cache</button>
		</div>
		
		<div id="rightcol">
			<div id="canvas" draggable="false"><div id="plot_message">Select 2 genomes to compare and click the "Create dotplot" button.</div>
		</div>
		</div>
		
		<p id="output"></p>
	</div>
</div>

	</body>
</html>
