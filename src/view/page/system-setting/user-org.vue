<template>
  <div>
    <div class="clear" style="padding-bottom: 10px">
      <Row>
        <Col span="4">
          <Input class="interval" size="small" clearable v-model="formItem.username" placeholder="请输入用户名称或真实姓名"/>
        </Col>
        <Col span="4">
          <Input class="interval" size="small" clearable v-model="formItem.idcard" placeholder="请输入用户证件号码"/>
        </Col>
        <Col span="16">
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
            <Button ghost @click="insert()" type="success" icon="md-add">添加</Button>
            <Button ghost @click="remove()" type="error" icon="md-close">删除</Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh">参数重置</Button>
          </ButtonGroup>
          <ButtonGroup size="small" style="padding-left:20px;">
            <Button ghost @click="enabledUser()" type="warning" icon="md-checkmark">启用用户</Button>
            <Button ghost @click="disableUser()" type="warning" icon="md-close">禁用用户</Button>
            <Button ghost @click="resetPassword()" type="warning" icon="ios-contact-outline">密码重置</Button>
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
      :maxHeight="tableHeight"
    />
    <Page
      size="small"
      show-total show-elevator show-sizer :current.sync="pageInfo.page"
      :page-size.sync="pageInfo.size" :page-size-opts="$pageSizeOpts"
      :total="pageInfo.totalElements"
      @on-change="search"
      @on-page-size-change="(value) => {pageInfo.size = value;search();}"
      style="float: right;padding-top: 6px"
    />
    <Modal v-model="showModal" title="信息维护" width="700px" :styles="{top: '10px'}">
      <Form ref="ref1558919005002" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="id">
          <Input disabled v-model="editItem.id" placeholder="序号,自动生成" clearable/>
        </FormItem>
        <FormItem label="用户名称" prop="username">
          <Input :disabled="!!editItem.id" v-model="editItem.username" placeholder="请输入用户名称" clearable/>
        </FormItem>
        <FormItem label="用户姓名" prop="realname">
          <Input v-model="editItem.realname" placeholder="请输入用户姓名" clearable/>
        </FormItem>
        <FormItem label="证件号码" prop="idcard">
          <Input v-model="editItem.idcard" placeholder="请输入证件号码" clearable/>
        </FormItem>
        <FormItem label="性别" prop="sex">
          <Select v-model="editItem.sex">
            <Option key="男" value="男" label="男">男</Option>
            <Option key="女" value="女" label="女">女</Option>
          </Select>
        </FormItem>
        <FormItem label="用户角色" prop="role">
          <Select clearable v-model="editItem.role" placeholder="请选择用户角色">
            <Option v-for="(value, key, index) in roles" :key="index" :value="key" :label="value">{{value}}</Option>
          </Select>
        </FormItem>
        <FormItem label="用户状态" prop="enabled">
          <Select clearable v-model="editItem.enabled" placeholder="请选择用户状态">
            <Option key="false" value="false" label="禁用">禁用</Option>
            <Option key="true" value="true" label="正常">正常</Option>
          </Select>
        </FormItem>
        <FormItem label="授权模块" prop="instances">
          <Select multiple clearable v-model="editItem.instancesList" placeholder="请选择授权模块">
            <template v-for="(value, key, index) in $models">
              <Option v-if="userInfo.instances & parseInt(key)" :key="index" :value="parseInt(key)" :label="value">
                {{value}}
              </Option>
            </template>
          </Select>
        </FormItem>
        <FormItem label="科室信息" prop="officeid">
          <Select clearable v-model="editItem.officeid" placeholder="请选择科室信息">
            <!--获取用户科室信息-->
            <template
              v-for="(user_officeRegionCode) in offices[userInfo.officeid] ? [offices[userInfo.officeid].officeRegionCode] : []">
              <!--循环科室信息-->
              <template v-for="(value, key, index) in offices">
                <Option v-if="value.officeRegionCode.indexOf(user_officeRegionCode.replace(/(0*$)/, '')) > -1"
                        :key="index" :value="parseInt(key)" :label="value.officeName">{{value.officeName}}
                </Option>
              </template>
            </template>
          </Select>
        </FormItem>
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
    name: 'user-org',
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
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/sys/offices/selectNodes', {page: 0, size: 99999}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          if (response.data.data) {
            let offices = {};
            response.data.data.forEach((node) => (offices[node.id] = node));
            this.$set(this, 'offices', offices);
          }
        }
      });
      this.$http.post('/api/sys/user/info/userRoles', {}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          if (response.data.data) {
            this.$set(this, 'roles', response.data.data);
          }
        }
      });
      setTimeout(this.search(), 500);
    },
    data() {
      return {
        userInfo: {}, // 用户信息
        offices: {}, // 科室信息
        roles: {}, // 用户角色信息
        tableHeight: 0,
        pageInfo: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        formItem: {}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {title: '用户名称', key: 'username', align: 'center',},
          {
            title: '用户角色',
            key: 'role',
            align: 'center',
            render: (h, params) => h('div', {}, this.roles[params.row.role])
          },
          {
            title: '用户状态',
            key: 'enabled',
            align: 'center',
            render: (h, params) => h('div', {}, {true: '正常', false: '禁用'}[params.row.enabled])
          },
          {
            title: '用户有效期',
            key: 'validity',
            align: 'center',
            render: (h, params) => h('div', {}, new Date(params.row.validity).format('yyyy-MM-dd'))
          },
          {title: '用户姓名', key: 'realname', align: 'center',},
          {title: '证件号码', key: 'idcard', align: 'center',},
          {title: '性别', key: 'sex', align: 'center',},
          {
            title: '授权模块', key: 'instances', align: 'center',
            render: (h, params) => h('div', {}, params.row.instancesList ? params.row.instancesList.map(key => this.$models[key]).join(',') : '')
          },
          {
            title: '默认模块', key: 'instdefault', align: 'center',
            render: (h, params) => h('div', {}, this.$models[params.row.instdefault] ? this.$models[params.row.instdefault] : '')
          },
          {
            title: '科室名称',
            key: 'officeid',
            align: 'center',
            render: (h, params) => h('div', {}, params.row.office.officeName),
          },
          {
            title: '操作', key: 'xh', width: 150, align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'info', size: 'small'},
                  on: {click: () => this.update(params.row)}
                }, '编辑'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'error', size: 'small'},
                  on: {click: () => this.remove(params.row.username)}
                }, '删除')
              ]);
            },
          },
        ], // 展示字段
        content: [], // 数据

        editItem: {}, // 添加或修改内容
        showModal: false, // 显示修改内容的Modal框
        modalLoading: false, // 添加或修改,触发请求时的等待状态
        ruleValidate: {
          username: [{required: true, type: 'string', message: '请填写用户名称信息!', trigger: 'blur'}],
          realname: [{required: true, type: 'string', message: '请填写用户姓名信息!', trigger: 'blur'}],
          idcard: [{required: true, type: 'string', message: '请填写证件信息!', trigger: 'blur'}],
          role: [{required: true, type: 'string', message: '请选择用户角色信息!', trigger: 'change'}],
          sex: [{required: true, type: 'string', message: '请选择性别信息!', trigger: 'change'}],
          officeid: [{required: true, type: 'number', message: '请选择科室信息!', trigger: 'change'}],
          enabled: [{required: true, type: 'string', message: '请选择用户状态信息!', trigger: 'change'}],
        }, // 添加或修改字段校验规则
      };
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-page mini")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.tableHeight = height - 40;
        }
      },
      reset() {
        this.$set(this, 'formItem', {})
        this.$set(this, 'pageInfo', JSON.parse(JSON.stringify(this.$pageInfo)));
        this.search();
      },
      enabledUser() {
        let usernames = this.$refs.selection.getSelection().map(n => n.username).join(',');
        if (usernames) {
          this.$http.post('/api/sys/user/info/enabledUser', {usernames: usernames}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        } else {
          this.$Message.warning({closable: true, duration: 2, content: '请选择需要操作的用户!',});
        }
      },
      disableUser() {
        let usernames = this.$refs.selection.getSelection().map(n => n.username).join(',');
        if (usernames) {
          this.$http.post('/api/sys/user/info/disableUser', {usernames: usernames}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        } else {
          this.$Message.warning({closable: true, duration: 2, content: '请选择需要操作的用户!',});
        }
      },
      resetPassword() {
        let usernames = this.$refs.selection.getSelection().map(n => n.username).join(',');
        if (usernames) {
          this.$http.post('/api/sys/user/info/resetPassword', {usernames: usernames}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        } else {
          this.$Message.warning({closable: true, duration: 2, content: '请选择需要操作的用户!',});
        }
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        (this.formItem.username) && (args.username = this.formItem.username);
        (this.formItem.idcard) && (args.idcard = this.formItem.idcard);
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : this.$pageInfo.page;
        args.size = this.pageInfo.size ? this.pageInfo.size : this.$pageInfo.size;
        this.$set(this, 'loading', true);

        this.$http.post('/api/sys/user/info/selectNodes', args).then((response) => {
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
        this.$refs.ref1558919005002.resetFields();
        this.$set(this, 'editItem', {});
        this.$set(this.editItem, '_type', 'insert');
        this.$set(this, 'showModal', true);
      },
      update(row) {
        this.$refs.ref1558919005002.resetFields();
        this.$set(this, 'editItem', JSON.parse(JSON.stringify(row)));
        this.$set(this.editItem, '_type', 'update');
        this.$set(this, 'showModal', true);
      },
      remove(usernames) {
        (!usernames) && (usernames = this.$refs.selection.getSelection().map(n => n.username).join(','));
        if (usernames) {
          this.$http.post('/api/sys/user/info/deleteNodes', {usernames: usernames}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
      submit() {
        this.$refs.ref1558919005002.validate((valid) => {
          if (valid) {
            if (this.editItem.instancesList && this.editItem.instancesList.length) {
              this.$set(this.editItem, 'instances', this.editItem.instancesList.reduce((l, r) => l | r));
            } else {
              this.$set(this.editItem, 'instances', 0);
            }
            this.$set(this, 'modalLoading', true);
            this.$http.post('/api/sys/user/info/' + this.editItem['_type'] + 'Node', this.editItem).then((response) => {
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

<style scoped>
</style>
