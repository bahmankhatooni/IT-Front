<template>
  <q-page class="computers-page" padding>

    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="desktop_windows" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">مدیریت تجهیزات سخت‌افزاری</div>
            <div class="text-subtitle">مدیریت و ویرایش اطلاعات کامپیوترها</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="content-section">
        <!-- بخش اقدامات و جستجو -->
        <div class="action-bar">
          <q-btn
            color="primary"
            label="افزودن سخت‌افزار جدید"
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
            placeholder="جستجوی نام دستگاه یا مشخصات..."
            @update:model-value="loadComputers"
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- جدول کامپیوترها -->
        <q-table
          :rows="computers"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          class="computers-table"
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
                icon="visibility"
                color="info"
                @click="openViewDialog(props.row)"
                class="action-btn"
                size="12px"
              />
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
      <q-card class="dialog-card computer-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon :name="isEdit ? 'edit' : 'add'" class="dialog-icon" />
            {{ isEdit ? 'ویرایش سخت‌افزار' : 'افزودن سخت‌افزار جدید' }}
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
            @update:model-value="loadEmployeesByBranch"
          >
            <template v-slot:prepend>
              <q-icon name="business" class="field-icon" />
            </template>
          </q-select>

          <!-- انتخاب کارمند -->
          <q-select
            v-model="form.employee_id"
            :options="employees"
            option-value="id"
            option-label="full_name"
            label="انتخاب کارمند"
            outlined
            dense
            emit-value
            map-options
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="person" class="field-icon" />
            </template>
            <template v-slot:selected>
              <span v-if="form.employee_id && currentEmployeeName">
                {{ currentEmployeeName }}
              </span>
              <span v-else-if="form.employee_id">
                {{ form.employee_id }}
              </span>
              <span v-else>
                کارمند را انتخاب کنید
              </span>
            </template>
          </q-select>

          <div class="row q-col-gutter-md form-row">
            <div class="col-6">
              <q-input
                v-model="form.name"
                label="نام دستگاه"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="computer" class="field-icon" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.monitor"
                label="مانیتور"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="tv" class="field-icon" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.mb"
                label="مادربرد"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="memory" class="field-icon" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.cpu"
                label="پردازنده"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="speed" class="field-icon" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.ram"
                label="رم"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="sd_card" class="field-icon" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.os"
                label="سیستم عامل"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="settings" class="field-icon" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md checkbox-row" style="margin-top: -35px;">
            <div class="col-6">
              <div class="checkbox-container">
                <q-checkbox
                  v-model="form.hard"
                  label="هارد SSD"
                  :true-value="true"
                  :false-value="false"
                  class="custom-checkbox"
                  color="primary"
                />
              </div>
            </div>
            <div class="col-6">
              <div class="checkbox-container">
                <q-checkbox
                  v-model="form.antivirus"
                  label="آنتی‌ویروس"
                  :true-value="true"
                  :false-value="false"
                  class="custom-checkbox"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="dialog-actions" style="margin-top: -35px;">
          <q-btn
            :label="isEdit ? 'ویرایش' : 'ثـبــت'"
            color="primary"
            @click="saveComputer"
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

    <!-- دیالوگ نمایش اطلاعات -->
    <q-dialog v-model="viewDialog">
      <q-card class="view-dialog-card">
        <q-card-section class="view-header">
          <q-icon name="visibility" color="info" size="32px" />
          <div class="view-title">مشاهده اطلاعات سخت‌افزار</div>
        </q-card-section>

        <q-card-section class="view-body">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="viewData.name" label="نام دستگاه" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.monitor" label="مانیتور" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.mb" label="مادربرد" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.cpu" label="پردازنده" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.ram" label="رم" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.os" label="سیستم عامل" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.hard_display" label="هارد SSD" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.antivirus_display" label="آنتی‌ویروس" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.employee_name" label="کارمند" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.branch_name" label="شعبه" outlined dense readonly />
            </div>
            <div class="col-6" v-if="user?.role_id === 1">
              <q-input v-model="viewData.city_name" label="حوزه قضایی" outlined dense readonly />
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

    <!-- دیالوگ تایید حذف -->
    <q-dialog v-model="deleteDialog">
      <q-card class="delete-dialog-card">
        <q-card-section class="delete-header">
          <q-icon name="warning" color="orange" size="32px" />
          <div class="delete-title">تأیید حذف</div>
        </q-card-section>

        <q-card-section class="delete-body">
          آیا از حذف سخت‌افزار "{{ selectedComputer.name }}" اطمینان دارید؟
          <div class="delete-warning">این عمل غیرقابل بازگشت است!</div>
        </q-card-section>

        <q-card-actions align="center" class="delete-actions">
          <q-btn
            label="تـأیید حذف"
            color="negative"
            @click="deleteComputer"
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
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'

const search = ref('')
const computers = ref([])
const cities = ref([])
const branches = ref([])
const employees = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null)
const dialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedComputer = ref(null)
const selectedCity = ref(null)
const selectedBranch = ref(null)

const form = ref({
  id: null,
  name: '',
  city_id: null,
  branch_id: null,
  employee_id: null,
  monitor: '',
  mb: '',
  cpu: '',
  ram: '',
  hard: false,
  os: '',
  antivirus: false
})

const viewData = ref({
  name: '',
  monitor: '',
  mb: '',
  cpu: '',
  ram: '',
  hard_display: '',
  os: '',
  antivirus_display: '',
  employee_name: '',
  branch_name: '',
  city_name: ''
})

