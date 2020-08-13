<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">

    <div class="login-con">
<!--      <div class="login-con-title">人车轨迹分析系统</div>-->
      <Card icon="log-in" title="人车轨迹分析系统" :bordered="false">
        <div class="form-con">
          <login-form :loading="loading" @on-success-valid="handleSubmit"></login-form>
          <!--          <p class="login-tip">输入任意用户名和密码即可</p>-->
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
  import LoginForm from '_c/login-form'
  import {mapMutations} from 'vuex'

  export default {
    components: {
      LoginForm
    },
    data() {
      return {
        loading:false,
      }
    },
    methods: {
      ...mapMutations([
        'setAccess',
        'setTagNavList'
      ]),

      handleSubmit({userName, password}) {

        this.loading = true;
        let CryptoJS = require('crypto-js');
        // base64 加密
        let username = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${new Date().format('yyyyMMddHHmm')}${userName}`));
        password = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${new Date().format('yyyyMMddHHmm')}${password}`));
        for (let i = 0; i < 10; i++) {
          username = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`X${i}${username}`));
          password = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`X${i}${password}`));
        }

        this.$http.post('/api/self/logon', {username: username, password: password,}).then((response) => {
          if (response && response.status === 200) {
            if ((response.data.status & 0b00000111) === 1) { // 登录成功
              this.$http.post('/api/self/infomation').then((response) => {
                if (response && response.status === 200) {
                  if ((response.data.status & 0b00000111) === 1) { // 登录成功
                    this.setTagNavList([]);
                    this.setAccess(response.data.data.role);
                    sessionStorage.setItem('userInfo', JSON.stringify(response.data.data));
                    this.$router.push({name: 'home'});
                    this.loading = false;
                    // this.$router.push({name: this.$config.homeName});
                    /* this.handleLogin({userName, password}).then(res => {
                       this.getUserInfo().then(res => {
                         this.$router.push({
                           name: this.$config.homeName
                         })
                       })
                     })*/
                  } else {
                    this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                  }
                }
              }).catch(() => {
              });
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }

        }).catch(() => {
          this.loading = false;
        });
      }
    }
  }
</script>

<style>

</style>
