const routes = [
  // مسیر ورود
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },

  // مسیر پیش‌فرض: ریدایرکت به صفحه لاگین
  {
    path: '/',
    redirect: '/login',
  },

  // مسیرهای اصلی با layout
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'cities', component: () => import('pages/CitiesPage.vue') },
      { path: 'branches', component: () => import('pages/BranchesPage.vue') },
      { path: 'employees', component: () => import('pages/EmployeesPage.vue') },
      { path: 'computers', component: () => import('pages/ComputersPage.vue') },
      { path: 'printers', component: () => import('pages/PrintersPage.vue') },
      { path: 'scanners', component: () => import('pages/ScannersPage.vue') },
      { path: 'reports', component: () => import('pages/ReportsPage.vue') },
    ],
  },

  // مسیر catch-all برای صفحات ناموجود
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
