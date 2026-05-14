function escape(val) {
  const s = String(val ?? '').replace(/\n/g, ' ').replace(/"/g, '""');
  return `"${s}"`;
}

function download(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function exportPostsCsv(posts, accountName = 'page') {
  const header = ['id', 'message', 'created_time', 'likes', 'comments'].join(',');
  const rows = posts.map((p) => [
    escape(p.id),
    escape(p.message || p.story || ''),
    escape(p.created_time),
    escape(p.likes?.summary?.total_count ?? 0),
    escape(p.comments?.summary?.total_count ?? 0),
  ].join(','));
  download([header, ...rows].join('\n'), `posts-${accountName}-${todayStr()}.csv`);
}

function flattenComments(comments, parentId = '') {
  const rows = [];
  for (const c of comments) {
    rows.push({ id: c.id, parent_id: parentId, author: c.from?.name ?? '', message: c.message ?? '', created_time: c.created_time });
    if (c.comments?.data?.length) rows.push(...flattenComments(c.comments.data, c.id));
  }
  return rows;
}

export function exportCommentsCsv(comments, accountName = 'page') {
  const header = ['id', 'parent_id', 'author', 'message', 'created_time'].join(',');
  const rows = flattenComments(comments).map((r) => [
    escape(r.id), escape(r.parent_id), escape(r.author), escape(r.message), escape(r.created_time),
  ].join(','));
  download([header, ...rows].join('\n'), `comments-${accountName}-${todayStr()}.csv`);
}
