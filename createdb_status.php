<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once("createdb_lib.php");

function check_mail($ad) {
	if (filter_var($ad, FILTER_VALIDATE_EMAIL)) {
		return $ad;
	} else {
		return "";
	}
}

function check_text($t) {
	if ($t) {
		return $t;
	} else {
		return "";
	}
}

function check_blocks_tol($btol) {
	# Default: btol = 2
	if (!ctype_digit($btol)) {
		$btol = 2;
	}
	# Out of bounds: closest (0 or 5)
	elseif ($btol < 0) {
		$btol = 0;
	}
	elseif ($btol > 5) {
		$btol = 5;
	}
	return $btol;
}

function start_job() {
	$config = get_config();

	# Change from "preparation" to "waiting"
	if (isset($config) && isset($config['status']) && $config["status"] == 'preparation') {
		$config["status"] = "waiting";
		# Get a mail address too?
		if (isset($_GET["mail"])) {
			$mail = check_mail($_GET["mail"]);
			if ($mail == '') {
				return array(
					'status' => "mail_error",
				);
			} else {
				$config["mail"] = $mail;
			}
		}
		# Get an author?
		if (isset($_GET["author"])) {
			$author = check_text($_GET["author"]);
			if ($author == '') {
				return array(
					'status' => "author_error",
				);
			} else {
				$config["author"] = $author;
			}
		}
		# Get a description?
		if (isset($_GET["description"])) {
			$description = check_text($_GET["description"]);
			if ($description == '') {
				return array(
					'status' => "description_error",
				);
			} else {
				$config["description"] = $description;
			}
		}
		# Get a blocks tolerance value?
		if (isset($_GET["btol"])) {
			$btol = check_blocks_tol($_GET["btol"]);
			$config["blocks_tolerance"] = $btol;
		}
		set_config($config);
		return $config;
	} else {
		return array(
			'status' => "error",
			'details' => "Status already exists (" . $status['status'] . ")",
		);
	}
}

$output = array();

# Check id
if (!check_id($id)) {
	$output = array(
		"status" => "error",
		"details" => "Invalid id ($id)",
	);
} else if (isset($_GET["command"])) {
	$command = $_GET["command"];

	# Check for the status of the current working dir
	if ($command == "check") {
		$output = get_config();
	# Start the job (=create an empty status file)
	} else if ($command == "start") {
		$output = start_job();
	} else {
		$output = array(
			"status" => 'error',
			"details" => 'invalid command',
		);
	}
} else {
	$output = array(
		"status" => "error",
		"details" => "No command",
	);
}

echo json_encode($output);
?>

