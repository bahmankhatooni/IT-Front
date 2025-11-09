<!-- ReportsPage.vue -->
<template>
  <q-page class="reports-page" padding>
    <!-- کارت اصلی -->
    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="assessment" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">گزارش کامپیوترها</div>
            <div class="text-subtitle">مدیریت و مشاهده گزارشات کامپیوترها</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="content-section">
        <!-- بخش فیلترها -->
        <div class="filters-section">
          <div class="text-h6 q-mb-md">فیلترها</div>

          <div class="row q-col-gutter-md">
            <!-- انتخاب حوزه -->
            <div class="col-12 col-md-4" v-if="user?.role_id === 1">
              <q-select
                v-model="filters.city_id"
                :options="cities"
                option-value="id"
                option-label="name"
                label="حوزه قضایی"
                outlined
                dense
                emit-value
                map-options
                clearable
                class="filter-field"
                @update:model-value="loadComputers"
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" class="field-icon" />
                </template>
              </q-select>
            </div>

            <!-- انتخاب شعبه -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="filters.branch_id"
                :options="branches"
                option-value="id"
                option-label="name"
                label="شعبه"
                outlined
                dense
                emit-value
                map-options
                clearable
                class="filter-field"
                @update:model-value="loadComputers"
              >
                <template v-slot:prepend>
                  <q-icon name="business" class="field-icon" />
                </template>
              </q-select>
            </div>

            <!-- جستجو -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="filters.search"
                label="جستجوی نام، سیستم عامل، RAM و ..."
                outlined
                dense
                clearable
                class="filter-field"
                @update:model-value="onSearchInput"
              >
                <template v-slot:prepend>
                  <q-icon name="search" class="field-icon" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- آمار کلی -->
        <div v-if="computers.length > 0" class="stats-section q-mt-xl">
          <div class="row q-col-gutter-md">
            <div class="col-6 col-sm-3">
              <q-card class="stat-card">
                <q-card-section class="stat-content">
                  <q-icon name="desktop_windows" color="primary" size="32px" />
                  <div class="stat-info">
                    <div class="stat-number">{{ computers.length }}</div>
                    <div class="stat-label">تعداد کل</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6 col-sm-3">
              <q-card class="stat-card">
                <q-card-section class="stat-content">
                  <q-icon name="security" color="positive" size="32px" />
                  <div class="stat-info">
                    <div class="stat-number">{{ antivirusCount }}</div>
                    <div class="stat-label">آنتی‌ویروس فعال</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6 col-sm-3">
              <q-card class="stat-card">
                <q-card-section class="stat-content">
                  <q-icon name="storage" color="secondary" size="32px" />
                  <div class="stat-info">
                    <div class="stat-number">{{ ssdCount }}</div>
                    <div class="stat-label">هارد SSD</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6 col-sm-3">
              <q-card class="stat-card">
                <q-card-section class="stat-content">
                  <q-icon name="memory" color="accent" size="32px" />
                  <div class="stat-info">
                    <div class="stat-number">{{ avgRam }}</div>
                    <div class="stat-label">میانگین RAM</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- جدول کامپیوترها -->
        <div class="table-section q-mt-xl">
          <div class="text-h6 q-mb-md">لیست کامپیوترها</div>

          <q-table
            :rows="computers"
            :columns="columns"
            row-key="id"
            flat
            bordered
            :loading="loading"
            class="computers-table"
            :pagination="{ rowsPerPage: 15 }"
            rows-per-page-label="تعداد در صفحه"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <!-- وضعیت آنتی‌ویروس -->
            <template v-slot:body-cell-antivirus="props">
              <q-td :props="props">
                <q-badge :color="props.value ? 'positive' : 'negative'" class="status-badge">
                  {{ props.value ? 'فعال' : 'غیرفعال' }}
                </q-badge>
              </q-td>
            </template>

            <!-- نوع هارد -->
            <template v-slot:body-cell-hard="props">
              <q-td :props="props">
                <q-badge :color="props.value ? 'primary' : 'grey'" class="status-badge">
                  {{ props.value ? 'SSD' : 'HDD' }}
                </q-badge>
              </q-td>
            </template>

            <!-- اقدامات -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="actions-cell">
                <q-btn
                  dense
                  flat
                  icon="visibility"
                  color="info"
                  @click="viewComputer(props.row)"
                  class="action-btn"
                  size="12px"
                >
                  <q-tooltip>مشاهده جزئیات</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </div>

        <!-- حالت بدون داده -->
        <div v-if="!loading && computers.length === 0" class="no-data-section text-center q-mt-xl">
          <q-icon name="desktop_windows" size="80px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">هیچ کامپیوتری یافت نشد</div>
          <div class="text-subtitle1 q-mt-sm text-grey-5">
            <span v-if="hasFilters">با فیلترهای فعلی هیچ کامپیوتری وجود ندارد</span>
            <span v-else>هنوز کامپیوتری ثبت نشده است</span>
          </div>
          <q-btn
            v-if="hasFilters"
            label="حذف فیلترها"
            color="primary"
            @click="resetFilters"
            class="q-mt-md"
            icon="clear_all"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- دیالوگ مشاهده جزئیات -->
    <q-dialog v-model="viewDialog">
      <q-card class="view-dialog-card">
        <q-card-section class="view-header">
          <q-icon name="visibility" color="info" size="32px" />
          <div class="view-title">مشاهده جزئیات کامپیوتر</div>
        </q-card-section>

        <q-card-section class="view-body" v-if="selectedComputer">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="selectedComputer.name" label="نام دستگاه" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="selectedComputer.employee_name" label="کارمند" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="selectedComputer.branch_name" label="شعبه" outlined dense readonly />
            </div>
            <div class="col-6" v-if="user?.role_id === 1">
              <q-input v-model="selectedComputer.city_name" label="حوزه قضایی" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="selectedComputer.os" label="سیستم عامل" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="selectedComputer.ram" label="رم" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="selectedComputer.cpu" label="پردازنده" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="selectedComputer.monitor" label="مانیتور" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="selectedComputer.mb" label="مادربرد" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input :value="selectedComputer.antivirus ? 'فعال' : 'غیرفعال'" label="آنتی‌ویروس" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input :value="selectedComputer.hard ? 'SSD' : 'HDD'" label="نوع هارد" outlined dense readonly />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="view-actions">
          <q-btn
            label="بستن"
            color="grey"
            v-close-popup
            class="close-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const user = ref(null)
