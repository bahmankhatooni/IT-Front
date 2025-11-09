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
    // مرتب‌سازی بر اساس ID به صورت نزولی (جدیدترین اول)
    cities.value = res.data.sort((a, b) => b.id - a.id)
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
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
