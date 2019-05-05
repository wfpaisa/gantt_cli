<template>
  <div class="container">
    <div
      id="gantt"
      ref="gantt"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag';
import { gantt } from 'dhtmlx-gantt';

export default {
  name: 'App',
  data() {
    return {
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.initGantt();
    // this.createTask();
  },
  methods: {
    async initGantt() {
      const queryTasks = await this.$apollo.query({
        query: gql`query{
            data: tasks{
              id
              text
              start_date
              duration
              progress
              parent
            },
            links: tasklinks{
              id
              source
              target
              type
            }
          }`
        ,
      });
      gantt.config.xml_date = '%Y:%m:%d';
      gantt.init(this.$refs.gantt);

      gantt.parse(queryTasks.data);
    },
    async createTask() {
    // Call to the graphql mutation
      await this.$apollo.mutate({
      // Query
        mutation: gql`mutation ($text: String!) {
        createTask(input:{
          data:{
            text: $text
          }
        }) {
          task{
            id
            text
          }
        }
      }`,
        // Parameters
        variables: {
          text: 'xtask-2',
        },
      });
    },
  },
};

</script>

<style>
  @import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";

  html,
  body{
    margin: 0px;
  }

  #gantt{
    height: 100vh
  }
</style>
