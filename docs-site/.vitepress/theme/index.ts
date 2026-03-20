import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ComponentDemo from '../components/ComponentDemo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ComponentDemo', ComponentDemo)
  },
}
