<style lang="less">
  .clear {
    padding-bottom: 10px;
  }
</style>
<template>
  <div>
    <div class="clear">
      <Row>
        <Col span="6">
          <Input v-if="userInfo && userInfo.role && ['ROLE_ADMIN','ROLE_DEVELOP'].indexOf(userInfo.role) > -1"
                 class="interval" size="small" clearable v-model="formItem.username" placeholder="请输入用户名称"/>
        </Col>
        <Col span="12">
          <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem.datetimerange"
                      placeholder="请选择时间范围" style="width: 300px"/>
        </Col>
        <Col span="6">
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
    <Table
      ref="selection"
      :columns="columns"
      :data="content"
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
      :page-size-opts="$pageSizeOpts"
      :total="pageInfo.totalElements"
      @on-change="search"
      @on-page-size-change="(value) => {pageInfo.size = value;search();}"
      style="float: right;padding-top: 10px"
    />
  </div>
</template>
<script>
  export default {
    name: 'logs-history',
    watch:{
      tableHeight:{
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.setHeight();
          }
        },
        immediate:true,
      }
    },
    mounted() {
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo')))) && (this.$set(this.formItem, 'username', this.userInfo.username));
      this.$http.post('/api/sys/urls/selectNodes', {}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          if (response.data.data) {
            let urls = {};
            response.data.data.forEach(node => urls[node.fnurl] = node)
            this.$set(this, 'urls', urls);
          }
        }
      });
      setTimeout(this.search(), 500);
      this.setHeight();
      window.onresize = () => this.setHeight();
    },
    data() {
      return {
        userInfo: {}, // 用户信息
        urls: {}, // urls信息
        tableHeight: 0,
        pageInfo: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        formItem: {username: '', datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {title: '用户名称', key: 'username', minWidth: 100, align: 'center',},
          {title: '登录IP', key: 'ip', minWidth: 160, align: 'center',},
          {
            title: '访问内容',
            key: 'fnurl',
            align: 'center',
            width: 200,
            render: (h, params) => h('div', {}, this.urls[params.row.fnurl] ? this.urls[params.row.fnurl].desc : '未知')
          },
          {
            title: '携带内容',width: 200, key: 'params', align: 'left', render: (h, params) => {
              let ps = eval('(' + (params.row.params || '{}') + ')');
              let content = [];
              ps.regionCode && content.push(h('div', {}, `行政区划: ${ps.regionCode}`));
              ps.abnormal && content.push(h('div', {}, `异常点位: ${ps.abnormal ? '是' : '否'}`));
              (ps.imsis || ps.imsi) && (content.push(h('div', {}, `串号信息: ${ps.imsis || ps.imsi}`)));
              (ps.cphms || ps.cphm) && (content.push(h('div', {}, `车辆信息: ${ps.cphms || ps.cphm}`)));
              if (ps.kssjc || ps.jssjc) {
                let kssj = ps.kssjc ? new Date(ps.kssjc * 1).format('yyyy-MM-dd HH:mm:ss') : '';
                let jssj = ps.jssjc ? new Date(ps.jssjc * 1).format('yyyy-MM-dd HH:mm:ss') : '';
                content.push(h('div', {}, `时间范围: ${kssj} ~ ${jssj}`))
              }
              (ps.page || ps.size) && (content.push(h('div', {}, `分页信息: ${ps.page ? ps.page * 1 + 1 : 1} / ${ps.size || ''}`)));
              return h('div', {}, content);
            }
          },
          {
            title: '访问时间',
            key: 'tms',
            width: 200,
            align: 'center',
            render: (h, params) => h('div', {}, new Date(params.row.tms).format('yyyy-MM-dd HH:mm:ss'))
          },
          {
            title: '操作', key: 'xh',minWidth:160, align: 'center',
            render: (h, params) => {
              let action = [];
              action.push(h('Button', {
                style: {marginRight: '5px'},
                props: {type: 'info', size: 'small'},
                on: {click: () => this.recall(params.row)}
              }, '回溯'));
              if (this.userInfo && this.userInfo.role === 'ROLE_DEVELOP') {
                action.push(h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'error', size: 'small'},
                  on: {click: () => this.remove(params.row.id)}
                }, '删除'));
              }
              return h('div', {}, action);
            },
          },
        ], // 展示字段
        content: [], // 数据
      };
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight-
            document.getElementsByClassName("ivu-page mini")[0].offsetHeight-
            30;
          this.$set(this, 'tableHeight', height);
        }
      },
      reset() {
        this.$set(this, 'formItem', {
          username: this.userInfo && this.userInfo.username || '',
          datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]
        });
        this.$set(this, 'pageInfo', JSON.parse(JSON.stringify(this.$pageInfo)));
        this.search();
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        (this.formItem.username) && (args.username = this.formItem.username);
        args.start = (this.formItem.datetimerange && this.formItem.datetimerange[0]) ? this.formItem.datetimerange[0].getTime() : new Date(new Date().getTime() - 1 * 86400000).getTime(); // 毫秒级时间戳
        args.end = (this.formItem.datetimerange && this.formItem.datetimerange[1]) ? this.formItem.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : this.$pageInfo.page;
        args.size = this.pageInfo.size ? this.pageInfo.size : this.$pageInfo.size;
        this.$set(this, 'loading', true);

        this.$http.post('/api/sys/logs/selectNodes', args).then((response) => {
          if (!!response && response.status === 200) {
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
      recall(row) {
        let query = JSON.parse(row.params);
        Object.keys(query).forEach(_ => (Array.isArray && Array.isArray(query[_]) || query[_] instanceof Array) && (0 < query[_].length ? query[_] = query[_][0] : delete query[_]));
        ['size', 'page', 'kssjc', 'jssjc'].forEach(_ => (query[_]) && (query[_] = parseInt(query[_])));
        this.$router.push({path: row.fnurl.substr(5), query: query});
      },
      remove(ids) {
        (!ids) && (ids = this.$refs.selection.getSelection().map(n => n.id).join(','));
        if (ids) {
          this.$http.post('/api/sys/logs/deleteNodes', {ids: ids}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
    },
  }
</script>

<style scoped>
</style>
