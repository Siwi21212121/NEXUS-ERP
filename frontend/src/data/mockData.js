export const revenueTrend = [
  { month: 'Jan', value: 30 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 38 },
  { month: 'Apr', value: 52 },
  { month: 'May', value: 68 },
  { month: 'Jun', value: 48 },
  { month: 'Jul', value: 40 },
  { month: 'Aug', value: 58 },
  { month: 'Sep', value: 88 },
  { month: 'Oct', value: 92 },
  { month: 'Nov', value: 90 },
  { month: 'Dec', value: 91 },
]

export const employeeDistribution = [
  { name: 'North America', value: 42, color: '#3b82f6' },
  { name: 'EMEA', value: 31, color: '#22d3ee' },
  { name: 'Other', value: 27, color: '#3a4150' },
]

export const stats = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: '$42.8M',
    tag: '+12.4% vs LM',
    tagTone: 'good',
    barPct: 78,
    barColor: '#3b82f6',
    icon: 'wallet',
  },
  {
    id: 'employees',
    label: 'Active Employees',
    value: '12,480',
    tag: 'Stable',
    tagTone: 'muted',
    barPct: 60,
    barColor: '#22d3ee',
    icon: 'users',
  },
  {
    id: 'inventory',
    label: 'Inventory Health',
    value: '94%',
    tag: 'Good',
    tagTone: 'good',
    barPct: 94,
    barColor: '#34d399',
    icon: 'box',
  },
  {
    id: 'forecast',
    label: 'Forecast Accuracy',
    value: '98.2%',
    tag: 'Excellent',
    tagTone: 'violet',
    barPct: 98,
    barColor: '#a78bfa',
    icon: 'brain',
  },
]

export const alerts = [
  {
    id: 1,
    tone: 'danger',
    title: 'Inventory shortage predicted',
    body: "Shortage expected in 8 days for 'Titanium-X' units in Berlin hub.",
    action: 'Reorder now',
  },
  {
    id: 2,
    tone: 'warn',
    title: 'Payroll anomaly detected',
    body: 'Variance of +15% found in APAC region regional overheads.',
    action: 'Audit report',
  },
  {
    id: 3,
    tone: 'cyan',
    title: 'Q3 Growth Forecast',
    body: 'Revenue expected to increase by 12% in Q3 based on current sales velocity.',
    action: 'View forecast model',
  },
]

export const inventoryStatus = [
  { label: 'Critical Components', value: 82, color: '#3b82f6' },
  { label: 'Finished Goods', value: 96, color: '#22d3ee' },
]

export const aiMessages = [
  {
    id: 1,
    sender: 'Nexus AI',
    time: '2m ago',
    body:
      "I've analyzed the Q3 pipeline. We're trending 4% above target in North America, but APAC logistics costs are rising.",
  },
]

export const aiRecommendation =
  'Consider reallocating $2M from the unused R&D buffer to APAC freight optimization.'

export const logistics = {
  ships: 42,
  flights: 128,
  trucks: 1204,
}
