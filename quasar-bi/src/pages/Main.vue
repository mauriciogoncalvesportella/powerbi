<template>
  <q-page class="row items-center justify-evenly black">
    <example-component
      title="Example component"
      active
      :todos="todos"
      :meta="meta"
    />
  </q-page>
</template>

<script lang="ts">
import { Todo, Meta } from 'components/models'
import ExampleComponent from 'components/ClassComponent.vue'
import Login from 'pages/Login.vue'
import { Vue, Options } from 'vue-class-component'

@Options({
  components: { ExampleComponent, Login }
})
export default class Main extends Vue {
  todos: Todo[] = [
    {
      id: 1,
      content: 'ct1'
    },
    {
      id: 2,
      content: 'ct2'
    },
    {
      id: 3,
      content: 'ct3'
    },
    {
      id: 4,
      content: 'ct4'
    },
    {
      id: 5,
      content: 'ct5'
    }
  ];

  meta: Meta = {
    totalCount: 1200
  };
}
</script>
