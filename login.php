<?php require 'inc/db.php';
$err = ''; $email = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_csrf();
  $email = trim($_POST['email'] ?? '');
  $s = db()->prepare('SELECT * FROM users WHERE email=?'); $s->execute([$email]); $u = $s->fetch();
  if ($u && password_verify($_POST['password'] ?? '', $u['password'])) {
    session_regenerate_id(true);
    $_SESSION['user'] = ['id'=>$u['id'],'name'=>$u['name']];
    header('Location: index.php'); exit;
  }
  $err = 'ელ-ფოსტა ან პაროლი არასწორია';
}
require 'inc/header.php'; ?>
<form class="card form" method="post"><h1>შესვლა</h1><?= csrf_field() ?>
<?php if ($err): ?><div class="alert"><?= e($err) ?></div><?php endif; ?>
<label>ელ-ფოსტა<input type="email" name="email" value="<?= e($email) ?>" required></label>
<label>პაროლი<input type="password" name="password" required></label>
<button class="btn full">შესვლა</button><p class="muted">არ გაქვთ ანგარიში? <a href="register.php">რეგისტრაცია</a></p></form>
<?php require 'inc/footer.php';
