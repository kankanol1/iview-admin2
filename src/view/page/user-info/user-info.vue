<template>
  <div>
    <Card title="个人信息" style="max-width: 400pt;margin: 20pt auto;">
      <Form ref="formInline" :label-width="80">
        <Row>
          <Col span="12">
            <FormItem label="用户名称" style="margin-bottom: 15px;">
              <Row>
                <Col span="20">
                  <Input v-model="userInfo.username" :disabled="!userInfo.status"/>
                </Col>
              </Row>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="真实名称" style="margin-bottom: 15px;">
              <Row>
                <Col span="20">
                  <Input v-model="userInfo.realname" :disabled="!userInfo.status"/>
                </Col>
              </Row>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="证件号码" style="margin-bottom: 15px;">
              <Row>
                <Col span="20">
                  <Input v-model="userInfo.idcard" :disabled="!userInfo.status"/>
                </Col>
              </Row>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="性别" style="margin-bottom: 15px;">
              <Row>
                <Col span="20">
                  <Select v-model="userInfo.sex" :disabled="!userInfo.status && !!userInfo.sex">
                    <template v-for="(value, key, index) in sexes">
                      <Option :key="index" :value="key" :label="value">{{value}}</Option>
                    </template>
                  </Select>
                </Col>
              </Row>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="科室名称" style="margin-bottom: 15px;" v-if="!!userInfo.office">
            <Row>
              <Col span="20">
                <Tag v-model="userInfo.office.officeName" type="border" color="blue" style="height:30px;line-height:30px;width: 100%; text-align: center;">
                  {{userInfo.office.officeName || '未知'}}
                </Tag>
              </Col>
            </Row>
          </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="用户角色" style="margin-bottom: 15px;" v-if="!!userInfo.role">
              <Row>
                <Col span="20">
                  <Tag v-model="userInfo.role" type="border" color="blue" style="height:30px;line-height:30px;width: 100%; text-align: center;">
                    {{roles[userInfo.role] ? roles[userInfo.role] : '未知'}}
                  </Tag>
                </Col>
              </Row>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="默认模块" style="margin-bottom: 15px;">
          <Row>
            <Col span="22">
              <Select v-model="userInfo.instdefault" placeholder="请选择授权模块" :disabled="!userInfo.status">
                <template v-for="(value, key, index) in $models">
                  <Option v-if="userInfo && userInfo.instances && (userInfo.instances & key) == 1" :key="index" :value="parseInt(key)" :label="value">{{value}}
                  </Option>
                </template>
              </Select>
            </Col>
          </Row>
        </FormItem>
        <FormItem style="margin-bottom: 15px;">
          <Row>
            <Col span="22">
              <Button type="primary" long @click="submit" :disabled="!userInfo.status">提交</Button>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <p style="text-shadow: darkgray 0.1em 0.1em 0.1em">温馨提示: 身份信息只有一次修改权限, 请慎重修改!</p>
    </Card>
  </div>
</template>

<script>

  export default {
    name: 'user-info',
    components: {},
    data() {
      return {
        userInfo: {}, // 用户信息
        roles: {}, // 用户角色信息
        sexes: {}, // 用户性别信息
        loading: false,
      }
    },
    mounted() {
      // 从本地session里面读取, 读取不到, 说明未登录, 会被router拦截, 跳转到登录页.
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/sys/user/info/userSexes', {}).then((response) => {
        if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
          (response.data.data) && (this.$set(this, 'sexes', response.data.data));
        }
      });
      this.$http.post('/api/sys/user/info/userRoles', {}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          (response.data.data) && (this.$set(this, 'roles', response.data.data));
        }
      });
    },
    methods: {
      submit() {
        if (!this.userInfo.sex) {
          this.$Message.warning({closable: false, duration: 1, content: '请选择您的性别信息!',});
          return false;
        }
        if (!this.userInfo.idcard || !(15 == this.userInfo.idcard.length || 18 == this.userInfo.idcard.length)) {
          this.$Message.warning({closable: false, duration: 1, content: '请填写您的证件信息!',});
          return false;
        }
        this.$set(this, 'loading', true);
        this.$http.post('/api/self/update', this.userInfo).then((response) => {
          if (!!response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$http.post('/api/self/infomation').then((response) => { // 修改完成后, 更新本地缓存
                if (response && response.status === 200 && ((response.data.status & 0b00000111) === 0b00000001)) {
                  sessionStorage.setItem('userInfo', JSON.stringify(response.data.data));
                  this.$set(this, 'userInfo', response.data.data);
                }
              });
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'loading', false);
        }).catch(() => this.$set(this, 'loading', false));
      },
    }
  }
</script>

<style></style>
