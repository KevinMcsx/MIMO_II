const collections = {
  GameScore: 'loopybrain_game_scores',
  PlayerProfile: 'loopybrain_player_profiles',
  DailyChallenge: 'loopybrain_daily_challenges',
  ChallengeCompletion: 'loopybrain_challenge_completions',
};

function collection(key, indexedByName = false) {
  function read() {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return indexedByName ? Object.values(parsed) : parsed;
  }

  function write(records) {
    const value = indexedByName
      ? Object.fromEntries(records.map(record => [record.player_name, record]))
      : records;
    localStorage.setItem(key, JSON.stringify(value));
  }

  function matches(record, criteria) {
    return Object.entries(criteria).every(([field, value]) => record[field] === value);
  }

  function select(criteria, order = '-created_date', limit) {
    const descending = order.startsWith('-');
    const field = descending ? order.slice(1) : order;
    const rows = read().filter(record => matches(record, criteria));
    rows.sort((a, b) => {
      const comparison = a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0;
      return descending ? -comparison : comparison;
    });
    return rows.slice(0, limit ?? rows.length);
  }

  return {
    async filter(criteria, order, limit) {
      return select(criteria, order, limit);
    },
    async list(order, limit) {
      return select({}, order, limit);
    },
    async create(data) {
      const existing = read();
      const duplicate = indexedByName && existing.find(record => record.player_name === data.player_name);
      if (duplicate) return duplicate;
      const record = { ...data, id: crypto.randomUUID(), created_date: new Date().toISOString() };
      write([...existing, record]);
      return record;
    },
    async update(id, updates) {
      const records = read();
      const index = records.findIndex(record => record.id === id);
      if (index < 0) throw new Error('Record not found');
      records[index] = { ...records[index], ...updates };
      write(records);
      return records[index];
    },
    async delete(id) {
      write(read().filter(record => record.id !== id));
    },
    async deleteMany(criteria) {
      write(read().filter(record => !matches(record, criteria)));
    },
  };
}

export const localData = {
  entities: Object.fromEntries(Object.entries(collections).map(([name, key]) => [
    name,
    collection(key, name === 'PlayerProfile'),
  ])),
};
