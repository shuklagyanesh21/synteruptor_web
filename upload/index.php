<?php
require_once("../createdb_lib.php");

# Check id
if (isset($_GET["id"])) {
	header("Location: ../createdb.php?id=$id");
} else {
	header("Location: ../createdb.php");
}
?>

