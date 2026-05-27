<template>
  <div class="section-page">
    <nav class="top-nav">
      <div class="nav-inner">
        <button class="back-btn" @click="$router.push('/catalog')"><svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M13 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> 返回目录</button>
        <span class="nav-title">{{ section?.title || '加载中' }}</span>
        <div style="width:100px"></div>
      </div>
    </nav>
    <div class="section-hero" v-if="section">
      <img :src="section.cover_image || '/materials/img/intro_main.jpg'" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-text">
        <div class="hero-badge">第 {{ sectionId }} 板块</div>
        <h1>{{ section.title }}</h1>
        <p>{{ section.description }}</p>
      </div>
    </div>

    <div class="section-content" v-if="section">
      <!-- 板块2: 结构组成 - 特殊交互布局 -->
      <template v-if="isStructureSection">
        <div class="structure-layout">
          <div class="structure-overview">
            <h2 class="structure-title">润滑系统结构组成总图</h2>
            <p class="structure-desc">{{ currentContent?.content_text }}</p>
            <div class="overview-img" @click="showImageModal(currentContent?.image_url)">
              <img :src="currentContent?.image_url" alt="结构组成总图" />
              <span class="img-hint">点击查看大图</span>
            </div>
          </div>
          <h3 class="grid-title">点击查看各组成部件详情</h3>
          <div class="component-grid">
            <div class="component-card" v-for="(item, idx) in currentContent?.sub_items" :key="item.id"
              :class="{ active: selectedComponent === idx }" @click="toggleComponent(idx)">
              <div class="comp-icon">{{ idx + 1 }}</div>
              <span class="comp-name">{{ item.title }}</span>
            </div>
          </div>
          <transition name="slide-fade">
            <div class="component-detail" v-if="selectedComponent >= 0 && currentContent?.sub_items?.[selectedComponent]">
              <div class="detail-header">
                <h3>{{ currentContent.sub_items[selectedComponent].title }}</h3>
                <button class="close-detail" @click="selectedComponent = -1">&times;</button>
              </div>
              <p class="detail-desc">{{ currentContent.sub_items[selectedComponent].description }}</p>
              <div class="detail-images">
                <div class="detail-img" v-if="currentContent.sub_items[selectedComponent].image_url">
                  <img :src="currentContent.sub_items[selectedComponent].image_url" :alt="currentContent.sub_items[selectedComponent].title" @click="showImageModal(currentContent.sub_items[selectedComponent].image_url)" />
                </div>
                <div class="detail-img" v-if="currentContent.sub_items[selectedComponent].image_url_2">
                  <button class="photo-btn" @click="showImageModal(currentContent.sub_items[selectedComponent].image_url_2)">
                    <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="7.5" cy="8.5" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 14l4-4 3 3 4-5 5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    查看实物图
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </template>

      <!-- 板块5: 故障表格 -->
      <template v-else-if="isFaultSection">
        <div class="fault-layout">
          <h2 class="fault-title">柴油机润滑系统常见故障和排除方法</h2>
          <div class="fault-table-wrap">
            <table class="fault-table">
              <thead>
                <tr><th style="width:18%">故障现象</th><th style="width:38%">主要原因</th><th style="width:44%">排除方法</th></tr>
              </thead>
              <tbody>
                <tr v-for="(fault, fi) in faultData" :key="fi">
                  <td class="fault-symptom">
                    <strong>{{ fault.symptom }}</strong>
                    <span class="fault-detail">{{ fault.detail }}</span>
                  </td>
                  <td>
                    <ol class="fault-list"><li v-for="(c, ci) in fault.causes" :key="ci">{{ c }}</li></ol>
                  </td>
                  <td>
                    <ol class="fault-list"><li v-for="(s, si) in fault.solutions" :key="si">{{ s }}</li></ol>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- 常规板块(板块1/3/4) -->
      <template v-else>
        <div class="tab-bar" v-if="section.contents && section.contents.length > 1">
          <button v-for="(c, i) in section.contents" :key="c.id" :class="['tab-item', { active: activeTab === i }]" @click="activeTab = i">{{ c.title }}</button>
        </div>
        <div class="tab-content" v-if="currentContent">
          <div class="content-intro">
            <p>{{ currentContent.content_text }}</p>
          </div>
          <div class="items-list">
            <div class="knowledge-item" v-for="(item, idx) in currentContent.sub_items" :key="item.id" :class="{ expanded: expandedItem === idx }" @click="expandedItem = expandedItem === idx ? -1 : idx">
              <div class="item-header">
                <div class="item-index">{{ idx + 1 }}</div>
                <h3>{{ item.title }}</h3>
                <svg class="arrow-icon" viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="item-body" v-show="expandedItem === idx">
                <p>{{ item.description }}</p>
                <div class="item-img" v-if="item.image_url && !isTextOnlySection">
                  <img :src="item.image_url" :alt="item.title" @click.stop="showImageModal(item.image_url)" />
                </div>
                <div class="photo-btn-wrap" v-if="item.image_url_2 && !isTextOnlySection">
                  <button class="photo-btn" @click.stop="showImageModal(item.image_url_2)">
                    <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="7.5" cy="8.5" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 14l4-4 3 3 4-5 5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    查看实物图
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="nav-buttons" v-if="section">
      <button v-if="Number(sectionId) > 1" class="nav-btn prev" @click="goSection(Number(sectionId) - 1)">← 上一板块</button>
      <div v-else></div>
      <button v-if="Number(sectionId) < 5" class="nav-btn next" @click="goSection(Number(sectionId) + 1)">下一板块 →</button>
      <button v-else class="nav-btn next" @click="$router.push('/quiz')">开始测试 →</button>
    </div>
    <div v-if="!section" class="loading-state">加载中...</div>

    <!-- 图片大图弹窗 -->
    <teleport to="body">
      <div class="image-modal-overlay" v-if="modalImage" @click="modalImage = null">
        <div class="image-modal" @click.stop>
          <button class="modal-close" @click="modalImage = null">&times;</button>
          <img :src="modalImage" alt="大图预览" />
        </div>
      </div>
    </teleport>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../utils/api'

