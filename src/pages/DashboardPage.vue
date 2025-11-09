<template>
  <q-page class="dashboard-page" padding>
    <!-- کارت خوش‌آمدگویی -->
    <q-card class="welcome-card main-card">
      <q-card-section class="card-header welcome-header">
        <div class="header-content">
          <q-icon name="dashboard" class="header-icon" />
          <div class="header-text">
            <div class="text-h4">داشبورد مدیریتی</div>
            <div class="text-subtitle">خلاصه‌ای از وضعیت تجهیزات سخت‌افزاری</div>
          </div>
        </div>
        <div class="welcome-user">
          <q-avatar color="primary" text-color="white" size="60px" class="user-avatar">
            <q-icon name="person" size="30px" />
          </q-avatar>
          <div class="user-greeting">
            <div class="greeting-text">سلام، {{ user?.city?.name || 'کاربر' }}!</div>
            <div class="greeting-date">{{ currentDate }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- کارت‌های آمار کلی -->
    <div class="row q-col-gutter-md stats-section">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card computer-card" @click="$router.push('/computers')">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="desktop_windows" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalComputers || 0 }}</div>
              <div class="stat-label">رایانه‌ها</div>
              <div class="stat-description">تجهیزات فعال</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card printer-card" @click="$router.push('/printers')">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="print" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalPrinters || 0 }}</div>
              <div class="stat-label">پرینترها</div>
              <div class="stat-description">دستگاه‌های چاپ</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card scanner-card" @click="$router.push('/scanners')">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="scanner" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalScanners || 0 }}</div>
              <div class="stat-label">اسکنرها</div>
              <div class="stat-description">دستگاه‌های اسکن</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card employee-card" @click="$router.push('/employees')">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="people" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalEmployees || 0 }}</div>
              <div class="stat-label">کارمندان</div>
              <div class="stat-description">پرسنل سازمان</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- بخش خلاصه وضعیت -->
    <div class="row q-col-gutter-md summary-section">
      <div class="col-12 col-md-8">
        <q-card class="summary-card main-card">
          <q-card-section class="card-header">
            <div class="header-content">
              <q-icon name="summarize" class="header-icon" />
              <div class="header-text">
                <div class="text-h5">خلاصه تجهیزات</div>
                <div class="text-subtitle">توزیع کلی تجهیزات در سیستم</div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="summary-content">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-icon computer">
                  <q-icon name="desktop_windows" />
                </div>
                <div class="summary-details">
                  <div class="summary-title">رایانه‌ها</div>
                  <div class="summary-count">{{ stats.totalComputers || 0 }} دستگاه</div>
                  <div class="summary-percent">{{ getComputerPercent() }}% از کل</div>
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-icon printer">
                  <q-icon name="print" />
                </div>
                <div class="summary-details">
                  <div class="summary-title">پرینترها</div>
                  <div class="summary-count">{{ stats.totalPrinters || 0 }} دستگاه</div>
                  <div class="summary-percent">{{ getPrinterPercent() }}% از کل</div>
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-icon scanner">
                  <q-icon name="scanner" />
                </div>
                <div class="summary-details">
                  <div class="summary-title">اسکنرها</div>
                  <div class="summary-count">{{ stats.totalScanners || 0 }} دستگاه</div>
                  <div class="summary-percent">{{ getScannerPercent() }}% از کل</div>
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-icon antivirus">
                  <q-icon name="security" />
                </div>
                <div class="summary-details">
                  <div class="summary-title">آنتی ویروس</div>
                  <div class="summary-count">{{ stats.totalAntivirus || 0 }} دستگاه</div>
                  <div class="summary-percent">{{ getAntivirusPercent() }}% از کل</div>
                </div>
              </div>



              <div class="summary-item total">
                <div class="summary-icon total">
                  <q-icon name="devices" />
                </div>
                <div class="summary-details">
                  <div class="summary-title">کل تجهیزات</div>
                  <div class="summary-count">{{ getTotalEquipment() }} دستگاه</div>
                  <div class="summary-percent">۱۰۰% از کل</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="quick-stats-card main-card">
          <q-card-section class="card-header">
            <div class="header-content">
              <q-icon name="insights" class="header-icon" />
              <div class="header-text">
                <div class="text-h5">آمار سریع</div>
                <div class="text-subtitle">نمای کلی سیستم</div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="quick-stats-content">

            <div class="quick-stat-item" v-if="user?.role_id === 1">
              <q-icon name="location_city" color="secondary" size="24px" />
              <div class="quick-stat-info">
                <div class="quick-stat-label">حوزه‌های قضایی</div>
                <div class="quick-stat-value">{{ stats.totalCities || 0 }} حوزه</div>
              </div>
            </div>

            <div class="quick-stat-item">
              <q-icon name="business" color="primary" size="24px" />
              <div class="quick-stat-info">
                <div class="quick-stat-label">شعب فعال</div>
                <div class="quick-stat-value">{{ stats.totalBranches || 0 }} شعبه</div>
              </div>
            </div>

            <div class="quick-stat-item">
              <q-icon name="today" color="accent" size="24px" />
              <div class="quick-stat-info">
                <div class="quick-stat-label">تجهیزات امروز</div>
                <div class="quick-stat-value">{{ stats.todayEquipment || 0 }} مورد</div>
              </div>
            </div>

          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- بخش آخرین فعالیت‌ها -->
    <div class="row q-col-gutter-md activity-section">
      <div class="col-12 col-lg-6">
        <q-card class="recent-card main-card">
          <q-card-section class="card-header">
            <div class="header-content">
              <q-icon name="update" class="header-icon" />
              <div class="header-text">
                <div class="text-h5">تجهیزات اخیر</div>
                <div class="text-subtitle">جدیدترین تجهیزات ثبت شده</div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="recent-content">
            <div v-if="recentEquipment.length === 0" class="no-data">
              <q-icon name="inventory_2" size="48px" color="grey-4" />
              <div class="no-data-text">هیچ تجهیزاتی یافت نشد</div>
            </div>
            <div v-else class="recent-list">
              <div v-for="item in recentEquipment" :key="item.id" class="recent-item">
                <div class="recent-icon" :class="item.type">
                  <q-icon :name="getEquipmentIcon(item.type)" />
                </div>
                <div class="recent-details">
                  <div class="recent-title">{{ item.name || item.model }}</div>
                  <div class="recent-subtitle">{{ getEquipmentType(item.type) }}</div>
                  <div class="recent-branch">{{ item.branch?.name }}</div>
                </div>
                <div class="recent-time">{{ formatTime(item.created_at) }}</div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="center" class="recent-actions">
            <q-btn
              label="مشاهده همه تجهیزات"
              color="primary"
              flat
              @click="$router.push('/computers')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card class="quick-actions-card main-card">
          <q-card-section class="card-header">
            <div class="header-content">
              <q-icon name="flash_on" class="header-icon" />
              <div class="header-text">
                <div class="text-h5">دسترسی سریع</div>
                <div class="text-subtitle">عملیات‌های پرکاربرد</div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="quick-actions-content">
            <div class="quick-actions-grid">
              <q-btn
                color="primary"
                icon="add"
                label="رایانه جدید"
                class="quick-action-btn"
                @click="$router.push('/computers?action=add')"
              />
              <q-btn
                color="secondary"
                icon="add"
                label="پرینتر جدید"
                class="quick-action-btn"
                @click="$router.push('/printers?action=add')"
              />
              <q-btn
                color="accent"
                icon="add"
                label="اسکنر جدید"
                class="quick-action-btn"
                @click="$router.push('/scanners?action=add')"
              />
              <q-btn
                color="positive"
                icon="person_add"
                label="کارمند جدید"
                class="quick-action-btn"
                @click="$router.push('/employees?action=add')"
              />
              <q-btn
                color="info"
                icon="assessment"
                label="گزارشات کامل"
                class="quick-action-btn"
                @click="$router.push('/reports')"
              />
              <q-btn
                color="warning"
                icon="settings"
                label="تنظیمات سیستم"
                class="quick-action-btn"
                @click="$router.push('/settings')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import { api } from 'boot/axios'


const user = ref(null)
const stats = ref({})
const recentEquipment = ref([])

// تاریخ جاری فارسی
const currentDate = computed(() => {
  const now = new Date()
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }
  return new Intl.DateTimeFormat('fa-IR', options).format(now)
})

