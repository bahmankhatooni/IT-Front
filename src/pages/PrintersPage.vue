<template>
  <q-page padding>
    <q-card>
      <q-card-section style="background-color: #1976d254">
        <div class="text-h6" style="text-align: center">مدیریت پرینترها</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn color="positive" label="افزودن پرینتر جدید" @click="addPrinter" class="q-mb-md" />

        <q-table
          :columns="columns"
          :rows="printers"
          row-key="id"
          rows-per-page-label="تعداد در صفحه"
          flat
          bordered
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn dense flat icon="edit" color="primary" @click="editPrinter(props.row)" />
              <q-btn dense flat icon="delete" color="negative" @click="deletePrinter(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const printers = ref([
  {
    id: 1,
    assetCode: 'PR-1001',
    model: 'HP LaserJet 1020',
    userName: 'مریم کاظمی',
    branchCode: '101',
  },
  { id: 2, assetCode: 'PR-1002', model: 'Canon LBP2900', userName: 'علی رضایی', branchCode: '102' },
])

const columns = [
  { name: 'assetCode', label: 'کد تجهیز', field: 'assetCode', align: 'center' },
  { name: 'model', label: 'مدل پرینتر', field: 'model', align: 'center' },
  { name: 'userName', label: 'نام کاربر', field: 'userName', align: 'center' },
  { name: 'branchCode', label: 'کد شعبه', field: 'branchCode', align: 'center' },
  { name: 'actions', label: 'عملیات', field: 'actions', align: 'center' },
]

function addPrinter() {
  console.log('افزودن پرینتر جدید')
}

function editPrinter(row) {
  console.log('ویرایش پرینتر:', row)
}

function deletePrinter(row) {
  console.log('حذف پرینتر:', row)
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
