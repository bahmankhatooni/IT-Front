<template>
  <q-page class="cities-page" padding>
    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="location_city" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">مدیریت حوزه‌های قضایی</div>
            <div class="text-subtitle">مدیریت و ویرایش اطلاعات حوزه‌ها</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="user?.role_id === 1" class="content-section">
        <!-- بخش اقدامات و جستجو -->
        <div class="action-bar">
          <q-btn
            color="primary"
            label="افزودن حوزه جدید"
            @click="openAddDialog"
            class="add-btn"
            icon="add"
          />
          <q-space />
          <q-input
            dense
            outlined
            debounce="500"
            v-model="search"
            placeholder="جستجوی نام حوزه..."
            @update:model-value="loadCities"
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- جدول حوزه‌ها -->
        <q-table
          :rows="cities"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          class="cities-table"
          rows-per-page-label="تعداد در صفحه"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td align="center" class="actions-cell">
              <q-btn
                dense
                flat
                icon="edit"
                color="primary"
                @click="openEditDialog(props.row)"
                class="action-btn"
                size="12px"
              />
              <q-btn
                dense
                flat
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
                class="action-btn"
                size="12px"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <!-- پیام عدم دسترسی -->
      <q-card-section v-else class="access-denied">
        <div class="text-center">
          <q-icon name="warning" size="64px" color="orange" />
          <div class="text-h6 q-mt-md">عدم دسترسی</div>
          <div class="text-subtitle1">شما مجوز دسترسی به این بخش را ندارید.</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- دیالوگ افزودن/ویرایش -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon :name="isEdit ? 'edit' : 'add'" class="dialog-icon" />
            {{ isEdit ? 'ویرایش حوزه' : 'افزودن حوزه جدید' }}
          </div>
        </q-card-section>
        <!-- پیام خطا -->
        <q-banner
          style="color: red;"
          v-if="errorMessage"
          class="error-banner q-mb-md"
          rounded
          dense
        >
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ errorMessage }}
        </q-banner>
        <q-card-section class="dialog-body">
          <q-input
            v-model="form.code"
            label="کد حوزه"
            outlined
            dense
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="tag" class="field-icon" />
            </template>
          </q-input>

          <q-input
            v-model="form.name"
            label="نام حوزه"
            outlined
            dense
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="location_city" class="field-icon" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="center" class="dialog-actions">
          <q-btn
            :label="isEdit ? 'ویرایش' : 'ثـبــت'"
            color="primary"
            @click="saveCity"
            class="submit-btn"
            :loading="loading"
          />
          <q-btn
            label="انصراف"
            color="grey"
            v-close-popup
            class="cancel-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- دیالوگ تایید حذف -->
    <q-dialog v-model="deleteDialog">
      <q-card class="delete-dialog-card">
        <q-card-section class="delete-header">
          <q-icon name="warning" color="orange" size="32px" />
          <div class="delete-title">تأیید حذف</div>
        </q-card-section>

        <q-card-section class="delete-body">
          آیا از حذف حوزه "{{ selectedCity.name }}" اطمینان دارید؟
          <div class="delete-warning">این عمل غیرقابل بازگشت است!</div>
        </q-card-section>

        <q-card-actions align="center" class="delete-actions">
          <q-btn
            label="تـأیید حذف"
            color="negative"
            @click="deleteCity"
            class="delete-confirm-btn"
          />
          <q-btn
            label="انصراف"
            color="grey"
            v-close-popup
            class="delete-cancel-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const cities = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null)
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedCity = ref(null)
const search = ref('')
const form = ref({ id: null, code: '', name: '' })

const columns = [
  {
    name: 'code',
    label: 'کد حوزه',
    field: 'code',
    align: 'center',
    sortable: true
  },
  {
    name: 'name',
    label: 'نام حوزه',
    field: 'name',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'عملیات',
    align: 'center',
    sortable: false
  },
]

// واکشی لیست شهرها
async function loadCities() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/cities', {
      params: { search: search.value || '' }
    })
    cities.value = res.data
  } catch (err) {
    if (err.response?.status === 401) {
      errorMessage.value = 'دسترسی غیرمجاز یا توکن منقضی شده است.'
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در دریافت داده‌ها'
    }
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = { id: null, code: '', name: '' }
  errorMessage.value = ''
  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = { ...row }
  errorMessage.value = ''
  dialog.value = true
}

