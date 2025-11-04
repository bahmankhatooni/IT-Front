<template>
  <q-page padding>
    <!-- پیام خطا -->
    <q-banner v-if="errorMessage" class="bg-red text-white q-mb-md"  rounded dense style="text-align: center;">
      {{ errorMessage }}
    </q-banner>
    <q-card>
      <!-- هدر -->
      <q-card-section class="bg-blue-2">
        <div class="text-h6 text-center">مدیریت کارکنان</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-sm">
          <q-btn color="positive" label="افزودن کارمند جدید" @click="openAddDialog" />
          <q-space />
          <q-input
            dense
            outlined
            debounce="500"
            v-model="search"
            placeholder="نام یا کد پرسنلی"
            @update:model-value="loadEmployees"
            style="width: 250px"
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
          rows-per-page-label="تعداد در صفحه"
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn
                dense
                flat
                icon="edit"
                color="primary"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                dense
                flat
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- دیالوگ افزودن / ویرایش -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 400px; border-radius: 12px; padding: 16px;">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ isEdit ? 'ویرایش کارمند' : 'افزودن کارمند جدید' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.code" label="کد پرسنلی" outlined dense class="q-mb-md" />
          <q-input v-model="form.fname" label="نام" outlined dense class="q-mb-md" />
          <q-input v-model="form.lname" label="نام خانوادگی" outlined dense class="q-mb-md" />

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
            @update:model-value="loadBranchesByCity"
          />

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
            style="margin-top: 16px"
          />
        </q-card-section>

        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn :label="isEdit ? 'ویرایش' : 'ثـبــت'" color="positive" @click="saveEmployee" />
          <q-btn label="انصراف" color="grey" v-close-popup />
        </div>
      </q-card>
    </q-dialog>

    <!-- دیالوگ حذف -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 300px; border-radius: 12px; padding: 16px;">
        <q-card-section>
          آیا از حذف کارمند "{{ selectedEmployee.fname }} {{ selectedEmployee.lname }}" اطمینان دارید؟
        </q-card-section>
        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn label="تـأیید" color="negative" @click="deleteEmployee" />
          <q-btn label="انصراف" color="grey" v-close-popup />
        </div>
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
  { name: 'code', label: 'کد پرسنلی', field: 'code', align: 'center' },
  { name: 'fname', label: 'نام', field: 'fname', align: 'center' },
  { name: 'lname', label: 'نام خانوادگی', field: 'lname', align: 'center' },
  { name: 'branch', label: 'شعبه', field: row => row.branch?.name || '-', align: 'center' },
  { name: 'city', label: 'حوزه قضایی', field: row => row.city?.name || '-', align: 'center' },
  { name: 'actions', label: 'عملیات', align: 'center' }
]

async function loadEmployees() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/employees', {
      params: { search: search.value || '' }
    })
    employees.value = res.data
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

  const formData = new FormData()
  formData.append('code', form.value.code)
  formData.append('fname', form.value.fname)
  formData.append('lname', form.value.lname)
  formData.append('city_id', form.value.city_id)
  formData.append('branch_id', form.value.branch_id)

  try {
    if (isEdit.value) {
      formData.append('_method', 'PUT')
      await api.post(`/employees/${form.value.id}`, formData)
    } else {
      await api.post('/employees', formData)
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
.bg-blue-2 {
  background: #cce5ff;
}
</style>
