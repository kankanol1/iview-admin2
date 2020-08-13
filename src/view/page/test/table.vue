<template>
  <div>
    <Table :columns="columns1" :data="data1"></Table>
    <Button @click="getData">测试1</Button>
    <Button @click="getDataList">测试2</Button>
  </div>
</template>

<script>
import { getCarList, getCarListTest } from '@/api/test'

export default {
  data () {
    return {
      columns1: [
        {
          title: 'Name',
          key: 'name'
        },
        {
          title: 'Age',
          key: 'age'
        },
        {
          title: 'Address',
          key: 'address'
        }
      ],
      data1: [
        {
          name: 'John Brown',
          age: 18,
          address: 'New York No. 1 Lake Park',
          date: '2016-10-03'
        },
        {
          name: 'Jim Green',
          age: 24,
          address: 'London No. 1 Lake Park',
          date: '2016-10-01'
        },
        {
          name: 'Joe Black',
          age: 30,
          address: 'Sydney No. 1 Lake Park',
          date: '2016-10-02'
        },
        {
          name: 'Jon Snow',
          age: 26,
          address: 'Ottawa No. 2 Lake Park',
          date: '2016-10-04'
        }
      ]
    }
  },
  beforeCreate () {

  },

  methods: {
    getData () {
      getCarListTest({ name: 'kankna', age: '28' }).then(res => {
        console.log(res)
        this.data1 = res.data.data
      })
    },
    getDataList () {
      getCarList({ name: 'kankna', age: '28' }).then(res => {
        console.log(res)
      })
    }
  },
  mounted () {
    getCarListTest({ name: 'kankna', age: '28' }).then(res => {
      this.data1 = res.data.data
    })
  }
}
</script>

<style scoped>

</style>
