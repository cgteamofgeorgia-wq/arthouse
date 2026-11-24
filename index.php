<?php require 'inc/db.php';
$q = trim($_GET['q'] ?? ''); $cat = $_GET['cat'] ?? ''; $city = $_GET['city'] ?? '';
$sql = 'SELECT l.*, u.name FROM listings l JOIN users u ON u.id=l.user_id WHERE 1=1'; $p = [];
if ($q !== '') { $sql .= ' AND (l.title LIKE ? OR l.description LIKE ?)'; $p[] = "%$q%"; $p[] = "%$q%"; }
if (in_array($cat, CATEGORIES)) { $sql .= ' AND l.category=?'; $p[] = $cat; }
if (in_array($city, CITIES)) { $sql .= ' AND l.city=?'; $p[] = $city; }
$s = db()->prepare($sql.' ORDER BY l.id DESC LIMIT 60'); $s->execute($p); $rows = $s->fetchAll();
require 'inc/header.php'; ?>
<?php if (isset($_GET['welcome'])): ?><div class="ok">რეგისტრაცია წარმატებით დასრულდა! ახლა შეგიძლიათ განცხადების დამატება.</div><?php endif; ?>
<form class="search" method="get"><input name="q" value="<?= e($q) ?>" placeholder="ძებნა...">
<select name="cat"><option value="">ყველა კატეგორია</option><?php foreach (CATEGORIES as $c): ?><option<?= $c===$cat?' selected':'' ?>><?= e($c) ?></option><?php endforeach; ?></select>
<select name="city"><option value="">ყველა ქალაქი</option><?php foreach (CITIES as $c): ?><option<?= $c===$city?' selected':'' ?>><?= e($c) ?></option><?php endforeach; ?></select>
<button class="btn">ძებნა</button></form>
<div class="list"><?php foreach ($rows as $r): ?>
<a class="item card" href="view.php?id=<?= $r['id'] ?>"><div class="thumb"<?= $r['image'] ? ' style="background-image:url(uploads/'.e($r['image']).')"' : '' ?>><?= $r['image'] ? '' : '🧱' ?></div>
<div class="body"><span class="tag"><?= e($r['category']) ?></span><h3><?= e($r['title']) ?></h3>
<b class="price"><?= number_format($r['price'],2) ?> ₾ / <?= e($r['unit']) ?></b><small class="muted">📍 <?= e($r['city']) ?></small></div></a>
<?php endforeach; if (!$rows): ?><p class="muted">განცხადებები ვერ მოიძებნა.</p><?php endif; ?></div>
<?php require 'inc/footer.php';
