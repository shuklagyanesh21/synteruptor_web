<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<?php
    require_once("common.php");
    require_once("createdb_lib.php");
    $userid = get_setting("userid");
    $script_dir = get_setting("script_dir");
    $id = $_GET["id"];
    $run_script = $_GET["run_script"];
    if ($run_script=="run_migenis.sh") {
        $parent_dir = get_setting("upload_dir");
        $ncpus = get_setting("createdb_max_ncpus");
        $walltime = get_setting("createdb_walltime");
        $queue = get_setting("createdb_queue");
        $gbks = scan_gbks();
        $ngbks = count($gbks);
        $mem = get_setting("createdb_mem") * $ngbks;
        $mem = "$mem" . "Mb";
        if ( $ngbks < $ncpus ){
            $ncpus = $ngbks;
        }
        $run_script = "$run_script"." -j $ncpus";
    } else {
        $parent_dir = get_setting("search_dir");
        $walltime = get_setting("search_walltime");
        $mem = get_setting("search_mem");
        $queue = get_setting("search_queue");
        $ncpus = "1";
    }
    echo shell_exec("echo sudo /home/scripts/run_job_as -u $userid -c 'qsub -N $id -q $queue -o $parent_dir/$id/$id.log -j oe -S /bin/sh -l ncpus=$ncpus -l walltime=$walltime -l mem=$mem -- $script_dir/$run_script -i $parent_dir/$id' > $parent_dir/$id/tmp.sh");
    $output = shell_exec("sudo /home/scripts/run_job_as -u $userid -c 'qsub -N $id -q $queue -o $parent_dir/$id/$id.log -j oe -S /bin/sh -l ncpus=$ncpus -l walltime=$walltime -l mem=$mem -- $script_dir/$run_script -i $parent_dir/$id'");
?>
