<template>
  <div>
    <Form ref="ref_formItem"  class="form-item-s"  :model="formItem" :rules="rules" inline>
      <FormItem prop="jjrdh">
        <Input class="interval" size="small" clearable v-model="formItem.jjrdh" placeholder="请输入发件人电话"
               style="width: 90pt;" @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="jjrzjh">
        <Input class="interval" size="small" clearable v-model="formItem.jjrzjh" placeholder="请输入发件人证件号码"
               style="width: 110pt;" @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="sjrdh">
        <Input class="interval" size="small" clearable v-model="formItem.sjrdh" placeholder="请输入收件人电话"
               style="width: 90pt;" @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="sjrzjh">
        <Input class="interval" size="small" clearable v-model="formItem.sjrzjh" placeholder="请输入收件人证件号码"
               style="width: 110pt;" @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="jjsj">
        <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem.jjsj" placeholder="请选择寄件时间"
                    style="width: 300px" @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="datetimerange">
        <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem.datetimerange"
                    placeholder="请选择签收时间" style="width: 300px" @on-change="queryChange"/>
      </FormItem>
      <FormItem>
        <ButtonGroup size="small" style="padding-left:10px;">
          <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
          <Button v-if="userInfo && userInfo.role && userInfo.role === 'ROLE_DEVELOP'" ghost @click="insert()"
                  type="success" icon="md-add">添加
          </Button>
          <Button v-if="userInfo && userInfo.role && userInfo.role === 'ROLE_DEVELOP'" ghost @click="remove()"
                  type="error" icon="md-close">删除
          </Button>
          <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
        </ButtonGroup>
      </FormItem>
    </Form>
    <Table
      ref="selection"
      :columns="columns"
      :data="content" border
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
      style="float: right;padding-top: 5px"
    />


    <Modal :styles="{top: '20px'}" v-model="showModal" title="信息维护" width="700px">
      <Form ref="ref1558919005000" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="xh"><Input disabled v-model="editItem.xh" placeholder="序号,自动生成" clearable/>
        </FormItem>

        <FormItem label="快递公司编号" prop="kdgsbh"><Input v-model="editItem.kdgsbh" placeholder="请输入快递公司编号" clearable/>
        </FormItem>
        <FormItem label="快递公司名称" prop="kdgsmc"><Input v-model="editItem.kdgsmc" placeholder="请输入快递公司名称" clearable/>
        </FormItem>
        <FormItem label="运单号" prop="ydh"><Input v-model="editItem.ydh" placeholder="请输入运单号" clearable/></FormItem>
        <FormItem label="取货地" prop="qhd"><Input v-model="editItem.qhd" placeholder="请输入取货地(快递公司内容使用)" clearable/>
        </FormItem>
        <FormItem label="送货地" prop="shd"><Input v-model="editItem.shd" placeholder="请输入送货地(快递公司内容使用)" clearable/>
        </FormItem>

        <FormItem label="寄件时间" prop="jjsj">
          <DatePicker class="interval" size="small" type="datetime" format="yyyy-MM-dd HH:mm:ss.SSS"
                      style="padding-left: 0pt !important; width: 100%"
                      v-model="editItem._jjsj" @on-change="updateDate" placeholder="请选择寄件时间"/>
        </FormItem>

        <FormItem label="寄件人姓名" prop="jjrxm"><Input v-model="editItem.jjrxm" placeholder="请输入寄件人姓名" clearable/>
        </FormItem>
        <FormItem label="寄件人证件号" prop="jjrzjh"><Input v-model="editItem.jjrzjh" placeholder="请输入寄件人证件号" clearable/>
        </FormItem>
        <FormItem label="寄件人电话" prop="jjrdh"><Input v-model="editItem.jjrdh" placeholder="请输入寄件人电话" clearable/>
        </FormItem>
        <FormItem label="寄件地址" prop="jjdz"><Input v-model="editItem.jjdz" placeholder="请输入寄件地址" clearable/></FormItem>
        <FormItem label="托寄物" prop="tjw"><Input v-model="editItem.tjw" placeholder="请输入托寄物" clearable/></FormItem>
        <FormItem label="收件人姓名" prop="sjrxm"><Input v-model="editItem.sjrxm" placeholder="请输入收件人姓名" clearable/>
        </FormItem>
        <FormItem label="收件人证件号" prop="sjrzjh"><Input v-model="editItem.sjrzjh" placeholder="请输入收件人证件号" clearable/>
        </FormItem>
        <FormItem label="收件人电话" prop="sjrdh"><Input v-model="editItem.sjrdh" placeholder="请输入收件人电话" clearable/>
        </FormItem>
        <FormItem label="收件人地址" prop="sjdz"><Input v-model="editItem.sjdz" placeholder="请输入收件人地址" clearable/></FormItem>
        <FormItem label="签收状态" prop="qszt"><Input v-model="editItem.qszt" placeholder="请输入签收状态" clearable/></FormItem>
        <FormItem label="签收人姓名" prop="qsrxm"><Input v-model="editItem.qsrxm" placeholder="请输入签收人姓名" clearable/>
        </FormItem>
        <FormItem label="签收人证件号" prop="qsrzjh"><Input v-model="editItem.qsrzjh" placeholder="请输入签收人证件号" clearable/>
        </FormItem>
        <FormItem label="签收人电话" prop="qsrdh"><Input v-model="editItem.qsrdh" placeholder="请输入签收人电话" clearable/>
        </FormItem>
        <FormItem label="签收地址" prop="qsdz"><Input v-model="editItem.qsdz" placeholder="请输入签收地址" clearable/></FormItem>


        <FormItem label="签收时间" prop="qssj">
          <DatePicker class="interval" size="small" type="datetime" format="yyyy-MM-dd HH:mm:ss.SSS"
                      style="padding-left: 0pt !important; width: 100%"
                      v-model="editItem._qssj" @on-change="updateDate" placeholder="请选择寄件时间"/>
        </FormItem>

        <FormItem label="备注" prop="bz"><Input v-model="editItem.bz" placeholder="请输入备注" clearable/></FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="() => (this.$set(this, 'showModal', false))" :loading="modalLoading">
          取消
        </Button>
        <Button type="primary" size="large" @click="submit" :loading="modalLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  export default {
    name: 'jd',
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
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
        immediate: true
      },
    },
    computed: {

    },
    data() {
      return {
        tableHeight:0,
        userInfo: {}, // 用户信息
        pageInfo: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        formItem: {}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},

          {
            title: '序号', key: 'xh', width: 70, align: 'center',
            render: (h, params) => h('div', {
              style: {
                display: 'inline-block',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              domProps: {title: params.row.xh,},
            }, params.row.xh),
          },
          {
            title: '快递公司名称', key: 'kdgsbh', width: 200, align: 'center',
            render: (h, params) => {
              return h('Tooltip', {props: {placement: 'top'}}, [h('div',
                {slot: 'content',},
                [h('p', {}, `编号: ${params.row.kdgsbh}\r\n`), h('p', {}, `名称: ${params.row.kdgsmc}`)]), h('div', {}, params.row.kdgsmc)]);
            },
          },
          {title: '运单号', key: 'ydh', width: 100, align: 'center',},
          {title: '取货地', key: 'qhd', width: 100, align: 'center',},
          {title: '送货地', key: 'shd', width: 100, align: 'center',},
          {
            title: '寄件时间', key: 'jjsj', width: 180, align: 'center',
            render: (h, params) => {
              return h('Tooltip', {props: {placement: 'top'}}, [h('div',
                {slot: 'content',},
                [h('p', {}, `时间: ${params.row.jjsj}\r\n`), h('p', {}, `时间戳: ${params.row.jjsjc}`)]), h('div', {}, params.row.jjsj)]);
            },
          },
          {title: '寄件人姓名', key: 'jjrxm', width: 100, align: 'center',},
          {title: '寄件人证件号', key: 'jjrzjh', width: 160, align: 'center',},
          {title: '寄件人电话', key: 'jjrdh', width: 100, align: 'center',},
          {title: '寄件地址', key: 'jjdz', width: 100, align: 'center',},
          {title: '托寄物', key: 'tjw', width: 100, align: 'center',},
          {title: '收件人姓名', key: 'sjrxm', width: 100, align: 'center',},
          {title: '收件人证件号', key: 'sjrzjh', width: 160, align: 'center',},
          {title: '收件人电话', key: 'sjrdh', width: 100, align: 'center',},
          {title: '收件人地址', key: 'sjdz', width: 100, align: 'center',},
          {title: '签收状态', key: 'qszt', width: 100, align: 'center',},
          {title: '签收人姓名', key: 'qsrxm', width: 100, align: 'center',},
          {title: '签收人证件号', key: 'qsrzjh', width: 160, align: 'center',},
          {title: '签收人电话', key: 'qsrdh', width: 100, align: 'center',},
          {title: '签收地址', key: 'qsdz', width: 100, align: 'center',},
          {
            title: '签收时间', key: 'qssj', width: 180, align: 'center',
            render: (h, params) => {
              return h('Tooltip', {}, [h('div', {slot: 'content',}, [h('p', {}, `时间: ${params.row.qssj}\r\n`), h('p', {}, `时间戳: ${params.row.qssjc}`)]), h('div', {}, params.row.qssj)]);
            },
          },
          {title: '备注', key: 'bz', width: 100, align: 'center',},

          {
            title: '操作', key: 'xh', width: 150, align: 'center',
            render: (h, params) => {
              let action = [];
              if (this.userInfo && this.userInfo.role && this.userInfo.role === 'ROLE_DEVELOP') {
                action.push(h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'info', size: 'small'},
                  on: {click: () => this.update(params.row)}
                }, '修改'));
                action.push(h('Button', {
                  props: {type: 'error', size: 'small'},
                  on: {click: () => this.remove(params.row.xh)}
                }, '删除'));
              }
              return h('div', {}, action);
            },
          },
        ], // 展示字段
        content: [], // 数据
        rules: {},

        editItem: {}, // 添加或修改内容
        showModal: false, // 显示修改内容的Modal框
        modalLoading: false, // 添加或修改,触发请求时的等待状态
        ruleValidate: {
          ydh: [
            {required: true, message: '运单号不能为空', trigger: 'blur'}
          ],
          jjsj: [
            {required: true, message: '寄件时间不能为空', trigger: 'blur'},
          ],
        }, // 添加或修改字段校验规则
      };
    },
    methods: {
      setHeight() {
        this.tableHeight = this.$setTableHeight()-30;
      },
      queryChange() {
        this.formItem.queryLastUpdate = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 1000) {
            this.$set(this, 'pageInfo', JSON.parse(JSON.stringify(this.$pageInfo)));
            this.$set(this, 'content', []);
            this.search();
          }
        }, 1001)
      },
      reset() {
        this.$set(this, 'formItem', {})
        this.$set(this, 'pageInfo', JSON.parse(JSON.stringify(this.$pageInfo)));
        this.search();
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        (this.formItem.jjrdh) && (args.jjrdh = this.formItem.jjrdh);
        (this.formItem.jjrzjh) && (args.jjrzjh = this.formItem.jjrzjh);
        (this.formItem.sjrdh) && (args.sjrdh = this.formItem.sjrdh);
        (this.formItem.sjrzjh) && (args.sjrzjh = this.formItem.sjrzjh);
        (this.formItem.jjsj && this.formItem.jjsj[0]) && (args.kjjsjc = this.formItem.jjsj[0].getTime()); // 毫秒级时间戳
        (this.formItem.jjsj && this.formItem.jjsj[1]) && (args.jjjsjc = this.formItem.jjsj[1].getTime()); // 毫秒级时间戳
        (this.formItem.datetimerange && this.formItem.datetimerange[0]) && (args.kqssjc = this.formItem.datetimerange[0].getTime()); // 毫秒级时间戳
        (this.formItem.datetimerange && this.formItem.datetimerange[1]) && (args.jqssjc = this.formItem.datetimerange[1].getTime()); // 毫秒级时间戳
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : this.$pageInfo.page;
        args.size = this.pageInfo.size ? this.pageInfo.size : this.$pageInfo.size;
        this.$set(this, 'loading', true);

        this.$http.post('/api/com/jidishuju/selectNodes', args).then((response) => {
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
      insert() {
        this.$refs.ref1558919005000.resetFields();
        this.$set(this, 'editItem', {});
        this.$set(this.editItem, '_type', 'insert');
        this.$set(this, 'showModal', true);
      },
      update(row) {
        this.$refs.ref1558919005000.resetFields();
        this.$set(this, 'editItem', JSON.parse(JSON.stringify(row)));
        this.$set(this.editItem, '_type', 'update');
        this.$set(this.editItem, '_jjsj', new Date(this.editItem.jjsj));
        this.$set(this, 'showModal', true);
      },
      remove(xhs) {
        (!xhs) && (xhs = this.$refs.selection.getSelection().map(n => n.xh).join(','));
        if (xhs) {
          this.$http.post('/api/com/jidishuju/deleteNodes', {xhs: xhs}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
      updateDate() {
        if (this.editItem._jjsj) {
          this.$set(this.editItem, 'jjsj', this.editItem._jjsj.format('yyyy-MM-dd HH:mm:ss.SSS'));
          this.$set(this.editItem, 'jjsjc', this.editItem._jjsj.getTime());
          this.$set(this.editItem, 'riqi', parseInt(this.editItem._jjsj.format('yyyyMMdd')));
        }
        if (this.editItem._qssj) {
          this.$set(this.editItem, 'qssj', this.editItem._qssj.format('yyyy-MM-dd HH:mm:ss.SSS'));
          this.$set(this.editItem, 'qssjc', parseInt(this.editItem._qssj.format('yyyyMMdd')));
        }
      },
      submit() {
        this.$refs.ref1558919005000.validate((valid) => {
          if (valid) {
            this.$set(this, 'modalLoading', true);
            this.updateDate();
            (!this.editItem.rksjc) && (this.$set(this.editItem, 'rksjc', new Date().getTime())); // 入库时间戳
            this.$http.post('/api/com/jidishuju/' + this.editItem['_type'] + 'Node', this.editItem).then((response) => {
              this.$set(this, 'modalLoading', false);
              if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 1) {
                this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
                this.$set(this, 'showModal', false);
                this.search();
                return true;
              } else if (!!response && response.status === 200 && (response.data.status & 0b00001111) !== 1) {
                this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
              } else {
                this.$Message.warning({closable: true, duration: 2, content: '请求失败!',});
              }
              return false;
            }).catch(() => {
              this.$set(this, 'modalLoading', false);
              return false;
            });
          } else {
            return false;
          }
        })
      },
    },
  }
</script>

<style scoped></style>
