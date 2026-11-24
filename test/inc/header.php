<!DOCTYPE html><html lang="ka"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= e(SITE_NAME) ?></title><link rel="stylesheet" href="assets/style.css"></head><body>
<header><div class="wrap nav"><a class="logo" href="index.php">🧱 <?= e(SITE_NAME) ?></a><nav>
<?php if (user()): ?><a class="btn" href="add.php">+ განცხადება</a><a href="my.php">ჩემი განცხადებები</a><span class="muted"><?= e(user()['name']) ?></span><a href="logout.php">გასვლა</a>
<?php else: ?><a href="login.php">შესვლა</a><a class="btn" href="register.php">რეგისტრაცია</a><?php endif; ?>
</nav></div></header><main class="wrap">
