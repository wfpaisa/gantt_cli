<template>
  <div class="container">
    <gantt
      class="left-container"
      :tasks="apolloTasks"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag';
import Gantt from './Gantt.vue';

export default {
  name: 'App',
  components: { Gantt },
  apollo: {
    // Simple query that will update the 'hello' vue property
    tasks: gql`query {
      tasks{
        id
        text
        start_date
        duration
        progress
        parent
      }
    }`,
    tasklinks: gql`query {
      tasklinks{
        id
        source
        target
        type
      }
    }`,
  },
  data() {
    return {
      tasks: [],
      tasklinks: [],
      // ntasks: {data:[],links:[]},
    };
  },
  computed: {

    apolloTasks() {
      const cloneTasks = this.tasks.map((obj) => {
        const newTask = Object.assign({}, obj);
        delete newTask.__typename; // eslint-disable-line
        return newTask;
      });

      const cloneTasklinks = this.tasklinks.map((obj) => {
        const newTasklink = Object.assign({}, obj);
        delete newTasklink.__typename; // eslint-disable-line
        return newTasklink;
      });

      const tasks = {
        data: cloneTasks,
        links: cloneTasklinks,
      };

      return tasks;
    },
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  @import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";

  html,
  body{
    margin: 0px;
  }

  .left-container{
    height: 100vh
  }
</style>