// computed برای نمایش نام کارمند فعلی
const currentEmployeeName = computed(() => {
  if (!form.value.employee_id) return ''
  const employee = employees.value.find(emp => emp.id === form.value.employee_id)
  return employee ? employee.full_name : 'در حال لود...'
})

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
    field: row => row.employee ? `${row.employee.fname} ${row.employee.lname}` : '-',
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
    name: 'os',
    label: 'سیستم عامل',
    field: 'os',
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

async function loadComputers() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/computers', {
      params: { search: search.value || '' }
    })

    // مرتب‌سازی بر اساس ID به صورت نزولی (جدیدترین اول)
    computers.value = res.data.sort((a, b) => b.id - a.id)
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
    employees.value = []
    form.value.employee_id = null
  } catch (err) {
    console.error('خطا در دریافت شعبات حوزه:', err)
  }
}

async function loadEmployeesByBranch() {
  if (!selectedBranch.value) return

  try {
    const res = await api.get('/employees', { params: { branch_id: selectedBranch.value } })
    const newEmployees = res.data.map(emp => ({
      ...emp,
      full_name: `${emp.fname} ${emp.lname}`
    }))

    employees.value = []
    employees.value = [...newEmployees]

    if (isEdit.value && form.value.employee_id) {
      const currentEmployeeExists = newEmployees.find(emp => emp.id === form.value.employee_id)
      if (!currentEmployeeExists) {
        await loadSpecificEmployee(form.value.employee_id)
      }
    }
  } catch (err) {
    console.error('خطا در دریافت کارمندان شعبه:', err)
  }
}

// تابع برای لود اطلاعات یک کارمند خاص
async function loadSpecificEmployee(employeeId) {
  try {
    const res = await api.get(`/employees/${employeeId}`)
    const employee = res.data
    if (!employees.value.find(emp => emp.id === employee.id)) {
      employees.value.push({
        ...employee,
        full_name: `${employee.fname} ${employee.lname}`
      })
    }
  } catch (err) {
    console.error('خطا در دریافت اطلاعات کارمند:', err)
  }
}

async function loadBranchesForUser() {
  try {
    const res = await api.get('/branches')
    branches.value = res.data
    employees.value = []
    form.value.employee_id = null
  } catch (err) {
    console.error('خطا در دریافت شعبات:', err)
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = {
    id: null,
    name: '',
    city_id: null,
    branch_id: null,
    employee_id: null,
    monitor: '',
    mb: '',
    cpu: '',
    ram: '',
    hard: false,
    os: '',
    antivirus: false
  }
  selectedCity.value = null
  selectedBranch.value = null
  employees.value = []
  errorMessage.value = ''

  if (user.value?.role_id === 1) loadCities()
  else loadBranchesForUser()

  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true

  form.value = {
    ...row,
    hard: row.hard == 1 || row.hard === true,
    antivirus: row.antivirus == 1 || row.antivirus === true
  }

  selectedCity.value = row.city_id
  selectedBranch.value = row.branch_id

  employees.value = []
  if (row.employee) {
    employees.value.push({
      id: row.employee.id,
      fname: row.employee.fname,
      lname: row.employee.lname,
      full_name: `${row.employee.fname} ${row.employee.lname}`
    })
    form.value.employee_id = row.employee.id
  }

  errorMessage.value = ''

  dialog.value = true

  setTimeout(() => {
    if (user.value?.role_id === 1) {
      loadCities().then(() => {
        loadBranchesByCity().then(() => {
          loadEmployeesByBranch().then(() => {
            if (row.employee_id && !employees.value.find(emp => emp.id === row.employee_id)) {
              loadSpecificEmployee(row.employee_id)
            }
          })
        })
      })
    } else {
      loadBranchesForUser().then(() => {
        loadEmployeesByBranch().then(() => {
          if (row.employee_id && !employees.value.find(emp => emp.id === row.employee_id)) {
            loadSpecificEmployee(row.employee_id)
          }
        })
      })
    }
  }, 100)
}

function openViewDialog(row) {
  viewData.value = {
    name: row.name || '-',
    monitor: row.monitor || '-',
    mb: row.mb || '-',
    cpu: row.cpu || '-',
    ram: row.ram || '-',
    hard_display: row.hard ? 'بله' : 'خیر',
    os: row.os || '-',
    antivirus_display: row.antivirus ? 'بله' : 'خیر',
    employee_name: row.employee ? `${row.employee.fname} ${row.employee.lname}` : '-',
    branch_name: row.branch?.name || '-',
    city_name: row.city?.name || '-'
  }
  viewDialog.value = true
}

async function saveComputer() {
  if (user.value?.role_id === 1) {
    form.value.city_id = selectedCity.value
  } else {
    form.value.city_id = user.value.city_id
  }
  form.value.branch_id = selectedBranch.value

  if (!form.value.name || !form.value.branch_id || !form.value.employee_id) {
    errorMessage.value = 'لطفاً فیلدهای نام دستگاه، شعبه و کارمند را پر کنید'
    return
  }

  const submitData = {
    ...form.value,
    hard: form.value.hard ? 1 : 0,
    antivirus: form.value.antivirus ? 1 : 0
  }

  try {
    if (isEdit.value) {
      await api.put(`/computers/${form.value.id}`, submitData)
    } else {
      await api.post('/computers', submitData)
    }
    dialog.value = false
    loadComputers()
  } catch (err) {
    console.error('خطا در ثبت سخت‌افزار:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedComputer.value = row
  deleteDialog.value = true
}

async function deleteComputer() {
  try {
    await api.delete(`/computers/${selectedComputer.value.id}`)
    loadComputers()
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
  loadComputers()
})
</script>

<style scoped>
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
