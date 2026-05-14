export function filterPosts(posts, { search = '', filter = 'all' }) {
  let result = posts;

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter((p) =>
      (p.message || p.story || '').toLowerCase().includes(q)
    );
  }

  if (filter === 'with_image') {
    result = result.filter((p) => !!p.full_picture);
  } else if (filter === 'text_only') {
    result = result.filter((p) => !p.full_picture);
  } else if (filter === 'most_liked') {
    result = [...result].sort(
      (a, b) => (b.likes?.summary?.total_count ?? 0) - (a.likes?.summary?.total_count ?? 0)
    );
  } else if (filter === 'most_comments') {
    result = [...result].sort(
      (a, b) => (b.comments?.summary?.total_count ?? 0) - (a.comments?.summary?.total_count ?? 0)
    );
  }

  return result;
}
