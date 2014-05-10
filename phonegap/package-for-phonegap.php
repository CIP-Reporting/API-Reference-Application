<?php

/*
 * CIP Reporting API Client Application
 *
 * Copyright (c) 2013 CIP Reporting
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms are permitted
 * provided that the above copyright notice and this paragraph are
 * duplicated in all such forms and that any documentation,
 * advertising materials, and other materials related to such
 * distribution and use acknowledge that the software was developed
 * by CIP Reporting.  The name of CIP Reporting may not be used to 
 * endorse or promote products derived from this software without 
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND WITHOUT ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 */

 // Avoid warnings
 date_default_timezone_set('America/New_York'); 
 
/**
 * Show help and exit with optional error message
 * @param string $err Error message
 */
function showHelp($err) {
  global $argv, $argc;
  
  echo <<<EOD

Usage: {$argv[0]} application destination

Where:

  application = The name of the application to package
  destination = The destination folder to package the application into

ERROR - $err

EOD;
  exit;
}

/**
 * Copy a file, or recursively copy a folder and its contents
 * @param string $source Source path
 * @param string $dest Destination path
 * @param string $permissions New folder creation permissions
 * @return bool Returns true on success, false on failure
 */
function xcopy($source, $dest, $permissions = 0755)
{
  // Check for symlinks
  if (is_link($source)) {
    return symlink(readlink($source), $dest);
  }

  // Simple copy for a file
  if (is_file($source)) {
    return copy($source, $dest);
  }

  // Make destination directory
  if (!is_dir($dest)) {
    mkdir($dest, $permissions);
  }

  // Loop through the folder
  $dir = dir($source);
  while (false !== $entry = $dir->read()) {
    // Skip pointers
    if ($entry == '.' || $entry == '..') {
      continue;
    }

    // Deep copy directories
    xcopy("$source/$entry", "$dest/$entry");
  }

  // Clean up
  $dir->close();
  return true;
}

/**
 * Replace text within the specified file with the specified replacement text
 * @param string $file The file to perform replacement upon
 * @param string $search The text to find for replacement
 * @param string $replace The text to replace
 */
function replaceInFile($file, $search, $replace) {
  $str = file_get_contents($file);

  $str = str_replace($search, $replace, $str);

  file_put_contents($file, $str);
}

/**
 * Iterate the provided file looking for an HTML META tag by tag name
 * @param string $file The file to extract meta content from
 * @param string $tag The meta tag name to extract content from
 * @return string Returns the content of the specified meta tag
 */
function extractMetaTagContent($file, $tag) {
  foreach (file($file) as $line) {
    if (preg_match("/<meta.*?name=\"(.*?)\"/", $line, $matches)) {
      if ($tag == $matches[1]) {
        if (preg_match("/<meta.*?content=\"(.*?)\"/", $line, $matches)) {
          return $matches[1];
        }
      }
    }
  }
  return false;
}

/**
 * Prompt the user for confirmation
 * @param string $message Confirmation message
 */
function confirmAction($message = false)
{
  if ($message == false) $message = "Are you sure you want to do this [y/N]";

  echo $message;
  flush();

  $confirmation = trim(fgets(STDIN));
  
  return strlen($confirmation) == 1 && strtolower($confirmation[0]) == 'y';
}

/**
 * Return an array of files within a directory including files that start with (.).
 * @param string $dir Path to directory
 */
function getDirectoryContents($dir)
{ 
  $files = Array();
  
  if (!($res = opendir($dir))) return $files;
  
  while (($file = readdir($res)) == true)
  {
    if ($file == '.' ||  $file == '..' || $file == '.git') continue;
    array_push($files, "$dir\\$file");
  }
      
  closedir($res); 
  return $files; 
}

/**
 * Recursively clean up a directory, optionally leaving the initial directory in place
 * @param string $dir Path to directory
 * @param boolean $rmdir Remove directory
 */
function recursiveCleanup($dir, $rmdir = false)
{
  if($objs = getDirectoryContents($dir))
    foreach ($objs as $obj) is_dir($obj) ? recursiveCleanup($obj, true) : unlink($obj);

  if ($rmdir) rmdir($dir);
}

if ($argc !== 3) {
  showHelp("Invalid argument count");
}

$rootDir = realpath(dirname(__FILE__) . '/..');
$appDir  = realpath($rootDir . "/apps/{$argv[1]}");
$dstDir  = realpath($argv[2]);

if (false === $appDir) {
  showHelp("The specified application does not exist: {$argv[1]}");
}

