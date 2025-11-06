// boot/auth.js
import { boot } from 'quasar/wrappers'
import { api } from 'boot/axios'

export default boot(({ router }) => {
  // بررسی وضعیت لاگین کاربر
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  if (token && user) {
    // تنظیم هدر Authorization برای درخواست‌های آینده
    api.defaults.headers.Authorization = `Bearer ${token}`
  }

  // بررسی وضعیت احراز هویت قبل از هر route
  router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token')

    // اگر route نیاز به احراز هویت دارد و کاربر لاگین نباشد
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/login')
    }
    // اگر کاربر لاگین کرده باشد و بخواهد به صفحه login برود
    else if (to.path === '/login' && isAuthenticated) {
      next('/dashboard')
    }
    // در غیر این صورت اجازه دسترسی بده
    else {
      next()
    }
  })
})
