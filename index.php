<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE HTML>
<html>
<?php
require_once('lib_db.php');
require_once('common.php');
?>
	<head>
		<meta charset="UTF-8">
		<title><?php site_name(); ?> tools</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/index.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/index.js"></script>
	</head>
<nav><?php	print_sidebar(); ?></nav>

	<body>
<?php	print_header(); ?>
<div id="content">
	<div class="centered_box">
		<div id="site_description">
		<div class='index_box'>
			<!--<img src='css/Synteruptor_logo_full.png' id='logo' alt='logo' />-->
			<h2>About <?php echo $site_name ?></h2>
			<p><?php echo $site_name ?> is a tool designed to find synteny breaks between closely related bacterial genomes. The breaks found can be explored with this web interface to find clusters of genes of interest.</p>
			<br /><span id="last_update">Last update: <?php echo get_setting("last_update"); ?></span>
			<br /><span id="contact">Contact: <?php echo get_mail(); ?></span>
			<span style="float:right;"><a href="download.php">Download <?php echo $site_name ?></a></span>
			<div style='clear:both;'></div>
			</div>
<div class="index_box">
			<h2>How to use the <?php echo $site_name ?> website</h2>
			<p>Synteruptor can be used in several ways:
							<ul>
				<li>either explore a precomputed, available database: <a href="explore_db.php">Explore databases</a></li>
				<li>or create your own database with your own genome files: <a href="createdb.php">Create database</a>. The created database will be private, but it can be explored like any of the precomputed database</li>
			</ul>
			</p>
			<p>You can also:
							<ul>
								<li>Search individual sequences within your or precomputed databases: <a href="search.php">Search databases</a></li>
								<li>or directly access previously identified genomic islands: <a href="direct_access.php">Genomic islands</a></li>
							</ul>
						</p>	

					</div>
<!-- 
					<div class='index_box'>
						<h2>How to use the <?php echo $site_name ?> website</h2>
						
						//<p>Synteruptor can be used in several ways:<ul>
						//	<li>either explore a precomputed, available database</li>
						//	<li>or create your own database with your own genome files. The created database will be private, but it can be explored like any of the precomputed database</li>
						//</ul>
						//</p>
						
			<?php
				// Display public databases (if any)
				echo "<h3 id='availdb'>Available databases</h3>";
				$allowed = get_available_dbs_list();
				if ($allowed) {
					echo "<p>The following databases were generated with preselected genomes and can be freely explored:</p>";
					echo "<div id='databases'></div>";
				} else {
					echo "<p>No public database available</p>";
				}
				// Direct access to the genomic islands
				echo "<h3>Direct access to the genomic islands</h3>";
				if ($allowed) {
					echo "<p>The genomic islands identified in the previous databases can be directly accessed with their identifier:</p>";
					echo "<div class='button_container'><a href='direct_access.php'><div class='button_link'>Access to a genomic island</div></a></div>";
					echo "<div id='databases'></div>";
				} else {
					echo "<p>No public database available</p>";
				}
				// Show database creator link if active
				echo "<h3>Database creation</h3>";
				if (get_setting("can_upload")) {
				echo "<p>Upload your genomes to create a $site_name database:</p>";
					echo "<div class='button_container'><a href='createdb.php'><div class='button_link'>Create a $site_name database</div></a></div>";
				} else {
					echo "<p>Database creation is not activated on this website</p>";
				}
				
			?>
		</div> -->
	</div>
	</div>
</div>
<?php print_footer();?>
</body>
</html>

