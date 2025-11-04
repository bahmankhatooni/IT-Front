<template>
  <q-page class="bg-light-blue-1" dir="rtl">
    <div class="q-pa-md">
      <div class="text-h5 text-center text-primary q-mb-lg">داشبورد مدیریت تجهیزات</div>

      <q-row gutter-md>
        <q-col v-for="card in cards" :key="card.label" xs="12" sm="6" md="4">
          <q-card :class="['hover-card', card.colorClass]">
            <q-card-section class="text-center text-white">
              <q-icon :name="card.icon" size="50px" class="q-mb-sm" />
              <div class="text-h6">{{ card.label }}</div>
              <div class="text-subtitle2">{{ card.subtitle }}</div>
            </q-card-section>
            <q-separator color="white" />
            <q-card-actions align="center">
              <q-btn flat label="مشاهده" class="text-white" @click="goTo(card.path)" />
            </q-card-actions>
          </q-card>
        </q-col>
      </q-row>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cards = ref([
  {
    label: 'شهرستان‌ها',
    subtitle: 'مدیریت شهرستان‌ها',
    icon: 'place',
    path: '/cities',
    colorClass: 'bg-blue',
  },
  { label: 'شعب', subtitle: 'مدیریت شعب', icon: 'store', path: '/branches', colorClass: 'bg-teal' },
  {
    label: 'کارمندان',
    subtitle: 'مدیریت کارمندان',
    icon: 'people',
    path: '/employees',
    colorClass: 'bg-orange',
  },
  {
    label: 'رایانه‌ها',
    subtitle: 'ثبت و مدیریت رایانه‌ها',
    icon: 'desktop_windows',
    path: '/computers',
    colorClass: 'bg-purple',
  },
  {
    label: 'پرینترها',
    subtitle: 'مدیریت پرینترها',
    icon: 'print',
    path: '/printers',
    colorClass: 'bg-pink',
  },
  {
    label: 'اسکنرها',
    subtitle: 'مدیریت اسکنرها',
    icon: 'scanner',
    path: '/scanners',
    colorClass: 'bg-green',
  },
  {
    label: 'گزارش‌ها',
    subtitle: 'گزارش‌گیری کامل',
    icon: 'assessment',
    path: '/reports',
    colorClass: 'bg-indigo',
  },
])

function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
.bg-light-blue-1 {
  background: linear-gradient(to left, #e3f2fd, #bbdefb);
  min-height: 100vh;
}

.hover-card {
  transition: all 0.3s ease;
  cursor: pointer;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* رنگ‌های کارت‌ها */
.bg-blue {
  background-color: #2196f3;
}
.bg-teal {
  background-color: #009688;
}
.bg-orange {
  background-color: #ff9800;
}
.bg-purple {
  background-color: #9c27b0;
}
.bg-pink {
  background-color: #e91e63;
}
.bg-green {
  background-color: #4caf50;
}
.bg-indigo {
  background-color: #3f51b5;
}
</style>
