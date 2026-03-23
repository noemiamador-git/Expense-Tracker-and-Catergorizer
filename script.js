const starterEntries = [
  { title: 'Rent', amount: 1250, type: 'expense', category: 'Housing', billing: 'monthly' },
  { title: 'Groceries', amount: 142.8, type: 'expense', category: 'Food', billing: 'one-time' },
  { title: 'Spotify', amount: 10.99, type: 'subscription', category: 'Entertainment', billing: 'monthly' },
  { title: 'Metro Card', amount: 52, type: 'expense', category: 'Transport', billing: 'monthly' }
];

const entries = [...starterEntries];

const form = document.getElementById('money-form');
const entriesEl = document.getElementById('entries');
const categoryStackEl = document.getElementById('category-stack');
const tipsEl = document.getElementById('tips');

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function render() {
  const totalExpenses = entries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalSubscriptions = entries
    .filter((entry) => entry.type === 'subscription')
    .reduce((sum, entry) => sum + entry.amount, 0);

  document.getElementById('total-expenses').textContent = currency.format(totalExpenses);
  document.getElementById('total-subscriptions').textContent = currency.format(totalSubscriptions);
  document.getElementById('balance').textContent = currency.format(4200 - totalExpenses - totalSubscriptions);

  const categoryTotals = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  document.getElementById('top-category').textContent = sortedCategories[0]?.[0] || '—';

  const largest = sortedCategories[0]?.[1] || 1;
  categoryStackEl.innerHTML = sortedCategories
    .map(
      ([category, total]) => `
        <div class="category-bar">
          <header>
            <strong>${category}</strong>
            <span>${currency.format(total)}</span>
          </header>
          <progress value="${total}" max="${largest}"></progress>
        </div>`
    )
    .join('');

  entriesEl.innerHTML = [...entries]
    .reverse()
    .map(
      (entry) => `
        <article class="entry">
          <div class="entry-top">
            <div>
              <span class="entry-tag">${entry.type}</span>
              <strong>${entry.title}</strong>
            </div>
            <strong>${currency.format(entry.amount)}</strong>
          </div>
          <div class="entry-meta">
            <span>${entry.category}</span>
            <span>${entry.billing}</span>
          </div>
        </article>`
    )
    .join('');

  const tips = [];
  if (totalSubscriptions > 50) {
    tips.push({
      title: 'Subscription check-in',
      body: 'Your recurring services are stacking up. Review which ones you actually used this month.'
    });
  }
  if ((categoryTotals.Food || 0) > 300) {
    tips.push({
      title: 'Food spending is leading',
      body: 'Meal prep or a weekly grocery cap could help smooth out the biggest category.'
    });
  }
  if (!tips.length) {
    tips.push({
      title: 'Looking balanced',
      body: 'Nice work — your spending is diversified, and no single area is wildly dominating.'
    });
  }
  tips.push({
    title: 'Sunny habit idea',
    body: 'Use this dashboard once a week for 2 minutes. Small check-ins beat one giant budget cleanup.'
  });

  tipsEl.innerHTML = tips
    .map(
      (tip) => `
        <article class="tip-card">
          <h3>${tip.title}</h3>
          <p>${tip.body}</p>
        </article>`
    )
    .join('');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const billing = document.getElementById('billing').value;

  if (!title || !amount) return;

  entries.push({ title, amount, type, category, billing });
  form.reset();
  render();
});

render();
