import React, { useEffect, useMemo, useState } from 'react'
import {
  Wallet,
  CreditCard,
  Landmark,
  Plus,
  Search,
  TrendingUp,
  ReceiptText,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'
import DashboardAIPanel from '../components/DashboardAIPanel'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import api from '../utils/api'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const chartColors = ['#60a5fa', '#22d3ee', '#c084fc', '#f59e0b', '#22c55e']

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0))
}

function makeRef(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function FinanceCard({
  icon: Icon,
  title,
  value,
  subtext,
  color,
}) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-6">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={22} style={{ color }} />
        </div>

        <span
          className="text-xs font-medium"
          style={{ color }}
        >
          {subtext}
        </span>
      </div>

      <p className="text-xs tracking-[3px] uppercase text-muted mb-3">
        {title}
      </p>

      <h2 className="text-4xl font-light leading-tight">
        {value}
      </h2>

      <div className="mt-5 h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: '65%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function Finance() {
  const [dashboard, setDashboard] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [profitLoss, setProfitLoss] = useState(null)
  const [cashFlowStatement, setCashFlowStatement] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    page: 1,
  })
  const [form, setForm] = useState({
    transactionNumber: '',
    counterparty: '',
    transactionType: 'REVENUE',
    status: 'PAID',
    category: 'General',
    amount: '',
    transactionDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    notes: '',
  })
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    customerName: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date().toISOString().slice(0, 10),
    subtotal: '',
    taxAmount: '',
    paidAmount: '',
    status: 'SENT',
  })
  const [paymentForm, setPaymentForm] = useState({
    paymentNumber: '',
    invoiceId: '',
    counterparty: '',
    paymentDirection: 'INCOMING',
    paymentMethod: 'BANK_TRANSFER',
    amount: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'COMPLETED',
  })
  const [budgetForm, setBudgetForm] = useState({
    department: '',
    fiscalYear: new Date().getFullYear(),
    allocatedAmount: '',
    spentAmount: '',
    status: 'REVIEW',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const cards = dashboard?.cards || {}
  const revenueData = useMemo(
    () =>
      (dashboard?.revenueTrend || []).map((item) => ({
        month: item.month,
        value: Number(item.revenue || 0),
        expenses: Number(item.expenses || 0),
      })),
    [dashboard]
  )
  const cashFlowData = dashboard?.cashFlow || []
  const expenseBreakdown = dashboard?.expenseBreakdown || []
  const categoryAnalysis = dashboard?.categoryAnalysis || []

  async function loadDashboard() {
    const response = await api.get('/finance/dashboard')
    setDashboard(response.data.data)
  }

  async function loadTransactions(nextFilters = filters) {
    const response = await api.get('/finance/transactions', {
      params: {
        page: nextFilters.page,
        limit: pagination.limit,
        search: nextFilters.search || undefined,
        status: nextFilters.status || undefined,
        type: nextFilters.type || undefined,
      },
    })

    setTransactions(response.data.data || [])
    setPagination(response.data.pagination || pagination)
  }

  async function loadNotifications() {
    const response = await api.get('/finance/notifications')
    setNotifications(response.data.data || [])
  }

  async function loadFinanceLists() {
    const [
      budgetsResponse,
      invoicesResponse,
      paymentsResponse,
      profitLossResponse,
      cashFlowResponse,
    ] = await Promise.all([
      api.get('/finance/budgets'),
      api.get('/finance/invoices'),
      api.get('/finance/payments'),
      api.get('/finance/profit-loss'),
      api.get('/finance/cash-flow'),
    ])

    setBudgets(budgetsResponse.data.data || [])
    setInvoices(invoicesResponse.data.data || [])
    setPayments(paymentsResponse.data.data || [])
    setProfitLoss(profitLossResponse.data.data)
    setCashFlowStatement(cashFlowResponse.data.data)
  }

  async function loadFinanceModule(nextFilters = filters) {
    try {
      setLoading(true)
      setError('')
      await Promise.all([
        loadDashboard(),
        loadTransactions(nextFilters),
        loadNotifications(),
        loadFinanceLists(),
      ])
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load finance data. Please verify the backend and database migration.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateInvoice(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const subtotal = Number(invoiceForm.subtotal)
      const taxAmount = Number(invoiceForm.taxAmount || 0)
      await api.post('/finance/invoices', {
        ...invoiceForm,
        invoiceNumber: invoiceForm.invoiceNumber || makeRef('INV'),
        subtotal,
        taxAmount,
        totalAmount: subtotal + taxAmount,
        paidAmount: Number(invoiceForm.paidAmount || 0),
      })
      setNotice('Invoice created successfully')
      setInvoiceForm({
        invoiceNumber: '',
        customerName: '',
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        subtotal: '',
        taxAmount: '',
        paidAmount: '',
        status: 'SENT',
      })
      await loadFinanceModule(filters)
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Unable to create invoice')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreatePayment(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      await api.post('/finance/payments', {
        ...paymentForm,
        paymentNumber: paymentForm.paymentNumber || makeRef('PAY'),
        invoiceId: paymentForm.invoiceId || null,
        amount: Number(paymentForm.amount),
      })
      setNotice('Payment created successfully')
      setPaymentForm({
        paymentNumber: '',
        invoiceId: '',
        counterparty: '',
        paymentDirection: 'INCOMING',
        paymentMethod: 'BANK_TRANSFER',
        amount: '',
        paymentDate: new Date().toISOString().slice(0, 10),
        status: 'COMPLETED',
      })
      await loadFinanceModule(filters)
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Unable to create payment')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateBudget(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      await api.post('/finance/budgets', {
        ...budgetForm,
        fiscalYear: Number(budgetForm.fiscalYear),
        allocatedAmount: Number(budgetForm.allocatedAmount),
        spentAmount: Number(budgetForm.spentAmount || 0),
      })
      setNotice('Budget saved successfully')
      setBudgetForm({
        department: '',
        fiscalYear: new Date().getFullYear(),
        allocatedAmount: '',
        spentAmount: '',
        status: 'REVIEW',
      })
      await loadFinanceModule(filters)
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Unable to save budget')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadFinanceModule()
  }, [])

  function updateFilters(nextValues) {
    const nextFilters = {
      ...filters,
      ...nextValues,
      page: nextValues.page || 1,
    }
    setFilters(nextFilters)
    loadTransactions(nextFilters).catch((err) => {
      setError(err.response?.data?.message || 'Unable to filter transactions')
    })
  }

  async function handleCreateTransaction(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      await api.post('/finance/transactions', {
        ...form,
        transactionNumber: form.transactionNumber || makeRef(form.transactionType || 'TXN'),
        amount: Number(form.amount),
        dueDate: form.dueDate || null,
      })

      setNotice('Transaction created successfully')
      setForm({
        transactionNumber: '',
        counterparty: '',
        transactionType: 'REVENUE',
        status: 'PAID',
        category: 'General',
        amount: '',
        transactionDate: new Date().toISOString().slice(0, 10),
        dueDate: '',
        notes: '',
      })
      await loadFinanceModule(filters)
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(', ') ||
          err.response?.data?.message ||
          'Unable to create transaction'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-7">
          {loading && (
            <div className="mb-5 bg-panel border border-line rounded-2xl p-5 text-muted">
              Loading finance command center...
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-950 border border-red-500/30 rounded-2xl p-5 text-red-200">
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-5 bg-cyan/10 border border-cyan/30 rounded-2xl p-5 text-cyan-200">
              {notice}
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">
              Financial Command Center
            </h1>

            <p className="text-muted text-lg max-w-4xl">
              Real-time fiscal monitoring across global
              business units. Integrated with AI forecasting
              and automated reconciliation pipelines.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
            <FinanceCard
              icon={Wallet}
              title="Today's Revenue"
              value={formatCurrency(cards.todaysRevenue)}
              subtext="Live"
              color="#60a5fa"
            />

            <FinanceCard
              icon={TrendingUp}
              title="Monthly Revenue"
              value={formatCurrency(cards.monthlyRevenue)}
              subtext="This Month"
              color="#22d3ee"
            />

            <FinanceCard
              icon={Landmark}
              title="Pending Payments"
              value={formatCurrency(cards.pendingPayments)}
              subtext="Queued"
              color="#f59e0b"
            />

            <FinanceCard
              icon={CreditCard}
              title="Expenses"
              value={formatCurrency(cards.totalExpenses)}
              subtext="All Time"
              color="#c084fc"
            />

            <FinanceCard
              icon={ReceiptText}
              title="Profit"
              value={formatCurrency(cards.netProfit)}
              subtext="Revenue - Expense"
              color="#22c55e"
            />
          </div>

          <DashboardAIPanel moduleKey="finance" refreshKey={`${loading}-${transactions.length}-${invoices.length}-${payments.length}`} />

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-2xl mb-1">Revenue Trend</h2>
              <p className="text-xs tracking-[3px] uppercase text-muted mb-6">Monthly Income vs Expense</p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a93a6' }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#60a5fa" />
                    <Bar dataKey="expenses" radius={[10, 10, 0, 0]} fill="#c084fc" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-2xl mb-1">Cash Flow</h2>
              <p className="text-xs tracking-[3px] uppercase text-muted mb-6">Inflow, Outflow and Net Movement</p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a93a6' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="inflow" stroke="#22d3ee" strokeWidth={4} />
                    <Line type="monotone" dataKey="outflow" stroke="#f59e0b" strokeWidth={4} />
                    <Line type="monotone" dataKey="net" stroke="#22c55e" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-2xl mb-1">Expense Breakdown</h2>
              <p className="text-xs tracking-[3px] uppercase text-muted mb-6">By Expense Category</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="value" nameKey="category" outerRadius={105}>
                      {expenseBreakdown.map((item, index) => (
                        <Cell key={item.category} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-2xl mb-1">Category Analysis</h2>
              <p className="text-xs tracking-[3px] uppercase text-muted mb-6">Income, Expenses, Payables, Receivables</p>
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {categoryAnalysis.map((item) => (
                  <div key={`${item.category}-${item.type}`} className="flex justify-between border-b border-line pb-3 text-sm">
                    <span>{item.category} <span className="text-muted">({item.type})</span></span>
                    <span className="font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Form */}
          <form
            onSubmit={handleCreateTransaction}
            className="bg-panel border border-line rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl">Create Finance Transaction</h2>
                <p className="text-muted text-sm mt-1">
                  Add revenue, expenses, receivables or payables to the finance ledger.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-accent px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                <Plus size={16} />
                {saving ? 'Saving...' : 'Add Transaction'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <input
                value={form.transactionNumber}
                onChange={(e) => setForm({ ...form, transactionNumber: e.target.value })}
                placeholder="Transaction #"
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.counterparty}
                onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
                placeholder="Counterparty"
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={form.transactionType}
                onChange={(e) => setForm({ ...form, transactionType: e.target.value })}
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              >
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
                <option value="RECEIVABLE">Receivable</option>
                <option value="PAYABLE">Payable</option>
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              >
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="APPROVED">Approved</option>
                <option value="DRAFT">Draft</option>
              </select>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Category"
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount"
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </form>

          {/* Invoices, Payments, Budgets */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <form onSubmit={handleCreateInvoice} className="bg-panel border border-line rounded-2xl p-5">
              <h2 className="text-xl mb-1">Invoices</h2>
              <p className="text-muted text-sm mb-4">Create and track customer invoices.</p>
              <div className="space-y-3">
                <input value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} placeholder="Invoice #" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input value={invoiceForm.customerName} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })} placeholder="Customer" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })} placeholder="Subtotal" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={invoiceForm.taxAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, taxAmount: e.target.value })} placeholder="Tax" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <button className="w-full bg-accent px-4 py-2 rounded-lg text-sm">Create Invoice</button>
              </div>
            </form>

            <form onSubmit={handleCreatePayment} className="bg-panel border border-line rounded-2xl p-5">
              <h2 className="text-xl mb-1">Payments</h2>
              <p className="text-muted text-sm mb-4">Record incoming and outgoing payments.</p>
              <div className="space-y-3">
                <input value={paymentForm.paymentNumber} onChange={(e) => setPaymentForm({ ...paymentForm, paymentNumber: e.target.value })} placeholder="Payment #" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <select value={paymentForm.invoiceId} onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">No Invoice</option>
                  {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber}</option>)}
                </select>
                <input value={paymentForm.counterparty} onChange={(e) => setPaymentForm({ ...paymentForm, counterparty: e.target.value })} placeholder="Counterparty" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <select value={paymentForm.paymentDirection} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDirection: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="INCOMING">Incoming</option>
                  <option value="OUTGOING">Outgoing</option>
                </select>
                <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="Amount" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <button className="w-full bg-accent px-4 py-2 rounded-lg text-sm">Record Payment</button>
              </div>
            </form>

            <form onSubmit={handleCreateBudget} className="bg-panel border border-line rounded-2xl p-5">
              <h2 className="text-xl mb-1">Budgets</h2>
              <p className="text-muted text-sm mb-4">Plan and track departmental budgets.</p>
              <div className="space-y-3">
                <input value={budgetForm.department} onChange={(e) => setBudgetForm({ ...budgetForm, department: e.target.value })} placeholder="Department" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={budgetForm.fiscalYear} onChange={(e) => setBudgetForm({ ...budgetForm, fiscalYear: e.target.value })} placeholder="Fiscal Year" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={budgetForm.allocatedAmount} onChange={(e) => setBudgetForm({ ...budgetForm, allocatedAmount: e.target.value })} placeholder="Allocated Amount" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={budgetForm.spentAmount} onChange={(e) => setBudgetForm({ ...budgetForm, spentAmount: e.target.value })} placeholder="Spent Amount" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <select value={budgetForm.status} onChange={(e) => setBudgetForm({ ...budgetForm, status: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="REVIEW">Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="LOCKED">Locked</option>
                </select>
                <button className="w-full bg-accent px-4 py-2 rounded-lg text-sm">Save Budget</button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-xl">Profit & Loss</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="bg-panel2 border border-line rounded-xl p-4"><p className="text-muted text-xs">Income</p><p className="text-2xl">{formatCurrency(profitLoss?.income)}</p></div>
                <div className="bg-panel2 border border-line rounded-xl p-4"><p className="text-muted text-xs">Expenses</p><p className="text-2xl">{formatCurrency(profitLoss?.expenses)}</p></div>
                <div className="bg-panel2 border border-line rounded-xl p-4"><p className="text-muted text-xs">Gross Profit</p><p className="text-2xl">{formatCurrency(profitLoss?.grossProfit)}</p></div>
                <div className="bg-panel2 border border-line rounded-xl p-4"><p className="text-muted text-xs">Net Profit</p><p className="text-2xl">{formatCurrency(profitLoss?.netProfit)}</p></div>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-xl">Cash Flow Statement</h2>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4">
                <div className="bg-panel2 border border-line rounded-xl p-4"><p className="text-muted text-xs">Inflow</p><p className="text-2xl">{formatCurrency(cashFlowStatement?.inflow)}</p></div>
                <div className="bg-panel2 border border-line rounded-xl p-4"><p className="text-muted text-xs">Outflow</p><p className="text-2xl">{formatCurrency(cashFlowStatement?.outflow)}</p></div>
                <div className="bg-panel2 border border-line rounded-xl p-4"><p className="text-muted text-xs">Net</p><p className="text-2xl">{formatCurrency(cashFlowStatement?.netCashFlow)}</p></div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-panel border border-line rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center gap-4 p-5 border-b border-line flex-wrap">
              <div>
                <h2 className="text-xl">
                  Recent Accounts Activity
                </h2>
                <p className="text-muted text-sm mt-1">
                  Search, filter and paginate live finance ledger records.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    placeholder="Search ledger"
                    className="bg-panel2 pl-9 pr-3 py-2 rounded-lg border border-line text-sm"
                  />
                </div>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  className="bg-panel2 px-4 py-2 rounded-lg border border-line text-sm"
                >
                  <option value="">All Types</option>
                  <option value="REVENUE">Revenue</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="RECEIVABLE">Receivable</option>
                  <option value="PAYABLE">Payable</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="bg-panel2 px-4 py-2 rounded-lg border border-line text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-panel2 text-muted text-xs uppercase">
                <tr>
                  <th className="text-left p-5">
                    Invoice ID
                  </th>
                  <th className="text-left p-5">
                    Counterparty
                  </th>
                  <th className="text-left p-5">
                    Amount
                  </th>
                  <th className="text-left p-5">
                    Status
                  </th>
                  <th className="text-left p-5">
                    Due Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-line"
                  >
                    <td className="p-5">
                      {item.transactionNumber}
                    </td>

                    <td className="p-5">
                      {item.counterparty}
                    </td>

                    <td className="p-5 font-semibold">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${
                          item.status === 'PAID'
                            ? 'border-cyan-500 text-cyan-400'
                            : item.status === 'PENDING' || item.status === 'APPROVED'
                            ? 'border-violet-500 text-violet-400'
                            : 'border-red-500 text-red-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-5 text-muted">
                      {formatDate(item.dueDate || item.transactionDate)}
                    </td>
                  </tr>
                ))}

                {!transactions.length && !loading && (
                  <tr>
                    <td className="p-5 text-muted" colSpan="5">
                      No finance transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between p-5 border-t border-line text-sm text-muted">
              <span>
                Page {pagination.page} of {pagination.totalPages || 1} · {pagination.total} records
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilters({ page: pagination.page - 1 })}
                  className="bg-panel2 px-4 py-2 rounded-lg border border-line disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateFilters({ page: pagination.page + 1 })}
                  className="bg-panel2 px-4 py-2 rounded-lg border border-line disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-xl">Invoice Register</h2>
              </div>
              <div className="divide-y divide-line max-h-80 overflow-y-auto">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-5">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">{invoice.invoiceNumber}</span>
                      <span className="text-xs text-cyan-400">{invoice.status}</span>
                    </div>
                    <p className="text-muted text-sm mt-1">{invoice.customerName}</p>
                    <p className="mt-2">{formatCurrency(invoice.totalAmount)} <span className="text-muted text-sm">paid {formatCurrency(invoice.paidAmount)}</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-xl">Payment Register</h2>
              </div>
              <div className="divide-y divide-line max-h-80 overflow-y-auto">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-5">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">{payment.paymentNumber}</span>
                      <span className="text-xs text-cyan-400">{payment.paymentDirection}</span>
                    </div>
                    <p className="text-muted text-sm mt-1">{payment.counterparty}</p>
                    <p className="mt-2">{formatCurrency(payment.amount)} <span className="text-muted text-sm">{payment.status}</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-xl">Budget Control</h2>
              </div>
              <div className="divide-y divide-line max-h-80 overflow-y-auto">
                {budgets.map((budget) => (
                  <div key={budget.id} className="p-5">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">{budget.department}</span>
                      <span className="text-xs text-cyan-400">{budget.status}</span>
                    </div>
                    <p className="text-muted text-sm mt-1">{budget.fiscalYear}</p>
                    <p className="mt-2">{budget.utilization}% used <span className="text-muted text-sm">{formatCurrency(budget.spentAmount)} / {formatCurrency(budget.allocatedAmount)}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-panel border border-line rounded-2xl overflow-hidden mt-6">
            <div className="p-5 border-b border-line">
              <h2 className="text-xl">Finance Notifications</h2>
            </div>
            <div className="divide-y divide-line">
              {notifications.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex justify-between gap-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-xs text-cyan-400">{item.severity}</span>
                  </div>
                  <p className="text-muted text-sm mt-2">{item.message}</p>
                </div>
              ))}
              {!notifications.length && (
                <div className="p-5 text-muted text-sm">
                  No finance notifications.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}
