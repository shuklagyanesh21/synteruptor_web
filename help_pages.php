<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<?php
		require_once("common.php");
	?>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title><?php site_name(); ?> help pages</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>

	</head>
	<nav>
		<?php
			print_sidebar();
		?>		
	</nav>
	<body>
		<?php
			print_header();
		?>
		<div id="content">
			<div class="centered_box">
				<h2>About <?php echo $site_name ?></h2>
				<div id="site_description">
					<div class='index_box'>
						<!--<img src='css/Synteruptor_logo_full.png' id='logo' alt='logo' />-->
						<p><?php echo $site_name ?> is a tool designed to find synteny breaks between closely related bacterial genomes. The breaks found can be explored with this web interface to find clusters of genes of interest.</p>
						<br /><span id="last_update">Last update: <?php echo get_setting("last_update"); ?></span>
						<br /><span id="contact">Contact: <?php echo get_mail(); ?></span>
						<span style="float:right;"><a href="download.php">Download <?php echo $site_name ?></a></span>
						<div style='clear:both;'></div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>

