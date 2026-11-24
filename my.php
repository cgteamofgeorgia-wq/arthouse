<?php require 'inc/db.php'; require_login();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_csrf();
  $s = db()->prepare('SELECT image FROM listings WHERE id=? AND user_id=?'); $s->execute([(int)$_POST['id'], user()['id']]);
  if ($row = $s->fetch()) {
    if ($row['image']) @unlink(__DIR__.'/uploads/'.$row['image']);
    db()->prepare('DELETE FROM listings WHERE id=? AND user_id=?')->execute([(int)$_POST['id'], user()['id']]);
  }
  header('Location: my.php'); exit;
}
$s = db()->prepare('SELECT * FROM listings WHERE user_id=? ORDER BY id DESC'); $s->execute([user()['id']]); $rows = $s->fetchAll();
require 'inc/header.php'; ?>
<h1>ჩემი განცხადებები</h1>
<table class="card tbl"><tr><th>სათაური</th><th>ფასი</th><th>თარიღი</th><th></th></tr>
<?php foreach ($rows as $r): ?><tr><td><a href="view.php?id=<?= $r['id'] ?>"><?= e($r['title']) ?></a></td><td><?= number_format($r['price'],2) ?> ₾</td><td><?= e($r['created_at']) ?></td>
<td><form method="post" onsubmit="return confirm('წავშალოთ?')"><?= csrf_field() ?><input type="hidden" name="id" value="<?= $r['id'] ?>"><button class="del">წაშლა</button></form></td></tr><?php endforeach; ?>
</table><?php if (!$rows): ?><p class="muted">ჯერ არ გაქვთ განცხადებები. <a href="add.php">დაამატეთ</a></p><?php endif; ?>
<?php require 'inc/footer.php';
