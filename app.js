const STORAGE_KEY = "php-finance-tracker-v1";
const FEEDBACK_STORAGE_KEY = "php-finance-tracker-feedback-v1";

const DEFAULT_CATEGORIES = {
  expense: [
    { id: "food", name: "Food", icon: "Food", budget: 10000 },
    { id: "grocery", name: "Grocery", icon: "Groc", budget: 12000 },
    { id: "personal", name: "Personal", icon: "Pers", budget: 10000 },
    { id: "car", name: "Car", icon: "Car", budget: 3000 },
    { id: "bills", name: "Bills", icon: "Bill", budget: 38000 },
    { id: "card", name: "Card", icon: "Card", budget: 0 },
    { id: "medicine", name: "Medicine", icon: "Med", budget: 2000 },
    { id: "living-costs", name: "Living Costs", icon: "Live", budget: 50000 }
  ],
  income: [
    { id: "salary", name: "Salary", icon: "Pay" },
    { id: "interest", name: "Interest", icon: "%" },
    { id: "investment", name: "Investment", icon: "Inv" },
    { id: "bonus", name: "Bonus", icon: "+" },
    { id: "part-time", name: "Part-time job", icon: "Job" },
    { id: "dividend", name: "Dividend", icon: "Div" }
  ],
  saving: [
    { id: "emergency", name: "Emergency", icon: "Emer" },
    { id: "general", name: "General", icon: "Gen" },
    { id: "investment-saving", name: "Investment", icon: "Inv" },
    { id: "travel", name: "Travel", icon: "Trip" }
  ]
};

const DEFAULT_GOALS = [
  { id: "emergency", name: "Emergency Fund", target: 50000 },
  { id: "general", name: "General Savings", target: 25000 }
];

const DEFAULT_ASSETS = [
  { id: "landbank", date: "2026-03-09", account: "LandBank", balance: 152.54 },
  { id: "gcash", date: "2026-03-09", account: "GCash", balance: 23988.35 },
  { id: "gsave", date: "2026-03-09", account: "GSave", balance: 160177.26 },
  { id: "ginvest", date: "2026-03-09", account: "GInvest", balance: 993.33 },
  { id: "metrobank", date: "2026-03-09", account: "Metrobank", balance: 24504.89 },
  { id: "bdo-savings", date: "2026-03-09", account: "BDO Savings", balance: 22177.22 },
  { id: "bpi-uitf", date: "2026-03-09", account: "BPI UITF", balance: 2108519.19 }
];

const CREDIT_CARD_METHODS = [
  { id: "bpi", name: "BPI", method: "Credit Card - BPI", cutoffDay: 25 },
  { id: "metro", name: "Metro", method: "Credit Card - Metro", cutoffDay: 25 }
];
const PAYMENT_METHODS = ["Cash", ...CREDIT_CARD_METHODS.map((card) => card.method), "Digital Wallet"];

let state = loadState();
let currentMonth = getMonthKey(new Date());
let selectedDate = toDateInputValue(new Date());
let historyYear = new Date().getFullYear();
let entryType = "expense";
let selectedCategory = state.categories.expense[0].id;
let assetsEditMode = false;
let categoryEditMode = false;
let transactionEditMode = false;
let selectedDateDetailsOpen = false;
let editingTransactionId = "";
let selectedCardDetailId = "";
let summaryValuesVisible = true;
let expandedSummaryCategoryId = "";
let calculatorTarget = null;
let calculatorExpression = "";
let lastCalculatorOpenAt = 0;
let activeClusterIndex = 0;
let selectedEntryClusterId = "";
let selectedPaymentMethod = PAYMENT_METHODS[0];

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2
});

const els = {
  screenTitle: document.querySelector("#screen-title"),
  monthLabel: document.querySelector("#month-label"),
  monthPrev: document.querySelector("#month-prev"),
  monthNext: document.querySelector("#month-next"),
  navButtons: document.querySelectorAll(".bottom-nav button"),
  screens: document.querySelectorAll(".screen"),
  form: document.querySelector("#transaction-form"),
  amount: document.querySelector("#amount"),
  amountPrefix: document.querySelector("#amount-prefix"),
  note: document.querySelector("#note"),
  date: document.querySelector("#date"),
  time: document.querySelector("#time"),
  entryClusterRow: document.querySelector("#entry-cluster-row"),
  entryCluster: document.querySelector("#entry-cluster"),
  entryPaymentRow: document.querySelector("#entry-payment-row"),
  entryPaymentMethod: document.querySelector("#entry-payment-method"),
  categoryChips: document.querySelector("#category-chips"),
  typeButtons: document.querySelectorAll(".segmented button"),
  privacyToggles: document.querySelectorAll("[data-privacy-toggle]"),
  homeIncome: document.querySelector("#home-income"),
  homeExpenses: document.querySelector("#home-expenses"),
  openHistory: document.querySelector("#open-history"),
  backSummary: document.querySelector("#back-summary"),
  historyPrev: document.querySelector("#history-prev"),
  historyNext: document.querySelector("#history-next"),
  historyYear: document.querySelector("#history-year"),
  historyBudgeted: document.querySelector("#history-budgeted"),
  historySpent: document.querySelector("#history-spent"),
  historyDifference: document.querySelector("#history-difference"),
  historyList: document.querySelector("#history-list"),
  summaryClusterPrev: document.querySelector("#summary-cluster-prev"),
  summaryClusterNext: document.querySelector("#summary-cluster-next"),
  summaryClusterName: document.querySelector("#summary-cluster-name"),
  summaryClusterSpent: document.querySelector("#summary-cluster-spent"),
  homeBudgetBars: document.querySelector("#home-budget-bars"),
  paymentMethodList: document.querySelector("#payment-method-list"),
  calendarGrid: document.querySelector("#calendar-grid"),
  selectedDatePanel: document.querySelector("#selected-date-panel"),
  selectedDateTitle: document.querySelector("#selected-date-title"),
  selectedDateTotal: document.querySelector("#selected-date-total"),
  selectedDateList: document.querySelector("#selected-date-list"),
  toggleTransactionEdit: document.querySelector("#toggle-transaction-edit"),
  transactionModal: document.querySelector("#transaction-modal"),
  transactionEditForm: document.querySelector("#transaction-edit-form"),
  closeTransactionModal: document.querySelector("#close-transaction-modal"),
  cardDetailModal: document.querySelector("#card-detail-modal"),
  closeCardDetail: document.querySelector("#close-card-detail"),
  cardDetailTitle: document.querySelector("#card-detail-title"),
  cardCutoffDay: document.querySelector("#card-cutoff-day"),
  cardDetailPeriod: document.querySelector("#card-detail-period"),
  cardDetailTotal: document.querySelector("#card-detail-total"),
  cardDetailList: document.querySelector("#card-detail-list"),
  editTransactionType: document.querySelector("#edit-transaction-type"),
  editTransactionCategory: document.querySelector("#edit-transaction-category"),
  editTransactionClusterRow: document.querySelector("#edit-transaction-cluster-row"),
  editTransactionCluster: document.querySelector("#edit-transaction-cluster"),
  editTransactionPaymentRow: document.querySelector("#edit-transaction-payment-row"),
  editTransactionPaymentMethod: document.querySelector("#edit-transaction-payment-method"),
  editTransactionPrefix: document.querySelector("#edit-transaction-prefix"),
  editTransactionAmount: document.querySelector("#edit-transaction-amount"),
  editTransactionTime: document.querySelector("#edit-transaction-time"),
  editTransactionDate: document.querySelector("#edit-transaction-date"),
  editTransactionNote: document.querySelector("#edit-transaction-note"),
  deleteTransaction: document.querySelector("#delete-transaction"),
  calculatorModal: document.querySelector("#calculator-modal"),
  calculatorTitle: document.querySelector("#calculator-title"),
  calculatorGrid: document.querySelector("#calculator-grid"),
  calculatorOpenButtons: document.querySelectorAll("[data-calculator-target]"),
  budgetClusterPrev: document.querySelector("#budget-cluster-prev"),
  budgetClusterNext: document.querySelector("#budget-cluster-next"),
  budgetClusterName: document.querySelector("#budget-cluster-name"),
  budgetClusterSpent: document.querySelector("#budget-cluster-spent"),
  budgetClusterRemaining: document.querySelector("#budget-cluster-remaining"),
  clusterActions: document.querySelector("#cluster-actions"),
  renameCluster: document.querySelector("#rename-cluster"),
  addCluster: document.querySelector("#add-cluster"),
  removeCluster: document.querySelector("#remove-cluster"),
  budgetList: document.querySelector("#budget-list"),
  toggleCategoryEdit: document.querySelector("#toggle-category-edit"),
  addCategory: document.querySelector("#add-category"),
  assetsList: document.querySelector("#assets-list"),
  assetTotal: document.querySelector("#asset-total"),
  assetTitle: document.querySelector("#asset-title"),
  addAsset: document.querySelector("#add-asset"),
  toggleAssetsEdit: document.querySelector("#toggle-assets-edit"),
  exportCsv: document.querySelector("#export-csv"),
  exportAssetsCsv: document.querySelector("#export-assets-csv"),
  exportBackup: document.querySelector("#export-backup"),
  importBackup: document.querySelector("#import-backup"),
  feedbackNotes: document.querySelector("#feedback-notes"),
  saveFeedback: document.querySelector("#save-feedback"),
  clearFeedback: document.querySelector("#clear-feedback"),
  exportFeedback: document.querySelector("#export-feedback")
};

