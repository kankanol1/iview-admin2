import Main from '@/components/main'
import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true,
      access: [],
      users: [],
      rules: [],
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '设备维护',
      access: [],
      users: [],
      rules: [],
    },
    children: [
      {
        path: 'equ_way',
        name: 'equ_way',
        meta: {
          icon: 'ios-book',
          title: '卡口维护',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/equipment/equ-way')
      },
      {
        path: 'equ_rd',
        name: 'equ_rd',
        meta: {
          icon: 'ios-book',
          title: '热点维护',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/equipment/equ-rd')
      },
      {
        path: 'equ_com_table',
        name: 'equ_com_table',
        meta: {
          icon: 'ios-book',
          title: '关联维护表',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/equipment/equ-com-table')
      },
      {
        path: 'equ_com_map',
        name: 'equ_com_map',
        meta: {
          icon: 'ios-book',
          title: '关联维护图',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/equipment/equ-com-map')
      },
    ]
  },
  {
    path: '/base',
    name: 'base',
    component: Main,
    meta: {
      icon: 'ios-paper',
      title: '基本数据',
      access: [],
      users: [],
      rules: [],
    },
    children: [
      {
        path: 'base_car',
        name: 'base_car',
        meta: {
          icon: 'ios-paper',
          title: '过车数据',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/base-info/car')
      },
      {
        path: 'base_rd',
        name: 'base_rd',
        meta: {
          icon: 'ios-paper',
          title: '热点数据',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/base-info/rd')
      },
      {
        path: 'base_car_com',
        name: 'base_car_com',
        meta: {
          icon: 'ios-paper',
          title: '过车数据对比',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/base-info/car-com')
      },
      {
        path: 'base_rd_com',
        name: 'base_rd_com',
        meta: {
          icon: 'ios-book',
          title: '热点数据对比',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/base-info/rd-com')
      },
      {
        path: 'base_car_rd',
        name: 'base_car_rd',
        meta: {
          icon: 'ios-paper',
          title: '过车热点数据对比',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/base-info/car-rd')
      },
      {
        path: 'base_jd_rd',
        name: 'base_jd_rd',
        meta: {
          icon: 'ios-paper',
          title: '寄递数据',
          access: ['ROLE_DEVELOP'],
          users: [],
          rules: ['ROLE_DEVELOP'],
        },
        component: () => import('@/view/page/base-info/jd')
      },
    ]
  },
  {
    path: '/check',
    name: 'check',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '人工比对',
      hideInMenu: true,
      hideInBread: true,
      access: [],
      users: [],
      rules: [],
    },
    children: [
      {
        path: 'car_check_table',
        name: 'car_check_table',
        meta: {
          icon: 'ios-book',
          title: '车辆人工比对',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/human-check/car-check')
      },
      {
        path: 'rd_check_table',
        name: 'rd_check_table',
        meta: {
          icon: 'ios-book',
          title: '热点人工比对',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/human-check/rd-check')
      },
    ]
  },
  {
    path: '/human',
    name: 'human',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '人车合一',
      access: [],
      users: [],
      rules: [],
    },
    children: [
      {
        path: 'hum_com_table',
        name: 'hum_com_table',
        meta: {
          icon: 'ios-book',
          title: '人车伴随表',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/human-car/hum-com-table')
      },
      {
        path: 'hum_com_map',
        name: 'hum_com_map',
        meta: {
          icon: 'ios-book',
          title: '人车伴随图',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/human-car/hum-com-map')
      },
      {
        path: 'hum_com_table_o',
        name: 'hum_com_table_o',
        meta: {
          icon: 'ios-book',
          title: '人车伴随表(原)',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/human-car/hum-com-table-o')
      },
      {
        path: 'hum_com_map_o',
        name: 'hum_com_map_o',
        meta: {
          icon: 'ios-book',
          title: '人车伴随图(原)',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/human-car/hum-com-map-o')
      },
    ]
  },

  {
    path: '/analysis',
    name: 'analysis',
    component: Main,
    meta: {
      icon: 'md-bus',
      title: '伴随分析',
      access: [],
      users: [],
      rules: [],
    },
    children: [
      {
        path: 'ana_hum_table',
        name: 'ana_hum_table',
        meta: {
          icon: 'md-bus',
          title: '人人伴随表',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/adjoint-analysis/hum-adjoint-table')
      },
      {
        path: 'ana_hum_map',
        name: 'ana_hum_map',
        meta: {
          icon: 'md-bus',
          title: '人人伴随图',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/adjoint-analysis/hum-adjoint-map')
      },
      {
        path: 'ana_rd_table',
        name: 'ana_rd_table',
        meta: {
          icon: 'md-bus',
          title: '热点伴随表',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/adjoint-analysis/rd-adjoint-table')
      },
      {
        path: 'ana_rd_map',
        name: 'ana_rd_map',
        meta: {
          icon: 'md-bus',
          title: '热点伴随图',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/adjoint-analysis/rd-adjoint-map')
      },{
        path: 'ana_car_table',
        name: 'ana_car_table',
        meta: {
          icon: 'md-bus',
          title: '车车伴随表',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/adjoint-analysis/car-adjoint-table')
      },
      {
        path: 'ana_car_map',
        name: 'ana_car_map',
        meta: {
          icon: 'md-bus',
          title: '车车伴随图',
          access: [],
          users: [],
          rules: [],
        },
        component: () => import('@/view/page/adjoint-analysis/car-adjoint-map')
      },
    ]
  },

  {
    path: '/work',
    name: 'work',
    component: Main,
    meta: {
      icon: 'ios-flask',
      title: '分析任务',
      access: ['ROLE_DEVELOP'],
      users: [],
      rules: ['ROLE_DEVELOP'],
      hideInMenu: true,
      hideInBread:true,
    },
    children: [
      {
        path: 'work_list_new',
        name: 'work_list_new',
        meta: {
          icon: 'ios-flask',
          title: '任务列表',
          access: ['ROLE_DEVELOP'],
          users: [],
          rules: ['ROLE_DEVELOP'],
        },
        component: () => import('@/view/page/analysis-work/work-list-new')
      },
      {
        path: 'work-list-result',
        name: 'work-list-result',
        meta: {
          icon: 'ios-flask',
          title: '任务结果',
          rules: [],
          users: [],
          access: [],
          hideInMenu:true,
        },
        component: () => import('@/view/page/analysis-work/work-list-result')
      },
     /* {
        path: 'work-list-result',
        name: 'work-list-result',
        meta: {
          icon: 'ios-book',
          title: '任务结果',
          hideInMenu:true,
        },
        component: () => import('@/view/page/base-info/work-list-result')
      },*/
    ]
  },
  {
    path: '/logs',
    name: 'logs',
    component: Main,
    meta: {
      icon: 'md-calculator',
      title: '操作日志',
      rules: [],
      users: [],
      access: [],
    },
    children: [
      {
        path: 'logs_history',
        name: 'logs_history',
        meta: {
          icon: 'md-calculator',
          title: '操作日志',
          rules:[],
          users: [],
          access: [],
        },
        component: () => import('@/view/page/logs-history/logs-history')
      },
    ]
  },
  {
    path: '/data',
    name: 'data',
    component: Main,
    meta: {
      icon: 'md-calculator',
      title: '数据统计',
      rules:[],
      users: [],
      access: [],
    },
    children: [
      {
        path: 'data_statics',
        name: 'data_statics',
        meta: {
          icon: 'md-calculator',
          title: '数据统计',
          rules:[],
          users: [],
          access: [],
        },
        component: () => import('@/view/page/data-statics/data-statics')
      },
      {
        path: 'kakou_statics',
        name: 'kakou_statics',
        meta: {
          icon: 'md-calculator',
          title: '卡口分时统计',
          rules: ['ROLE_DEVELOP', 'ROLE_ADMIN'],
          users: [],
          access: ['ROLE_DEVELOP', 'ROLE_ADMIN'],
        },
        component: () => import('@/view/page/data-statics/kakou-statics')
      },
      {
        path: 'rd_statics',
        name: 'rd_statics',
        meta: {
          icon: 'md-calculator',
          title: '热点分时统计',
          access: ['ROLE_DEVELOP', 'ROLE_ADMIN'],
          rules: ['ROLE_DEVELOP', 'ROLE_ADMIN'],
          users: [],
        },
        component: () => import('@/view/page/data-statics/rd-statics')
      },
    ]
  },

  {
    path: '/user',
    name: 'user',
    component: Main,
    meta: {
      icon: 'md-person',
      title: '个人信息',
      rules:[],
      users: [],
      access: [],
    },
    children: [
      {
        path: 'user_info',
        name: 'user_info',
        meta: {
          icon: 'md-person',
          title: '个人信息',
          rules:[],
          users: [],
          access: [],
        },
        component: () => import('@/view/page/user-info/user-info')
      }, {
        path: 'pwd_change',
        name: 'pwd_change',
        meta: {
          icon: 'ios-key',
          title: '密码修改',
          rules:[],
          users: [],
          access: [],
        },
        component: () => import('@/view/page/user-info/pwd-change')
      },
    ]
  },
  {
    path: '/system_setting',
    name: 'system_setting',
    component: Main,
    meta: {
      icon: 'ios-hammer',
      title: '系统设置',
      access: ['ROLE_ADMIN', 'ROLE_DEVELOP'],
      rules: ['ROLE_ADMIN', 'ROLE_DEVELOP'],
      users: [],
    },
    children: [
      {
        path: 'user_org',
        name: 'user_org',
        meta: {
          icon: 'ios-people',
          title: '用户管理',
          access: ['ROLE_ADMIN', 'ROLE_DEVELOP'],
          rules: ['ROLE_ADMIN', 'ROLE_DEVELOP'],
          users: [],
        },
        component: () => import('@/view/page/system-setting/user-org')
      },
      {
        path: 'room_org',
        name: 'room_org',
        meta: {
          icon: 'md-document',
          title: '科室管理',
          access: ['ROLE_ADMIN', 'ROLE_DEVELOP'],
          rules: ['ROLE_ADMIN', 'ROLE_DEVELOP'],
          users: [],
        },
        component: () => import('@/view/page/system-setting/room-org')
      },
    ]
  },
  {
    path: '/system_info',
    name: 'system_info',
    component: Main,
    meta: {
      icon: 'md-locate',
      title: '系统信息',
      access: [],
      rules: [],
      users: [],
    },
    children: [
      {
        path: 'about_us',
        name: 'about_us',
        meta: {
          icon: 'md-locate',
          title: '系统信息',
          access: [],
          rules: [],
          users: [],
        },
        component: () => import('@/view/page/system-info/about-us')
      },
    ]
  },
  {
    path: '/system_oper',
    name: 'system_oper',
    component: Main,
    meta: {
      icon: 'md-locate',
      title: '系统运维',
      rules: ['ROLE_DEVELOP'],
      access: ['ROLE_DEVELOP'],
      users: [],
    },
    children: [
      {
        path: 'system_variable',
        name: 'system_variable',
        meta: {
          icon: 'md-locate',
          title: '系统变量',
          rules: ['ROLE_DEVELOP'],
          access: ['ROLE_DEVELOP'],
          users: [],
        },
        component: () => import('@/view/page/system-oper/system-variable')
      }, {
        path: 'system_params',
        name: 'system_params',
        meta: {
          icon: 'md-locate',
          title: '系统参数',
          rules: ['ROLE_DEVELOP'],
          access: ['ROLE_DEVELOP'],
          users: [],
        },
        component: () => import('@/view/page/system-oper/system-params')
      },{
        path: 'logs_intercept',
        name: 'logs_intercept',
        meta: {
          icon: 'md-locate',
          title: '日志拦截',
          rules: ['ROLE_DEVELOP'],
          access: ['ROLE_DEVELOP'],
          users: [],
        },
        component: () => import('@/view/page/system-oper/logs-intercept')
      },
    ]
  },

 /* {
    path: '/base',
    name: 'base',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '基本数据'
    },
    children: [
      {
        path: 'base_car',
        name: 'base_car',
        meta: {
          icon: 'ios-book',
          title: '过车数据'
        },
        component: () => import('@/view/page/base-info/car')
      },
      {
        path: 'base_rd',
        name: 'base_rd',
        meta: {
          icon: 'ios-book',
          title: '热点数据'
        },
        component: () => import('@/view/page/base-info/rd')
      },
      {
        path: 'base_car_com',
        name: 'base_car_com',
        meta: {
          icon: 'ios-book',
          title: '过车数据对比'
        },
        component: () => import('@/view/page/base-info/car-com')
      },
      {
        path: 'base_rd_com',
        name: 'base_rd_com',
        meta: {
          icon: 'ios-book',
          title: '热点数据对比'
        },
        component: () => import('@/view/page/base-info/rd-com')
      },

    ]
  },*/

  /*{
    path: '/equipment',
    name: 'equipment',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '设备维护'
    },
    children: [
      {
        path: 'base_car',
        name: 'base_car',
        meta: {
          icon: 'ios-book',
          title: '过车数据'
        },
        component: () => import('@/view/page/base-info/car')
      },
      {
        path: 'base_rd',
        name: 'base_rd',
        meta: {
          icon: 'ios-book',
          title: '热点数据'
        },
        component: () => import('@/view/page/base-info/rd')
      },
      {
        path: 'base_car_com',
        name: 'base_car_com',
        meta: {
          icon: 'ios-book',
          title: '过车数据对比'
        },
        component: () => import('@/view/page/base-info/car-com')
      },
      {
        path: 'base_rd_com',
        name: 'base_rd_com',
        meta: {
          icon: 'ios-book',
          title: '热点数据对比'
        },
        component: () => import('@/view/page/base-info/rd-com')
      },

    ]
  },
  {
    path: '/base',
    name: 'base',
    component: Main,
    meta: {
      icon: 'logo-buffer',
      title: '基本数据'
    },
    children: [
      {
        path: 'base_car',
        name: 'base_car',
        meta: {
          icon: 'ios-book',
          title: '过车数据'
        },
        component: () => import('@/view/page/base-info/car')
      },
      {
        path: 'base_rd',
        name: 'base_rd',
        meta: {
          icon: 'ios-book',
          title: '热点数据'
        },
        component: () => import('@/view/page/base-info/rd')
      },
      {
        path: 'base_car_com',
        name: 'base_car_com',
        meta: {
          icon: 'ios-book',
          title: '过车数据对比'
        },
        component: () => import('@/view/page/base-info/car-com')
      },
      {
        path: 'base_rd_com',
        name: 'base_rd_com',
        meta: {
          icon: 'ios-book',
          title: '热点数据对比'
        },
        component: () => import('@/view/page/base-info/rd-com')
      },

    ]
  },*/
  /*{
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message_page',
        name: 'message_page',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/single-page/message/index.vue')
      }
    ]
  },
  {
    path: '/components',
    name: 'components',
    meta: {
      icon: 'logo-buffer',
      title: '组件',
      hideInBread: true,
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'tables_page',
        name: 'tables_page',
        meta: {
          icon: 'md-grid',
          title: '多功能表格'
        },
        component: () => import('@/view/components/tables/tables.vue')
      },
      {
        path: 'tables_test',
        name: 'tables_test',
        meta: {
          icon: 'md-grid',
          title: '测试'
        },
        component: () => import('@/view/page/test/table.vue')
      },
      {
        path: 'count_to_page',
        name: 'count_to_page',
        meta: {
          icon: 'md-trending-up',
          title: '数字渐变'
        },
        component: () => import('@/view/components/count-to/count-to.vue')
      }
    ]
  },*/
  /*  {
    path: '',
    name: 'doc',
    meta: {
      title: '文档',
      href: 'https://lison16.github.io/iview-admin-doc/#/',
      icon: 'ios-book'
    }
  },
  {
    path: '/join',
    name: 'join',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: 'join_page',
        name: 'join_page',
        meta: {
          icon: '_qq',
          title: 'QQ群'
        },
        component: () => import('@/view/join-page.vue')
      }
    ]
  },
  {
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message_page',
        name: 'message_page',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/single-page/message/index.vue')
      }
    ]
  },
  {
    path: '/components',
    name: 'components',
    meta: {
      icon: 'logo-buffer',
      title: '组件'
    },
    component: Main,
    children: [
      {
        path: 'tree_select_page',
        name: 'tree_select_page',
        meta: {
          icon: 'md-arrow-dropdown-circle',
          title: '树状下拉选择器'
        },
        component: () => import('@/view/components/tree-select/index.vue')
      },
      {
        path: 'count_to_page',
        name: 'count_to_page',
        meta: {
          icon: 'md-trending-up',
          title: '数字渐变'
        },
        component: () => import('@/view/components/count-to/count-to.vue')
      },
      {
        path: 'drag_list_page',
        name: 'drag_list_page',
        meta: {
          icon: 'ios-infinite',
          title: '拖拽列表'
        },
        component: () => import('@/view/components/drag-list/drag-list.vue')
      },
      {
        path: 'drag_drawer_page',
        name: 'drag_drawer_page',
        meta: {
          icon: 'md-list',
          title: '可拖拽抽屉'
        },
        component: () => import('@/view/components/drag-drawer')
      },
      {
        path: 'org_tree_page',
        name: 'org_tree_page',
        meta: {
          icon: 'ios-people',
          title: '组织结构树'
        },
        component: () => import('@/view/components/org-tree')
      },
      {
        path: 'tree_table_page',
        name: 'tree_table_page',
        meta: {
          icon: 'md-git-branch',
          title: '树状表格'
        },
        component: () => import('@/view/components/tree-table/index.vue')
      },
      {
        path: 'cropper_page',
        name: 'cropper_page',
        meta: {
          icon: 'md-crop',
          title: '图片裁剪'
        },
        component: () => import('@/view/components/cropper/cropper.vue')
      },
      {
        path: 'tables_page',
        name: 'tables_page',
        meta: {
          icon: 'md-grid',
          title: '多功能表格'
        },
        component: () => import('@/view/components/tables/tables.vue')
      },
      {
        path: 'split_pane_page',
        name: 'split_pane_page',
        meta: {
          icon: 'md-pause',
          title: '分割窗口'
        },
        component: () => import('@/view/components/split-pane/split-pane.vue')
      },
      {
        path: 'markdown_page',
        name: 'markdown_page',
        meta: {
          icon: 'logo-markdown',
          title: 'Markdown编辑器'
        },
        component: () => import('@/view/components/markdown/markdown.vue')
      },
      {
        path: 'editor_page',
        name: 'editor_page',
        meta: {
          icon: 'ios-create',
          title: '富文本编辑器'
        },
        component: () => import('@/view/components/editor/editor.vue')
      },
      {
        path: 'icons_page',
        name: 'icons_page',
        meta: {
          icon: '_bear',
          title: '自定义图标'
        },
        component: () => import('@/view/components/icons/icons.vue')
      }
    ]
  },
  {
    path: '/update',
    name: 'update',
    meta: {
      icon: 'md-cloud-upload',
      title: '数据上传'
    },
    component: Main,
    children: [
      {
        path: 'update_table_page',
        name: 'update_table_page',
        meta: {
          icon: 'ios-document',
          title: '上传Csv'
        },
        component: () => import('@/view/update/update-table.vue')
      },
      {
        path: 'update_paste_page',
        name: 'update_paste_page',
        meta: {
          icon: 'md-clipboard',
          title: '粘贴表格数据'
        },
        component: () => import('@/view/update/update-paste.vue')
      }
    ]
  },
  {
    path: '/excel',
    name: 'excel',
    meta: {
      icon: 'ios-stats',
      title: 'EXCEL导入导出'
    },
    component: Main,
    children: [
      {
        path: 'upload-excel',
        name: 'upload-excel',
        meta: {
          icon: 'md-add',
          title: '导入EXCEL'
        },
        component: () => import('@/view/excel/upload-excel.vue')
      },
      {
        path: 'export-excel',
        name: 'export-excel',
        meta: {
          icon: 'md-download',
          title: '导出EXCEL'
        },
        component: () => import('@/view/excel/export-excel.vue')
      }
    ]
  },
  {
    path: '/tools_methods',
    name: 'tools_methods',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'tools_methods_page',
        name: 'tools_methods_page',
        meta: {
          icon: 'ios-hammer',
          title: '工具方法',
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/tools-methods/tools-methods.vue')
      }
    ]
  },
  {
    path: '/i18n',
    name: 'i18n',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'i18n_page',
        name: 'i18n_page',
        meta: {
          icon: 'md-planet',
          title: 'i18n - {{ i18n_page }}'
        },
        component: () => import('@/view/i18n/i18n-page.vue')
      }
    ]
  },
  {
    path: '/error_store',
    name: 'error_store',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'error_store_page',
        name: 'error_store_page',
        meta: {
          icon: 'ios-bug',
          title: '错误收集'
        },
        component: () => import('@/view/error-store/error-store.vue')
      }
    ]
  },
  {
    path: '/error_logger',
    name: 'error_logger',
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'error_logger_page',
        name: 'error_logger_page',
        meta: {
          icon: 'ios-bug',
          title: '错误收集'
        },
        component: () => import('@/view/single-page/error-logger.vue')
      }
    ]
  },
  {
    path: '/directive',
    name: 'directive',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'directive_page',
        name: 'directive_page',
        meta: {
          icon: 'ios-navigate',
          title: '指令'
        },
        component: () => import('@/view/directive/directive.vue')
      }
    ]
  },
  {
    path: '/multilevel',
    name: 'multilevel',
    meta: {
      icon: 'md-menu',
      title: '多级菜单'
    },
    component: Main,
    children: [
      {
        path: 'level_2_1',
        name: 'level_2_1',
        meta: {
          icon: 'md-funnel',
          title: '二级-1'
        },
        component: () => import('@/view/multilevel/level-2-1.vue')
      },
      {
        path: 'level_2_2',
        name: 'level_2_2',
        meta: {
          access: ['super_admin'],
          icon: 'md-funnel',
          showAlways: true,
          title: '二级-2'
        },
        component: parentView,
        children: [
          {
            path: 'level_2_2_1',
            name: 'level_2_2_1',
            meta: {
              icon: 'md-funnel',
              title: '三级'
            },
            component: () => import('@/view/multilevel/level-2-2/level-2-2-1.vue')
          },
          {
            path: 'level_2_2_2',
            name: 'level_2_2_2',
            meta: {
              icon: 'md-funnel',
              title: '三级'
            },
            component: () => import('@/view/multilevel/level-2-2/level-2-2-2.vue')
          }
        ]
      },
      {
        path: 'level_2_3',
        name: 'level_2_3',
        meta: {
          icon: 'md-funnel',
          title: '二级-3'
        },
        component: () => import('@/view/multilevel/level-2-3.vue')
      }
    ]
  }, */
/*  {
    path: '/argu',
    name: 'argu',
    meta: {
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'params/:id',
        name: 'params',
        meta: {
          icon: 'md-flower',
          title: route => `{{ params }}-${route.params.id}`,
          notCache: true,
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/argu-page/params.vue')
      },
      {
        path: 'query',
        name: 'query',
        meta: {
          icon: 'md-flower',
          title: route => `{{ query }}-${route.query.id}`,
          notCache: true
        },
        component: () => import('@/view/argu-page/query.vue')
      }
    ]
  },*/
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