const loading = ref(false)
const computers = ref([])
const cities = ref([])
const branches = ref([])
const viewDialog = ref(false)
const selectedComputer = ref(null)

// فیلترها
const filters = ref({
  city_id: null,
  branch_id: null,
  search: ''
})

// ستون‌های جدول
const columns = [
  {
    name: 'name',
    label: 'نام دستگاه',
    field: 'name',
    align: 'center',
    sortable: true
  },
  {
    name: 'employee',
    label: 'کارمند',
    field: 'employee_name',
    align: 'center',
    sortable: true
  },
  {
    name: 'branch',
    label: 'شعبه',
    field: 'branch_name',
    align: 'center',
    sortable: true
  },
  {
    name: 'city',
    label: 'حوزه',
    field: 'city_name',
    align: 'center',
    sortable: true,
    vIf: 'user?.role_id === 1'
  },
  {
    name: 'os',
    label: 'سیستم عامل',
    field: 'os',
    align: 'center',
    sortable: true
  },
  {
    name: 'ram',
    label: 'رم',
    field: 'ram',
    align: 'center',
    sortable: true
  },
  {
    name: 'antivirus',
    label: 'آنتی‌ویروس',
    field: 'antivirus',
    align: 'center',
    sortable: true
  },
  {
    name: 'hard',
    label: 'هارد',
    field: 'hard',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'عملیات',
    align: 'center',
    sortable: false
  }
]