initialize();

function initialize() {
  ensureMonthBudget(currentMonth);
  setDateTimeDefaults();
  els.feedbackNotes.value = localStorage.getItem(FEEDBACK_STORAGE_KEY) || "";
  bindEvents();
  render();

  if ("serviceWorker" in navigator && ["http:", "https:"].includes(location.protocol)) {
    navigator.serviceWorker.register("service-worker.js");
  }
}

function bindEvents() {
  els.navButtons.forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.screen));
  });

  els.monthPrev.addEventListener("click", () => changeMonth(-1));
  els.monthNext.addEventListener("click", () => changeMonth(1));
  els.summaryClusterPrev.addEventListener("click", () => changeCluster(-1));
  els.summaryClusterNext.addEventListener("click", () => changeCluster(1));
  els.budgetClusterPrev.addEventListener("click", () => changeCluster(-1));
  els.budgetClusterNext.addEventListener("click", () => changeCluster(1));
  els.openHistory.addEventListener("click", () => showScreen("history-screen"));
  els.backSummary.addEventListener("click", () => showScreen("summary-screen"));
  els.historyPrev.addEventListener("click", () => {
    historyYear -= 1;
    renderHistory();
  });
  els.historyNext.addEventListener("click", () => {
    historyYear += 1;
    renderHistory();
  });
  els.privacyToggles.forEach((button) => {
    button.addEventListener("click", () => {
      summaryValuesVisible = !summaryValuesVisible;
      renderHome();
    });
  });
  els.homeBudgetBars.addEventListener("click", (event) => {
    const row = event.target.closest("[data-summary-category]");
    if (!row) return;
    expandedSummaryCategoryId = expandedSummaryCategoryId === row.dataset.summaryCategory ? "" : row.dataset.summaryCategory;
    renderHomeBudgetBars();
  });
  els.calendarGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button) return;
    if (selectedDate === button.dataset.date && selectedDateDetailsOpen) {
      selectedDateDetailsOpen = false;
    } else {
      selectedDate = button.dataset.date;
      selectedDateDetailsOpen = true;
    }
    transactionEditMode = false;
    renderCalendar();
    renderSelectedDateTransactions();
  });
  els.toggleTransactionEdit.addEventListener("click", () => {
    transactionEditMode = !transactionEditMode;
    if (!transactionEditMode) closeTransactionModal();
    renderSelectedDateTransactions();
  });
  els.selectedDateList.addEventListener("click", handleTransactionAction);
  els.transactionEditForm.addEventListener("submit", saveEditedTransaction);
  els.closeTransactionModal.addEventListener("click", closeTransactionModal);
  els.transactionModal.addEventListener("click", (event) => {
    if (event.target === els.transactionModal) closeTransactionModal();
  });
  els.paymentMethodList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-detail]");
    if (!button) return;
    openCardDetail(button.dataset.cardDetail);
  });
  els.closeCardDetail.addEventListener("click", closeCardDetail);
  els.cardDetailModal.addEventListener("click", (event) => {
    if (event.target === els.cardDetailModal) closeCardDetail();
  });
  els.cardCutoffDay.addEventListener("change", () => {
    const card = getCreditCardSetting(selectedCardDetailId);
    if (!card) return;
    card.cutoffDay = clampCutoffDay(Number(els.cardCutoffDay.value));
    persist();
    renderPaymentMethodTotals();
    renderCardDetail();
  });
  els.editTransactionType.addEventListener("change", () => {
    populateEditClusters(els.editTransactionDate.value);
    populateEditCategories(els.editTransactionType.value, els.editTransactionCluster.value, els.editTransactionDate.value);
    populatePaymentMethods(els.editTransactionPaymentMethod, els.editTransactionPaymentRow, els.editTransactionType.value === "expense");
    els.editTransactionPrefix.textContent = els.editTransactionType.value === "expense" ? "- PHP" : "+ PHP";
  });
  els.editTransactionCluster.addEventListener("change", () => {
    populateEditCategories(els.editTransactionType.value, els.editTransactionCluster.value, els.editTransactionDate.value);
  });
  els.editTransactionDate.addEventListener("change", () => {
    populateEditClusters(els.editTransactionDate.value);
    populateEditCategories(els.editTransactionType.value, els.editTransactionCluster.value, els.editTransactionDate.value);
    populatePaymentMethods(els.editTransactionPaymentMethod, els.editTransactionPaymentRow, els.editTransactionType.value === "expense", els.editTransactionPaymentMethod.value);
  });
  els.deleteTransaction.addEventListener("click", deleteEditingTransaction);
  els.calculatorOpenButtons.forEach((button) => {
    const openFromButton = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const now = Date.now();
      if (now - lastCalculatorOpenAt < 350) return;
      lastCalculatorOpenAt = now;
      openCalculator(getCalculatorTarget(button.dataset.calculatorTarget));
    };
    if (window.PointerEvent) {
      button.addEventListener("pointerup", openFromButton);
    }
    button.addEventListener("click", openFromButton);
  });
  els.calculatorGrid.addEventListener("click", handleCalculatorKey);
  els.calculatorModal.addEventListener("click", (event) => {
    if (event.target === els.calculatorModal) closeCalculator();
  });

  els.typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      entryType = button.dataset.type;
      selectedCategory = getEntryCategories()[0]?.id || "";
      renderEntry();
    });
  });
  els.entryCluster.addEventListener("change", () => {
    selectedEntryClusterId = els.entryCluster.value;
    selectedCategory = getEntryCategories()[0]?.id || "";
    renderEntry();
  });
  els.entryPaymentMethod.addEventListener("change", () => {
    selectedPaymentMethod = els.entryPaymentMethod.value;
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveTransaction();
  });

  els.toggleCategoryEdit.addEventListener("click", () => {
    categoryEditMode = !categoryEditMode;
    renderBudget();
  });
  els.addCategory.addEventListener("click", addCategory);
  els.renameCluster.addEventListener("click", renameCluster);
  els.addCluster.addEventListener("click", addCluster);
  els.removeCluster.addEventListener("click", removeCluster);
  els.addAsset.addEventListener("click", addAsset);
  els.toggleAssetsEdit.addEventListener("click", () => {
    assetsEditMode = !assetsEditMode;
    renderAssets();
  });
  els.assetsList.addEventListener("click", handleAssetAction);
  els.assetsList.addEventListener("change", handleAssetFieldChange);
  els.exportCsv.addEventListener("click", exportCsv);
  els.exportAssetsCsv.addEventListener("click", exportAssetsCsv);
  els.exportBackup.addEventListener("click", exportBackup);
  els.importBackup.addEventListener("change", importBackup);
  els.saveFeedback.addEventListener("click", saveFeedback);
  els.clearFeedback.addEventListener("click", clearFeedback);
  els.exportFeedback.addEventListener("click", exportFeedback);
  els.feedbackNotes.addEventListener("change", saveFeedback);
}