const route = useRoute()
const router = useRouter()
const sectionId = computed(() => route.params.id)
const section = ref(null)
const activeTab = ref(0)
const expandedItem = ref(0)
const selectedComponent = ref(-1)
const modalImage = ref(null)

const isStructureSection = computed(() => Number(sectionId.value) === 2)
const isFaultSection = computed(() => Number(sectionId.value) === 5)
const isTextOnlySection = computed(() => Number(sectionId.value) === 4)

const currentContent = computed(() => section.value?.contents?.[activeTab.value] || null)

const faultData = computed(() => {
  if (!isFaultSection.value || !currentContent.value) return []
  try { return JSON.parse(currentContent.value.content_text) } catch { return [] }
})

function showImageModal(url) {
  if (url) modalImage.value = url
}

function toggleComponent(idx) {
  selectedComponent.value = selectedComponent.value === idx ? -1 : idx
}

async function loadSection() {
  section.value = null
  activeTab.value = 0
  expandedItem.value = 0
  selectedComponent.value = -1
  try {
    const res = await api.get(`/sections/${sectionId.value}`)
    if (res.code === 200) section.value = res.data
    api.post('/learn/record', { section_id: Number(sectionId.value) }).catch(() => {})
  } catch {}
}

function goSection(id) { router.push('/section/' + id) }
onMounted(loadSection)
watch(sectionId, loadSection)
</script>
<style scoped>
.section-page { min-height: 100vh; background: var(--bg-main); }
.top-nav { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
.nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 14px; color: var(--text-secondary); background: none; }
.back-btn:hover { color: var(--primary); }
.nav-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.section-hero { position: relative; height: 220px; overflow: hidden; }
.hero-bg { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(27,67,50,0.85), rgba(45,106,79,0.65)); }
.hero-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; }
.hero-badge { padding: 4px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 12px; margin-bottom: 12px; }
.hero-text h1 { font-size: 28px; font-weight: 700; letter-spacing: 3px; }
.hero-text p { font-size: 14px; opacity: 0.8; margin-top: 8px; max-width: 500px; text-align: center; }
.section-content { max-width: 960px; margin: 0 auto; padding: 32px 24px 24px; }

