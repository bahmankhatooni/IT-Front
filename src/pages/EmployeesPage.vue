<template>
  <q-page class="employees-page" padding>
    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="people" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">مدیریت کارکنان</div>
            <div class="text-subtitle">مدیریت و ویرایش اطلاعات کارمندان</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="content-section">
        <!-- بخش اقدامات و جستجو -->
        <div class="action-bar">
          <q-btn
            color="primary"
            label="افزودن کارمند جدید"
            @click="openAddDialog"
            class="add-btn"
            icon="person_add"
          />
          <q-space />
          <q-input
            dense
            outlined
            debounce="500"
            v-model="search"
            placeholder="جستجوی نام یا کد پرسنلی..."
            @update:model-value="loadEmployees"
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- جدول کارکنان -->
        <q-table
          :rows="employees"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          class="employees-table"
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
            <q-icon :name="isEdit ? 'edit' : 'person_add'" class="dialog-icon" />
            {{ isEdit ? 'ویرایش کارمند' : 'افزودن کارمند جدید' }}
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
            label="کد پرسنلی"
            outlined
            dense
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="badge" class="field-icon" />
            </template>
          </q-input>

          <q-input
            v-model="form.fname"
            label="نام"
            outlined
            dense
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="person" class="field-icon" />
            </template>
          </q-input>

          <q-input
            v-model="form.lname"
            label="نام خانوادگی"
            outlined
            dense
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="people" class="field-icon" />
            </template>
          </q-input>

          <!-- انتخاب حوزه برای ادمین -->
          <q-select
            v-if="user?.role_id === 1"
            v-model="selectedCity"
            :options="cities"
            option-value="id"
            option-label="name"
            label="انتخاب حوزه قضایی"
            outlined
            dense
            emit-value
            map-options
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
            @update:model-value="loadBranchesByCity"
          >
            <template v-slot:prepend>
              <q-icon name="location_city" class="field-icon" />
            </template>
          </q-select>

          <!-- انتخاب شعبه -->
          <q-select
            v-model="selectedBranch"
            :options="branches"
            option-value="id"
            option-label="name"
            label="انتخاب شعبه"
            outlined
            dense
            emit-value
            map-options
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="business" class="field-icon" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="center" class="dialog-actions">
          <q-btn
            :label="isEdit ? 'ویرایش' : 'ثـبــت'"
            color="primary"
            @click="saveEmployee"
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
          آیا از حذف کارمند "{{ selectedEmployee.fname }} {{ selectedEmployee.lname }}" اطمینان دارید؟
          <div class="delete-warning">این عمل غیرقابل بازگشت است!</div>
        </q-card-section>

        <q-card-actions align="center" class="delete-actions">
          <q-btn
            label="تـأیید حذف"
            color="negative"
            @click="deleteEmployee"
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
const employees = ref([])
const cities = ref([])
const branches = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null)
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedEmployee = ref(null)
const selectedCity = ref(null)
const selectedBranch = ref(null)

const form = ref({
  id: null,
  code: '',
  fname: '',
  lname: '',
  city_id: null,
  branch_id: null
})

const columns = [
  {
    name: 'code',
    label: 'کد پرسنلی',
    field: 'code',
    align: 'center',
    sortable: true
  },
  {
    name: 'fname',
    label: 'نام',
    field: 'fname',
    align: 'center',
    sortable: true
  },
  {
    name: 'lname',
    label: 'نام خانوادگی',
    field: 'lname',
    align: 'center',
    sortable: true
  },
  {
    name: 'branch',
    label: 'شعبه',
    field: row => row.branch?.name || '-',
    align: 'center',
    sortable: true
  },
  {
    name: 'city',
    label: 'حوزه قضایی',
    field: row => row.city?.name || '-',
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

async function loadEmployees() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/employees', {
      params: { search: search.value || '' }
    })
    // مرتب‌سازی بر اساس ID به صورت نزولی (جدیدترین اول)
    employees.value = res.data.sort((a, b) => b.id - a.id)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'خطا در دریافت اطلاعات'
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

async function loadBranchesByCity() {
  if (!selectedCity.value) return
  try {
    const res = await api.get('/branches', { params: { city_id: selectedCity.value } })
    branches.value = res.data
  } catch (err) {
    console.error('خطا در دریافت شعبات حوزه:', err)
  }
}

async function loadBranchesForUser() {
  try {
    const res = await api.get('/branches')
    branches.value = res.data
  } catch (err) {
    console.error('خطا در دریافت شعبات:', err)
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = { id: null, code: '', fname: '', lname: '', city_id: null, branch_id: null }
  selectedCity.value = null
  selectedBranch.value = null
  errorMessage.value = ''

  if (user.value?.role_id === 1) loadCities()
  else loadBranchesForUser()

  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = { ...row }
  selectedCity.value = row.city_id
  selectedBranch.value = row.branch_id
  errorMessage.value = ''

  if (user.value?.role_id === 1) {
    loadCities()
    loadBranchesByCity()
  } else {
    loadBranchesForUser()
  }

  dialog.value = true
}

async function saveEmployee() {
  if (user.value?.role_id === 1) {
    form.value.city_id = selectedCity.value
  } else {
    form.value.city_id = user.value.city_id
  }
  form.value.branch_id = selectedBranch.value

  if (!form.value.code || !form.value.fname || !form.value.lname || !form.value.branch_id) {
    errorMessage.value = 'لطفاً تمام فیلدها را پر کنید'
    return
  }

  const submitData = {
    code: form.value.code,
    fname: form.value.fname,
    lname: form.value.lname,
    city_id: form.value.city_id,
    branch_id: form.value.branch_id
  }

  try {
    if (isEdit.value) {
      await api.put(`/employees/${form.value.id}`, submitData)
    } else {
      await api.post('/employees', submitData)
    }
    dialog.value = false
    loadEmployees()
  } catch (err) {
    console.error('خطا در ثبت کارمند:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedEmployee.value = row
  deleteDialog.value = true
}

async function deleteEmployee() {
  try {
    await api.delete(`/employees/${selectedEmployee.value.id}`)
    loadEmployees()
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
  loadEmployees()
})
</script>
<style scoped>
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