function showScreen(screenId) {
  els.screens.forEach((screen) => screen.classList.toggle("active", screen.id === screenId));
  els.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.screen === screenId));
  const activeButton = [...els.navButtons].find((button) => button.dataset.screen === screenId);
  els.screenTitle.textContent = activeButton?.querySelector("span")?.textContent || "Summary";
  if (screenId === "add-screen") {
    els.amount.focus();
  }
}

function changeMonth(offset) {
  const [year, month] = currentMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  currentMonth = getMonthKey(date);
  selectedDate = selectedDate.startsWith(currentMonth) ? selectedDate : `${currentMonth}-01`;
  selectedDateDetailsOpen = false;
  ensureMonthBudget(currentMonth);
  clampClusterIndex();
  render();
}

function changeCluster(offset) {
  const clusters = getBudgetClusters(state.budgets[currentMonth]);
  activeClusterIndex = (activeClusterIndex + offset + clusters.length) % clusters.length;
  expandedSummaryCategoryId = "";
  selectedEntryClusterId = getActiveCluster(state.budgets[currentMonth]).id;
  renderHomeBudgetBars();
  renderEntry();
  renderBudget();
}

function render() {
  ensureMonthBudget(currentMonth);
  els.monthLabel.textContent = monthLong(currentMonth);
  renderHome();
  renderEntry();
  renderBudget();
  renderAssets();
  renderHistory();
}

function renderHome() {
  const totals = getMonthTotals(currentMonth);
  els.homeIncome.textContent = formatPrivateMoney(totals.income);
  els.homeExpenses.textContent = formatPrivateMoney(totals.expense);
  els.privacyToggles.forEach((button) => {
    button.classList.toggle("hidden-values", !summaryValuesVisible);
    button.setAttribute("aria-label", summaryValuesVisible ? "Hide summary values" : "Show summary values");
  });
  renderHomeBudgetBars();
  renderPaymentMethodTotals();

  renderCalendar();
  renderSelectedDateTransactions();
}

function renderHomeBudgetBars() {
  const budget = state.budgets[currentMonth];
  const cluster = getActiveCluster(budget);
  const clusterTotals = getClusterTotals(currentMonth, cluster);
  els.summaryClusterName.textContent = cluster.name;
  els.summaryClusterSpent.textContent = `Spent ${formatMoney(clusterTotals.spent)}`;
  els.homeBudgetBars.innerHTML = getClusterCategoryIds(cluster)
    .map((categoryId) => {
      const category = findCategory("expense", categoryId);
      const limit = cluster.categories[categoryId] ?? 0;
      const spent = getCategorySpent(currentMonth, categoryId, cluster.id);
      const remaining = limit - spent;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const capped = Math.min(100, Math.max(0, percent));
      const statusClass = getBudgetStatusClass(percent);
      const isExpanded = expandedSummaryCategoryId === categoryId;
      return `
        <button class="home-budget-row ${isExpanded ? "expanded" : ""}" type="button" data-summary-category="${categoryId}">
          <div class="home-budget-labels">
            <strong>${category?.name || "Uncategorized"}</strong>
            <span class="${remaining < 0 ? "amount-negative" : ""}">
              ${remaining < 0 ? "Over " : "Remaining "}${formatMoney(Math.abs(remaining))}
            </span>
          </div>
          <div class="progress-track compact">
            <div class="progress-fill ${statusClass}" style="--width:${capped}%"></div>
          </div>
          ${isExpanded ? `<div class="summary-category-total">Month total <strong>${formatMoney(spent)}</strong></div>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderCalendar() {
  const [year, month] = currentMonth.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const todayKey = toDateInputValue(new Date());
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = weekdays.map((day) => `<div class="calendar-cell weekday">${day}</div>`);

  for (let i = 0; i < first.getDay(); i += 1) {
    cells.push(`<div></div>`);
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const dateKey = `${currentMonth}-${String(day).padStart(2, "0")}`;
    const spent = state.transactions
      .filter((item) => item.date === dateKey && item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    cells.push(`
      <button class="calendar-cell ${dateKey === todayKey ? "today" : ""} ${dateKey === selectedDate && selectedDateDetailsOpen ? "selected" : ""}" type="button" data-date="${dateKey}">
        <strong>${day}</strong>
        ${spent ? `<small>-${compactMoney(spent)}</small>` : ""}
      </button>
    `);
  }

  els.calendarGrid.innerHTML = cells.join("");
}

function renderSelectedDateTransactions() {
  els.selectedDatePanel.classList.toggle("hidden", !selectedDateDetailsOpen);
  if (!selectedDateDetailsOpen) return;
  const items = state.transactions
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => b.time.localeCompare(a.time));
  const expenseTotal = items
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  els.selectedDateTitle.textContent = formatDisplayDate(selectedDate);
  els.selectedDateTotal.textContent = formatMoney(expenseTotal);
  els.toggleTransactionEdit.textContent = transactionEditMode ? "Done" : "Edit";
  els.toggleTransactionEdit.classList.toggle("hidden", !items.length);
  els.selectedDateList.innerHTML = items.length
    ? items.map(transactionTemplate).join("")
    : `<p class="empty">No transactions on this date.</p>`;
}

function renderEntry() {
  els.typeButtons.forEach((button) => button.classList.toggle("active", button.dataset.type === entryType));
  els.amountPrefix.textContent = entryType === "expense" ? "-" : "+";
  els.amountPrefix.parentElement.style.color = entryType === "expense" ? "var(--pink)" : "var(--mint-dark)";
  renderEntryClusterSelector();
  populatePaymentMethods(els.entryPaymentMethod, els.entryPaymentRow, entryType === "expense", selectedPaymentMethod);
  const categories = getEntryCategories();
  if (!categories.some((category) => category.id === selectedCategory)) {
    selectedCategory = categories[0]?.id || "";
  }
  els.categoryChips.innerHTML = categories
    .map((category) => `
      <button class="${category.id === selectedCategory ? "active" : ""}" type="button" data-category="${category.id}">
        ${category.name}
      </button>
    `)
    .join("");

  els.categoryChips.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      renderEntry();
    });
  });
}