if (false === $dstDir) {
  showHelp("The specified directory does not exist: {$argv[2]}");
}

if (!is_dir($dstDir)) {
  showHelp("The specified directory is not a directory: {$argv[2]}");
}

$dstDir .= "\\{$argv[1]}";

if (file_exists($dstDir)) {
  echo "\nThe specified application is already packaged in the destination location:\n\n  $dstDir\n\n";
  if (!confirmAction()) exit;

  echo "\nRemoving existing files... ";
  recursiveCleanup($dstDir);
  echo "[done]\n";
}

$version = `svnversion`;
if (null === $version) {
  showHelp("Unable to extract SVN version number");
}
$version = '1.' . preg_replace("/\\D/", '', $version);

echo "\nExtracting metadata from application\n";
$name   = extractMetaTagContent("$appDir\\index.html", "name");
$desc   = extractMetaTagContent("$appDir\\index.html", "description");
$author = extractMetaTagContent("$appDir\\index.html", "author");
$email  = extractMetaTagContent("$appDir\\index.html", "email");

if (false === $name) {
  showHelp("Required meta data does not exist: name");
}

if (false === $desc) {
  showHelp("Required meta data does not exist: description");
}

if (false === $author) {
  showHelp("Required meta data does not exist: author");
}

if (false === $email) {
  showHelp("Required meta data does not exist: email");
}

$id = 'cip' . preg_replace("/\\W/", '', strtolower($name));
echo "Version: $version\n";
echo "ID: $id\n";
echo "Name: $name\n";
echo "Description: $desc\n";
echo "Author: $author\n";
echo "Email: $email\n\n";

echo "Packaging {$argv[1]} for Phonegap distribution\n\n";
echo "Root Dir: $rootDir\n";
echo "Appl Dir: $appDir\n";
echo "Dest Dir: $dstDir\n\n";

if (!file_exists($dstDir))
{
  echo "Creating destination folder... ";
  mkdir ($dstDir);
  echo "[done]\n";
}

echo "Copying CIPAPI... ";
xcopy("$rootDir\\CIPAPI", "$dstDir\\CIPAPI");
echo "[done]\n";

echo "Copying lib... ";
xcopy("$rootDir\\lib", "$dstDir\\lib");
echo "[done]\n";

echo "Copying application... ";
xcopy("$appDir", "$dstDir\\app");
echo "[done]\n";

echo "Copying index.html... ";
xcopy("$dstDir\\app\\index.html", "$dstDir\\index.html");
echo "[done]\n";

echo "Copying README.md... ";
xcopy("$dstDir\\app\\README.md", "$dstDir\\README.md");
echo "[done]\n";

echo "Copying LICENSE... ";
xcopy("$rootDir\\LICENSE", "$dstDir\\LICENSE");
echo "[done]\n";

echo "Copying icon.png... ";
xcopy("$rootDir\\phonegap\\icon.png", "$dstDir\\icon.png");
echo "[done]\n";

echo "Copying config.xml... ";
xcopy("$rootDir\\phonegap\\config.xml", "$dstDir\\config.xml");
echo "[done]\n";

echo "Cleaning up application folder... ";
if (file_exists("$dstDir\\app\\index.html")) {
  unlink("$dstDir\\app\\index.html");
}

if (file_exists("$dstDir\\app\\README.md")) {
  unlink("$dstDir\\app\\README.md");
}

if (file_exists("$dstDir\\app\\{$argv[1]}-config-pack.xml")) {
  unlink("$dstDir\\app\\{$argv[1]}-config-pack.xml");
}
echo "[done]\n";

echo "Fixing paths... ";
replaceInFile("$dstDir\\index.html", '"./',          '"./app/');
replaceInFile("$dstDir\\index.html", '"../../',      '"./');
replaceInFile("$dstDir\\CIPAPI\\components\\map.js", '"../../', '"./');
echo "[done]\n";

echo "Configuring Phonegap build... ";
replaceInFile("$dstDir\\config.xml", '[APPID]',      $id);
replaceInFile("$dstDir\\config.xml", '[APPNAME]',    $name);
replaceInFile("$dstDir\\config.xml", '[APPDESC]',    $desc);
replaceInFile("$dstDir\\config.xml", '[APPEMAIL]',   $email);
replaceInFile("$dstDir\\config.xml", '[APPAUTHOR]',  $author);
replaceInFile("$dstDir\\config.xml", '[APPVERSION]', $version);
echo "[done]\n";


