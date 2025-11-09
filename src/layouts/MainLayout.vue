<!-- MainLayout.vue -->
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

        <!-- منوی کاربر در هدر -->
        <q-btn flat dense round icon="person" class="q-ml-md">
          <q-menu auto-close>
            <q-list style="min-width: 150px">
              <q-item clickable @click="goToSettings">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>تنظیمات کاربری</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>خروج</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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

        <!-- کاربران (فقط برای ادمین) -->
        <q-item
          v-if="user?.role_id === 1"
          to="/users"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="person" class="menu-icon" />
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

        <!-- تنظیمات کاربری -->
        <q-item
          to="/user-settings"
          clickable
          v-ripple
          class="menu-item"
          active-class="menu-item-active"
        >
          <q-item-section avatar>
            <q-icon name="settings" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>تنظیمات کاربری</q-item-label>
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

const router = useRouter()
const rightDrawerOpen = ref(true)
const user = ref(null)

// رفتن به صفحه تنظیمات
const goToSettings = () => {
  router.push('/user-settings')
}

// تابع خروج
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
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
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