function renderEntryClusterSelector() {
  const isExpense = entryType === "expense";
  els.entryClusterRow.classList.toggle("hidden", !isExpense);
  if (!isExpense) return;
  const clusters = getBudgetClusters(state.budgets[currentMonth]);
  if (!clusters.some((cluster) => cluster.id === selectedEntryClusterId)) {
    selectedEntryClusterId = getActiveCluster(state.budgets[currentMonth]).id;
  }
  els.entryCluster.innerHTML = clusters
    .map((cluster) => `<option value="${cluster.id}" ${cluster.id === selectedEntryClusterId ? "selected" : ""}>${cluster.name}</option>`)
    .join("");
}

function populatePaymentMethods(select, row, visible, selected = PAYMENT_METHODS[0]) {
  row.classList.toggle("hidden", !visible);
  if (!visible) return;
  const active = PAYMENT_METHODS.includes(selected) ? selected : PAYMENT_METHODS[0];
  select.innerHTML = PAYMENT_METHODS.map((method) => `<option value="${method}" ${method === active ? "selected" : ""}>${method}</option>`).join("");
}

function getEntryCategories() {
  if (entryType !== "expense") return state.categories[entryType] || [];
  const cluster = getClusterById(state.budgets[currentMonth], selectedEntryClusterId) || getActiveCluster(state.budgets[currentMonth]);
  return getClusterCategoryIds(cluster)
    .map((categoryId) => findCategory("expense", categoryId))
    .filter(Boolean);
}

function renderPaymentMethodTotals() {
  els.paymentMethodList.innerHTML = state.creditCards
    .map((card) => {
      const period = getStatementPeriod(currentMonth, card.cutoffDay);
      const total = getCreditCardTransactions(card.id, currentMonth).reduce((sum, item) => sum + item.amount, 0);
      return `
        <button class="payment-method-row highlight" type="button" data-card-detail="${card.id}">
          <span>
            <strong>${escapeHtml(card.name)}</strong>
            <small>${formatShortDate(period.start)} - ${formatShortDate(period.end)}</small>
          </span>
          <strong>${formatMoney(total)}</strong>
        </button>
      `;
    })
    .join("");
}

function openCardDetail(cardId) {
  selectedCardDetailId = cardId;
  renderCardDetail();
  els.cardDetailModal.classList.remove("hidden");
}

function closeCardDetail() {
  selectedCardDetailId = "";
  els.cardDetailModal.classList.add("hidden");
}

function renderCardDetail() {
  const card = getCreditCardSetting(selectedCardDetailId);
  if (!card) return;
  const period = getStatementPeriod(currentMonth, card.cutoffDay);
  const transactions = getCreditCardTransactions(card.id, currentMonth);
  const total = transactions.reduce((sum, item) => sum + item.amount, 0);
  els.cardDetailTitle.textContent = `${card.name} transactions`;
  els.cardCutoffDay.value = card.cutoffDay;
  els.cardDetailPeriod.textContent = `${formatDisplayDate(period.start)} - ${formatDisplayDate(period.end)}`;
  els.cardDetailTotal.textContent = formatMoney(total);
  els.cardDetailList.innerHTML = transactions.length
    ? transactions
        .map((item) => {
          const category = findCategory(item.type, item.categoryId);
          return `
            <article class="transaction-item">
              <div>
                <strong>${category?.name || "Uncategorized"}</strong>
                <small>${formatDisplayDate(item.date)} - ${item.time}${item.note ? ` - ${escapeHtml(item.note)}` : ""}</small>
              </div>
              <strong class="amount-negative">-${formatMoney(item.amount)}</strong>
            </article>
          `;
        })
        .join("")
    : `<p class="empty">No credit card transactions in this statement period.</p>`;
}

function renderBudget() {
  const budget = state.budgets[currentMonth];
  const cluster = getActiveCluster(budget);
  const clusterTotals = getClusterTotals(currentMonth, cluster);
  els.budgetClusterName.textContent = cluster.name;
  els.budgetClusterSpent.textContent = `Spent ${formatMoney(clusterTotals.spent)}`;
  els.budgetClusterRemaining.textContent = `${clusterTotals.remaining < 0 ? "Over" : "Remaining"} ${formatMoney(Math.abs(clusterTotals.remaining))}`;
  els.budgetClusterRemaining.className = clusterTotals.remaining < 0 ? "amount-negative" : "";
  els.toggleCategoryEdit.textContent = categoryEditMode ? "Done" : "Edit categories";
  els.clusterActions.classList.toggle("hidden", !categoryEditMode);
  els.budgetList.innerHTML = getClusterCategoryIds(cluster)
    .map((categoryId) => {
      const category = findCategory("expense", categoryId);
      const limit = cluster.categories[categoryId] ?? 0;
      const spent = getCategorySpent(currentMonth, categoryId, cluster.id);
      const remaining = limit - spent;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const capped = Math.min(100, Math.max(0, percent));
      const statusClass = getBudgetStatusClass(percent);
      return `
        <article class="budget-card">
          <div class="budget-row ${categoryEditMode ? "editing" : ""}">
            ${
              categoryEditMode
                ? `<input class="category-name-input" value="${escapeAttribute(category?.name || "Uncategorized")}" data-category-field="name" data-category="${categoryId}" aria-label="${escapeAttribute(category?.name || "Uncategorized")} name" />`
                : `<h3>${category?.name || "Uncategorized"}</h3>`
            }
            <input inputmode="decimal" value="${limit || ""}" data-budget-category="${categoryId}" aria-label="${category?.name || "Uncategorized"} budget" />
            ${
              categoryEditMode
                ? `<button class="remove-icon-button" type="button" data-category-remove="${categoryId}" aria-label="Remove ${escapeAttribute(category?.name || "category")}"></button>`
                : ""
            }
          </div>
          <div class="progress-track">
            <div class="progress-fill ${statusClass}" style="--width:${capped}%"></div>
          </div>
          <div class="budget-detail">
            <span>${percent}% of ${formatMoney(limit)}</span>
            <strong class="${remaining < 0 ? "amount-negative" : ""}">
              ${remaining < 0 ? "Over " : "Left "}${formatMoney(Math.abs(remaining))}
            </strong>
          </div>
          <div class="budget-detail">
            <span>Spent ${formatMoney(spent)}</span>
            <span>Budget ${formatMoney(limit)}</span>
          </div>
        </article>
      `;
    })
    .join("");

  els.budgetList.querySelectorAll("[data-budget-category]").forEach((input) => {
    input.addEventListener("change", () => {
      cluster.categories[input.dataset.budgetCategory] = parseAmount(input.value);
      persist();
      render();
    });
  });

  els.budgetList.querySelectorAll("[data-category-field]").forEach((input) => {
    input.addEventListener("change", () => {
      const category = state.categories.expense.find((item) => item.id === input.dataset.category);
      if (!category) return;
      category.name = normalizeTextInput(input.value) || category.name;
      persist();
      render();
    });
  });

  els.budgetList.querySelectorAll("[data-category-remove]").forEach((button) => {
    button.addEventListener("click", () => removeCategory(button.dataset.categoryRemove));
  });
}

