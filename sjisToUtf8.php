 <?php
 $path = $_GET['path'];
 echo mb_convert_encoding(file_get_contents($path), "UTF-8", "SJIS");
 ?>
