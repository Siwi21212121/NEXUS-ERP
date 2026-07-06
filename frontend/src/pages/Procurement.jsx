import React, { useEffect, useState } from 'react'
import { ClipboardList, CircleCheck, DollarSign, Truck, Users, Plus } from 'lucide-react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'
import DashboardAIPanel from '../components/DashboardAIPanel'
import api from '../utils/api'

const colors = ['#38bdf8', '#22d3ee', '#c084fc', '#60a5fa', '#22c55e']
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function fmt(value) {
  return money.format(Number(value || 0))
}

function makeRef(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function MetricCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] tracking-[3px] uppercase text-muted mb-2">{title}</p>
          <h2 className="text-5xl font-light" style={{ color }}>{value}</h2>
          <p className="text-muted text-sm mt-2">{subtitle}</p>
        </div>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="mt-4 h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '72%', backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Procurement() {
  const [dashboard, setDashboard] = useState(null)
  const [vendors, setVendors] = useState([])
  const [requests, setRequests] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [vendorForm, setVendorForm] = useState({ name: '', category: '', location: '', contactEmail: '', rating: 4.5, deliveryPerformance: 90, qualityScore: 90 })
  const [requestForm, setRequestForm] = useState({ requestNumber: '', requester: '', department: '', itemName: '', quantity: '', estimatedCost: '' })
  const [orderForm, setOrderForm] = useState({ poNumber: '', vendorId: '', requestId: '', itemName: '', quantity: '', unitCost: '', expectedDelivery: '' })
  const [receiptForm, setReceiptForm] = useState({ receiptNumber: '', orderId: '', receivedQuantity: '', receivedDate: new Date().toISOString().slice(0, 10), status: 'COMPLETE' })
  const [invoiceForm, setInvoiceForm] = useState({ invoiceNumber: '', orderId: '', invoiceAmount: '', invoiceDate: new Date().toISOString().slice(0, 10) })

  async function loadProcurement() {
    try {
      setLoading(true)
      setError('')
      const [dashboardResponse, vendorResponse, requestResponse, orderResponse] = await Promise.all([
        api.get('/procurement/dashboard'),
        api.get('/procurement/vendors'),
        api.get('/procurement/requests'),
        api.get('/procurement/orders'),
      ])
      setDashboard(dashboardResponse.data.data)
      setVendors(vendorResponse.data.data || [])
      setRequests(requestResponse.data.data || [])
      setOrders(orderResponse.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load procurement data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProcurement()
  }, [])

  async function submitForm(event, endpoint, payload, message, reset) {
    event.preventDefault()
    try {
      setError('')
      setNotice('')
      await api.post(endpoint, payload)
      setNotice(message)
      reset()
      await loadProcurement()
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || message.replace('created', 'failed'))
    }
  }

  async function reviewOrder(id, action) {
    try {
      await api.patch(`/procurement/orders/${id}/${action}`)
      setNotice(action === 'approve' ? 'Purchase order approved' : 'Purchase order rejected')
      await loadProcurement()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to review purchase order')
    }
  }

  const cards = dashboard?.cards || {}

  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {loading && <div className="mb-5 bg-panel border border-line rounded-2xl p-5 text-muted">Loading procurement command center...</div>}
          {error && <div className="mb-5 bg-red-950 border border-red-500/30 rounded-2xl p-5 text-red-200">{error}</div>}
          {notice && <div className="mb-5 bg-cyan/10 border border-cyan/30 rounded-2xl p-5 text-cyan-200">{notice}</div>}

          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">Procurement Command Center</h1>
            <p className="text-muted text-lg max-w-4xl">Vendor management, purchase requests, approvals, goods receipt and invoice matching.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
            <MetricCard icon={ClipboardList} title="Pending Orders" value={cards.pendingOrders || 0} subtitle="Awaiting approval" color="#38bdf8" />
            <MetricCard icon={CircleCheck} title="Approved Orders" value={cards.approvedOrders || 0} subtitle="Released POs" color="#22c55e" />
            <MetricCard icon={Users} title="Vendor Performance" value={`${cards.vendorPerformance || 0}%`} subtitle="Composite score" color="#22d3ee" />
            <MetricCard icon={DollarSign} title="Purchase Cost" value={fmt(cards.purchaseCost)} subtitle="Committed spend" color="#c084fc" />
            <MetricCard icon={Truck} title="Delivery Performance" value={`${cards.deliveryPerformance || 0}%`} subtitle="On-time delivery" color="#f59e0b" />
          </div>

          <DashboardAIPanel moduleKey="procurement" refreshKey={`${loading}-${vendors.length}-${requests.length}-${orders.length}`} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Vendor Comparison</h2>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard?.vendorComparison || []}>
                    <XAxis dataKey="name" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="rating" fill="#38bdf8" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Purchase Trend</h2>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard?.purchaseTrend || []}>
                    <XAxis dataKey="month" tick={{ fill: '#8a93a6' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line dataKey="cost" stroke="#22d3ee" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Monthly Procurement</h2>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboard?.statusDistribution || []} dataKey="value" nameKey="status" outerRadius={100}>
                      {(dashboard?.statusDistribution || []).map((entry, index) => <Cell key={entry.status} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <form onSubmit={(event) => submitForm(event, '/procurement/vendors', vendorForm, 'Vendor created', () => setVendorForm({ name: '', category: '', location: '', contactEmail: '', rating: 4.5, deliveryPerformance: 90, qualityScore: 90 }))} className="bg-panel border border-line rounded-2xl p-5 space-y-3">
              <h2 className="text-xl">Vendor Management</h2>
              <input value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} placeholder="Vendor Name" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={vendorForm.category} onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })} placeholder="Category" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={vendorForm.location} onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })} placeholder="Location" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <button className="w-full bg-accent rounded-lg px-4 py-2 text-sm"><Plus size={16} className="inline mr-2" />Add Vendor</button>
            </form>

            <form onSubmit={(event) => submitForm(event, '/procurement/requests', { ...requestForm, requestNumber: requestForm.requestNumber || makeRef('PR'), quantity: Number(requestForm.quantity), estimatedCost: Number(requestForm.estimatedCost) }, 'Purchase request created', () => setRequestForm({ requestNumber: '', requester: '', department: '', itemName: '', quantity: '', estimatedCost: '' }))} className="bg-panel border border-line rounded-2xl p-5 space-y-3">
              <h2 className="text-xl">Purchase Requests</h2>
              <input value={requestForm.requestNumber} onChange={(e) => setRequestForm({ ...requestForm, requestNumber: e.target.value })} placeholder="Request #" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={requestForm.requester} onChange={(e) => setRequestForm({ ...requestForm, requester: e.target.value })} placeholder="Requester" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={requestForm.department} onChange={(e) => setRequestForm({ ...requestForm, department: e.target.value })} placeholder="Department" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={requestForm.itemName} onChange={(e) => setRequestForm({ ...requestForm, itemName: e.target.value })} placeholder="Item" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={requestForm.quantity} onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })} placeholder="Quantity" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={requestForm.estimatedCost} onChange={(e) => setRequestForm({ ...requestForm, estimatedCost: e.target.value })} placeholder="Estimated Cost" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <button className="w-full bg-accent rounded-lg px-4 py-2 text-sm">Submit Request</button>
            </form>

            <form onSubmit={(event) => submitForm(event, '/procurement/orders', { ...orderForm, poNumber: orderForm.poNumber || makeRef('PO'), vendorId: Number(orderForm.vendorId), requestId: orderForm.requestId || null, quantity: Number(orderForm.quantity), unitCost: Number(orderForm.unitCost) }, 'Purchase order created', () => setOrderForm({ poNumber: '', vendorId: '', requestId: '', itemName: '', quantity: '', unitCost: '', expectedDelivery: '' }))} className="bg-panel border border-line rounded-2xl p-5 space-y-3">
              <h2 className="text-xl">Purchase Orders</h2>
              <input value={orderForm.poNumber} onChange={(e) => setOrderForm({ ...orderForm, poNumber: e.target.value })} placeholder="PO #" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <select value={orderForm.vendorId} onChange={(e) => setOrderForm({ ...orderForm, vendorId: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Vendor</option>
                {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
              </select>
              <select value={orderForm.requestId} onChange={(e) => setOrderForm({ ...orderForm, requestId: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">No Request</option>
                {requests.map((request) => <option key={request.id} value={request.id}>{request.requestNumber}</option>)}
              </select>
              <input value={orderForm.itemName} onChange={(e) => setOrderForm({ ...orderForm, itemName: e.target.value })} placeholder="Item" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} placeholder="Quantity" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={orderForm.unitCost} onChange={(e) => setOrderForm({ ...orderForm, unitCost: e.target.value })} placeholder="Unit Cost" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input type="date" value={orderForm.expectedDelivery} onChange={(e) => setOrderForm({ ...orderForm, expectedDelivery: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <button className="w-full bg-accent rounded-lg px-4 py-2 text-sm">Create PO</button>
            </form>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <form onSubmit={(event) => submitForm(event, '/procurement/receipts', { ...receiptForm, receiptNumber: receiptForm.receiptNumber || makeRef('GR'), orderId: Number(receiptForm.orderId), receivedQuantity: Number(receiptForm.receivedQuantity) }, 'Goods receipt created', () => setReceiptForm({ receiptNumber: '', orderId: '', receivedQuantity: '', receivedDate: new Date().toISOString().slice(0, 10), status: 'COMPLETE' }))} className="bg-panel border border-line rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-5 gap-3">
              <h2 className="text-xl lg:col-span-5">Goods Receipt</h2>
              <input value={receiptForm.receiptNumber} onChange={(e) => setReceiptForm({ ...receiptForm, receiptNumber: e.target.value })} placeholder="Receipt #" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <select value={receiptForm.orderId} onChange={(e) => setReceiptForm({ ...receiptForm, orderId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Order</option>
                {orders.map((order) => <option key={order.id} value={order.id}>{order.poNumber}</option>)}
              </select>
              <input type="number" value={receiptForm.receivedQuantity} onChange={(e) => setReceiptForm({ ...receiptForm, receivedQuantity: e.target.value })} placeholder="Qty" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input type="date" value={receiptForm.receivedDate} onChange={(e) => setReceiptForm({ ...receiptForm, receivedDate: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <button className="bg-accent rounded-lg px-4 py-2 text-sm">Receive</button>
            </form>

            <form onSubmit={(event) => submitForm(event, '/procurement/invoice-matching', { ...invoiceForm, invoiceNumber: invoiceForm.invoiceNumber || makeRef('PINV'), orderId: Number(invoiceForm.orderId), invoiceAmount: Number(invoiceForm.invoiceAmount) }, 'Invoice matched', () => setInvoiceForm({ invoiceNumber: '', orderId: '', invoiceAmount: '', invoiceDate: new Date().toISOString().slice(0, 10) }))} className="bg-panel border border-line rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-4 gap-3">
              <h2 className="text-xl lg:col-span-4">Invoice Matching</h2>
              <input value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} placeholder="Invoice #" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <select value={invoiceForm.orderId} onChange={(e) => setInvoiceForm({ ...invoiceForm, orderId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Order</option>
                {orders.map((order) => <option key={order.id} value={order.id}>{order.poNumber}</option>)}
              </select>
              <input type="number" value={invoiceForm.invoiceAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceAmount: e.target.value })} placeholder="Invoice Amount" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <button className="bg-accent rounded-lg px-4 py-2 text-sm">Match</button>
            </form>
          </div>

          <div className="bg-panel border border-line rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-line"><h2 className="text-2xl">Purchase Approval</h2></div>
            <table className="w-full">
              <thead className="bg-panel2 text-muted text-xs uppercase">
                <tr><th className="text-left p-5">PO</th><th className="text-left p-5">Vendor</th><th className="text-left p-5">Item</th><th className="text-left p-5">Cost</th><th className="text-left p-5">Status</th><th className="text-left p-5">Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <td className="p-5">{order.poNumber}</td>
                    <td className="p-5 text-muted">{order.vendorName}</td>
                    <td className="p-5">{order.itemName}</td>
                    <td className="p-5 font-semibold">{fmt(order.totalCost)}</td>
                    <td className="p-5 text-cyan-400">{order.status}</td>
                    <td className="p-5 flex gap-3">
                      <button onClick={() => reviewOrder(order.id, 'approve')} className="text-cyan-400 text-sm">Approve</button>
                      <button onClick={() => reviewOrder(order.id, 'reject')} className="text-red-400 text-sm">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}
