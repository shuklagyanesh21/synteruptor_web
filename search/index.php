<?php
require_once("../search_lib.php");

# Check id
if (isset($_GET["id"])) {
	header("Location: ../search.php?id=$id");
} else {
	header("Location: ../search.php");
}
?>

