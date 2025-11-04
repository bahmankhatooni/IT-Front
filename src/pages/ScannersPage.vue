<template>
  <q-page padding>
    <q-card>
      <q-card-section style="background-color: #1976d254">
        <div class="text-h6" style="text-align: center">مدیریت اسکنرها</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn color="positive" label="افزودن اسکنر جدید" @click="addScanner" class="q-mb-md" />

        <q-table
          :columns="columns"
          :rows="scanners"
          row-key="id"
          rows-per-page-label="تعداد در صفحه"
          flat
          bordered
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn dense flat icon="edit" color="primary" @click="editScanner(props.row)" />
              <q-btn dense flat icon="delete" color="negative" @click="deleteScanner(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const scanners = ref([
  { id: 1, assetCode: 'SC-1001', model: 'Epson V19', userName: 'حمید مرادی', branchCode: '101' },
  {
    id: 2,
    assetCode: 'SC-1002',
    model: 'Canon LiDE 300',
    userName: 'سارا احمدی',
    branchCode: '102',
  },
])

const columns = [
  { name: 'assetCode', label: 'کد تجهیز', field: 'assetCode', align: 'center' },
  { name: 'model', label: 'مدل اسکنر', field: 'model', align: 'center' },
  { name: 'userName', label: 'نام کاربر', field: 'userName', align: 'center' },
  { name: 'branchCode', label: 'کد شعبه', field: 'branchCode', align: 'center' },
  { name: 'actions', label: 'عملیات', field: 'actions', align: 'center' },
]

function addScanner() {
  console.log('افزودن اسکنر جدید')
}

function editScanner(row) {
  console.log('ویرایش اسکنر:', row)
}

function deleteScanner(row) {
  console.log('حذف اسکنر:', row)
}
</script>

<style scoped>
.q-table thead tr {
  background-color: #e0e0e0;
  font-weight: bold;
}
.q-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