function renderHistory() {
  const monthRows = Array.from({ length: 12 }, (_, index) => {
    const monthKey = `${historyYear}-${String(index + 1).padStart(2, "0")}`;
    const budgeted = state.budgets[monthKey] ? sumBudgetClusters(state.budgets[monthKey]) : 0;
    const spent = getMonthTotals(monthKey).expense;
    return {
      monthKey,
      monthName: monthLong(monthKey),
      budgeted,
      spent,
      difference: budgeted - spent
    };
  });

  const totalBudgeted = monthRows.reduce((sum, row) => sum + row.budgeted, 0);
  const totalSpent = monthRows.reduce((sum, row) => sum + row.spent, 0);
  const totalDifference = totalBudgeted - totalSpent;

  els.historyYear.textContent = historyYear;
  els.historyBudgeted.textContent = formatMoney(totalBudgeted);
  els.historySpent.textContent = formatMoney(totalSpent);
  els.historyDifference.textContent = formatMoney(totalDifference);
  els.historyDifference.className = totalDifference < 0 ? "amount-negative" : "";
  els.historyList.innerHTML = monthRows
    .map((row) => {
      const overspent = getMonthOverspending(row.monthKey);
      return `
      <article class="history-row">
        <strong>${row.monthName}</strong>
        <span>Budgeted ${formatMoney(row.budgeted)}</span>
        <span>Spent ${formatMoney(row.spent)}</span>
        <span class="${row.difference < 0 ? "amount-negative" : ""}">
          ${row.difference < 0 ? "Over " : "Left "}${formatMoney(Math.abs(row.difference))}
        </span>
        ${
          overspent.length
            ? `<div class="history-insight">
                <strong>Overspent</strong>
                ${overspent.slice(0, 3).map((item) => `<span>${escapeHtml(item.name)} +${formatMoney(item.amount)}</span>`).join("")}
              </div>`
            : ""
        }
      </article>
    `;
    })
    .join("");
}

function renderAssets() {
  const total = state.assets.reduce((sum, asset) => sum + asset.balance, 0);
  const trackerDate = state.assetUpdatedAt || latestAssetDate();
  els.assetTitle.textContent = `Asset tracker (${formatDisplayDate(trackerDate)})`;
  els.assetTotal.textContent = formatMoney(total);
  els.toggleAssetsEdit.textContent = assetsEditMode ? "Done" : "Edit";
  els.addAsset.classList.toggle("hidden", !assetsEditMode);
  els.assetsList.innerHTML = `
    <div class="asset-header ${assetsEditMode ? "editing" : ""}">
      <span>Account</span>
      <span>Balance</span>
      ${assetsEditMode ? "<span>Actions</span>" : ""}
    </div>
    ${state.assets
      .map((asset, index) => `
        <div class="asset-row ${assetsEditMode ? "editing" : ""}">
          ${
            assetsEditMode
              ? `<input class="asset-account-input" value="${escapeAttribute(asset.account)}" data-asset-field="account" data-asset="${asset.id}" aria-label="Account name" />`
              : `<strong>${escapeHtml(asset.account)}</strong>`
          }
          ${
            assetsEditMode
              ? `<label class="asset-balance-input"><span>PHP</span><input inputmode="decimal" value="${asset.balance}" data-asset-field="balance" data-asset="${asset.id}" aria-label="${escapeAttribute(asset.account)} balance" /></label>`
              : `<span>${formatMoney(asset.balance)}</span>`
          }
          ${
            assetsEditMode
              ? `<span class="asset-actions">
                  <button class="asset-order-button" type="button" data-asset-action="up" data-asset="${asset.id}" aria-label="Move ${escapeAttribute(asset.account)} up" ${index === 0 ? "disabled" : ""}>&uarr;</button>
                  <button class="asset-order-button" type="button" data-asset-action="down" data-asset="${asset.id}" aria-label="Move ${escapeAttribute(asset.account)} down" ${index === state.assets.length - 1 ? "disabled" : ""}>&darr;</button>
                  <button class="remove-icon-button" type="button" data-asset-action="remove" data-asset="${asset.id}" aria-label="Remove ${escapeAttribute(asset.account)}"></button>
                </span>`
              : ""
          }
        </div>
      `)
      .join("")}
  `;
}

function openCalculator(target) {
  if (!target) return;
  calculatorTarget = target;
  calculatorExpression = target.value || "";
  renderCalculator();
  els.calculatorModal.classList.remove("hidden");
}

function getCalculatorTarget(targetId) {
  if (targetId === "amount") return els.amount;
  if (targetId === "edit-transaction-amount") return els.editTransactionAmount;
  return document.querySelector(`#${targetId}`);
}

function closeCalculator() {
  calculatorTarget = null;
  calculatorExpression = "";
  els.calculatorModal.classList.add("hidden");
}

function handleCalculatorKey(event) {
  const button = event.target.closest("[data-calculator-key]");
  if (!button) return;
  const key = button.dataset.calculatorKey;

  if (key === "clear") {
    calculatorExpression = "";
  } else if (key === "back") {
    calculatorExpression = calculatorExpression.slice(0, -1);
  } else if (key === "=") {
    calculatorExpression = formatCalculatorResult(parseAmount(calculatorExpression));
  } else if (key === "apply") {
    const amount = parseAmount(calculatorExpression);
    if (calculatorTarget) {
      calculatorTarget.value = amount ? formatCalculatorResult(amount) : "";
      calculatorTarget.dispatchEvent(new Event("change", { bubbles: true }));
    }
    closeCalculator();
    return;
  } else {
    calculatorExpression = appendCalculatorKey(calculatorExpression, key);
  }

  renderCalculator();
}

function appendCalculatorKey(expression, key) {
  const operators = ["+", "-", "*", "/"];
  if (operators.includes(key) && (!expression || operators.includes(expression.at(-1)))) {
    return expression ? `${expression.slice(0, -1)}${key}` : "";
  }
  if (key === "." && expression.split(/[+\-*/]/).at(-1).includes(".")) return expression;
  return `${expression}${key}`;
}

function renderCalculator() {
  const result = parseAmount(calculatorExpression);
  els.calculatorTitle.textContent = calculatorExpression || "0";
  if (calculatorExpression && /[+\-*/xX]/.test(calculatorExpression) && result) {
    els.calculatorTitle.textContent = `${calculatorExpression} = ${formatPlainNumber(result)}`;
  }
}

function formatCalculatorResult(value) {
  return Number(value.toFixed(2)).toString();
}

function saveTransaction() {
  const amount = parseAmount(els.amount.value);
  if (entryType === "expense" && !selectedEntryClusterId) {
    selectedEntryClusterId = getActiveCluster(state.budgets[currentMonth]).id;
  }
  if (!amount || !selectedCategory) return;

  state.transactions.push({
    id: crypto.randomUUID(),
    type: entryType,
    amount,
    categoryId: selectedCategory,
    clusterId: entryType === "expense" ? selectedEntryClusterId : "",
    paymentMethod: entryType === "expense" ? selectedPaymentMethod : "",
    note: normalizeTextInput(els.note.value),
    date: els.date.value,
    time: els.time.value,
    createdAt: new Date().toISOString()
  });

  persist();
  els.amount.value = "";
  els.note.value = "";
  selectedDate = els.date.value;
  selectedDateDetailsOpen = true;
  currentMonth = getMonthKey(new Date(`${selectedDate}T00:00:00`));
  setDateTimeDefaults();
  render();
  showScreen("summary-screen");
}

function transactionTemplate(item) {
  const category = findCategory(item.type, item.categoryId);
  const group = item.type === "expense" ? findTransactionCluster(item) : null;
  const sign = item.type === "expense" ? "-" : "+";
  const amountClass = item.type === "expense" ? "amount-negative" : "amount-positive";
  const details = [item.time, group?.name, item.type === "expense" ? item.paymentMethod : "", item.note].filter(Boolean).map(escapeHtml).join(" - ");
  return `
    <article class="transaction-item ${transactionEditMode ? "editable" : ""}" ${transactionEditMode ? `data-transaction-action="open" data-transaction="${item.id}"` : ""}>
      <div>
        <strong>${category?.name || "Uncategorized"}</strong>
        <small>${details}</small>
      </div>
      <strong class="${amountClass}">${sign}${formatMoney(item.amount)}</strong>
    </article>
  `;
}

