<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <!-- هدر بالا -->
    <q-header elevated class="main-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="rightDrawerOpen = !rightDrawerOpen" class="menu-btn" />
        <q-toolbar-title class="header-title">
          <div class="title-content">

            <div class="title-text">
              <div class="text-h6">سامانه مدیریت تجهیزات سخت‌افزاری</div>

            </div>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- منوی سمت راست -->
    <q-drawer
      v-model="rightDrawerOpen"
      show-if-above
      side="right"
      :width="220"
      class="sidebar-drawer"
      bordered
    >
      <div class="sidebar-header" style="color: #3f51b5;">
        <div v-if="user" class="user-info">
          <q-icon name="person" size="20px" />
            <span style="font-size:larger">
              {{ user.city.name }}
            </span>
        </div>
      </div>

      <q-list dense class="menu-list">
        <!-- داشبورد -->
        <q-item
          to="/dashboard"
          exact
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>داشبورد</q-item-label>
          </q-item-section>
        </q-item>

        <!-- شهرستان‌ها (فقط برای ادمین) -->
        <q-item
          v-if="user?.role_id === 1"
          to="/users"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="users" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>کاربران</q-item-label>
          </q-item-section>
        </q-item>

        <!-- شهرستان‌ها (فقط برای ادمین) -->
        <q-item
          v-if="user?.role_id === 1"
          to="/cities"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="location_city" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>شهرستان‌ها</q-item-label>
          </q-item-section>
        </q-item>

        <!-- شعب -->
        <q-item
          to="/branches"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="business" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>شعب</q-item-label>
          </q-item-section>
        </q-item>

        <!-- کارمندان -->
        <q-item
          to="/employees"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="people" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>کارمندان</q-item-label>
          </q-item-section>
        </q-item>

        <!-- رایانه‌ها -->
        <q-item
          to="/computers"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="desktop_windows" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>رایانه‌ها</q-item-label>
          </q-item-section>
        </q-item>

        <!-- پرینترها -->
        <q-item
          to="/printers"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="print" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>پرینترها</q-item-label>
          </q-item-section>
        </q-item>

        <!-- اسکنرها -->
        <q-item
          to="/scanners"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="scanner" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>اسکنرها</q-item-label>
          </q-item-section>
        </q-item>

        <!-- گزارشات -->
        <q-item
          to="/reports"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="assessment" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>گزارشات</q-item-label>
          </q-item-section>
        </q-item>

        <!-- جداکننده -->
        <q-separator class="menu-separator" />

        <!-- خروج -->
        <q-item
          clickable
          v-ripple
          class="menu-item logout-item"
          @click="logout"
        >
          <q-item-section avatar>
            <q-icon name="logout" class="logout-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>خروج از سیستم</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- محتوای صفحات -->
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

const router = useRouter()
const rightDrawerOpen = ref(true)
const user = ref(null)

// تابع خروج ساده
const logout = () => {
  // پاک کردن داده‌های localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // پاک کردن هدر Authorization
  delete api.defaults.headers.Authorization

  // هدایت به صفحه login
  router.push('/login')
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})
</script>

<style scoped>
.main-layout {
  background: linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%);
  font-family: Vazirmatn, serif;
}

/* استایل هدر */
.main-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 0 0 15px 15px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
}

.menu-btn {
  color: white;
}

.header-title {
  text-align: center;
  color: white;
}

.title-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 32px;
  color: white;
}

.title-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.9;
}

.admin-role {
  color: #ffeb3b;
  font-weight: bold;
}

.user-role {
  color: #c8e6c9;
  font-weight: bold;
}

/* استایل سایدبار */
.sidebar-drawer {
  background: linear-gradient(180deg, #ffffff 0%, #f5fbff 100%);
  border-left: 1px solid #e3f2fd;
}

.sidebar-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5fbff 100%);
  border-bottom: 1px solid #e1f5fe;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-icon {
  font-size: 24px;
  color: #1976d2;
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: #1976d2;
}

/* استایل منوها */
.menu-list {
  padding: 10px 8px;
}

.menu-item {
  border-radius: 12px;
  margin: 8px 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.menu-item:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3f9ff 100%);
  border-color: #bbdefb;
  transform: translateX(-4px);
}

.menu-item-active {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%) !important;
  color: white !important;
  border-color: #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.menu-item-active .menu-icon {
  color: white !important;
}

.menu-icon {
  font-size: 20px;
  color: #42a5f5;
}

.menu-separator {
  margin: 16px 12px;
  background: #e3f2fd;
}

/* استایل خروج */
.logout-item {
  margin-top: 8px;
  border: 1px solid #ffcdd2;
}

.logout-item:hover {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: #ef5350;
}

.logout-icon {
  font-size: 20px;
  color: #f44336;
}

/* استایل محتوای صفحات */
.page-container {
  background: transparent;
  padding: 20px;
}

/* استایل‌های responsive */
@media (max-width: 1024px) {
  .sidebar-drawer {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .sidebar-drawer {
    width: 180px;
  }

  .title-content {
    flex-direction: column;
    gap: 8px;
  }

  .page-container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .sidebar-drawer {
    width: 160px;
  }

  .sidebar-header {
    padding: 15px 12px;
  }

  .menu-item {
    margin: 2px 4px;
  }
}

/* انیمیشن‌ها */
.menu-item {
  animation: slideInRight 0.5s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* استایل‌های سفارشی برای حالت فعال */
:deep(.q-item__label) {
  font-weight: 500;
  font-size: 14px;
}

:deep(.q-item__section--avatar) {
  min-width: 40px;
}

/* افکت‌های ویژه برای هدر */
.main-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffffff, transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
