<?php require 'inc/db.php';
$err = []; $v = ['name'=>'','email'=>'','phone'=>''];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_csrf();
  foreach ($v as $k=>$_) $v[$k] = trim($_POST[$k] ?? '');
  $p = $_POST['password'] ?? ''; $p2 = $_POST['password2'] ?? '';
  if (mb_strlen($v['name']) < 2) $err['name'] = 'შეიყვანეთ სახელი (მინ. 2 სიმბოლო)';
  if (!filter_var($v['email'], FILTER_VALIDATE_EMAIL)) $err['email'] = 'ელ-ფოსტა არასწორია';
  if (!preg_match('/^\+?[0-9 ]{9,15}$/', $v['phone'])) $err['phone'] = 'ტელეფონი არასწორია (მაგ. 5XX XXX XXX)';
  if (strlen($p) < 8 || !preg_match('/[0-9]/', $p) || !preg_match('/[a-zA-Z]/', $p)) $err['password'] = 'პაროლი: მინ. 8 სიმბოლო, ასო და ციფრი';
  if ($p !== $p2) $err['password2'] = 'პაროლები არ ემთხვევა';
  if (empty($_POST['terms'])) $err['terms'] = 'დაეთანხმეთ წესებს';
  if (!$err) {
    $s = db()->prepare('SELECT id FROM users WHERE email=?'); $s->execute([$v['email']]);
    if ($s->fetch()) $err['email'] = 'ეს ელ-ფოსტა უკვე რეგისტრირებულია';
  }
  if (!$err) {
    db()->prepare('INSERT INTO users(name,email,phone,password) VALUES(?,?,?,?)')->execute([$v['name'],$v['email'],$v['phone'],password_hash($p, PASSWORD_DEFAULT)]);
    session_regenerate_id(true);
    $_SESSION['user'] = ['id'=>db()->lastInsertId(),'name'=>$v['name']];
    header('Location: index.php?welcome=1'); exit;
  }
}
function f($n,$err){ return isset($err[$n]) ? '<small class="err">'.e($err[$n]).'</small>' : ''; }
require 'inc/header.php'; ?>
<form class="card form" method="post" novalidate><h1>რეგისტრაცია</h1><?= csrf_field() ?>
<label>სახელი, გვარი / კომპანია<input name="name" value="<?= e($v['name']) ?>" required></label><?= f('name',$err) ?>
<label>ელ-ფოსტა<input type="email" name="email" value="<?= e($v['email']) ?>" required></label><?= f('email',$err) ?>
<label>ტელეფონი<input name="phone" value="<?= e($v['phone']) ?>" placeholder="5XX XXX XXX" required></label><?= f('phone',$err) ?>
<label>პაროლი<input type="password" name="password" minlength="8" required></label><?= f('password',$err) ?>
<label>გაიმეორეთ პაროლი<input type="password" name="password2" required></label><?= f('password2',$err) ?>
<label class="row"><input type="checkbox" name="terms" value="1"> ვეთანხმები საიტის წესებს</label><?= f('terms',$err) ?>
<button class="btn full">რეგისტრაცია</button><p class="muted">უკვე გაქვთ ანგარიში? <a href="login.php">შესვლა</a></p></form>
<?php require 'inc/footer.php';
