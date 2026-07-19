import request from '@/utils/request'

export const gradeExerciseAPI = (data) => request({
  url: '/exercise/grade',
  method: 'post',
  data
})

export const revealExerciseAnswersAPI = (artifactId) => request({
  url: `/exercise/${encodeURIComponent(artifactId)}/answers`,
  method: 'get'
})
