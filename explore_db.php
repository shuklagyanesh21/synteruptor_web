<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<?php
		require_once("common.php");
		require_once("lib_db.php");
        ?>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title><?php site_name(); ?> help pages</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/index.js"></script>

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
				<h2>Available databases</h2>
                <div class='index_box'>
                <?php
                    // Display public databases (if any)
                    $allowed = get_available_dbs_list();
                    if ($allowed) {
                        echo "<p>The following databases were generated with preselected genomes and can be freely explored:</p>";
                        echo "<div id='databases'></div>";
                    } else {
                        echo "<p>No public database available</p>";
                    }
                ?>
				<br>
                </div>
			</div>
			<div class="centered_box">
				<h2>User databases</h2>
                <div class='index_box'>
                <?php
					$available_dbs = get_available_dbs_list(true, $_SESSION['db_ids']);
					foreach ($_SESSION['db_ids'] as $key => $value){
						if(!in_array($value.".sqlite",$available_dbs)){
							unset($_SESSION['db_ids'][$key]);
						}
					}
					if (empty($_SESSION['db_ids'])){
						echo "<p>No user databases found in web browser history</p>";
					}else{
						echo "<p>The following databases were generated:</p>";
						foreach ($_SESSION['db_ids'] as &$value){
							$site_host = get_setting('site_host');
							$site_host_subdir = get_setting('site_host_subdir');
							echo "<p><a href='$site_host/$site_host_subdir/summary.php?version=$value'>$value</a></p>";
						}
					}
                ?>
                </div>
			</div>
		</div>
	</body>
</html>

