<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvator"/>
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
       <!-- <DropdownItem name="message">
          消息中心
          <Badge style="margin-left: 10px" :count="messageUnreadCount"/>
        </DropdownItem>-->
        <DropdownItem name="infomation">个人信息</DropdownItem>
        <DropdownItem name="password">密码修改</DropdownItem>
        <Divider size="small" />
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
import userAvator from '../../../../assets/images/logo-min.jpg'
export default {
  name: 'User',
  data(){
    return{
      userAvator,
    }
  },
  props: {
   /* userAvator: {
      type: String,
      default: ''
    },*/
    messageUnreadCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
   /* ...mapActions([
      'handleLogOut'
    ]),*/
    /*logout () {
      this.handleLogOut().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    },*/
   /* message () {
      this.$router.push({
        name: 'message_page'
      })
    },*/
    handleClick (name) {
      /*switch (name) {
        case 'logout': this.logout()
          break
        case 'message': this.message()
          break
      }
*/
      switch (name) {
        case 'infomation': {
          this.$router.push({name: 'user_info'});
          break;
        }
        case 'password': {
          this.$router.push({name: 'pwd_change'});
          break;
        }
        case 'logout': {
          this.$http.post('/api/self/logout', {}).then((response) => {
            sessionStorage.clear();
            this.$router.push({name: 'login'});
          });
          break;
        }
        case 'other': {
          break;
        }
        default: {
          break;
        }
      }
    }
  }
}
</script>
