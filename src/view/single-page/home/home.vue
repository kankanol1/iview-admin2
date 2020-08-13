<template>
  <div>
    <Row :gutter="20">
      <i-col :xs="12" :md="8" :lg="4" v-for="(infor, i) in inforCardData" :key="`infor-${i}`"
             style="height: 120px;padding-bottom: 10px;">
        <infor-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36">
          <count-to :end="infor.count" count-class="count-style"/>
          <p>{{ infor.title }}</p>
        </infor-card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="8" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie style="height: 300px;" :value="pieData" text="卡口数据来源"></chart-pie>
        </Card>
      </i-col>
      <i-col :md="24" :lg="16" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-bar style="height: 300px;" :value="barData" text="本周卡口数据采集量"/>
        </Card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="8" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie style="height: 300px;" :value="pieData2" text="热点数据"></chart-pie>
        </Card>
      </i-col>
      <i-col :md="24" :lg="16" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-bar style="height: 300px;" :value="barData2" text="本周热点数据采集量"/>
        </Card>
      </i-col>
    </Row>
    <Row>
      <Card shadow>
        <example text="异常卡口数据统计" :color="color1" :value="exampleData" style="height: 310px;"/>
      </Card>
    </Row>
    <Row>
      <Card shadow>
        <example text="异常热点数据统计" :color="color2" :value="exampleData2" style="height: 310px;"/>
      </Card>
    </Row>
  </div>
</template>

<script>
import InforCard from '_c/info-card'
import CountTo from '_c/count-to'
import { ChartPie, ChartBar } from '_c/charts'
import Example from './example.vue'

export default {
  name: 'home',
  components: {
    InforCard,
    CountTo,
    ChartPie,
    ChartBar,
    Example
  },
  data () {
    return {
      color1: [
        '#9400D3',
        '#FF1493',
        '#00BFFF',
        '#1E90FF',
        '#2241b2',
        '#c99e29',
        '#228B22'
      ],
      color2: [
        '#7FFF00',
        '#D2691E',
        '#FF7F50',
        '#6495ED',
        '#00FFFF',
        '#DC143C',
        '#00008B'
      ],
      inforCardData: [
        { title: '卡口采集总量', icon: 'md-person-add', count: 803, color: '#2d8cf0' },
        { title: '热点采集总量', icon: 'md-locate', count: 232, color: '#19be6b' },
        { title: '卡口当日采集量', icon: 'md-help-circle', count: 142, color: '#ff9900' },
        { title: '热点当日采集量', icon: 'md-share', count: 57, color: '#ed3f14' },
        { title: '异常卡口推送量', icon: 'md-chatbubbles', count: 12, color: '#E46CBB' },
        { title: '异常热点推送量', icon: 'md-map', count: 14, color: '#9A66E4' }
      ],
      pieData: [
        { value: 335, name: '小型汽车' },
        { value: 310, name: '境外汽车' },
        { value: 234, name: '大型汽车' },
        { value: 135, name: '临时车牌' },
        { value: 1548, name: '其他车牌' }
      ],
      pieData2: [
        { value: 1548, name: '市中区' },
        { value: 1548, name: '高新区' },
        { value: 234, name: '历下区' },
        { value: 135, name: '历城区' },
        { value: 548, name: '槐荫区' },
        { value: 1048, name: '天桥区' }
      ],
      barData: {
        '周一': 13253,
        '周二': 34235,
        '周三': 26321,
        '周四': 12340,
        '周五': 24643,
        '周六': 0,
        '周日': 0
      },
      barData2: {
        '周一': 13253,
        '周二': 24235,
        '周三': 16321,
        '周四': 15340,
        '周五': 44643,
        '周六': 0,
        '周日': 0
      },
      exampleData: [
        {
          name: '小型轿车',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#2d8cf0'
            }
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '大型汽车',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#10A6FF'
            }
          },
          data: [257, 358, 278, 234, 290, 330, 310]
        },
        {
          name: '境外汽车',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#0C17A6'
            }
          },
          data: [379, 268, 354, 269, 310, 478, 358]
        },
        {
          name: '临时车牌',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#4608A6'
            }
          },
          data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
          name: '其他车牌',
          type: 'line',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          },
          areaStyle: {
            normal: {
              color: '#398DBF'
            }
          },
          data: [820, 645, 546, 745, 872, 624, 258]
        }
      ],
      exampleData2: [
        {
          name: '市中区',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#2d8cf0'
            }
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '历下区',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#10A6FF'
            }
          },
          data: [257, 358, 278, 234, 290, 330, 310]
        },
        {
          name: '历城区',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#0C17A6'
            }
          },
          data: [379, 268, 354, 269, 310, 478, 358]
        },
        {
          name: '天桥区',
          type: 'line',
          stack: '总量',
          areaStyle: {
            normal: {
              color: '#4608A6'
            }
          },
          data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
          name: '槐荫区',
          type: 'line',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          },
          areaStyle: {
            normal: {
              color: '#398DBF'
            }
          },
          data: [620, 645, 546, 645, 572, 724, 258]
        }
      ]

    }
  },
  mounted () {

  }
}
</script>

<style lang="less">
  .count-style {
    font-size: 50px;
  }
</style>
