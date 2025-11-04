<template>
  <q-layout view="hHh lpR fFf">
    <!-- هدر بالا -->
    <q-header elevated class="bg-primary text-white" style="border-radius: 5px">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="rightDrawerOpen = !rightDrawerOpen" />
        <q-toolbar-title style="text-align: center"
          >سامانه مدیریت تجهیزات سخت‌افزاری</q-toolbar-title
        >
      </q-toolbar>
    </q-header>

    <!-- منوی سمت راست -->
    <q-drawer
      v-model="rightDrawerOpen"
      show-if-above
      side="right"
      bordered
      :width="150"
      class="bg-grey-1"
    >
      <q-list dense>
        <q-item to="/dashboard" exact clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>داشبورد</q-item-section>
        </q-item>

        <q-item   v-if="user?.role_id === 1"  to="/cities" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>شهرستان‌ها</q-item-section>
        </q-item>

        <q-item to="/branches" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>شعب</q-item-section>
        </q-item>

        <q-item to="/employees" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>کارمندان</q-item-section>
        </q-item>

        <q-item to="/computers" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>رایانه‌ها</q-item-section>
        </q-item>

        <q-item to="/printers" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>پرینترها</q-item-section>
        </q-item>

        <q-item to="/scanners" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>اسکنرها</q-item-section>
        </q-item>

        <q-item to="/reports" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>گزارشات</q-item-section>
        </q-item>

        <q-item to="/login" clickable v-ripple active-class="bg-primary text-white">
          <q-item-section>خروج</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- محتوای صفحات -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>

import { ref, onMounted } from 'vue';
const rightDrawerOpen = ref(true)
const user = ref(null);

onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
});
</script>

<style scoped>
.q-drawer {
  text-align: right;
  direction: rtl;
}
.q-item {
  font-size: 18px;
  padding: 12px 16px;
}
.q-item .q-focus-helper,
.q-focusable,
.q-manual-focusable,
.q-hoverable {
  border-radius: 5px;
}
</style>
