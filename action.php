<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php echo htmlspecialchars($_POST['id']); ?>
<?php echo htmlspecialchars($_POST['db']); ?>

<!-- http://localhost/synteruptor/web/current/break_viewer.php?break_min1=1&break_min2=1&conditional=OR&strict=1&breakid=353&version=S_agalactiae -->