function handleTransactionAction(event) {
  const button = event.target.closest("[data-transaction-action]");
  if (!button) return;
  const transaction = state.transactions.find((item) => item.id === button.dataset.transaction);
  if (!transaction) return;

  if (button.dataset.transactionAction === "open") {
    openTransactionModal(transaction.id);
  }
}

function openTransactionModal(transactionId) {
  const transaction = state.transactions.find((item) => item.id === transactionId);
  if (!transaction) return;
  editingTransactionId = transactionId;
  els.editTransactionType.innerHTML = `
    <option value="expense">Expense</option>
    <option value="income">Income</option>
  `;
  els.editTransactionType.value = transaction.type;
  populateEditClusters(transaction.date);
  els.editTransactionCluster.value = transaction.type === "expense" ? getTransactionClusterId(transaction) : "";
  populatePaymentMethods(els.editTransactionPaymentMethod, els.editTransactionPaymentRow, transaction.type === "expense", transaction.paymentMethod);
  populateEditCategories(transaction.type, els.editTransactionCluster.value, transaction.date);
  els.editTransactionCategory.value = transaction.categoryId;
  els.editTransactionPrefix.textContent = transaction.type === "expense" ? "- PHP" : "+ PHP";
  els.editTransactionAmount.value = transaction.amount;
  els.editTransactionTime.value = transaction.time;
  els.editTransactionDate.value = transaction.date;
  els.editTransactionNote.value = transaction.note || "";
  els.transactionModal.classList.remove("hidden");
  els.editTransactionAmount.focus();
}

function populateEditClusters(dateValue = selectedDate) {
  const isExpense = els.editTransactionType.value === "expense";
  els.editTransactionClusterRow.classList.toggle("hidden", !isExpense);
  if (!isExpense) {
    els.editTransactionCluster.innerHTML = "";
    return;
  }
  const monthKey = dateValue?.slice(0, 7) || currentMonth;
  ensureMonthBudget(monthKey);
  els.editTransactionCluster.innerHTML = getBudgetClusters(state.budgets[monthKey])
    .map((cluster) => `<option value="${cluster.id}">${cluster.name}</option>`)
    .join("");
}

function populateEditCategories(type, clusterId = "", dateValue = selectedDate) {
  const monthKey = dateValue?.slice(0, 7) || currentMonth;
  ensureMonthBudget(monthKey);
  const categories =
    type === "expense"
      ? getClusterCategoryIds(getClusterById(state.budgets[monthKey], clusterId) || getActiveCluster(state.budgets[monthKey]))
          .map((categoryId) => findCategory("expense", categoryId))
          .filter(Boolean)
      : state.categories[type] || [];
  els.editTransactionCategory.innerHTML = categories
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join("");
}

function closeTransactionModal() {
  editingTransactionId = "";
  els.transactionModal.classList.add("hidden");
}

function saveEditedTransaction(event) {
  event.preventDefault();
  const transaction = state.transactions.find((item) => item.id === editingTransactionId);
  if (!transaction) return;
  transaction.type = els.editTransactionType.value;
  transaction.categoryId = els.editTransactionCategory.value;
  transaction.clusterId = transaction.type === "expense" ? els.editTransactionCluster.value : "";
  transaction.paymentMethod = transaction.type === "expense" ? els.editTransactionPaymentMethod.value : "";
  transaction.amount = parseAmount(els.editTransactionAmount.value);
  transaction.time = els.editTransactionTime.value;
  transaction.date = els.editTransactionDate.value;
  transaction.note = normalizeTextInput(els.editTransactionNote.value);

  selectedDate = transaction.date;
  selectedDateDetailsOpen = true;
  currentMonth = getMonthKey(new Date(`${selectedDate}T00:00:00`));
  ensureMonthBudget(currentMonth);
  persist();
  closeTransactionModal();
  render();
}

function deleteEditingTransaction() {
  const transaction = state.transactions.find((item) => item.id === editingTransactionId);
  if (!transaction) return;
  if (!confirm("Delete this transaction?")) return;
  state.transactions = state.transactions.filter((item) => item.id !== transaction.id);
  closeTransactionModal();
  persist();
  render();
}

function addCategory() {
  const cluster = getActiveCluster(state.budgets[currentMonth]);
  const name = prompt("Category name");
  if (!name) return;
  const normalizedName = normalizeTextInput(name);
  const idBase = slugify(normalizedName) || "category";
  let category = state.categories.expense.find((item) => item.id === idBase || item.name.toLowerCase() === normalizedName.toLowerCase());
  if (!category) {
    let id = idBase;
    let suffix = 2;
    while (state.categories.expense.some((item) => item.id === id)) {
      id = `${idBase}-${suffix}`;
      suffix += 1;
    }
    category = { id, name: normalizedName, icon: "", budget: 0 };
    state.categories.expense.push(category);
  }

  const budgetAmount = parseAmount(prompt("Monthly budget", "0") || "0");
  cluster.categories[category.id] = budgetAmount;
  persist();
  render();
}

function removeCategory(categoryId) {
  const category = state.categories.expense.find((item) => item.id === categoryId);
  const cluster = getActiveCluster(state.budgets[currentMonth]);
  if (!category) return;
  const warning = `Remove ${category.name} from ${cluster.name}? Transactions and other clusters will not be deleted.`;
  if (!confirm(warning)) return;

  delete cluster.categories[categoryId];
  if (selectedCategory === categoryId) {
    selectedCategory = state.categories.expense[0]?.id || "";
  }
  persist();
  render();
}

function renameCluster() {
  const cluster = getActiveCluster(state.budgets[currentMonth]);
  const name = prompt("Group name", cluster.name);
  if (!name) return;
  cluster.name = normalizeTextInput(name) || cluster.name;
  persist();
  render();
}

function addCluster() {
  const budget = state.budgets[currentMonth];
  const clusters = getBudgetClusters(budget);
  const source = getActiveCluster(budget);
  const name = prompt("New group name", `${source.name} copy`);
  if (!name) return;
  const normalizedName = normalizeTextInput(name);
  clusters.push({
    id: `${slugify(normalizedName) || "cluster"}-${Date.now()}`,
    name: normalizedName,
    categories: structuredClone(source.categories || {})
  });
  activeClusterIndex = clusters.length - 1;
  persist();
  render();
}

function removeCluster() {
  const budget = state.budgets[currentMonth];
  const clusters = getBudgetClusters(budget);
  if (clusters.length <= 1) {
    alert("At least one budget group is required.");
    return;
  }
  const cluster = getActiveCluster(budget);
  if (!confirm(`Remove ${cluster.name}? Transactions and categories will not be deleted.`)) return;
  clusters.splice(activeClusterIndex, 1);
  clampClusterIndex();
  selectedEntryClusterId = getActiveCluster(state.budgets[currentMonth]).id;
  persist();
  render();
}

function addAsset() {
  const account = prompt("Account name");
  if (!account) return;
  const normalizedAccount = normalizeTextInput(account);
  const balance = parseAmount(prompt("Current balance") || "0");
  const id = `${slugify(normalizedAccount)}-${Date.now()}`;
  const date = toDateInputValue(new Date());
  state.assets.push({ id, account: normalizedAccount, balance, date });
  state.assetUpdatedAt = date;
  persist();
  render();
}

