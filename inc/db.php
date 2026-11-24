<?php
require_once __DIR__ . '/config.php';
session_start();
function db() {
  static $pdo;
  if ($pdo) return $pdo;
  if (DB_DRIVER === 'mysql') {
    $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS);
    $ai = 'INT AUTO_INCREMENT PRIMARY KEY';
  } else {
    $pdo = new PDO('sqlite:' . SQLITE_PATH);
    $ai = 'INTEGER PRIMARY KEY AUTOINCREMENT';
  }
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  $pdo->exec("CREATE TABLE IF NOT EXISTS users (id $ai, name VARCHAR(100) NOT NULL, email VARCHAR(190) NOT NULL UNIQUE, phone VARCHAR(30) NOT NULL, password VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  $pdo->exec("CREATE TABLE IF NOT EXISTS listings (id $ai, user_id INT NOT NULL, title VARCHAR(150) NOT NULL, category VARCHAR(60) NOT NULL, price DECIMAL(12,2) NOT NULL, unit VARCHAR(30) NOT NULL, city VARCHAR(60) NOT NULL, description TEXT, image VARCHAR(255), created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  return $pdo;
}
function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function user() { return $_SESSION['user'] ?? null; }
function require_login() { if (!user()) { header('Location: login.php'); exit; } }
function csrf() { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16)); return $_SESSION['csrf']; }
function csrf_field() { return '<input type="hidden" name="csrf" value="'.csrf().'">'; }
function check_csrf() { if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) die('არასწორი მოთხოვნა'); }
const CATEGORIES = ['ცემენტი და ბეტონი','აგური და ბლოკი','ხე-ტყე','ლითონი და არმატურა','სახურავი','იზოლაცია','ფილა და კერამიკა','საღებავი','სანტექნიკა','ელექტროობა','ხელსაწყოები','სხვა'];
const CITIES = ['თბილისი','ბათუმი','ქუთაისი','რუსთავი','ზუგდიდი','გორი','ფოთი','თელავი','სხვა'];
const UNITS = ['ც','კგ','ტონა','მ²','მ³','მ','ტომარა','კომპლექტი'];
