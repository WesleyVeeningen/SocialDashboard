function startOfToday() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}
function startOfWeek() {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d;
}

export function filterComments(comments, { search = '', filter = 'all' }) {
  return comments.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const inMessage = c.message?.toLowerCase().includes(q);
      const inName = c.from?.name?.toLowerCase().includes(q);
      if (!inMessage && !inName) return false;
    }
    if (filter === 'unanswered') {
      if ((c.comments?.data?.length ?? 0) > 0) return false;
    }
    if (filter === 'today') {
      if (new Date(c.created_time) < startOfToday()) return false;
    }
    if (filter === 'week') {
      if (new Date(c.created_time) < startOfWeek()) return false;
    }
    return true;
  });
}