/* 标签栏 */
.tab-bar { display: flex; gap: 8px; margin-bottom: 24px; background: #fff; padding: 6px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
.tab-item { flex: 1; padding: 10px 16px; font-size: 14px; font-weight: 500; color: var(--text-secondary); background: none; border-radius: var(--radius-sm); transition: all 0.2s; }
.tab-item.active { background: var(--primary); color: #fff; }
.tab-item:hover:not(.active) { background: var(--primary-bg-light); }
.content-intro { margin-bottom: 20px; }
.content-intro p { font-size: 14px; color: var(--text-secondary); line-height: 1.8; }

/* 常规知识卡片 */
.knowledge-item { background: #fff; border-radius: var(--radius-md); margin-bottom: 12px; box-shadow: var(--shadow-sm); overflow: hidden; cursor: pointer; transition: all 0.2s; }
.knowledge-item:hover { box-shadow: var(--shadow-md); }
.item-header { display: flex; align-items: center; gap: 14px; padding: 18px 20px; }
.item-index { width: 28px; height: 28px; border-radius: 50%; background: var(--primary-bg); color: var(--primary); font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-header h3 { flex: 1; font-size: 15px; font-weight: 600; color: var(--text-primary); }
.arrow-icon { color: var(--text-muted); transition: transform 0.2s; flex-shrink: 0; }
.expanded .arrow-icon { transform: rotate(180deg); }
.item-body { padding: 0 20px 20px 62px; }
.item-body p { font-size: 14px; color: var(--text-secondary); line-height: 1.9; }
.item-img { margin-top: 16px; border-radius: var(--radius-sm); overflow: hidden; }
.item-img img { width: 100%; max-height: 360px; object-fit: contain; border-radius: var(--radius-sm); cursor: zoom-in; background: #f8f9fa; }

/* 实物图按钮 */
.photo-btn-wrap { margin-top: 12px; }
.photo-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; font-size: 13px; font-weight: 500; color: var(--primary); background: var(--primary-bg-light); border: 1px solid var(--primary-bg); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
.photo-btn:hover { background: var(--primary-bg); border-color: var(--primary); }

/* ===== 板块2：结构组成 ===== */
.structure-layout { padding-bottom: 8px; }
.structure-title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.structure-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px; }
.overview-img { position: relative; border-radius: var(--radius-lg); overflow: hidden; cursor: zoom-in; background: #fff; box-shadow: var(--shadow-sm); }
.overview-img img { width: 100%; display: block; }
.img-hint { position: absolute; bottom: 12px; right: 16px; padding: 4px 12px; background: rgba(0,0,0,0.5); color: #fff; font-size: 12px; border-radius: 20px; }
.grid-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 28px 0 16px; }
.component-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
.component-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 12px; background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
.component-card:hover { box-shadow: var(--shadow-md); border-color: var(--primary-bg); }
.component-card.active { border-color: var(--primary); background: var(--primary-bg-light); }
.comp-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-bg); color: var(--primary); font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.component-card.active .comp-icon { background: var(--primary); color: #fff; }
.comp-name { font-size: 13px; font-weight: 600; color: var(--text-primary); text-align: center; }
.component-detail { margin-top: 20px; background: #fff; border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-md); border-left: 4px solid var(--primary); }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.detail-header h3 { font-size: 18px; font-weight: 700; color: var(--primary); }
.close-detail { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-main); font-size: 20px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: none; }
.close-detail:hover { background: #fee; color: #e53e3e; }
.detail-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.9; margin-bottom: 16px; }
.detail-images { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
.detail-img img { max-width: 100%; max-height: 300px; border-radius: var(--radius-sm); cursor: zoom-in; background: #f8f9fa; }

/* ===== 板块5：故障表格 ===== */
.fault-layout { padding-bottom: 8px; }
.fault-title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; text-align: center; }
.fault-table-wrap { overflow-x: auto; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
.fault-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.fault-table thead { background: var(--primary); color: #fff; }
.fault-table th { padding: 14px 16px; text-align: left; font-weight: 600; font-size: 15px; }
.fault-table td { padding: 16px; border-bottom: 1px solid #edf2ee; vertical-align: top; line-height: 1.8; }
.fault-table tbody tr:last-child td { border-bottom: none; }
.fault-table tbody tr:hover { background: #f8faf9; }
.fault-symptom { font-weight: 500; }
.fault-symptom strong { display: block; color: var(--primary); font-size: 15px; margin-bottom: 4px; }
.fault-detail { font-size: 12px; color: var(--text-muted); }
.fault-list { margin: 0; padding-left: 20px; }
.fault-list li { margin-bottom: 4px; color: var(--text-secondary); }

/* ===== 动画 ===== */
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-10px); }
.slide-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* 导航按钮 */
.nav-buttons { max-width: 960px; margin: 0 auto; padding: 0 24px 60px; display: flex; justify-content: space-between; }
.nav-btn { padding: 10px 28px; font-size: 14px; font-weight: 500; border-radius: var(--radius-sm); transition: all 0.2s; }
.nav-btn.prev { color: var(--text-secondary); background: #fff; border: 1px solid var(--border); }
.nav-btn.prev:hover { border-color: var(--primary); color: var(--primary); }
.nav-btn.next { color: #fff; background: var(--primary); }
.nav-btn.next:hover { background: var(--primary-light); }
.loading-state { text-align: center; padding: 120px; color: var(--text-muted); }

/* 图片弹窗 */
.image-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
.image-modal { position: relative; max-width: 90vw; max-height: 90vh; }
.image-modal img { max-width: 90vw; max-height: 85vh; border-radius: 8px; object-fit: contain; box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
.modal-close { position: absolute; top: -16px; right: -16px; width: 36px; height: 36px; border-radius: 50%; background: #fff; font-size: 22px; color: #333; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: none; z-index: 1; }
.modal-close:hover { background: #fee; color: #e53e3e; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
