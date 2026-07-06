import React, { useEffect, useMemo, useState } from 'react'
import {
  Users,
  UserCheck,
  BadgeDollarSign,
  Clock3,
  Plus,
  Search,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'
import DashboardAIPanel from '../components/DashboardAIPanel'
import api from '../utils/api'

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

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const chartColors = ['#60a5fa', '#22d3ee', '#c084fc', '#f59e0b', '#22c55e']

const emptyEmployeeForm = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  employmentStatus: 'ACTIVE',
  departmentId: '',
  managerId: '',
  hireDate: new Date().toISOString().slice(0, 10),
}

const emptyLeaveForm = {
  employeeId: '',
  leaveType: 'ANNUAL',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  reason: '',
}

const emptySalaryForm = {
  employeeId: '',
  baseSalary: '',
  housingAllowance: '',
  transportAllowance: '',
  bonus: '',
  taxDeduction: '',
  effectiveFrom: new Date().toISOString().slice(0, 10),
}

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

function HRCard({
  icon: Icon,
  title,
  value,
  subtext,
  color,
}) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-5">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${color}20`,
          }}
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

      <h2 className="text-4xl font-light">
        {value}
      </h2>

      <div className="mt-5 h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: '72%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function HRPayroll() {
  const [dashboard, setDashboard] = useState(null)
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [attendanceSummary, setAttendanceSummary] = useState([])
  const [leaves, setLeaves] = useState([])
  const [payroll, setPayroll] = useState([])
  const [payslip, setPayslip] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    departmentId: '',
    page: 1,
  })
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [leaveForm, setLeaveForm] = useState(emptyLeaveForm)
  const [salaryForm, setSalaryForm] = useState(emptySalaryForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const cards = dashboard?.cards || {}
  const departmentDistribution = dashboard?.departmentDistribution || []
  const attendanceTrend = dashboard?.attendanceTrend || []
  const joiningTrend = dashboard?.joiningTrend || []

  const managerOptions = useMemo(
    () => employees.filter((employee) => employee.id !== editingEmployeeId),
    [employees, editingEmployeeId]
  )

  async function loadEmployees(nextFilters = filters) {
    const response = await api.get('/hr/employees', {
      params: {
        page: nextFilters.page,
        limit: pagination.limit,
        search: nextFilters.search || undefined,
        status: nextFilters.status || undefined,
        departmentId: nextFilters.departmentId || undefined,
      },
    })
    setEmployees(response.data.data || [])
    setPagination(response.data.pagination || pagination)
  }

  async function loadHR(nextFilters = filters) {
    try {
      setLoading(true)
      setError('')
      const [
        dashboardResponse,
        departmentsResponse,
        attendanceResponse,
        summaryResponse,
        leavesResponse,
        payrollResponse,
      ] = await Promise.all([
        api.get('/hr/dashboard'),
        api.get('/hr/departments'),
        api.get('/hr/attendance/monthly'),
        api.get('/hr/attendance/summary'),
        api.get('/hr/leaves'),
        api.get('/hr/payroll/monthly'),
      ])

      setDashboard(dashboardResponse.data.data)
      setDepartments(departmentsResponse.data.data || [])
      setAttendance(attendanceResponse.data.data || [])
      setAttendanceSummary(summaryResponse.data.data || [])
      setLeaves(leavesResponse.data.data || [])
      setPayroll(payrollResponse.data.data || [])
      await loadEmployees(nextFilters)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load HR data. Please verify the backend and HR migration.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHR()
  }, [])

  function updateFilters(nextValues) {
    const nextFilters = {
      ...filters,
      ...nextValues,
      page: nextValues.page || 1,
    }
    setFilters(nextFilters)
    loadEmployees(nextFilters).catch((err) => {
      setError(err.response?.data?.message || 'Unable to filter employees')
    })
  }

  function startEdit(employee) {
    setEditingEmployeeId(employee.id)
    setEmployeeForm({
      employeeCode: employee.employeeCode || '',
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      jobTitle: employee.jobTitle || '',
      employmentStatus: employee.employmentStatus || 'ACTIVE',
      departmentId: employee.department?.id || '',
      managerId: employee.manager?.id || '',
      hireDate: employee.hireDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    })
  }

  async function handleEmployeeSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = {
        ...employeeForm,
        employeeCode: employeeForm.employeeCode || makeRef('EMP'),
        departmentId: employeeForm.departmentId || null,
        managerId: employeeForm.managerId || null,
      }

      if (editingEmployeeId) {
        await api.put(`/hr/employees/${editingEmployeeId}`, payload)
        setNotice('Employee updated successfully')
      } else {
        await api.post('/hr/employees', payload)
        setNotice('Employee added successfully')
      }

      setEmployeeForm(emptyEmployeeForm)
      setEditingEmployeeId(null)
      await loadHR(filters)
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(', ') ||
          err.response?.data?.message ||
          'Unable to save employee'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEmployee(id) {
    setError('')
    setNotice('')

    try {
      await api.delete(`/hr/employees/${id}`)
      setNotice('Employee deleted successfully')
      await loadHR(filters)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete employee')
    }
  }

  async function handleProfile(id) {
    try {
      const response = await api.get(`/hr/employees/${id}`)
      setSelectedProfile(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load employee profile')
    }
  }

  async function handleAttendance(endpoint, employeeId) {
    try {
      await api.post(`/hr/attendance/${endpoint}`, { employeeId })
      setNotice(endpoint === 'check-in' ? 'Check-in recorded' : 'Check-out recorded')
      await loadHR(filters)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update attendance')
    }
  }

  async function handleLeaveSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      await api.post('/hr/leaves', leaveForm)
      setLeaveForm(emptyLeaveForm)
      setNotice('Leave request submitted')
      await loadHR(filters)
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(', ') ||
          err.response?.data?.message ||
          'Unable to submit leave'
      )
    } finally {
      setSaving(false)
    }
  }

  async function reviewLeave(id, action) {
    try {
      await api.patch(`/hr/leaves/${id}/${action}`)
      setNotice(action === 'approve' ? 'Leave approved' : 'Leave rejected')
      await loadHR(filters)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to review leave')
    }
  }

  async function handleSalarySubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      await api.post('/hr/salary-structures', salaryForm)
      setSalaryForm(emptySalaryForm)
      setNotice('Salary structure saved')
      await loadHR(filters)
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(', ') ||
          err.response?.data?.message ||
          'Unable to save salary structure'
      )
    } finally {
      setSaving(false)
    }
  }

  async function loadPayslip(payrollId) {
    try {
      const response = await api.get(`/hr/payroll/${payrollId}/payslip`)
      setPayslip(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load payslip')
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
              Loading HR command center...
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
              Human Resources & Payroll
            </h1>

            <p className="text-muted text-lg max-w-4xl">
              Employee lifecycle management,
              payroll automation and workforce
              performance monitoring.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
            <HRCard
              icon={Users}
              title="Total Employees"
              value={cards.totalEmployees || 0}
              subtext={`${cards.newJoiners || 0} New Joiners`}
              color="#60a5fa"
            />

            <HRCard
              icon={UserCheck}
              title="Today's Attendance"
              value={cards.todayAttendance || 0}
              subtext={`${cards.remoteToday || 0} Remote`}
              color="#22d3ee"
            />

            <HRCard
              icon={BadgeDollarSign}
              title="Monthly Payroll"
              value={formatCurrency(cards.monthlyPayroll)}
              subtext="This Month"
              color="#c084fc"
            />

            <HRCard
              icon={Clock3}
              title="Pending Leaves"
              value={cards.leavesPending || 0}
              subtext="Review"
              color="#f59e0b"
            />
          </div>

          <DashboardAIPanel moduleKey="hr" refreshKey={`${loading}-${employees.length}-${leaves.length}-${payroll.length}`} />

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-2xl mb-1">Department Distribution</h2>
              <p className="text-xs tracking-[3px] uppercase text-muted mb-6">Employees by Department</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={departmentDistribution} dataKey="value" outerRadius={95}>
                      {departmentDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-2xl mb-1">Attendance Trend</h2>
              <p className="text-xs tracking-[3px] uppercase text-muted mb-6">Last 14 Days</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceTrend}>
                    <XAxis dataKey="day" tick={{ fill: '#8a93a6' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="present" radius={[10, 10, 0, 0]} fill="#22d3ee" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-2xl mb-1">Employee Joining Trend</h2>
              <p className="text-xs tracking-[3px] uppercase text-muted mb-6">Monthly Growth</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={joiningTrend}>
                    <XAxis dataKey="month" tick={{ fill: '#8a93a6' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#c084fc" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Employee Form */}
          <form onSubmit={handleEmployeeSubmit} className="bg-panel border border-line rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl">{editingEmployeeId ? 'Edit Employee' : 'Add Employee'}</h2>
                <p className="text-muted text-sm mt-1">Manage profile, department and manager assignment.</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-accent px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                <Plus size={16} />
                {saving ? 'Saving...' : editingEmployeeId ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <input value={employeeForm.employeeCode} onChange={(e) => setEmployeeForm({ ...employeeForm, employeeCode: e.target.value })} placeholder="Employee Code" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={employeeForm.firstName} onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })} placeholder="First Name" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={employeeForm.lastName} onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })} placeholder="Last Name" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} placeholder="Email" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={employeeForm.phone} onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} placeholder="Phone" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <input value={employeeForm.jobTitle} onChange={(e) => setEmployeeForm({ ...employeeForm, jobTitle: e.target.value })} placeholder="Job Title" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <select value={employeeForm.employmentStatus} onChange={(e) => setEmployeeForm({ ...employeeForm, employmentStatus: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                <option value="ACTIVE">Active</option>
                <option value="REMOTE">Remote</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
              <input type="date" value={employeeForm.hireDate} onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <select value={employeeForm.departmentId} onChange={(e) => setEmployeeForm({ ...employeeForm, departmentId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
              <select value={employeeForm.managerId} onChange={(e) => setEmployeeForm({ ...employeeForm, managerId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Manager</option>
                {managerOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.fullName}</option>
                ))}
              </select>
              {editingEmployeeId && (
                <button type="button" onClick={() => { setEditingEmployeeId(null); setEmployeeForm(emptyEmployeeForm) }} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-muted">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Employee Directory */}
          <div className="bg-panel border border-line rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-line flex justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl">
                  Employee Directory
                </h2>

                <p className="text-muted text-sm mt-1">
                  Workforce overview with filters and pagination
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={filters.search} onChange={(e) => updateFilters({ search: e.target.value })} placeholder="Search employees" className="bg-panel2 pl-9 pr-3 py-2 rounded-lg border border-line text-sm" />
                </div>
                <select value={filters.departmentId} onChange={(e) => updateFilters({ departmentId: e.target.value })} className="bg-panel2 px-4 py-2 rounded-lg border border-line text-sm">
                  <option value="">All Departments</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
                <select value={filters.status} onChange={(e) => updateFilters({ status: e.target.value })} className="bg-panel2 px-4 py-2 rounded-lg border border-line text-sm">
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-panel2 text-muted text-xs uppercase">
                <tr>
                  <th className="text-left p-5">
                    Employee Name
                  </th>
                  <th className="text-left p-5">
                    Role
                  </th>
                  <th className="text-left p-5">
                    Status
                  </th>
                  <th className="text-left p-5">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t border-line"
                  >
                    <td className="p-5">
                      {employee.fullName}
                      <p className="text-xs text-muted mt-1">{employee.employeeCode}</p>
                    </td>

                    <td className="p-5 text-muted">
                      {employee.jobTitle}
                      <p className="text-xs mt-1">{employee.department?.name || 'Unassigned'}</p>
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${
                          employee.employmentStatus ===
                          'ACTIVE'
                            ? 'border-cyan-500 text-cyan-400'
                            : employee.employmentStatus ===
                              'REMOTE'
                            ? 'border-violet-500 text-violet-400'
                            : 'border-yellow-500 text-yellow-400'
                        }`}
                      >
                        {employee.employmentStatus}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleProfile(employee.id)} className="text-cyan-400 text-sm">View</button>
                        <button onClick={() => startEdit(employee)} className="text-violet-400 text-sm">Edit</button>
                        <button onClick={() => handleDeleteEmployee(employee.id)} className="text-red-400 text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!employees.length && !loading && (
                  <tr>
                    <td className="p-5 text-muted" colSpan="4">
                      No employees found.
                    </td>
                  </tr>
                )}
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

          {/* Attendance and Leave */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-2xl">Attendance</h2>
                <p className="text-muted text-sm mt-1">Check in, check out and monthly summary</p>
              </div>
              <div className="p-5 flex gap-3 flex-wrap">
                <select value={leaveForm.employeeId} onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.fullName}</option>
                  ))}
                </select>
                <button onClick={() => handleAttendance('check-in', leaveForm.employeeId)} className="bg-accent px-4 py-2 rounded-lg text-sm">Check In</button>
                <button onClick={() => handleAttendance('check-out', leaveForm.employeeId)} className="bg-panel2 border border-line px-4 py-2 rounded-lg text-sm">Check Out</button>
              </div>
              <div className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {attendanceSummary.map((item) => (
                    <div key={item.status} className="bg-panel2 border border-line rounded-xl p-4">
                      <p className="text-muted text-xs uppercase">{item.status}</p>
                      <p className="text-3xl mt-2">{item.count}</p>
                    </div>
                  ))}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {attendance.slice(0, 8).map((item) => (
                    <div key={item.id} className="flex justify-between border-t border-line py-3 text-sm">
                      <span>{item.employeeName}</span>
                      <span className="text-muted">{formatDate(item.attendanceDate)} - {item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-2xl">Leave Management</h2>
                <p className="text-muted text-sm mt-1">Apply leave and review pending requests</p>
              </div>
              <form onSubmit={handleLeaveSubmit} className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <select value={leaveForm.employeeId} onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.fullName}</option>
                  ))}
                </select>
                <select value={leaveForm.leaveType} onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="ANNUAL">Annual</option>
                  <option value="SICK">Sick</option>
                  <option value="CASUAL">Casual</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
                <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Reason" className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm lg:col-span-2" />
                <button className="bg-accent px-4 py-2 rounded-lg text-sm lg:col-span-2">Apply Leave</button>
              </form>
              <div className="px-5 pb-5 max-h-72 overflow-y-auto">
                {leaves.map((leave) => (
                  <div key={leave.id} className="border-t border-line py-4">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-medium">{leave.employeeName}</p>
                        <p className="text-muted text-sm">{leave.leaveType} - {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</p>
                      </div>
                      <span className="text-xs text-cyan-400">{leave.status}</span>
                    </div>
                    {leave.status === 'PENDING' && (
                      <div className="flex gap-3 mt-3">
                        <button onClick={() => reviewLeave(leave.id, 'approve')} className="text-cyan-400 text-sm">Approve</button>
                        <button onClick={() => reviewLeave(leave.id, 'reject')} className="text-red-400 text-sm">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payroll */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <form onSubmit={handleSalarySubmit} className="bg-panel border border-line rounded-2xl p-5">
              <h2 className="text-2xl mb-1">Salary Structure</h2>
              <p className="text-muted text-sm mb-5">Create or update employee compensation</p>
              <div className="space-y-3">
                <select value={salaryForm.employeeId} onChange={(e) => setSalaryForm({ ...salaryForm, employeeId: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm">
                  <option value="">Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.fullName}</option>
                  ))}
                </select>
                <input type="number" value={salaryForm.baseSalary} onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })} placeholder="Base Salary" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={salaryForm.housingAllowance} onChange={(e) => setSalaryForm({ ...salaryForm, housingAllowance: e.target.value })} placeholder="Housing Allowance" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={salaryForm.transportAllowance} onChange={(e) => setSalaryForm({ ...salaryForm, transportAllowance: e.target.value })} placeholder="Transport Allowance" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={salaryForm.bonus} onChange={(e) => setSalaryForm({ ...salaryForm, bonus: e.target.value })} placeholder="Bonus" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={salaryForm.taxDeduction} onChange={(e) => setSalaryForm({ ...salaryForm, taxDeduction: e.target.value })} placeholder="Tax Deduction" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={salaryForm.effectiveFrom} onChange={(e) => setSalaryForm({ ...salaryForm, effectiveFrom: e.target.value })} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
                <button className="w-full bg-accent px-4 py-2 rounded-lg text-sm">Save Salary</button>
              </div>
            </form>

            <div className="xl:col-span-2 bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-line">
                <h2 className="text-2xl">Monthly Payroll</h2>
                <p className="text-muted text-sm mt-1">Payroll history and payslip access</p>
              </div>
              <table className="w-full">
                <thead className="bg-panel2 text-muted text-xs uppercase">
                  <tr>
                    <th className="text-left p-5">Employee</th>
                    <th className="text-left p-5">Gross</th>
                    <th className="text-left p-5">Deductions</th>
                    <th className="text-left p-5">Net Pay</th>
                    <th className="text-left p-5">Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((item) => (
                    <tr key={item.id} className="border-t border-line">
                      <td className="p-5">{item.employeeName}<p className="text-xs text-muted mt-1">{item.jobTitle}</p></td>
                      <td className="p-5">{formatCurrency(item.grossPay)}</td>
                      <td className="p-5 text-muted">{formatCurrency(item.deductions)}</td>
                      <td className="p-5 font-semibold">{formatCurrency(item.netPay)}</td>
                      <td className="p-5"><button onClick={() => loadPayslip(item.id)} className="text-cyan-400 text-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(selectedProfile || payslip) && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
              <div className="bg-panel border border-line rounded-2xl p-6 max-w-2xl w-full">
                <div className="flex justify-between gap-4 mb-5">
                  <h2 className="text-2xl">{selectedProfile ? 'Employee Profile' : 'Payslip'}</h2>
                  <button onClick={() => { setSelectedProfile(null); setPayslip(null) }} className="text-muted">Close</button>
                </div>

                {selectedProfile && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p><span className="text-muted">Name:</span> {selectedProfile.employee.fullName}</p>
                    <p><span className="text-muted">Code:</span> {selectedProfile.employee.employeeCode}</p>
                    <p><span className="text-muted">Email:</span> {selectedProfile.employee.email}</p>
                    <p><span className="text-muted">Role:</span> {selectedProfile.employee.jobTitle}</p>
                    <p><span className="text-muted">Department:</span> {selectedProfile.employee.department?.name || 'Unassigned'}</p>
                    <p><span className="text-muted">Manager:</span> {selectedProfile.employee.manager?.name || 'Unassigned'}</p>
                    <p><span className="text-muted">Base Salary:</span> {formatCurrency(selectedProfile.salary?.baseSalary)}</p>
                    <p><span className="text-muted">Hire Date:</span> {formatDate(selectedProfile.employee.hireDate)}</p>
                  </div>
                )}

                {payslip && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p><span className="text-muted">Employee:</span> {payslip.employeeName}</p>
                    <p><span className="text-muted">Month:</span> {formatDate(payslip.payrollMonth)}</p>
                    <p><span className="text-muted">Department:</span> {payslip.departmentName}</p>
                    <p><span className="text-muted">Gross Pay:</span> {formatCurrency(payslip.grossPay)}</p>
                    <p><span className="text-muted">Deductions:</span> {formatCurrency(payslip.deductions)}</p>
                    <p><span className="text-muted">Net Pay:</span> {formatCurrency(payslip.netPay)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}
