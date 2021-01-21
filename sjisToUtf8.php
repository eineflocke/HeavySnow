<?php
$path = $_GET['path'];
#if(isset($_POST['path'])){ $path = $_POST['path']; }
echo mb_convert_encoding(file_get_contents($path), "UTF-8", "SJIS");
?>
