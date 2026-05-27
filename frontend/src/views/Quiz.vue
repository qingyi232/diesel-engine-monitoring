<template>
  <div class="quiz-page">
    <nav class="top-nav"><div class="nav-inner">
      <button class="back-btn" @click="$router.push('/home')"><svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M13 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> 返回首页</button>
      <span class="nav-title">知识测试</span>
      <div class="progress-text">{{ currentIndex + 1 }} / {{ quizzes.length }}</div>
    </div></nav>
    <div class="quiz-body" v-if="quizzes.length">
      <div class="progress-bar"><div class="progress-fill" :style="{ width: ((currentIndex + 1) / quizzes.length * 100) + '%' }"></div></div>
      <div class="quiz-card">
        <div class="q-num">第 {{ currentIndex + 1 }} 题</div>
        <h2>{{ current.question }}</h2>
        <div class="options">
          <div v-for="opt in ['A','B','C','D']" :key="opt" class="opt-item" :class="{ selected: answers[current.id] === opt }" @click="selectAnswer(opt)">
            <span class="opt-label">{{ opt }}</span>
            <span>{{ current['option_' + opt.toLowerCase()] }}</span>
          </div>
        </div>
        <div class="q-actions">
          <button v-if="currentIndex > 0" class="btn-outline" @click="currentIndex--">上一题</button>
          <div v-else></div>
          <button v-if="currentIndex < quizzes.length - 1" class="btn-primary" @click="nextQ" :disabled="!answers[current.id]">下一题</button>
          <button v-else class="btn-submit" @click="submitQuiz" :disabled="!allAnswered || submitting">{{ submitting ? '提交中...' : '提交答卷' }}</button>
        </div>
      </div>
      <div class="q-nav-dots">
        <span v-for="(q, i) in quizzes" :key="q.id" class="dot" :class="{ active: i === currentIndex, answered: answers[q.id] }" @click="currentIndex = i"></span>
      </div>
    </div>
    <div v-else class="loading-state">加载题目中...</div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api'
const router = useRouter()
const quizzes = ref([])
const currentIndex = ref(0)
const answers = ref({})
const submitting = ref(false)
const current = computed(() => quizzes.value[currentIndex.value] || {})
const allAnswered = computed(() => quizzes.value.every(q => answers.value[q.id]))
function selectAnswer(opt) { answers.value[current.value.id] = opt }
function nextQ() { if (answers.value[current.value.id] && currentIndex.value < quizzes.value.length - 1) currentIndex.value++ }
async function submitQuiz() {
  submitting.value = true
  try {
    const data = quizzes.value.map(q => ({ quiz_id: q.id, user_answer: answers.value[q.id] }))
    const res = await api.post('/quiz/submit', { answers: data })
    if (res.code === 200) {
      sessionStorage.setItem('quizResult', JSON.stringify({ ...res.data, quizzes: quizzes.value, userAnswers: answers.value }))
      router.push('/result')
    }
  } catch {} finally { submitting.value = false }
}
onMounted(async () => {
  try { const res = await api.get('/quizzes'); if (res.code === 200) quizzes.value = res.data } catch {}
})
</script>
<style scoped>
.quiz-page{min-height:100vh;background:var(--bg-main)}
.top-nav{background:#fff;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.nav-inner{max-width:900px;margin:0 auto;padding:0 32px;height:56px;display:flex;align-items:center;justify-content:space-between}
.back-btn{display:flex;align-items:center;gap:4px;font-size:14px;color:var(--text-secondary);background:none}
.back-btn:hover{color:var(--primary)}
.nav-title{font-size:15px;font-weight:600;color:var(--text-primary)}
.progress-text{font-size:13px;color:var(--text-muted);font-weight:500}
.quiz-body{max-width:720px;margin:0 auto;padding:32px 24px}
.progress-bar{height:4px;background:var(--border);border-radius:2px;margin-bottom:32px;overflow:hidden}
.progress-fill{height:100%;background:var(--primary);border-radius:2px;transition:width .3s}
.quiz-card{background:#fff;border-radius:var(--radius-lg);padding:36px;box-shadow:var(--shadow-sm)}
.q-num{font-size:12px;color:var(--primary);font-weight:600;margin-bottom:12px;padding:3px 12px;background:var(--primary-bg);border-radius:20px;display:inline-block}
.quiz-card h2{font-size:17px;font-weight:600;color:var(--text-primary);line-height:1.7;margin-bottom:24px}
.options{display:flex;flex-direction:column;gap:12px}
.opt-item{display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all .2s;font-size:14px;color:var(--text-secondary)}
.opt-item:hover{border-color:var(--primary-lighter);background:var(--primary-bg-light)}
.opt-item.selected{border-color:var(--primary);background:var(--primary-bg);color:var(--primary);font-weight:500}
.opt-label{width:28px;height:28px;border-radius:50%;background:var(--bg-main);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
.opt-item.selected .opt-label{background:var(--primary);color:#fff}
.q-actions{display:flex;justify-content:space-between;margin-top:32px}
.btn-outline{padding:10px 28px;font-size:14px;color:var(--text-secondary);background:#fff;border:1px solid var(--border);border-radius:var(--radius-sm)}
.btn-outline:hover{border-color:var(--primary);color:var(--primary)}
.btn-primary,.btn-submit{padding:10px 28px;font-size:14px;font-weight:600;color:#fff;background:var(--primary);border-radius:var(--radius-sm);transition:all .2s}
.btn-primary:hover,.btn-submit:hover{background:var(--primary-light)}
.btn-primary:disabled,.btn-submit:disabled{opacity:.5;cursor:not-allowed}
.btn-submit{background:var(--accent);letter-spacing:2px}
.btn-submit:hover{background:var(--accent-light)}
.q-nav-dots{display:flex;justify-content:center;gap:8px;margin-top:24px;flex-wrap:wrap}
.dot{width:10px;height:10px;border-radius:50%;background:var(--border);cursor:pointer;transition:all .2s}
.dot.active{background:var(--primary);transform:scale(1.3)}
.dot.answered{background:var(--primary-lighter)}
.loading-state{text-align:center;padding:120px;color:var(--text-muted)}
</style>