// computed properties
const antivirusCount = computed(() => {
  return computers.value.filter(comp => comp.antivirus).length
})

const ssdCount = computed(() => {
  return computers.value.filter(comp => comp.hard).length
})

const avgRam = computed(() => {
  const rams = computers.value
    .map(comp => {
      const ramMatch = comp.ram?.match(/(\d+)/)
      return ramMatch ? parseInt(ramMatch[1]) : 0
    })
    .filter(ram => ram > 0)

  if (rams.length === 0) return 0
  return Math.round(rams.reduce((a, b) => a + b, 0) / rams.length)
})

const hasFilters = computed(() => {
  return filters.value.city_id || filters.value.branch_id || filters.value.search
})

// توابع
async function loadFilterOptions() {
  try {
    const res = await api.get('/reports/filter-options')
    if (res.data.success) {
      cities.value = res.data.cities || []
      branches.value = res.data.branches || []
    }
  } catch (err) {
    console.error('خطا در دریافت گزینه‌های فیلتر:', err)
  }
}

async function loadComputers() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.city_id) params.city_id = filters.value.city_id
    if (filters.value.branch_id) params.branch_id = filters.value.branch_id
    if (filters.value.search) params.search = filters.value.search

    const res = await api.get('/reports/computers', { params })

    if (res.data.success) {
      computers.value = res.data.data || []
      $q.notify({
        type: 'positive',
        message: res.data.message,
        position: 'top',
        timeout: 2000
      })
    } else {
      throw new Error(res.data.message)
    }
  } catch (err) {
    console.error('خطا در دریافت کامپیوترها:', err)
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'خطا در دریافت داده‌ها',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  // تاخیر برای جستجو
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadComputers()
  }, 500)
}

let searchTimeout = null

function resetFilters() {
  filters.value = {
    city_id: null,
    branch_id: null,
    search: ''
  }
  loadComputers()
}

function viewComputer(computer) {
  selectedComputer.value = computer
  viewDialog.value = true
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
  loadFilterOptions()
  loadComputers()
})
</script>

<style scoped>
.reports-page {
  background: transparent;
  font-family: Vazirmatn, serif;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
  border: 1px solid #e3f2fd;
  background: white;
  animation: fadeInUp 0.5s ease-out;
}

.card-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 36px;
  color: white;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.text-h5 {
  font-weight: bold;
  margin-bottom: 4px;
}

.text-subtitle {
  opacity: 0.9;
  font-size: 14px;
}

.content-section {
  padding: 24px;
}

/* استایل فیلترها */
.filter-field {
  margin-bottom: 16px;
}

.filter-field :deep(.q-field__control) {
  border-radius: 10px;
}

.field-icon {
  color: #42a5f5;
}

/* کارت‌های آمار */
.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-info {
  text-align: right;
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* جدول */
.computers-table {
  border-radius: 12px;
  overflow: hidden;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  background: rgba(25, 118, 210, 0.1);
}

/* دیالوگ */
.view-dialog-card {
  min-width: 600px;
  border-radius: 16px;
  overflow: hidden;
}

.view-header {
  background: linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%);
  color: white;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #bbdefb;
}

.view-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 8px;
}

.view-body {
  padding: 24px;
}

.view-actions {
  padding: 16px 24px 24px;
}

.close-btn {
  min-width: 120px;
  border-radius: 10px;
  font-weight: bold;
}

/* بخش بدون داده */
.no-data-section {
  padding: 60px 20px;
}

/* انیمیشن */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* استایل‌های responsive */
@media (max-width: 768px) {
  .content-section {
    padding: 16px;
  }

  .card-header {
    padding: 20px 16px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .stat-content {
    padding: 16px;
  }

  .stat-number {
    font-size: 20px;
  }

  .view-dialog-card {
    min-width: 90vw;
    margin: 10px;
  }
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

:deep(.q-field--outlined .q-field__control:hover) {
  border-color: #42a5f5;
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}
</style>
