<template>
  <q-page padding>
    <!-- پیام خطا -->
    <q-banner v-if="errorMessage" class="bg-red text-white q-mb-md" rounded dense style="text-align: center;">
      {{ errorMessage }}
    </q-banner>
    <q-card>
      <!-- هدر -->
      <q-card-section class="bg-blue-2">
        <div class="text-h6 text-center">مدیریت تجهیزات سخت‌افزاری</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-sm">
          <q-btn color="positive" label="افزودن سخت‌افزار جدید" @click="openAddDialog" />
          <q-space />
          <q-input
            dense
            outlined
            debounce="500"
            v-model="search"
            placeholder="نام دستگاه یا مشخصات"
            @update:model-value="loadComputers"
            style="width: 250px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- جدول سخت‌افزارها -->
        <q-table
          :rows="computers"
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
                icon="visibility"
                color="info"
                @click="openViewDialog(props.row)"
              />
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
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 600px; border-radius: 12px; padding: 16px;">
        <q-card-section style="background-color: #bbdefb !important; border-radius: 12px; color: rgb(15 71 126)">
          <div class="text-h6 text-center" >
            {{ isEdit ? 'ویرایش سخت‌افزار' : 'افزودن سخت‌افزار جدید' }}
          </div>
        </q-card-section>

        <q-card-section>
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
            class="q-mt-md"
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
            class="q-mt-md"
            @update:model-value="loadEmployeesByBranch"
          />

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
            class="q-mt-md"
          >
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

          <div class="row q-col-gutter-md" style="margin-top: 0px" >
            <div class="col-6">
              <q-input v-model="form.name" label="نام دستگاه" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.monitor" label="مانیتور" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.mb" label="مادربرد" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.cpu" label="پردازنده" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.ram" label="رم" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.os" label="سیستم عامل" outlined dense />
            </div>
          </div>
          <div class="row q-col-gutter-md" style="margin-top: 0px" >
            <div class="col-6">
              <div class="row items-center">
                <q-checkbox
                  v-model="form.hard"
                  label="هارد SSD"
                  :true-value="true"
                  :false-value="false"
                />
              </div>
            </div>

            <div class="col-6">
              <div class="row items-center">
                <q-checkbox
                  v-model="form.antivirus"
                  label="آنتی‌ویروس"
                  :true-value="true"
                  :false-value="false"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn :label="isEdit ? 'ویرایش' : 'ثـبــت'" color="positive" @click="saveComputer" />
          <q-btn label="انصراف" color="grey" v-close-popup />
        </div>
      </q-card>
    </q-dialog>

    <!-- دیالوگ نمایش اطلاعات -->
    <q-dialog v-model="viewDialog">
      <q-card style="min-width: 500px; border-radius: 12px; padding: 16px;">
        <q-card-section style="background-color: #e3f2fd !important; border-radius: 12px; color: rgb(15 71 126)">
          <div class="text-h6 text-center">مشاهده اطلاعات سخت‌افزار</div>
        </q-card-section>

        <q-card-section>
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

        <div class="row justify-center q-mt-sm">
          <q-btn label="بستن" color="grey" v-close-popup />
        </div>
      </q-card>
    </q-dialog>

    <!-- دیالوگ حذف -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 300px; border-radius: 12px; padding: 16px;">
        <q-card-section>
          آیا از حذف سخت‌افزار "{{ selectedComputer.name }}" اطمینان دارید؟
        </q-card-section>
        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn label="تـأیید" color="negative" @click="deleteComputer" />
          <q-btn label="انصراف" color="grey" v-close-popup />
        </div>
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
  hard: false, // تغییر به boolean
  os: '',
  antivirus: false // تغییر به boolean
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
  { name: 'name', label: 'نام دستگاه', field: 'name', align: 'center' },
  { name: 'employee', label: 'کارمند', field: row => row.employee ? `${row.employee.fname} ${row.employee.lname}` : '-', align: 'center' },
  { name: 'branch', label: 'شعبه', field: row => row.branch?.name || '-', align: 'center' },
  { name: 'city', label: 'حوزه قضایی', field: row => row.city?.name || '-', align: 'center' },
  { name: 'os', label: 'سیستم عامل', field: 'os', align: 'center' },
  { name: 'actions', label: 'عملیات', align: 'center' }
]

async function loadComputers() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/computers', {
      params: { search: search.value || '' }
    })
    computers.value = res.data
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
    // فقط کارمندها رو پاک کن، employee_id رو نگه دار
    employees.value = []
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

    // کارمندهای جدید رو اضافه کن بدون پاک کردن کارمند فعلی
    newEmployees.forEach(newEmp => {
      if (!employees.value.find(emp => emp.id === newEmp.id)) {
        employees.value.push(newEmp)
      }
    })
  } catch (err) {
    console.error('خطا در دریافت کارمندان شعبه:', err)
  }
}

// تابع برای لود اطلاعات یک کارمند خاص
async function loadSpecificEmployee(employeeId) {
  try {
    const res = await api.get(`/employees/${employeeId}`)
    const employee = res.data
    // چک کن که قبلاً اضافه نشده باشه
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

  // ابتدا فرم رو با داده‌های فعلی پر کن
  form.value = {
    ...row,
    hard: row.hard == 1 || row.hard === true, // تبدیل به boolean
    antivirus: row.antivirus == 1 || row.antivirus === true
  }

  selectedCity.value = row.city_id
  selectedBranch.value = row.branch_id

  // کارمند فعلی رو فوراً به لیست اضافه کن
  employees.value = []
  if (row.employee) {
    employees.value.push({
      id: row.employee.id,
      fname: row.employee.fname,
      lname: row.employee.lname,
      full_name: `${row.employee.fname} ${row.employee.lname}`
    })
    form.value.employee_id = row.employee.id // مطمئن شو employee_id ست شده
  }

  errorMessage.value = ''

  // دیالوگ رو فوراً باز کن تا کاربر داده‌ها رو ببینه
  dialog.value = true

  // سپس داده‌های اضافی رو در پس‌زمینه لود کن
  setTimeout(() => {
    if (user.value?.role_id === 1) {
      loadCities().then(() => {
        loadBranchesByCity().then(() => {
          loadEmployeesByBranch().then(() => {
            // بعد از لود کارمندان، مطمئن شو کارمند فعلی در لیست هست
            if (row.employee_id && !employees.value.find(emp => emp.id === row.employee_id)) {
              loadSpecificEmployee(row.employee_id)
            }
          })
        })
      })
    } else {
      loadBranchesForUser().then(() => {
        loadEmployeesByBranch().then(() => {
          // بعد از لود کارمندان، مطمئن شو کارمند فعلی در لیست هست
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

  // اعتبارسنجی فیلدهای ضروری
  if (!form.value.name || !form.value.branch_id || !form.value.employee_id) {
    errorMessage.value = 'لطفاً فیلدهای نام دستگاه، شعبه و کارمند را پر کنید'
    return
  }

  // تبدیل boolean به عدد برای ارسال به سرور
  const submitData = {
    ...form.value,
    hard: form.value.hard ? 1 : 0,
    antivirus: form.value.antivirus ? 1 : 0
  }

  const formData = new FormData()
  Object.keys(submitData).forEach(key => {
    if (submitData[key] !== null) {
      formData.append(key, submitData[key])
    }
  })

  try {
    if (isEdit.value) {
      formData.append('_method', 'PUT')
      await api.post(`/computers/${form.value.id}`, formData)
    } else {
      await api.post('/computers', formData)
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
.bg-blue-2 {
  background: #cce5ff;
}
</style>