// توابع کمکی
const getEquipmentIcon = (type) => {
  const icons = {
    computer: 'desktop_windows',
    printer: 'print',
    scanner: 'scanner'
  }
  return icons[type] || 'devices'
}

const getEquipmentType = (type) => {
  const types = {
    computer: 'رایانه',
    printer: 'پرینتر',
    scanner: 'اسکنر'
  }
  return types[type] || 'تجهیز'
}

const formatTime = (dateString) => {
  if (!dateString) return 'اخیراً'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes} دقیقه پیش`
  if (hours < 24) return `${hours} ساعت پیش`
  return `${days} روز پیش`
}

// محاسبه درصدها
const getComputerPercent = () => {
  const total = getTotalEquipment()
  return total > 0 ? Math.round((stats.value.totalComputers / total) * 100) : 0
}

const getPrinterPercent = () => {
  const total = getTotalEquipment()
  return total > 0 ? Math.round((stats.value.totalPrinters / total) * 100) : 0
}

const getScannerPercent = () => {
  const total = getTotalEquipment()
  return total > 0 ? Math.round((stats.value.totalScanners / total) * 100) : 0
}

const getAntivirusPercent = () => {
  const total = stats.value.totalComputers;
  return total > 0 ? Math.round((stats.value.totalAntivirus / total) * 100) : 0
}


const getTotalEquipment = () => {
  return (stats.value.totalComputers || 0) +
    (stats.value.totalPrinters || 0) +
    (stats.value.totalScanners || 0)
}

// بارگذاری داده‌ها
async function loadDashboardData() {
  try {
    // بارگذاری آمار کلی
    const statsRes = await api.get('/dashboard/stats')
    stats.value = statsRes.data

    // بارگذاری آخرین تجهیزات
    const equipmentRes = await api.get('/dashboard/recent-equipment')
    recentEquipment.value = equipmentRes.data
  } catch (err) {
    console.error('خطا در بارگذاری داده‌های داشبورد:', err)
    // داده‌های نمونه برای نمایش
    // stats.value = {
    //   totalComputers: 45,
    //   totalPrinters: 23,
    //   totalScanners: 12,
    //   totalEmployees: 78,
    //   totalBranches: 8,
    //   totalCities: 3,
    //   todayEquipment: 2,
    //   monthlyGrowth: 12
    // }
    recentEquipment.value = [
      {
        id: 1,
        type: 'computer',
        name: 'PC-Admin-01',
        branch: { name: 'شعبه مرکزی' },
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 2,
        type: 'printer',
        model: 'HP LaserJet Pro',
        branch: { name: 'شعبه غرب' },
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      },
      {
        id: 3,
        type: 'scanner',
        model: 'Canon DR-2020',
        branch: { name: 'شعبه شرق' },
        created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      }
    ]
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
  loadDashboardData()
})
</script>

<style scoped>
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
