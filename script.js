const entries = [];
let monthlyBudget = null;

const form = document.getElementById('money-form');
const budgetForm = document.getElementById('budget-form');
const entriesEl = document.getElementById('entries');
const categoryStackEl = document.getElementById('category-stack');
const tipsEl = document.getElementById('tips');
const balanceEl = document.getElementById('balance');

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function renderEmptyState(container, title, body) {
  container.innerHTML = `
    <article class="empty-card">
      <h3>${title}</h3>
      <p>${body}</p>
    </article>`;
}

function render() {
  const totalExpenses = entries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalSubscriptions = entries
    .filter((entry) => entry.type === 'subscription')
    .reduce((sum, entry) => sum + entry.amount, 0);

  document.getElementById('total-expenses').textContent = currency.format(totalExpenses);
  document.getElementById('total-subscriptions').textContent = currency.format(totalSubscriptions);
  balanceEl.textContent = monthlyBudget === null
    ? 'Set your budget'
    : currency.format(monthlyBudget - totalExpenses - totalSubscriptions);

  const categoryTotals = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  document.getElementById('top-category').textContent = sortedCategories[0]?.[0] || '—';

  if (!sortedCategories.length) {
    renderEmptyState(
      categoryStackEl,
      'No categories yet',
      'Your category breakdown will appear here after you add your first expense or subscription.'
    );
  } else {
    const largest = sortedCategories[0][1];
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
  }

  if (!entries.length) {
    renderEmptyState(
      entriesEl,
      'No entries yet',
      'Use the form to add your first expense or subscription. Nothing is preloaded now — it is all yours to fill in.'
    );
  } else {
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
  }

  const tips = [];
  if (monthlyBudget === null) {
    tips.push({
      title: 'Start with your budget',
      body: 'Set a monthly budget first so the remaining balance card can reflect your actual plan.'
    });
  }
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
  if (!entries.length) {
    tips.push({
      title: 'Build your dashboard your way',
      body: 'Add your own categories, subscriptions, and purchases to turn this into a personalized money snapshot.'
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

budgetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = Number(document.getElementById('monthly-budget').value);

  if (Number.isNaN(value) || value < 0) {
    return;
  }

  monthlyBudget = value;
  budgetForm.reset();
  render();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value.trim();
  const billing = document.getElementById('billing').value;

  if (!title || Number.isNaN(amount) || amount <= 0 || !category) {
    return;
  }

  entries.push({ title, amount, type, category, billing });
  form.reset();
  render();
});

render();
