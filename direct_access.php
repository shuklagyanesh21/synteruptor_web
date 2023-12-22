<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<?php
require_once('lib_db.php');
require_once('common.php');
?>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Direct access to the genomic islands</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/direct_access.js"></script>
		<!-- <link rel="stylesheet" type="text/css" href="css/index.css"> -->

	</head>
	
        <?php require_once("common.php");?>
<nav>
		<?php 
				print_sidebar(); 
		?>
	</nav>        
        <body>
	<?php print_header("viewer"); ?>

	<div id="content">
<div class="centered_box">
		<h2>Direct access to the genomic islands</h2>
		<div id="message" style="display:none"></div>
		
		<div class='index_box'>
			<?php
				$allowed = get_available_dbs_list(true, $_SESSION['db_ids']);
				if ($allowed) {
					echo "<p>Select a public database:";
					echo "<div id='databases'></div>";
					echo "</p>";
				} else {
					echo "<p>No public database available</p>";
				}
			?>
			<form action="cible_da.php" method="post">
                                <select id="db" name="selectdb"></select>
                                <p> Or enter a private database id:
                                <input type="text" name="private_db" /> </p>
                                <p>Enter a break id: 
                                <input type="number" name="breakid" required/>
                                <input type="submit" value="Submit" /> </p>
                        </form>
</div>
	</div>
		</div>
	</body>
	</html>