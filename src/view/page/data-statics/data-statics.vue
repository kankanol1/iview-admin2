<style lang="less">
  .gl-titles {
    text-align: center;
    height: 50px;
    line-height: 50px;
  }
</style>
<template>
  <div>
    <h2 class="gl-titles">历史数据统计信息</h2>
    <Table
      class="data_statistics_01"
      ref="selection"
      :columns="columns"
      :data="content"
      stripe
      border
      :loading="loading"
      :height="tableHeight"
    />
    <Page
      size="small"
      show-total
      show-elevator
      show-sizer
      :current.sync="pageInfo.page"
      :page-size.sync="pageInfo.size"
      :page-size-opts="[20, 50, 100, 200, 500]"
      :total="pageInfo.totalElements"
      @on-change="search"
      @on-page-size-change="(value) => {pageInfo.size = value;search();}"
      style="float: right; padding-top: 10px;"
    />
  </div>
</template>

<script>
  export default {
    name: "data-statics",
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      this.search();
    },
    watch: {
      tableHeight: {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.setHeight();
          }
        },
        immediate: true,
      }
    },
    data() {
      return {
        tableHeight: 0,
        status: false,
        pageInfo: {totalElements: 0, page: 1, size: 20,}, // 展示分页信息
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {title: '日期', key: 'day', align: 'center',},
          {
            title: '串号', key: 'imsi', align: 'center', minWidth: 100, maxWidth: 200,
            render: (h, params) => {
              return h(
                'Tooltip',
                {props: {placement: 'right', maxWidth: '200'}},
                [h('div', {slot: 'content',}, [h('p', {}, `更新时间: ${params.row.imsiTime ? new Date(params.row.imsiTime).format('yyyy-MM-dd HH:mm:ss') : ''}`)]), h('div', {}, params.row.imsi),]
              );
            },
          },
          {
            title: '车辆', key: 'car', align: 'center', minWidth: 100, maxWidth: 200,
            render: (h, params) => {
              return h(
                'Tooltip',
                {props: {placement: 'right', maxWidth: '200'}},
                [h('div', {slot: 'content',}, [h('p', {}, `更新时间: ${params.row.carTime ? new Date(params.row.carTime).format('yyyy-MM-dd HH:mm:ss') : ''}`)]), h('div', {}, params.row.car),]
              );
            },
          },
          {
            title: '匹配信息', key: 'icr2', align: 'center', minWidth: 100, maxWidth: 200,
            render: (h, params) => {
              return h(
                'Tooltip',
                {props: {placement: 'left', maxWidth: '200'}},
                [h('div', {slot: 'content',}, [h('p', {}, `更新时间: ${params.row.icr2Time ? new Date(params.row.icr2Time).format('yyyy-MM-dd HH:mm:ss') : ''}`)]), h('div', {}, params.row.icr2),]
              );
            },
          },
        ], // 展示字段
        content: [], // 数据
      };
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("ivu-page mini").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-page mini")[0].offsetHeight -
            80;
          this.$set(this, 'tableHeight', height);
        }
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : 0;
        args.size = this.pageInfo.size ? this.pageInfo.size : 20;
        this.$set(this, 'loading', true);

        this.$http.post('/api/com/statistics/selectNodes', args).then((response) => {
          if (response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$set(this.pageInfo, 'totalElements', response.data.page.totalElements);
              this.$set(this, 'content', response.data.data);
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

<style>
  .data_statistics_01 .ivu-table td, .data_statistics_01 .ivu-table th {
    height: 30px;
  }
</style>
