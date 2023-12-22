<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
$settings_path = 'settings.ini';
$settings = parse_ini_file($settings_path);
$site_name = get_setting("site_name");

error_reporting(E_ALL);
ini_set('log_errors', 'On');
ini_set('display_errors', 'Off');
// ini_set('error_log','../migenis.log');

function get_setting($key) {
	global $settings;
	if (isset($settings[ $key ])) {
		return $settings[ $key ];
	} else {
		return '';
	}
}

function site_name() {
	echo get_setting("site_name");
}
function get_mail() {
	$contact = get_setting("contact");
	$pholder = str_replace("@", " at ", $contact);
	return "<a href='mailto:$contact'>$pholder</a>";
}

function print_header($type=null, $name=null) {
	echo "<span id='top'></span>";
	$sep = "&nbsp;> ";
	# Write the site name anyway (with link to root)
	echo "<div id='entete'>";
	echo "<a id='backtop' style='display:none;' href='#top'>^Top^</a>";
	$dir = '.';
	echo "<a href='$dir/index.php' alt='" . get_setting("site_name") . "'>";
	echo "<div id='sitelink'></div>";
	echo "</a>";
	echo "<div id='entete_links'>";
	if (!isset($type)) {
	}
	elseif ($type == 'viewer' || $type == 'aligner') {
		# If the database is given
		if (isset($_GET['version'])) {
			// echo "<br>";
			echo "<span id='entete_database'>";
			echo "<a href='$dir/summary.php?version=" . $_GET['version'] . "'>";
			echo "Database: " . $_GET['version'];
			echo "</a>";
			echo "</span>";
			# Create permalink container
			if (isset($name)) {
				echo $sep;
				echo "<span><a id='permalink' href=''>" . $name . "</a></span>";
			}
		}
	}
	else {
	}
	echo "</div>";
	echo "</div>";
}


function print_nav($type=null, $name=null) {
	$dir = '.';
	echo "<div id='entete_links'>";
	if ($type == 'viewer' || $type == 'aligner') {
		# If the database is given
		if (isset($_GET['version'])) {
			echo "<br>";
			echo "<span id='entete_database'>";
			echo "<a href='$dir/summary.php?version=" . $_GET['version'] . "'>";
			echo "Database: " . $_GET['version'];
			echo "</a>";
			echo "</span>";
			# Create permalink container
			if (isset($name)) {
				echo $sep;
				echo "<span><a id='permalink' href=''>" . $name . "</a></span>";
			}
		}
	}
	else {
	}
	echo "</div>";

}

function print_sidebar() {
	echo "<div class='sidebar'>";
	$dir = get_setting('site_host');                
	echo "<span class='mynav-logo-banner'>";
	echo "<a href='$dir' style='padding: 1px; text-align: center;'><img src='" . "css/logo_bioi2_no_title_s.png" . "' alt='logo_bioi2' id='bioi2_menu_logo'/></a>";
	// echo "<br>";
	echo "<a href='explore_db.php'>Explore databases</a>";
	echo "<a href='createdb.php'>Create database</a>";
	echo "<a href='search.php'>Search databases</a>";
	echo "<a href='direct_access.php'>Genomic islands</a>";
	echo "<a href='help_pages.php'>Help page</a>";
	echo "<a href='contact.php'>Contact us</a>";
	echo "<a href='index.php'>Back to home page</a>";
	echo "</span>";
	echo "</div>";
}

function print_footer() {
	echo "<div id='tail'>";
	echo "<ul>";
	echo "<li><a href='//www.agence-nationale-recherche.fr/?Projet=ANR-13-BSV6-0009'><img src='css/LogoANR_175.png' title='ANR Migenis' 'Link to ANR Migenis' /></a></li>";
	echo "<li><a href='http://www.universite-paris-saclay.fr/en'><img src='css/LogoPS.png' title='Université Paris-Saclay' alt='Link to University Paris-Saclay' /></a></li>";
	echo "<li><a href='//www.i2bc.paris-saclay.fr/?lang=en'><img src='css/LogoI2BC.png' title='I2BC' alt='Link to I2BC' /></a></li>";
	echo "<li><a href='http://dynamic.univ-lorraine.fr/?lang=en'><img src='css/LogoDYNAMIC.png' title='DYNAMIC' alt='Link to DYNAMIC' /></a></li>";
	echo "<li><a href='http://www.inrae.fr/en'><img src='css/LogoINRAE.png' title='INRAE' alt='Link to INRAE' /></a></li>";
	echo "<li><a href='http://www.univ-lorraine.fr/'><img src='css/LogoUL.png' title='UL' alt='Link to UL' /></a></li>";
	echo "</ul>";
	echo "</div>";
}


?>
