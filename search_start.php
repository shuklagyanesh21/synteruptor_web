<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
require_once('search_lib.php');
require_once("common.php");
$tempdir = "";
$userid = get_setting("userid");

function temp_dir() {
	global $basedir, $tempdir;

	error_log("Creating temp dir in $basedir");
	$tempdir = tempnam($basedir, 'blast_');
	error_log("Using temp dir $tempdir");
	if (is_file($tempdir)) {
		unlink($tempdir);
		mkdir($tempdir);
		if (is_dir($tempdir)) {
			chmod($tempdir, 0777);
			if(!in_array($tempdir,$_SESSION["blast_ids"])){$_SESSION["blast_ids"][]=basename($tempdir);}
			return basename($tempdir);
		}
	}
	return null;
}

function check_seq($seq) {
	$seq = urldecode( $seq );
	//echo "Check seq: $seq<br>\n";
	$first_line = strstr($seq, "\n", true);
	$parent_dir = get_setting("search_dir");
	// Add seqname if no fasta style sequence is given
	if (preg_match("/^>(.+)$/", $first_line)) {
		return $seq;
	} else {
		//echo "Added name<br>\n";
		$seq = ">Query\n$seq";
		return $seq;
	}
}

function check_db($db) {
	global $dbdir;
	//echo "Check db: $db<br>\n";
	$first_line = strstr($db, "\n", true);
	$db = filter_var($db, FILTER_SANITIZE_STRING);
	$parent_dir = get_setting("search_dir");

	//echo "Filtered: $db<br>\n";
	if (file_exists("$dbdir/$db.faa")) {
		return $db;
	} else {
		// echo "Couldn't find the faa!";
		return '';
	}
}

function write_file($filename, $content) {
	global $basedir, $tempdir;
	$outpath = "$basedir/$tempdir/$filename";
	file_put_contents($outpath, $content);
	if (file_exists($outpath)) {
		// echo "File written in $outpath<br>";
		chmod($outpath, 0666);
		return true;
	} else {
		// echo "Error: couldn't write file $filename<br>";
		return false;
	}
}

function copy_db($dbname) {
	global $dbdir, $basedir, $tempdir;
	$dborigin = "$dbdir/$dbname.faa";
	$dbpath =  "$basedir/$tempdir/db.faa";
	copy($dborigin, $dbpath);
	if (file_exists($dbpath)) {
		//echo "File written in $dbpath<br>";
		return true;
	} else {
		//echo "Error: couldn't write db file $dbname<br>";
		return false;
	}
	chmod($dbpath, 0666); //??? is this ever executed?
}

// Check if a sequence was submitted
$ans = array(
	'status' => 'failed',
	'detail' => 'unknown error',
	'new_url' => '',
	'id' => ''
);

if (isset($_POST['seq']) && isset($_POST['db'])) {
	$seq = check_seq($_POST['seq']);
	$db = check_db($_POST['db']);

	if ($seq != '' && $db != '') {
		// Create an empty folder with a unique random name
		$tempdir = temp_dir();

		if (isset($tempdir)) {
			global $basedir;
			// Write query, status and dbname file
			$sq = write_file("query.faa", $seq);
			$ss = write_file("status.txt", "waiting");
			$sd = write_file("database.txt", $db);
			// Copy the db
			$sc = copy_db($db);
			// error_log('['.date('Y-M-d H:m:s').']'." Copy db $sc");

			// Tried with curl on send_qsub.php and didn't work so using shell_exec directly
			$userid = get_setting("userid");
			$script_dir = get_setting("script_dir");
			$parent_dir = get_setting("search_dir");
			$walltime = get_setting("search_walltime");
			$mem = get_setting("search_mem");
			$queue = get_setting("search_queue");
			$run_script = "run_blaster.sh";
			echo shell_exec("echo sudo /home/scripts/run_job_as -u $userid -c 'qsub -N $tempdir -q $queue -o $parent_dir/$tempdir/$tempdir.log -j oe -S /bin/sh -l ncpus=1 -l walltime=$walltime -l mem=$mem -- $script_dir/$run_script -i $parent_dir/$tempdir' > $parent_dir/$tempdir/tmp.sh");
			$output = shell_exec("sudo /home/scripts/run_job_as -u $userid -c 'qsub -N $tempdir -q $queue -o $parent_dir/$tempdir/$tempdir.log -j oe -S /bin/sh -l ncpus=1 -l walltime=$walltime -l mem=$mem -- $script_dir/$run_script -i $parent_dir/$tempdir'");
			
			// // https://stackoverflow.com/questions/6560512/send-http-request-with-curl-to-local-file
			// $url = "send_qsub.php";
			// $varArr = array (
			// 	"id" => "$tempdir",
			// 	"run_script" => "run_blaster.sh"
			// );
			// $body = http_build_query($varArr);
			// error_log("$url $body");

			// $c = curl_init($url);
			// curl_setopt($c, CURLOPT_POST, true);
			// curl_setopt($c, CURLOPT_POSTFIELDS, $body);
			// curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
			// $page = curl_exec($c);
			// curl_close($c);
			// error_log("$page");
			// error_log("After curl");

			// Use the dir name as an id
			if ($sq && $ss && $sd && $sc) {
				$ans['status'] = 'success';
				$ans['id'] = $tempdir;
				$ans['detail'] = "";
			} else {
				$ans['status'] = "failed";
				$ans['detail'] = "One or more files couldn't be created.";
			}
		} else {
			$ans['status'] = "failed";
			$ans['detail'] = "Invalid generated id. Please refresh the page.";
		}
	} else {
		$ans['status'] = "failed";
		if ($seq == '') {
			$ans['detail'] = "Invalid sequence.";
		}
		if ($db == '') {
			$ans['detail'] = "Invalid db.";
		}
	}
} else {
	$ans['status'] = "failed";
	if (!isset($_POST['seq'])) {
		$ans['detail'] = "No sequence provided.";
	}
	if (!isset($_POST['db'])) {
		$ans['detail'] = "No database provided.";
	}
}
echo json_encode($ans);
?>

