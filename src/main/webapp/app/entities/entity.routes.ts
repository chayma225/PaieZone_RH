import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'paieZoneRhApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'company',
    data: { pageTitle: 'paieZoneRhApp.company.home.title' },
    loadChildren: () => import('./company/company.routes'),
  },
  {
    path: 'company-subscription',
    data: { pageTitle: 'paieZoneRhApp.companySubscription.home.title' },
    loadChildren: () => import('./company-subscription/company-subscription.routes'),
  },
  {
    path: 'user-profile',
    data: { pageTitle: 'paieZoneRhApp.userProfile.home.title' },
    loadChildren: () => import('./user-profile/user-profile.routes'),
  },
  {
    path: 'audit-log',
    data: { pageTitle: 'paieZoneRhApp.auditLog.home.title' },
    loadChildren: () => import('./audit-log/audit-log.routes'),
  },
  {
    path: 'department',
    data: { pageTitle: 'paieZoneRhApp.department.home.title' },
    loadChildren: () => import('./department/department.routes'),
  },
  {
    path: 'job-position',
    data: { pageTitle: 'paieZoneRhApp.jobPosition.home.title' },
    loadChildren: () => import('./job-position/job-position.routes'),
  },
  {
    path: 'employee',
    data: { pageTitle: 'paieZoneRhApp.employee.home.title' },
    loadChildren: () => import('./employee/employee.routes'),
  },
  {
    path: 'contract',
    data: { pageTitle: 'paieZoneRhApp.contract.home.title' },
    loadChildren: () => import('./contract/contract.routes'),
  },
  {
    path: 'hr-document',
    data: { pageTitle: 'paieZoneRhApp.hrDocument.home.title' },
    loadChildren: () => import('./hr-document/hr-document.routes'),
  },
  {
    path: 'employee-history',
    data: { pageTitle: 'paieZoneRhApp.employeeHistory.home.title' },
    loadChildren: () => import('./employee-history/employee-history.routes'),
  },
  {
    path: 'leave-type',
    data: { pageTitle: 'paieZoneRhApp.leaveType.home.title' },
    loadChildren: () => import('./leave-type/leave-type.routes'),
  },
  {
    path: 'leave-request',
    data: { pageTitle: 'paieZoneRhApp.leaveRequest.home.title' },
    loadChildren: () => import('./leave-request/leave-request.routes'),
  },
  {
    path: 'leave-balance',
    data: { pageTitle: 'paieZoneRhApp.leaveBalance.home.title' },
    loadChildren: () => import('./leave-balance/leave-balance.routes'),
  },
  {
    path: 'public-holiday',
    data: { pageTitle: 'paieZoneRhApp.publicHoliday.home.title' },
    loadChildren: () => import('./public-holiday/public-holiday.routes'),
  },
  {
    path: 'time-entry',
    data: { pageTitle: 'paieZoneRhApp.timeEntry.home.title' },
    loadChildren: () => import('./time-entry/time-entry.routes'),
  },
  {
    path: 'payroll-period',
    data: { pageTitle: 'paieZoneRhApp.payrollPeriod.home.title' },
    loadChildren: () => import('./payroll-period/payroll-period.routes'),
  },
  {
    path: 'rubrique',
    data: { pageTitle: 'paieZoneRhApp.rubrique.home.title' },
    loadChildren: () => import('./rubrique/rubrique.routes'),
  },
  {
    path: 'pay-slip',
    data: { pageTitle: 'paieZoneRhApp.paySlip.home.title' },
    loadChildren: () => import('./pay-slip/pay-slip.routes'),
  },
  {
    path: 'pay-slip-line',
    data: { pageTitle: 'paieZoneRhApp.paySlipLine.home.title' },
    loadChildren: () => import('./pay-slip-line/pay-slip-line.routes'),
  },
  {
    path: 'bonus',
    data: { pageTitle: 'paieZoneRhApp.bonus.home.title' },
    loadChildren: () => import('./bonus/bonus.routes'),
  },
  {
    path: 'advance',
    data: { pageTitle: 'paieZoneRhApp.advance.home.title' },
    loadChildren: () => import('./advance/advance.routes'),
  },
  {
    path: 'regulatory-param',
    data: { pageTitle: 'paieZoneRhApp.regulatoryParam.home.title' },
    loadChildren: () => import('./regulatory-param/regulatory-param.routes'),
  },
  {
    path: 'tax-bracket',
    data: { pageTitle: 'paieZoneRhApp.taxBracket.home.title' },
    loadChildren: () => import('./tax-bracket/tax-bracket.routes'),
  },
  {
    path: 'cnss-rate',
    data: { pageTitle: 'paieZoneRhApp.cnssRate.home.title' },
    loadChildren: () => import('./cnss-rate/cnss-rate.routes'),
  },
  {
    path: 'account-plan',
    data: { pageTitle: 'paieZoneRhApp.accountPlan.home.title' },
    loadChildren: () => import('./account-plan/account-plan.routes'),
  },
  {
    path: 'accounting-entry',
    data: { pageTitle: 'paieZoneRhApp.accountingEntry.home.title' },
    loadChildren: () => import('./accounting-entry/accounting-entry.routes'),
  },
  {
    path: 'official-document',
    data: { pageTitle: 'paieZoneRhApp.officialDocument.home.title' },
    loadChildren: () => import('./official-document/official-document.routes'),
  },
  {
    path: 'chat-session',
    data: { pageTitle: 'paieZoneRhApp.chatSession.home.title' },
    loadChildren: () => import('./chat-session/chat-session.routes'),
  },
  {
    path: 'chat-message',
    data: { pageTitle: 'paieZoneRhApp.chatMessage.home.title' },
    loadChildren: () => import('./chat-message/chat-message.routes'),
  },
  {
    path: 'knowledge-document',
    data: { pageTitle: 'paieZoneRhApp.knowledgeDocument.home.title' },
    loadChildren: () => import('./knowledge-document/knowledge-document.routes'),
  },
  {
    path: 'user-management',
    data: { pageTitle: 'userManagement.home.title' },
    loadChildren: () => import('./admin/user-management/user-management.routes'),
  },
  {
    path: 'payroll-period',
    loadChildren: () => import('./payroll-period/payroll-period.routes'),
  },
  {
    path: 'pay-slip',
    loadChildren: () => import('./pay-slip/pay-slip.routes'),
  },
  {
    path: 'bonus',
    loadChildren: () => import('./bonus/bonus.routes'),
  },
  {
    path: 'advance',
    loadChildren: () => import('./advance/advance.routes'),
  },
  {
    path: 'regulatory-param',
    loadChildren: () => import('./regulatory-param/regulatory-param.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
