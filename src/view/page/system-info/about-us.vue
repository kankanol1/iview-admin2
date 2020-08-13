<template>
  <div style="height: 100%;width: 100%;font-size: 12pt;" class="center-center">
    <div id="main_content">
      <div id="box">
        <div id="title">
          <h3>
            关于我们
          </h3>
        </div>
        <div id="content">
          <p>
            观澜数据技术有限公司（简称“观澜数据”）成立于2012年，是一家在大数据浪潮中应运而生，提供多种维度大数据管理与分析服务和深层次解决方案的技术性企业，
            秉承“诚信、负责、严谨、创新”的企业理念，目标是成为中国领先的大数据和云计算核心技术和解决方案提供商。
          </p>
          <p>
            观澜数据提供多项企业级大数据产品和解决方案，涵盖医疗、交通、通信、工业、教育等诸多领域，助力企业降低研发成本、迅速实施产品质量改善；观澜数据提供
            面向大数据行业的专家级咨询方案和优质培训服务，全面帮助企业提升将数据资产转化为商业价值的能力。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "node01"
  }
</script>

<style scoped lang="less">
  #main_content {
    width: 500pt;
    max-width: 500pt;
    min-width: 500pt;
    margin: 0 auto;

    #box {
      margin: 10px 10px 20px;
      border: 1px solid #D0D0D0;

      #title {
        border-left: 5px solid #0399ce;
        padding: 8px 10px;
        color: #333;
        background-color: #F5F5F5;
      }

      #content {
        padding: 0 20px;

        p {
          text-indent: 2em;
          margin: 15pt 0pt;
        }
      }
    }
  }
</style>
