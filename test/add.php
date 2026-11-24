<?php require 'inc/db.php'; require_login();
$err = []; $v = ['title'=>'','category'=>'','price'=>'','unit'=>'','city'=>'','description'=>''];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_csrf();
  foreach ($v as $k=>$_) $v[$k] = trim($_POST[$k] ?? '');
  if (mb_strlen($v['title']) < 3) $err[] = 'სათაური მინ. 3 სიმბოლო';
  if (!in_array($v['category'], CATEGORIES)) $err[] = 'აირჩიეთ კატეგორია';
  if (!is_numeric($v['price']) || $v['price'] < 0) $err[] = 'ფასი არასწორია';
  if (!in_array($v['unit'], UNITS)) $err[] = 'აირჩიეთ ერთეული';
  if (!in_array($v['city'], CITIES)) $err[] = 'აირჩიეთ ქალაქი';
  $img = null;
  if (!empty($_FILES['image']['name'])) {
    $f = $_FILES['image'];
    $types = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
    $mime = $f['error'] === 0 ? mime_content_type($f['tmp_name']) : '';
    if (!isset($types[$mime])) $err[] = 'სურათი: მხოლოდ JPG, PNG, WEBP';
    elseif ($f['size'] > MAX_IMG_MB*1024*1024) $err[] = 'სურათი მაქს. '.MAX_IMG_MB.'MB';
    else { $img = bin2hex(random_bytes(10)).'.'.$types[$mime]; }
  }
  if (!$err) {
    if ($img) move_uploaded_file($f['tmp_name'], __DIR__.'/uploads/'.$img);
    db()->prepare('INSERT INTO listings(user_id,title,category,price,unit,city,description,image) VALUES(?,?,?,?,?,?,?,?)')
      ->execute([user()['id'],$v['title'],$v['category'],$v['price'],$v['unit'],$v['city'],$v['description'],$img]);
    header('Location: view.php?id='.db()->lastInsertId()); exit;
  }
}
function opts($list,$sel){ $o='<option value="">— აირჩიეთ —</option>'; foreach($list as $x) $o.='<option'.($x===$sel?' selected':'').'>'.e($x).'</option>'; return $o; }
require 'inc/header.php'; ?>
<form class="card form wide" method="post" enctype="multipart/form-data"><h1>ახალი განცხადება</h1><?= csrf_field() ?>
<?php if ($err): ?><div class="alert"><?= implode('<br>', array_map('e',$err)) ?></div><?php endif; ?>
<label>სათაური<input name="title" value="<?= e($v['title']) ?>" placeholder="მაგ. ცემენტი M400, 50კგ" required></label>
<div class="grid2"><label>კატეგორია<select name="category" required><?= opts(CATEGORIES,$v['category']) ?></select></label>
<label>ქალაქი<select name="city" required><?= opts(CITIES,$v['city']) ?></select></label>
<label>ფასი (₾)<input type="number" step="0.01" min="0" name="price" value="<?= e($v['price']) ?>" required></label>
<label>ერთეული<select name="unit" required><?= opts(UNITS,$v['unit']) ?></select></label></div>
<label>აღწერა<textarea name="description" rows="5"><?= e($v['description']) ?></textarea></label>
<label>სურათი (JPG/PNG/WEBP, მაქს. <?= MAX_IMG_MB ?>MB)<input type="file" name="image" accept="image/*"></label>
<button class="btn full">გამოქვეყნება</button></form>
<?php require 'inc/footer.php';
