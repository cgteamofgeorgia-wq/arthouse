<?php
// ===== პარამეტრები =====
// DB_DRIVER: 'sqlite' (არაფრის დაყენება არ სჭირდება) ან 'mysql'
define('DB_DRIVER', 'sqlite');
define('SQLITE_PATH', __DIR__ . '/../data/site.db');
// MySQL-ისთვის (თუ DB_DRIVER = 'mysql')
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_db');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_pass');
define('SITE_NAME', 'სამშენებლო მასალები');
define('MAX_IMG_MB', 5);