// ذخیره یا ویرایش حوزه
async function saveCity() {
  if (!form.value.code || !form.value.name) {
    errorMessage.value = 'لطفاً تمام فیلدها را پر کنید'
    return
  }

  const submitData = {
    code: form.value.code,
    name: form.value.name
  }

  try {
    if (isEdit.value) {
      await api.put(`/cities/${form.value.id}`, submitData)
    } else {
      await api.post('/cities', submitData)
    }
    await loadCities()
    dialog.value = false
  } catch (err) {
    if (err.response && err.response.status === 422 && err.response.data.errors) {
      const errors = err.response.data.errors
      errorMessage.value = Object.values(errors).flat().join('، ')
    } else if (err.response?.status === 401) {
      errorMessage.value = 'دسترسی غیرمجاز یا توکن منقضی شده است.'
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedCity.value = row
  deleteDialog.value = true
}

async function deleteCity() {
  try {
    await api.delete(`/cities/${selectedCity.value.id}`)
    await loadCities()
    deleteDialog.value = false
  } catch (err) {
    if (err.response?.status === 401) {
      errorMessage.value = 'دسترسی غیرمجاز یا توکن منقضی شده است.'
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در حذف'
    }
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
  loadCities()
})
</script>

<style scoped>
.cities-page {
  background: transparent;
  font-family: Vazirmatn, serif;
}

/* کارت اصلی */
.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
  border: 1px solid #e3f2fd;
  background: white;
}

/* هدر کارت */
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

/* بخش محتوا */
.content-section {
  padding: 24px;
}

/* نوار اقدامات */
.action-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.add-btn {
  border-radius: 10px;
  padding: 8px 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.search-input {
  min-width: 280px;
  border-radius: 10px;
}

/* جدول */
.cities-table {
  border-radius: 12px;
  overflow: hidden;
}

.cities-table :deep(.q-table__top) {
  background: #f8fbff;
  border-bottom: 1px solid #e3f2fd;
}

.cities-table :deep(.q-table__control) {
  direction: rtl;
}

/* سلول اقدامات */
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

/* بخش عدم دسترسی */
.access-denied {
  padding: 60px 24px;
  text-align: center;
  color: #666;
}

/* دیالوگ‌ها */
.dialog-card {
  min-width: 400px;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  padding: 20px;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
}

.dialog-icon {
  font-size: 24px;
}

.dialog-body {
  padding: 24px;
}

.form-field {
  margin-bottom: 16px;
  border-radius: 10px;
}

.form-field :deep(.q-field__control) {
  border-radius: 10px;
}

.field-icon {
  color: #42a5f5;
}

.dialog-actions {
  padding: 16px 24px 24px;
  gap: 12px;
}

.submit-btn, .cancel-btn {
  min-width: 120px;
  border-radius: 10px;
  font-weight: bold;
}

/* دیالوگ حذف */
.delete-dialog-card {
  min-width: 350px;
  border-radius: 16px;
  overflow: hidden;
}

.delete-header {
  background: #fff3e0;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #ffcc80;
}

.delete-title {
  font-size: 18px;
  font-weight: bold;
  color: #f57c00;
  margin-top: 8px;
}

.delete-body {
  padding: 24px;
  text-align: center;
  font-size: 16px;
}

.delete-warning {
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
  font-weight: bold;
}

.delete-actions {
  padding: 16px 24px 24px;
  gap: 12px;
}

.delete-confirm-btn, .delete-cancel-btn {
  min-width: 120px;
  border-radius: 10px;
  font-weight: bold;
}

/* بنر خطا */
.error-banner {
  border-radius: 10px;
  border: 1px solid #ffcdd2;
}

/* استایل‌های responsive */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
  }

  .dialog-card {
    min-width: 90vw;
    margin: 10px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .actions-cell {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 16px;
  }

  .card-header {
    padding: 20px 16px;
  }

  .dialog-body {
    padding: 20px 16px;
  }
}

/* انیمیشن‌ها */
.main-card {
  animation: fadeInUp 0.5s ease-out;
}

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

/* استایل‌های سفارشی برای فیلدها */
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
