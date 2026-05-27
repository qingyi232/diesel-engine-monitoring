<template>
  <div class="result-page">
    <nav class="top-nav"><div class="nav-inner">
      <button class="back-btn" @click="$router.push('/home')"><svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M13 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> 返回首页</button>
      <span class="nav-title">测试结果</span>
      <div style="width:100px"></div>
    </div></nav>
    <div class="result-body" v-if="result">
      <div class="score-card" :class="scoreClass">
        <div class="score-circle"><span class="score-num">{{ result.score }}</span><span class="score-unit">分</span></div>
        <div class="score-info">
          <p>共 {{ result.total }} 题，答对 {{ result.correct }} 题</p>
          <p class="score-msg">{{ scoreMsg }}</p>
        </div>
      </div>
      <h3 class="detail-title">答题详情</h3>
      <div class="detail-list">
        <div v-for="(r, i) in result.results" :key="i" class="detail-item" :class="{ correct: r.is_correct, wrong: !r.is_correct }">
          <div class="d-header">
            <span class="d-num">{{ i + 1 }}</span>
            <span class="d-status">{{ r.is_correct ? '正确' : '错误' }}</span>
          </div>
          <p class="d-question">{{ getQuiz(r.quiz_id)?.question }}</p>
          <div class="d-answers">
            <span>你的答案：<b :class="{ wrong: !r.is_correct }">{{ r.user_answer }}</b></span>
            <span v-if="!r.is_correct">正确答案：<b class="right">{{ r.correct_answer }}</b></span>
          </div>
          <p class="d-explain">{{ r.explanation }}</p>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn-outline" @click="$router.push('/quiz')">重新测试</button>
        <button class="btn-primary" @click="$router.push('/catalog')">继续学习</button>
      </div>
    </div>
    <div v-else class="loading-state">暂无测试结果</div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
const result = ref(null)
const quizzes = ref([])
onMounted(() => {
  try {
    const d = JSON.parse(sessionStorage.getItem('quizResult') || 'null')
    if (d) { result.value = d; quizzes.value = d.quizzes || [] }
  } catch {}
})
function getQuiz(id) { return quizzes.value.find(q => q.id === id) }
const scoreClass = computed(() => { const s = result.value?.score || 0; return s >= 80 ? 'excellent' : s >= 60 ? 'good' : 'poor' })
const scoreMsg = computed(() => { const s = result.value?.score || 0; return s >= 90 ? '太棒了！掌握得非常好！' : s >= 80 ? '很好！继续保持！' : s >= 60 ? '及格了，还需加强学习。' : '需要继续努力，建议重新学习后再测试。' })
</script>
<style scoped>
.result-page{min-height:100vh;background:var(--bg-main)}
.top-nav{background:#fff;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.nav-inner{max-width:900px;margin:0 auto;padding:0 32px;height:56px;display:flex;align-items:center;justify-content:space-between}
.back-btn{display:flex;align-items:center;gap:4px;font-size:14px;color:var(--text-secondary);background:none}
.back-btn:hover{color:var(--primary)}
.nav-title{font-size:15px;font-weight:600;color:var(--text-primary)}
.result-body{max-width:720px;margin:0 auto;padding:32px 24px 60px}
.score-card{background:#fff;border-radius:var(--radius-lg);padding:36px;display:flex;align-items:center;gap:32px;box-shadow:var(--shadow-md);margin-bottom:32px}
.score-circle{width:100px;height:100px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.excellent .score-circle{background:linear-gradient(135deg,#2d6a4f,#52b788);color:#fff}
.good .score-circle{background:linear-gradient(135deg,#b7791f,#d4a843);color:#fff}
.poor .score-circle{background:linear-gradient(135deg,#c53030,#e53e3e);color:#fff}
.score-num{font-size:32px;font-weight:700;line-height:1}
.score-unit{font-size:12px;opacity:.8}
.score-info p{font-size:14px;color:var(--text-secondary);margin-bottom:4px}
.score-msg{font-weight:600;color:var(--text-primary)!important;font-size:16px!important;margin-top:4px}
.detail-title{font-size:17px;font-weight:600;margin-bottom:16px;color:var(--text-primary)}
.detail-item{background:#fff;border-radius:var(--radius-md);padding:20px 24px;margin-bottom:12px;border-left:4px solid var(--border)}
.detail-item.correct{border-left-color:var(--primary)}
.detail-item.wrong{border-left-color:#e53e3e}
.d-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.d-num{font-size:12px;color:var(--text-muted);font-weight:600}
.d-status{font-size:12px;font-weight:600;padding:2px 10px;border-radius:10px}
.correct .d-status{background:var(--primary-bg);color:var(--primary)}
.wrong .d-status{background:#fff5f5;color:#e53e3e}
.d-question{font-size:14px;font-weight:500;color:var(--text-primary);margin-bottom:10px;line-height:1.6}
.d-answers{display:flex;gap:24px;font-size:13px;color:var(--text-secondary);margin-bottom:8px}
.d-answers b.wrong{color:#e53e3e}
.d-answers b.right{color:var(--primary)}
.d-explain{font-size:13px;color:var(--text-muted);line-height:1.6;padding:10px 12px;background:var(--bg-main);border-radius:var(--radius-sm)}
.result-actions{display:flex;justify-content:center;gap:16px;margin-top:32px}
.btn-outline{padding:10px 32px;font-size:14px;color:var(--text-secondary);background:#fff;border:1px solid var(--border);border-radius:var(--radius-sm)}
.btn-outline:hover{border-color:var(--primary);color:var(--primary)}
.btn-primary{padding:10px 32px;font-size:14px;font-weight:600;color:#fff;background:var(--primary);border-radius:var(--radius-sm)}
.btn-primary:hover{background:var(--primary-light)}
.loading-state{text-align:center;padding:120px;color:var(--text-muted)}
</style>
