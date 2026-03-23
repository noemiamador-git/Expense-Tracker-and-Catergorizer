const entries = [];
let monthlyBalance = null;

const expenseForm = document.getElementById('expense-form');
const balanceForm = document.getElementById('balance-form');
const entriesEl = document.getElementById('entries');
const categoryStackEl = document.getElementById('category-stack');
const tipsEl = document.getElementById('tips');
const remainingBalanceEl = document.getElementById('remaining-balance');
const remainingSummaryEl = document.getElementById('remaining-summary');
const monthlyBalanceTotalEl = document.getElementById('monthly-balance-total');
const totalExpensesEl = document.getElementById('total-expenses');

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function renderEmptyState(container, title, body) {
  container.innerHTML = `
    <article class="empty-card">
      <h3>${title}</h3>
      <p>${body}</p>
    </article>`;
}

function formatEntryDate(value) {
  if (!value) return 'No date';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function render() {
  const totalExpenses = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const remainingBalance = monthlyBalance === null ? null : monthlyBalance - totalExpenses;

  totalExpensesEl.textContent = currency.format(totalExpenses);
  monthlyBalanceTotalEl.textContent = monthlyBalance === null ? '$0' : currency.format(monthlyBalance);
  remainingBalanceEl.textContent = remainingBalance === null ? 'Set your monthly balance' : currency.format(remainingBalance);
  remainingSummaryEl.textContent = remainingBalance === null ? '$0' : currency.format(remainingBalance);

  const categoryTotals = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (!sortedCategories.length) {
    renderEmptyState(
      categoryStackEl,
      'No monthly expenses yet',
      'Once you add expenses for the month, their totals by category will show up here.'
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
      'No recent entries yet',
      'Add an expense and it will appear here as part of your running monthly expense list.'
    );
  } else {
    entriesEl.innerHTML = [...entries]
      .reverse()
      .map(
        (entry) => `
          <article class="entry">
            <div class="entry-top">
              <div>
                <span class="entry-tag">${entry.category}</span>
                <strong>${entry.title}</strong>
              </div>
              <strong>${currency.format(entry.amount)}</strong>
            </div>
            <div class="entry-meta">
              <span>${formatEntryDate(entry.date)}</span>
              <span>${entry.note || 'No note'}</span>
            </div>
          </article>`
      )
      .join('');
  }

  const tips = [];
  if (monthlyBalance === null) {
    tips.push({
      title: 'Set your monthly balance first',
      body: 'Adding your starting monthly balance makes the remaining total much more useful.'
    });
  }
  if (totalExpenses > 0 && monthlyBalance !== null) {
    const spentShare = totalExpenses / monthlyBalance;
    if (spentShare >= 0.8) {
      tips.push({
        title: 'You have used most of your balance',
        body: 'Your expenses are above 80% of your monthly balance, so this is a good time to slow spending down.'
      });
    }
  }
  if (!entries.length) {
    tips.push({
      title: 'Start logging recent entries',
      body: 'Each expense you add builds your monthly total and your recent-entry list automatically.'
    });
  }
  tips.push({
    title: 'Quick habit idea',
    body: 'Update this once per day or after each purchase so your monthly total stays accurate.'
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

balanceForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = Number(document.getElementById('monthly-balance').value);

  if (Number.isNaN(value) || value < 0) {
    return;
  }

  monthlyBalance = value;
  balanceForm.reset();
  render();
});

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const category = document.getElementById('category').value.trim();
  const date = document.getElementById('date').value;
  const note = document.getElementById('note').value.trim();

  if (!title || Number.isNaN(amount) || amount <= 0 || !category || !date) {
    return;
  }

  entries.push({ title, amount, category, date, note });
  expenseForm.reset();
  render();
});

render();
