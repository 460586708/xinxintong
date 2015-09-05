<?php
require_once '../../db.php';

$sqls = array();
$sqls[] = "ALTER TABLE xxt_lottery add state tinyint not null default 1";
$sqls[] = "ALTER TABLE `xxt_lottery` DROP `custom_body`";

foreach ($sqls as $sql) {
	if (!$mysqli->query($sql)) {
		header('HTTP/1.0 500 Internal Server Error');
		echo 'database error: ' . $mysqli->error;
	}
}
echo "end update " . __FILE__ . PHP_EOL;