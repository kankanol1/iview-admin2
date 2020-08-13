<template>
  <div style="width: 100%; height: 100%; overflow-y: auto;">
    <div>
      <ButtonGroup size="small" style="padding-left:10px;">
        <Button ghost @click="() => {$set(this, 'status', false);}" type="text" icon="ios-search" style="padding-left:10px; color: #2d8cf0 !important;"
                onMouseOver="this.style.color='#F00';" onMouseOut="this.style.color='#2d8cf0';">
          统计图
        </Button>
        <Button ghost @click="() => {$set(this, 'status', true);}" type="text" icon="ios-search" style="padding-left:10px; color: #2d8cf0 !important;"
                onMouseOver="this.style.color='#F00';" onMouseOut="this.style.color='#2d8cf0';">
          统计表
        </Button>
      </ButtonGroup>
    </div>
    <hr/>
    <div :style="`height: calc(100% - 10pt - var(--searchBar)); ${status ? 'display: none;' : ''}`">
      <div id="chart_1556189592149" style="width: 100%;height: 100%; position: relative;margin-top: 10pt;">
      </div>
    </div>
    <div :style="`height: calc(100% - 10pt - var(--searchBar)); overflow-y: auto; ${!status ? 'display: none;' : ''}`">
      <div style="height: 5pt"></div>
      <h2 style="text-align: center;">历史数据统计信息</h2>
      <div style="height: 5pt"></div>
      <Table ref="selection" :columns="columns" :data="content" border :loading="loading"></Table>
      <Page size="small" show-total show-elevator show-sizer :current.sync="pageInfo.page"
            :page-size.sync="pageInfo.size" :page-size-opts="[500, 1000, 2000, 5000, 10000]"
            :total="pageInfo.totalElements" @on-change="search"
            @on-page-size-change="(value) => {pageInfo.size = value;search();}"
            style="float: right;margin-top: 10px"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: "data-statics-all",
    mounted() {
      this.search();
    },
    data() {
      return {
        status: false,
        pageInfo: {totalElements: 0, page: 1, size: 1000,}, // 展示分页信息
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {title: '日期', key: 'day', align: 'center',},
          {
            title: '串号', key: 'imsi', align: 'center',
            render: (h, params) => {
              return h(
                'Tooltip',
                {props: {placement: 'right', maxWidth: '200'}},
                [h('div', {slot: 'content',}, [h('p', {}, `更新时间: ${params.row.imsiTime ? new Date(params.row.imsiTime).format('yyyy-MM-dd HH:mm:ss') : ''}`)]), h('div', {}, params.row.imsi),]
              );
            },
          },
          {
            title: '车辆', key: 'car', align: 'center',
            render: (h, params) => {
              return h(
                'Tooltip',
                {props: {placement: 'right', maxWidth: '200'}},
                [h('div', {slot: 'content',}, [h('p', {}, `更新时间: ${params.row.carTime ? new Date(params.row.carTime).format('yyyy-MM-dd HH:mm:ss') : ''}`)]), h('div', {}, params.row.car),]
              );
            },
          },
          {
            title: '匹配信息', key: 'icr2', align: 'center',
            render: (h, params) => {
              return h(
                'Tooltip',
                {props: {placement: 'right', maxWidth: '200'}},
                [h('div', {slot: 'content',}, [h('p', {}, `更新时间: ${params.row.icr2Time ? new Date(params.row.icr2Time).format('yyyy-MM-dd HH:mm:ss') : ''}`)]), h('div', {}, params.row.icr2),]
              );
            },
          },
        ], // 展示字段
        content: [], // 数据
      };
    },
    methods: {
      graph() {
        let day = [];
        let imsi = [];
        let car = [];
        let icr2 = [];
        this.content/*.sort((l, r) => l.day > r.day ? 1 : -1)*/.forEach(node => {
          day.push(node.day);
          imsi.push(node.imsi || 0);
          car.push(node.car || 0);
          icr2.push(node.icr2 || 0);
        });
        let chart = require('echarts').init(document.getElementById('chart_1556189592149'));
        chart.setOption({
          title: {text: '历史数据统计信息'},
          tooltip: {trigger: 'axis'},
          legend: {data: ['串号数量', '车辆数量', '匹配数量',]},
          grid: {left: '4%', right: '4%', bottom: '4%', containLabel: true},
          toolbox: {feature: {saveAsImage: {}}},
          xAxis: {type: 'category', boundaryGap: false, data: day,},
          yAxis: {type: 'value'},
          series: [
            {name: '串号数量', type: 'line', data: imsi,},
            {name: '车辆数量', type: 'line', data: car,},
            {name: '匹配数量', type: 'line', data: icr2,},
          ]
        });
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : 0;
        args.size = this.pageInfo.size ? this.pageInfo.size : 1000;
        this.$set(this, 'loading', true);

        this.$http.post('/api/com/statistics/selectNodes', args).then((response) => {
          if (!!response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$set(this.pageInfo, 'totalElements', response.data.page.totalElements);
              this.$set(this, 'content', response.data.data);
              this.graph();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'loading', false);
        }).catch(() => this.$set(this, 'loading', false));
      },
    },
  }
</script>

<style scoped>
</style>
