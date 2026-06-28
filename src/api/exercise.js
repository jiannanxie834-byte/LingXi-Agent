import request from '@/utils/request'

export const gradeExerciseAPI = (data) => request({
  url: '/exercise/grade',
  method: 'post',
  data
})
