<template>
  <q-page class="branches-page" padding>
    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="business" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">مدیریت شعبات</div>
            <div class="text-subtitle">مدیریت و ویرایش اطلاعات شعبات</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="content-section">
        <!-- بخش اقدامات و جستجو -->
        <div class="action-bar">
          <q-btn
            color="primary"
            label="افزودن شعبه جدید"
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
            placeholder="جستجوی نام شعبه..."
            @update:model-value="loadBranches"
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- جدول شعبات -->
        <q-table
          :rows="branches"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          class="branches-table"
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
    </q-card>

    <!-- دیالوگ افزودن/ویرایش -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon :name="isEdit ? 'edit' : 'add'" class="dialog-icon" />
            {{ isEdit ? 'ویرایش شعبه' : 'افزودن شعبه جدید' }}
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
            label="کد شعبه"
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
            label="نام شعبه"
            outlined
            dense
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="business" class="field-icon" />
            </template>
          </q-input>

          <!-- فقط برای ادمین -->
          <q-select
            v-if="user?.role_id === 1"
            v-model="selectedCity"
            :options="cities"
            option-value="id"
            option-label="name"
            label="انتخاب شهرستان"
            outlined
            dense
            emit-value
            map-options
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="location_city" class="field-icon" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="center" class="dialog-actions">
          <q-btn
            :label="isEdit ? 'ویرایش' : 'ثـبــت'"
            color="primary"
            @click="saveBranch"
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
          آیا از حذف شعبه "{{ selectedBranch.name }}" اطمینان دارید؟
          <div class="delete-warning">این عمل غیرقابل بازگشت است!</div>
        </q-card-section>

        <q-card-actions align="center" class="delete-actions">
          <q-btn
            label="تـأیید حذف"
            color="negative"
            @click="deleteBranch"
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

const search = ref('')
const branches = ref([])
const cities = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null)
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedBranch = ref(null)
const selectedCity = ref(null)
const form = ref({ id: null, code: '', name: '', city_id: null })

const columns = [
  {
    name: 'code',
    label: 'کد شعبه',
    field: 'code',
    align: 'center',
    sortable: true
  },
  {
    name: 'name',
    label: 'نام شعبه',
    field: 'name',
    align: 'center',
    sortable: true
  },
  {
    name: 'city',
    label: 'نام حوزه',
    field: row => row.city?.name || '-',
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

async function loadBranches() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/branches', {
      params: { search: search.value || '' }
    })
    // مرتب‌سازی بر اساس ID به صورت نزولی (جدیدترین اول)
    branches.value = res.data.sort((a, b) => b.id - a.id)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'خطا در دریافت داده‌ها'
  } finally {
    loading.value = false
  }
}

async function loadCities() {
  try {
    const res = await api.get('/cities')
    cities.value = res.data
  } catch (err) {
    console.error('خطا در دریافت حوزه‌ها:', err)
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = { id: null, code: '', name: '', city_id: null }
  selectedCity.value = null
  errorMessage.value = ''
  if (user.value?.role_id === 1) loadCities()
  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = { id: row.id, code: row.code, name: row.name, city_id: row.city_id }
  selectedCity.value = row.city_id
  errorMessage.value = ''
  if (user.value?.role_id === 1) loadCities()
  dialog.value = true
}

async function saveBranch() {
  if (user.value?.role_id === 1) {
    form.value.city_id = selectedCity.value
  }

  if (!form.value.code || !form.value.name) {
    errorMessage.value = 'لطفاً تمام فیلدها را پر کنید'
    return
  }

  // اگر city_user هست، city_id خودش تنظیم میشه
  if (user.value?.role_id !== 1) {
    form.value.city_id = user.value.city_id
  }

  const submitData = {
    code: form.value.code,
    name: form.value.name,
    city_id: form.value.city_id
  }

  try {
    if (isEdit.value) {
      await api.put(`/branches/${form.value.id}`, submitData)
    } else {
      await api.post('/branches', submitData)
    }
    dialog.value = false
    loadBranches()
  } catch (err) {
    console.error('خطا در ثبت شعبه:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedBranch.value = row
  deleteDialog.value = true
}

async function deleteBranch() {
  try {
    await api.delete(`/branches/${selectedBranch.value.id}`)
    loadBranches()
    deleteDialog.value = false
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'خطا در حذف'
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
  loadBranches()
})
</script>

<style scoped>
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
