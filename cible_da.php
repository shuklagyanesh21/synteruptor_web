<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
        if (empty($_POST['private_db'])){ 
                header('Location: ./break_viewer.php?break_min1=1&break_min2=1&conditional=OR&breakid='.$_POST['breakid'].'&version='.$_POST['selectdb']);
        } else {
        header('Location: ./break_viewer.php?break_min1=1&break_min2=1&conditional=OR&breakid='.$_POST['breakid'].'&version='.$_POST['private_db']);
        }
?>