function handleAssetAction(event) {
  const button = event.target.closest("[data-asset-action]");
  if (!button) return;
  const assetIndex = state.assets.findIndex((item) => item.id === button.dataset.asset);
  const asset = state.assets[assetIndex];
  if (!asset) return;

  if (button.dataset.assetAction === "remove") {
    if (!confirm(`Remove ${asset.account}?`)) return;
    state.assets = state.assets.filter((item) => item.id !== asset.id);
  } else if (button.dataset.assetAction === "up" && assetIndex > 0) {
    [state.assets[assetIndex - 1], state.assets[assetIndex]] = [state.assets[assetIndex], state.assets[assetIndex - 1]];
  } else if (button.dataset.assetAction === "down" && assetIndex < state.assets.length - 1) {
    [state.assets[assetIndex + 1], state.assets[assetIndex]] = [state.assets[assetIndex], state.assets[assetIndex + 1]];
  }

  state.assetUpdatedAt = toDateInputValue(new Date());
  persist();
  render();
}

function handleAssetFieldChange(event) {
  const input = event.target.closest("[data-asset-field]");
  if (!input) return;
  const asset = state.assets.find((item) => item.id === input.dataset.asset);
  if (!asset) return;

  if (input.dataset.assetField === "account") {
    asset.account = normalizeTextInput(input.value) || asset.account;
  } else {
    asset.balance = parseAmount(input.value);
  }

  asset.date = toDateInputValue(new Date());
  state.assetUpdatedAt = asset.date;
  persist();
  renderAssets();
}

function exportCsv() {
  const header = ["Date", "Time", "Type", "Group", "Category", "Payment Method", "Amount", "Note"];
  const rows = state.transactions.map((item) => {
    const category = findCategory(item.type, item.categoryId);
    const cluster = item.type === "expense" ? findTransactionCluster(item) : null;
    return [item.date, item.time, item.type, cluster?.name || "", category?.name || "", item.paymentMethod || "", item.amount, item.note];
  });
  downloadFile(`transactions-${currentMonth}.csv`, toCsv([header, ...rows]), "text/csv");
}

function exportAssetsCsv() {
  const header = ["Tracker Date", "Account", "Balance"];
  const trackerDate = state.assetUpdatedAt || latestAssetDate();
  const rows = state.assets.map((asset) => [trackerDate, asset.account, asset.balance]);
  downloadFile(`assets-${trackerDate}.csv`, toCsv([header, ...rows]), "text/csv");
}

function exportBackup() {
  downloadFile(`finance-backup-${currentMonth}.json`, JSON.stringify(state, null, 2), "application/json");
}

function saveFeedback() {
  localStorage.setItem(FEEDBACK_STORAGE_KEY, els.feedbackNotes.value);
}

function clearFeedback() {
  if (!confirm("Clear all feedback notes?")) return;
  els.feedbackNotes.value = "";
  localStorage.removeItem(FEEDBACK_STORAGE_KEY);
}

function exportFeedback() {
  saveFeedback();
  const timestamp = new Date().toISOString().slice(0, 10);
  const content = [
    "Finance Tracker Test Feedback",
    `Export date: ${timestamp}`,
    "",
    els.feedbackNotes.value || "(No feedback notes yet.)"
  ].join("\n");
  downloadFile(`finance-tracker-feedback-${timestamp}.txt`, content, "text/plain");
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state = normalizeState(imported);
      ensureMonthBudget(currentMonth);
      activeClusterIndex = 0;
      selectedEntryClusterId = getActiveCluster(state.budgets[currentMonth]).id;
      persist();
      render();
    } catch {
      alert("That backup file could not be imported.");
    }
  };
  reader.readAsText(file);
}

function getMonthTotals(monthKey) {
  return state.transactions
    .filter((item) => item.date.startsWith(monthKey))
    .reduce(
      (totals, item) => {
        totals[item.type] += item.amount;
        return totals;
      },
      { expense: 0, income: 0, saving: 0 }
    );
}

function getPaymentMethodTotals(monthKey) {
  return state.transactions
    .filter((item) => item.type === "expense" && item.date.startsWith(monthKey))
    .reduce((totals, item) => {
      const method = PAYMENT_METHODS.includes(item.paymentMethod) ? item.paymentMethod : PAYMENT_METHODS[0];
      totals[method] += item.amount;
      return totals;
    }, Object.fromEntries(PAYMENT_METHODS.map((method) => [method, 0])));
}

function getCreditCardTransactions(cardId, monthKey) {
  const card = getCreditCardSetting(cardId);
  if (!card) return [];
  const period = getStatementPeriod(monthKey, card.cutoffDay);
  return state.transactions
    .filter((item) => item.type === "expense" && item.paymentMethod === card.method && item.date >= period.start && item.date <= period.end)
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}

function getCreditCardSetting(cardId) {
  return state.creditCards.find((card) => card.id === cardId);
}

