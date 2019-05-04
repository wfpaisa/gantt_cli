<template>
  <div class="tasks">
    {{ tasks }}
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  apollo: {
    tasks: gql`
    query {
      tasks{
        id
        text
      }
    }`,
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #42b983;
}
</style>
