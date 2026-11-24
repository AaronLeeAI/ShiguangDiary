/**
 * Conventional Commits 校验：feat / fix / refactor / perf / test / docs / chore / ci / build。
 * 目的是让提交历史能直接生成变更日志，也方便按类型过滤回溯。
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 中文标题里常有全角标点，不算标点结尾冲突
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0, 'always', 120],
    'footer-max-line-length': [0, 'always', 120],
    // 允许汉字开头，不做大小写约束
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'perf', 'test', 'docs', 'chore', 'ci', 'build', 'style'],
    ],
  },
}
