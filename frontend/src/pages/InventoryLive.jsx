import React, { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Boxes, CircleCheck, Plus, Search, Truck, Warehouse } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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
        <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function InventoryLive() {
  const [dashboard, setDashboard] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [movements, setMovements] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState({ search: '', categoryId: '', page: 1 })
  const [productForm, setProductForm] = useState({ sku: '', name: '', categoryId: '', supplierId: '', unitCost: '', reorderLevel: '' })
  const [movementForm, setMovementForm] = useState({ productId: '', sourceWarehouseId: '', destinationWarehouseId: '', movementType: 'RECEIPT', quantity: '', referenceNumber: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const productOptions = useMemo(
    () => products.map((product) => ({ id: product.id, label: `${product.sku} - ${product.name}` })),
    [products]
  )

  async function loadProducts(nextFilters = filters) {
    const response = await api.get('/inventory/products', {
      params: {
        page: nextFilters.page,
        limit: pagination.limit,
        search: nextFilters.search || undefined,
        categoryId: nextFilters.categoryId || undefined,
      },
    })
    setProducts(response.data.data || [])
    setPagination(response.data.pagination || pagination)
  }

  async function loadInventory(nextFilters = filters) {
    try {
      setLoading(true)
      setError('')
      const [dashboardResponse, categoriesResponse, warehousesResponse, suppliersResponse, alertsResponse, movementsResponse] = await Promise.all([
        api.get('/inventory/dashboard'),
        api.get('/inventory/categories'),
        api.get('/inventory/warehouses'),
        api.get('/inventory/suppliers'),
        api.get('/inventory/alerts/low-stock'),
        api.get('/inventory/movements'),
      ])
      setDashboard(dashboardResponse.data.data)
      setCategories(categoriesResponse.data.data || [])
      setWarehouses(warehousesResponse.data.data || [])
      setSuppliers(suppliersResponse.data.data || [])
      setAlerts(alertsResponse.data.data || [])
      setMovements(movementsResponse.data.data || [])
      await loadProducts(nextFilters)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  function updateFilters(nextValues) {
    const nextFilters = { ...filters, ...nextValues, page: nextValues.page || 1 }
    setFilters(nextFilters)
    loadProducts(nextFilters).catch((err) => setError(err.response?.data?.message || 'Unable to filter products'))
  }

  async function createProduct(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const sku = productForm.sku || makeRef('SKU')
      await api.post('/inventory/products', {
        ...productForm,
        sku,
        categoryId: productForm.categoryId || null,
        supplierId: productForm.supplierId || null,
        unitCost: Number(productForm.unitCost),
        reorderLevel: Number(productForm.reorderLevel || 0),
      })
      setNotice('Product created successfully')
      setProductForm({ sku: '', name: '', categoryId: '', supplierId: '', unitCost: '', reorderLevel: '' })
      await loadInventory(filters)
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Unable to create product')
    } finally {
      setSaving(false)
    }
  }

  async function createMovement(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const referenceNumber = movementForm.referenceNumber || makeRef(movementForm.movementType)
      await api.post('/inventory/movements', {
        ...movementForm,
        referenceNumber,
        productId: Number(movementForm.productId),
        sourceWarehouseId: movementForm.sourceWarehouseId || null,
        destinationWarehouseId: movementForm.destinationWarehouseId || null,
        quantity: Number(movementForm.quantity),
      })
      setNotice('Stock movement recorded successfully')
      setMovementForm({ productId: '', sourceWarehouseId: '', destinationWarehouseId: '', movementType: 'RECEIPT', quantity: '', referenceNumber: '', notes: '' })
      await loadInventory(filters)
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Unable to record stock movement')
    } finally {
      setSaving(false)
    }
  }

  const cards = dashboard?.cards || {}

  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {loading && <div className="mb-5 bg-panel border border-line rounded-2xl p-5 text-muted">Loading inventory command center...</div>}
          {error && <div className="mb-5 bg-red-950 border border-red-500/30 rounded-2xl p-5 text-red-200">{error}</div>}
          {notice && <div className="mb-5 bg-cyan/10 border border-cyan/30 rounded-2xl p-5 text-cyan-200">{notice}</div>}

          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">Inventory Command Center</h1>
            <p className="text-muted text-lg max-w-4xl">Products, categories, warehouses, stock, suppliers, low-stock alerts, transfers, goods receipts and dispatches.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
            <MetricCard icon={Boxes} title="Total Products" value={cards.totalProducts || 0} subtitle="Active SKUs" color="#38bdf8" />
            <MetricCard icon={Warehouse} title="Inventory Value" value={fmt(cards.inventoryValue)} subtitle="Stock on hand" color="#94a3b8" />
            <MetricCard icon={AlertTriangle} title="Low Stock" value={cards.lowStock || 0} subtitle="Below reorder" color="#f59e0b" />
            <MetricCard icon={CircleCheck} title="Out of Stock" value={cards.outOfStock || 0} subtitle="Immediate action" color="#ef4444" />
            <MetricCard icon={Truck} title="Warehouse Utilization" value={`${cards.warehouseUtilization || 0}%`} subtitle="Average capacity" color="#c084fc" />
          </div>

          <DashboardAIPanel moduleKey="inventory" refreshKey={`${loading}-${products.length}-${alerts.length}-${movements.length}`} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Inventory Trend</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard?.inventoryTrend || []}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a93a6' }} />
                    <Tooltip />
                    <Bar dataKey="receipts" radius={[10, 10, 0, 0]} fill="#22d3ee" />
                    <Bar dataKey="dispatches" radius={[10, 10, 0, 0]} fill="#f59e0b" />
                    <Bar dataKey="transfers" radius={[10, 10, 0, 0]} fill="#c084fc" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Category Distribution</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboard?.categoryDistribution || []} dataKey="value" nameKey="name" outerRadius={105}>
                      {(dashboard?.categoryDistribution || []).map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Stock Movement</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard?.stockMovement || []}>
                    <XAxis dataKey="movementType" axisLine={false} tickLine={false} tick={{ fill: '#8a93a6' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#67e8f9" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="xl:col-span-2 bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-line"><h2 className="text-3xl font-semibold">Warehouse Utilization</h2></div>
              <div className="p-6 grid lg:grid-cols-3 gap-5">
                {(dashboard?.warehouses || []).map((warehouse) => (
                  <div key={warehouse.id} className="bg-panel2 rounded-xl p-5 border border-line">
                    <p className="text-muted text-sm">{warehouse.name}</p>
                    <h2 className="text-4xl font-light mt-3">{warehouse.utilization}%</h2>
                    <p className="text-muted text-sm mt-2">{warehouse.used} / {warehouse.capacityUnits} units</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <form onSubmit={createProduct} className="bg-panel border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div><h2 className="text-xl">Add Product</h2><p className="text-muted text-sm mt-1">Create product master data.</p></div>
                <button disabled={saving} className="flex items-center gap-2 bg-accent px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"><Plus size={16} />Save Product</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} placeholder="SKU" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product Name" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <select value={productForm.supplierId} onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Supplier</option>
                  {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                </select>
                <input type="number" value={productForm.unitCost} onChange={(e) => setProductForm({ ...productForm, unitCost: e.target.value })} placeholder="Unit Cost" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={productForm.reorderLevel} onChange={(e) => setProductForm({ ...productForm, reorderLevel: e.target.value })} placeholder="Reorder Level" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              </div>
            </form>

            <form onSubmit={createMovement} className="bg-panel border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div><h2 className="text-xl">Stock Movement</h2><p className="text-muted text-sm mt-1">Goods receipt, dispatch and transfer.</p></div>
                <button disabled={saving} className="flex items-center gap-2 bg-accent px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"><Plus size={16} />Record</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <select value={movementForm.productId} onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Product</option>
                  {productOptions.map((product) => <option key={product.id} value={product.id}>{product.label}</option>)}
                </select>
                <select value={movementForm.movementType} onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="RECEIPT">Goods Receipt</option>
                  <option value="DISPATCH">Goods Dispatch</option>
                  <option value="TRANSFER">Stock Transfer</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
                <input type="number" value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })} placeholder="Quantity" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <select value={movementForm.sourceWarehouseId} onChange={(e) => setMovementForm({ ...movementForm, sourceWarehouseId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Source Warehouse</option>
                  {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
                </select>
                <select value={movementForm.destinationWarehouseId} onChange={(e) => setMovementForm({ ...movementForm, destinationWarehouseId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Destination Warehouse</option>
                  {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
                </select>
                <input value={movementForm.referenceNumber} onChange={(e) => setMovementForm({ ...movementForm, referenceNumber: e.target.value })} placeholder="Reference #" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              </div>
            </form>
          </div>

          <div className="bg-panel border border-line rounded-2xl overflow-hidden mb-6">
            <div className="flex justify-between items-center gap-4 p-5 border-b border-line flex-wrap">
              <div><h2 className="text-2xl">Products and Stock</h2><p className="text-muted text-sm mt-1">Search and filter inventory master data.</p></div>
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={filters.search} onChange={(e) => updateFilters({ search: e.target.value })} placeholder="Search products" className="bg-panel2 pl-9 pr-3 py-2 rounded-lg border border-line text-sm" />
                </div>
                <select value={filters.categoryId} onChange={(e) => updateFilters({ categoryId: e.target.value })} className="bg-panel2 px-4 py-2 rounded-lg border border-line text-sm">
                  <option value="">All Categories</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-panel2 text-muted text-xs uppercase">
                <tr><th className="text-left p-5">SKU</th><th className="text-left p-5">Product</th><th className="text-left p-5">Category</th><th className="text-left p-5">Stock</th><th className="text-left p-5">Value</th><th className="text-left p-5">Status</th></tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-line">
                    <td className="p-5">{product.sku}</td>
                    <td className="p-5">{product.name}<p className="text-xs text-muted mt-1">{product.supplierName || 'No supplier'}</p></td>
                    <td className="p-5 text-muted">{product.categoryName || 'Unassigned'}</td>
                    <td className="p-5">{product.totalStock}</td>
                    <td className="p-5 font-semibold">{fmt(product.totalStock * product.unitCost)}</td>
                    <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs border ${product.stockStatus === 'HEALTHY' ? 'border-cyan-500 text-cyan-400' : product.stockStatus === 'LOW_STOCK' ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}`}>{product.stockStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-5 border-t border-line text-sm text-muted">
              <span>Page {pagination.page} of {pagination.totalPages || 1} - {pagination.total} records</span>
              <div className="flex gap-2">
                <button disabled={pagination.page <= 1} onClick={() => updateFilters({ page: pagination.page - 1 })} className="bg-panel2 px-4 py-2 rounded-lg border border-line disabled:opacity-40">Previous</button>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => updateFilters({ page: pagination.page + 1 })} className="bg-panel2 px-4 py-2 rounded-lg border border-line disabled:opacity-40">Next</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Panel title="Low Stock Alerts" items={alerts} render={(item) => <><div className="flex justify-between"><span className="font-semibold">{item.sku}</span><span className="text-red-400 text-xs">{item.totalStock}</span></div><p className="text-muted text-sm mt-1">{item.name} - reorder at {item.reorderLevel}</p></>} />
            <Panel title="Suppliers" items={suppliers} render={(item) => <div className="flex justify-between gap-4"><div><p className="font-semibold">{item.name}</p><p className="text-muted text-sm">{item.location}</p></div><span className="text-cyan-400">{Number(item.rating || 0).toFixed(1)}</span></div>} />
            <Panel title="Inventory History" items={movements} render={(item) => <><div className="flex justify-between"><span className="font-semibold">{item.referenceNumber}</span><span className="text-cyan-400 text-xs">{item.movementType}</span></div><p className="text-muted text-sm mt-1">{item.productName} - {item.quantity} units</p></>} />
          </div>
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}

function Panel({ title, items, render }) {
  return (
    <div className="bg-panel border border-line rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-line"><h2 className="text-xl">{title}</h2></div>
      <div className="divide-y divide-line max-h-80 overflow-y-auto">
        {(items || []).map((item) => <div key={item.id} className="p-5">{render(item)}</div>)}
        {!(items || []).length && <div className="p-5 text-muted text-sm">No records found.</div>}
      </div>
    </div>
  )
}
