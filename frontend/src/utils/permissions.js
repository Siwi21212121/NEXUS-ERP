export const ROLES = {
  OWNER: 'OWNER',
  HR_MANAGER: 'HR_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
}

export const ROLE_ACCESS = {
  [ROLES.OWNER]: [
    'dashboard',
    'hr-payroll',
    'finance',
    'supply-chain',
    'procurement',
    'analytics',
    'ai-forecasting',
    'ai-copilot',
  ],
  [ROLES.HR_MANAGER]: [
    'dashboard',
    'hr-payroll',
    'ai-copilot',
  ],
  [ROLES.FINANCE_MANAGER]: [
    'dashboard',
    'finance',
    'ai-copilot',
  ],
  [ROLES.PROJECT_MANAGER]: [
    'dashboard',
    'supply-chain',
    'procurement',
    'ai-copilot',
  ],
  [ROLES.EMPLOYEE]: [
    'dashboard',
  ],
}

export const AUTHENTICATED_ROLES = Object.values(ROLES)

export function getStoredRole() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    return localStorage.getItem('role') || user?.role || null
  } catch {
    return localStorage.getItem('role')
  }
}

export function canView(role = getStoredRole(), moduleKey) {
  return Boolean(role && ROLE_ACCESS[role]?.includes(moduleKey))
}

export function canViewFinance(role = getStoredRole()) {
  return canView(role, 'finance')
}

export function canViewHR(role = getStoredRole()) {
  return canView(role, 'hr-payroll')
}

export function canViewAnalytics(role = getStoredRole()) {
  return canView(role, 'analytics')
}

export function canViewForecasting(role = getStoredRole()) {
  return canView(role, 'ai-forecasting')
}

export function canViewSupplyChain(role = getStoredRole()) {
  return canView(role, 'supply-chain')
}

export function canViewProcurement(role = getStoredRole()) {
  return canView(role, 'procurement')
}

export function canViewAICopilot(role = getStoredRole()) {
  return canView(role, 'ai-copilot')
}
