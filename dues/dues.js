// dues.js – Simplified Expense Tracker (only expenses, no advances)
let expenses = [];

function todayStr() { return new Date().toISOString().split('T')[0]; }

function loadExpenses() {
    const stored = localStorage.getItem('dairycare_expenses');
    if (stored) {
        try { expenses = JSON.parse(stored); } catch (e) { expenses = []; }
    } else { expenses = []; }
}
function saveExpenses() { localStorage.setItem('dairycare_expenses', JSON.stringify(expenses)); }

function renderExpenses() {
    const start = document.getElementById('filterStart').value;
    const end = document.getElementById('filterEnd').value;
    let filtered = expenses.filter(e => {
        if (start && e.date < start) return false;
        if (end && e.date > end) return false;
        return true;
    });
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    const tbody = document.getElementById('expenseBody');
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">ਕੋਈ ਖਰਚਾ ਨਹੀਂ</td></tr>';
        return;
    }
    let html = '';
    filtered.forEach(exp => {
        html += `<tr>
            <td>${exp.date}</td>
            <td>${exp.item || '-'}</td>
            <td>₹${exp.amount.toFixed(2)}</td>
            <td>${exp.note || '-'}</td>
            <td><button class="btn-edit" data-id="${exp.id}">✏️</button> <button class="btn-delete" data-id="${exp.id}">🗑️</button></td>
        </tr>`;
    });
    tbody.innerHTML = html;
    document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', editExpense));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', deleteExpense));

    // update total expense
    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('totalExpense').innerText = '₹' + total.toFixed(2);
}

function addExpense() {
    const date = document.getElementById('expenseDate').value;
    if (!date) { alert('ਤਾਰੀਖ਼ ਚੁਣੋ'); return; }
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    if (isNaN(amount) || amount <= 0) { alert('ਰਕਮ ਸਹੀ ਭਰੋ (0 ਤੋਂ ਵੱਧ)'); return; }
    const item = document.getElementById('expenseItem').value.trim() || '-';
    const note = document.getElementById('expenseNote').value.trim();
    const entry = { id: editMode ? editId : Date.now() + Math.random(), date, amount, item, note };

    if (editMode) {
        expenses = expenses.map(x => x.id == editId ? entry : x);
        editMode = false;
        editId = null;
        document.getElementById('saveExpenseBtn').innerText = '➕ ਖਰਚਾ ਸੇਵ ਕਰੋ';
    } else {
        expenses.push(entry);
    }

    saveExpenses();
    renderExpenses();

    // Clear Form Fields
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseItem').value = '';
    document.getElementById('expenseNote').value = '';
}

let editMode = false;
let editId = null;

function editExpense(e) {
    const id = e.currentTarget.getAttribute('data-id');
    const exp = expenses.find(x => x.id == id);
    if (!exp) return;

    editMode = true;
    editId = id;

    document.getElementById('expenseDate').value = exp.date;
    document.getElementById('expenseAmount').value = exp.amount;
    document.getElementById('expenseItem').value = exp.item;
    document.getElementById('expenseNote').value = exp.note || '';

    document.getElementById('saveExpenseBtn').innerText = '✏️ ਅੱਪਡੇਟ ਕਰੋ';
}

function deleteExpense(e) {
    if (!confirm('ਕੀ ਇਹ ਖਰਚਾ ਮਿਟਾਉਣਾ ਹੈ?')) return;
    const id = e.currentTarget.getAttribute('data-id');
    expenses = expenses.filter(x => x.id != id);
    saveExpenses();
    renderExpenses();
}

function deleteAll() {
    if (confirm('ਸਾਰੇ ਖਰਚੇ ਮਿਟਾਉਣ ਨਾਲ ਡਾਟਾ 0 ਹੋ ਜਾਵੇਗਾ। ਪੱਕਾ ਹੈ?')) {
        expenses = [];
        saveExpenses();
        renderExpenses();
    }
}

function applyFilters() { renderExpenses(); }
function resetFilters() {
    document.getElementById('filterStart').value = '';
    document.getElementById('filterEnd').value = '';
    renderExpenses();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('expenseDate').value = todayStr();
    loadExpenses();
    renderExpenses();
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
    document.getElementById('saveExpenseBtn').addEventListener('click', addExpense);
    document.getElementById('clearExpenseFormBtn').addEventListener('click', () => {
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseItem').value = '';
        document.getElementById('expenseNote').value = '';
        if (editMode) {
            editMode = false;
            editId = null;
            document.getElementById('saveExpenseBtn').innerText = '➕ ਖਰਚਾ ਸੇਵ ਕਰੋ';
        }
    });
    document.getElementById('deleteAllBtn').addEventListener('click', deleteAll);
});
