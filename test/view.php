<?php require 'inc/db.php';
$s = db()->prepare('SELECT l.*, u.name, u.phone, u.email FROM listings l JOIN users u ON u.id=l.user_id WHERE l.id=?');
$s->execute([(int)($_GET['id'] ?? 0)]); $r = $s->fetch();
require 'inc/header.php';
if (!$r): ?><p>განცხადება ვერ მოიძებნა.</p><?php else: ?>
<div class="card detail"><?php if ($r['image']): ?><img src="uploads/<?= e($r['image']) ?>" alt=""><?php endif; ?>
<div><span class="tag"><?= e($r['category']) ?></span><h1><?= e($r['title']) ?></h1>
<p class="price big"><?= number_format($r['price'],2) ?> ₾ / <?= e($r['unit']) ?></p>
<p>📍 <?= e($r['city']) ?> · <span class="muted"><?= e($r['created_at']) ?></span></p>
<p><?= nl2br(e($r['description'])) ?></p>
<div class="contact"><b><?= e($r['name']) ?></b><br>📞 <a href="tel:<?= e($r['phone']) ?>"><?= e($r['phone']) ?></a><br>✉️ <a href="mailto:<?= e($r['email']) ?>"><?= e($r['email']) ?></a></div></div></div>
<?php endif; require 'inc/footer.php';