function getStatementPeriod(monthKey, cutoffDay) {
  const [year, month] = monthKey.split("-").map(Number);
  const end = new Date(year, month - 1, Math.min(cutoffDay, daysInMonth(year, month)));
  const previousMonthDate = new Date(year, month - 2, 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth() + 1;
  const previousCutoff = new Date(previousYear, previousMonth - 1, Math.min(cutoffDay, daysInMonth(previousYear, previousMonth)));
  const start = new Date(previousCutoff);
  start.setDate(start.getDate() + 1);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function clampCutoffDay(value) {
  return Math.min(31, Math.max(1, Number(value) || 1));
}

function getCategorySpent(monthKey, categoryId, clusterId = "") {
  return state.transactions
    .filter((item) => {
      if (item.type !== "expense" || item.categoryId !== categoryId || !item.date.startsWith(monthKey)) return false;
      if (!clusterId) return true;
      return getTransactionClusterId(item) === clusterId;
    })
    .reduce((sum, item) => sum + item.amount, 0);
}

function getClusterTotals(monthKey, cluster) {
  const budgeted = sumClusterBudget(cluster);
  const spent = getClusterCategoryIds(cluster).reduce((sum, categoryId) => sum + getCategorySpent(monthKey, categoryId, cluster.id), 0);
  return { budgeted, spent, remaining: budgeted - spent };
}

function getMonthOverspending(monthKey) {
  const budget = state.budgets[monthKey];
  if (!budget) return [];
  return getBudgetClusters(budget)
    .flatMap((cluster) =>
      getClusterCategoryIds(cluster).map((categoryId) => {
        const category = findCategory("expense", categoryId);
        const limit = cluster.categories[categoryId] ?? 0;
        const spent = getCategorySpent(monthKey, categoryId, cluster.id);
        return {
          name: `${category?.name || "Uncategorized"} (${cluster.name})`,
          amount: spent - limit
        };
      })
    )
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

function ensureMonthBudget(monthKey) {
  if (state.budgets[monthKey]) {
    migrateBudget(state.budgets[monthKey]);
    return;
  }
  const [year, month] = monthKey.split("-").map(Number);
  const previousKey = getMonthKey(new Date(year, month - 2, 1));
  const fallback = state.budgets[previousKey];
  state.budgets[monthKey] = fallback
    ? structuredClone(fallback)
    : {
        total: state.categories.expense.reduce((sum, category) => sum + (category.budget || 0), 0),
        categories: Object.fromEntries(state.categories.expense.map((category) => [category.id, category.budget || 0]))
      };
  migrateBudget(state.budgets[monthKey]);
  persist();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return normalizeState({});
  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return normalizeState({});
  }
}

function normalizeState(input) {
  const categories = normalizeCategories(input.categories);
  const budgets = input.budgets || {};
  Object.values(budgets).forEach((budget) => migrateBudget(budget, categories));
  return {
    categories,
    transactions: normalizeTransactions(input.transactions, budgets, categories),
    budgets,
    goals: input.goals || structuredClone(DEFAULT_GOALS),
    creditCards: normalizeCreditCards(input.creditCards),
    assets: Array.isArray(input.assets) ? input.assets : structuredClone(DEFAULT_ASSETS),
    assetUpdatedAt: input.assetUpdatedAt || latestDateFromAssets(input.assets) || toDateInputValue(new Date())
  };
}

function normalizeCreditCards(cards) {
  return CREDIT_CARD_METHODS.map((defaultCard) => {
    const saved = Array.isArray(cards) ? cards.find((card) => card.id === defaultCard.id) : null;
    return {
      ...defaultCard,
      name: saved?.name || defaultCard.name,
      cutoffDay: clampCutoffDay(saved?.cutoffDay || defaultCard.cutoffDay)
    };
  });
}

function normalizeCategories(categories) {
  const normalized = categories || structuredClone(DEFAULT_CATEGORIES);
  const utilities = normalized.expense?.find((category) => category.id === "utilities");
  if (utilities) {
    utilities.id = "living-costs";
    utilities.name = "Living Costs";
    utilities.icon = "Live";
  }
  return normalized;
}

function normalizeTransactions(transactions, budgets = {}, categories = DEFAULT_CATEGORIES) {
  if (!Array.isArray(transactions)) return [];
  return transactions.map((transaction, index) => {
    const fallbackId = `transaction-${index}-${transaction.createdAt || ""}-${transaction.date || ""}-${transaction.time || ""}-${transaction.amount || 0}`;
    const normalized = {
      ...transaction,
      id: transaction.id || slugify(fallbackId) || crypto.randomUUID(),
      categoryId: transaction.categoryId === "utilities" ? "living-costs" : transaction.categoryId,
      paymentMethod: normalizePaymentMethod(transaction)
    };
    if (normalized.type === "expense" && !normalized.clusterId) {
      normalized.clusterId = inferTransactionClusterId(normalized, budgets, categories);
    }
    return normalized;
  });
}

function normalizePaymentMethod(transaction) {
  if (transaction.type !== "expense") return "";
  if (transaction.paymentMethod === "Credit Card") return CREDIT_CARD_METHODS[0].method;
  return PAYMENT_METHODS.includes(transaction.paymentMethod) ? transaction.paymentMethod : PAYMENT_METHODS[0];
}

function migrateBudget(budget, categoriesSource = DEFAULT_CATEGORIES) {
  if (!budget) return;
  if (Array.isArray(budget.clusters) && budget.clusters.length) {
    budget.clusters.forEach((cluster, index) => {
      cluster.id = cluster.id || `cluster-${index + 1}`;
      cluster.name = cluster.name || `Cluster ${index + 1}`;
      cluster.categories = cluster.categories || {};
      if (cluster.categories.utilities !== undefined && cluster.categories["living-costs"] === undefined) {
        cluster.categories["living-costs"] = cluster.categories.utilities;
      }
      delete cluster.categories.utilities;
    });
    delete budget.categories;
    delete budget.total;
    return;
  }
  const categories = budget.categories || Object.fromEntries(categoriesSource.expense.map((category) => [category.id, category.budget || 0]));
  if (categories.utilities !== undefined && categories["living-costs"] === undefined) {
    categories["living-costs"] = categories.utilities;
  }
  delete categories.utilities;
  budget.clusters = [
    {
      id: "personal",
      name: "Personal",
      categories
    }
  ];
  delete budget.categories;
  delete budget.total;
}

function getBudgetClusters(budget, categoriesSource = DEFAULT_CATEGORIES) {
  migrateBudget(budget, categoriesSource);
  return budget.clusters;
}

function getActiveCluster(budget) {
  const clusters = getBudgetClusters(budget);
  clampClusterIndex();
  return clusters[activeClusterIndex] || clusters[0];
}

function getClusterById(budget, clusterId) {
  return getBudgetClusters(budget).find((cluster) => cluster.id === clusterId);
}

function getClusterCategoryIds(cluster) {
  return Object.keys(cluster?.categories || {});
}

function sumClusterBudget(cluster) {
  return Object.values(cluster?.categories || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function sumBudgetClusters(budget) {
  return getBudgetClusters(budget).reduce((sum, cluster) => sum + sumClusterBudget(cluster), 0);
}

function clampClusterIndex() {
  const clusters = state?.budgets?.[currentMonth]?.clusters || [];
  if (!clusters.length) {
    activeClusterIndex = 0;
    return;
  }
  activeClusterIndex = Math.min(Math.max(activeClusterIndex, 0), clusters.length - 1);
}

function getTransactionClusterId(transaction) {
  if (transaction.clusterId) return transaction.clusterId;
  return inferTransactionClusterId(transaction);
}

function inferTransactionClusterId(transaction, budgets = state.budgets, categories = state.categories) {
  const monthKey = transaction.date?.slice(0, 7) || currentMonth;
  const budget = budgets[monthKey] || budgets[currentMonth];
  if (!budget) return "";
  const clusters = getBudgetClusters(budget, categories);
  const match = clusters.find((cluster) => getClusterCategoryIds(cluster).includes(transaction.categoryId));
  return match?.id || clusters[0]?.id || "";
}

function findTransactionCluster(transaction) {
  const monthKey = transaction.date?.slice(0, 7) || currentMonth;
  const budget = state.budgets[monthKey] || state.budgets[currentMonth];
  if (!budget) return null;
  return getClusterById(budget, getTransactionClusterId(transaction));
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setDateTimeDefaults() {
  const now = new Date();
  els.date.value = toDateInputValue(now);
  els.time.value = now.toTimeString().slice(0, 5);
}

function findCategory(type, id) {
  return state.categories[type]?.find((category) => category.id === id);
}

function parseAmount(value) {
  const cleaned = String(value).replace(/,/g, "").trim();
  if (!cleaned) return 0;
  if (/^[\d\s.+\-*/()xX]+$/.test(cleaned) && /[+\-*/xX()]/.test(cleaned)) {
    try {
      const expression = cleaned.replace(/[xX]/g, "*");
      const result = Function(`"use strict"; return (${expression});`)();
      return Number.isFinite(result) ? Math.abs(result) : 0;
    } catch {
      return 0;
    }
  }
  return Number(cleaned) || 0;
}

function formatMoney(value) {
  return peso.format(value);
}

function formatPrivateMoney(value) {
  return summaryValuesVisible ? formatMoney(value) : "---";
}

function compactMoney(value) {
  if (value >= 10000) {
    const amount = value / 1000;
    const rounded = Number.isInteger(amount) ? amount.toString() : amount.toFixed(1).replace(/\.0$/, "");
    return `${rounded}k`;
  }
  return formatPlainNumber(value);
}

function formatPlainNumber(value) {
  return new Intl.NumberFormat("en-PH", { maximumFractionDigits: 2 }).format(value);
}

function getBudgetStatusClass(percent) {
  if (percent >= 100) return "over";
  if (percent >= 70) return "warning";
  return "";
}

function normalizeTextInput(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLong(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-PH", { month: "long", year: "numeric" });
}

function formatDisplayDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-PH", { day: "numeric", month: "long", year: "numeric" });
}

function formatShortDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-PH", { day: "numeric", month: "short" });
}

function latestAssetDate() {
  return latestDateFromAssets(state.assets) || toDateInputValue(new Date());
}

function latestDateFromAssets(assets) {
  if (!Array.isArray(assets) || !assets.length) return "";
  return assets.map((asset) => asset.date).filter(Boolean).sort().at(-1) || "";
}

function toDateInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toCsv(rows) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
