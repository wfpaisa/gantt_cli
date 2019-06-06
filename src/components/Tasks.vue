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
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_keyboard_navigation'; // add keyboard capacity
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_auto_scheduling'; // auto update childs task behand each other
import 'dhtmlx-gantt/codebase/locale/locale_es'; // spanish


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
      const query = await this.$apollo.query({
        query: gql`query{
            data: tasks{
              id
              text
              start_date
              end_date
              duration
              progress
              parent
              sortorder
              open
              render
              type
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


      // Convert the render property in json
      const queryTasks = {
        data: query.data.data.map(task => ({
          ...task,
          render: JSON.parse(task.render),
        })),
        links: query.data.links,
      };

      /**
       * GANTT SETTINGS
       */
      gantt.config.xml_date = '%Y:%m:%d';
      // gantt.config.xml_date = '%Y-%m-%d %H:%i:%s';
      gantt.config.scale_unit = 'month';
      gantt.config.date_scale = '%F %Y';

      gantt.config.scale_height = 50;

      // Date in columns
      gantt.config.subscales = [
        { unit: 'day', step: 1, date: '%j' },
      ];

      // add css class weekend cells
      gantt.templates.task_cell_class = (task, date) => {
        if (!gantt.isWorkTime(date)) { return 'week_end'; }
        return '';
      };
      // Dont show weekend
      gantt.ignore_time = (date) => {
        if (date.getDay() === 0 || date.getDay() === 6) { return true; }
        return false;
      };

      // Cells width
      gantt.config.min_column_width = 20;

      // Sort tasks
      gantt.config.sort = true;

      // Drag and drop projects
      gantt.config.drag_project = true;
      gantt.config.order_branch_free = true;
      gantt.config.order_branch = 'marker';

      // Keyboard
      gantt.config.keyboard_navigation = true;
      gantt.config.keyboard_navigation_cells = true;

      // Recalcule with time left
      gantt.config.auto_scheduling = true;
      gantt.config.auto_scheduling_strict = true;

      // 'says' the Gantt chart to automatically extend the time scale in order
      // to fit all displayed tasks grid_resize
      gantt.config.fit_tasks = true;

      // Enables showing unscheduled tasks
      gantt.config.show_unscheduled = true;
      gantt.config.placeholder_task = true;

      // Automatically converts tasks with subtasks to projects and projects without
      // subtasks back to tasks
      gantt.config.auto_types = true;
      gantt.config.preserve_scroll = true;

      gantt.config.cascade_delete = true; // delete in cascade
      gantt.config.date_grid = '%d/%m/%Y'; // rows dateformat

      gantt.config.work_time = true;
      gantt.config.correct_work_time = true;


      const editors = {
        text: { type: 'text', map_to: 'text' },
        start_date: {
          type: 'date',
          map_to: 'start_date',
          min: new Date(2019, 0, 1),
          max: new Date(2019, 12, 1),
        },
        duration: {
          type: 'number', map_to: 'duration', min: 0, max: 100,
        },
      };


      gantt.config.columns = [
        {
          name: 'wbs', label: '#', width: 40, align: 'left', template: gantt.getWBSCode,
        },
        {
          name: 'text', label: 'Tarea', tree: true, width: 200, editor: editors.text, resize: true,
        },
        {
          name: 'start_date', label: 'Inicia', width: 80, align: 'center', editor: editors.start_date,
        },
        {
          name: 'duration', label: 'Dura', width: 60, align: 'center', editor: editors.duration,
        },
        {
          name: 'end_date', label: 'Termina', width: 80, align: 'center', editor: editors.end_date, resize: true,
        },
        { name: 'add' },
      ];


      gantt.config.auto_scheduling_compatibility = true;
      gantt.locale.labels.section_split = 'Display';
      gantt.config.lightbox.project_sections = [
        {
          name: 'description', height: 70, map_to: 'text', type: 'textarea', focus: true,
        },
        {
          name: 'split',
          type: 'checkbox',
          map_to: 'render',
          options: [
            { key: 'split', label: 'Split Task' },
          ],
        },
        {
          name: 'time', type: 'duration', readonly: true, map_to: 'auto',
        },
      ];

      // ====================== Change task type ====================================
      gantt.config.types.meeting = 'type_id';
      gantt.locale.labels.type_meeting = 'Meeting';

      // sections for tasks with 'meeting' type

      gantt.locale.labels.section_title = 'Subject';
      gantt.locale.labels.section_details = 'Details';
      gantt.config.lightbox.meeting_sections = [
        {
          name: 'title', height: 20, map_to: 'text', type: 'textarea', focus: true,
        },
        {
          name: 'details', height: 70, map_to: 'details', type: 'textarea', focus: true,
        },
        { name: 'type', type: 'typeselect', map_to: 'type' },
        { name: 'time', type: 'time', map_to: 'auto' },
      ];

      // sections for regular lightbox
      gantt.config.lightbox.sections = [
        {
          name: 'description', height: 70, map_to: 'text', type: 'textarea', focus: true,
        },
        { name: 'type', type: 'typeselect', map_to: 'type' },
        { name: 'time', type: 'duration', map_to: 'auto' },
      ];
      gantt.templates.task_class = (start, end, task) => {
        if (task.type === gantt.config.types.meeting) {
          return 'meeting_task';
        }
        return '';
      };

      gantt.templates.task_text = (start, end, task) => {
        if (task.type === gantt.config.types.meeting) {
          return `Meeting: <b>${task.text}</b>`;
        }
        return task.text;
      };


      gantt.templates.rightside_text = (start, end, task) => {
        if (task.type === gantt.config.types.milestone) {
          return task.text;
        }
        return '';
      };
      //= =======================================================

      // Filtro
      // gantt.attachEvent('onBeforeTaskDisplay', (id, task) => {
      //   if (task.text === 'uno') {
      //     return true;
      //   }
      //   return false;
      // });

      // let drag_id = null;
      // gantt.attachEvent('onRowDragStart', (id, target, e) => {
      //   drag_id = id;
      //   return true;
      // });
      // gantt.attachEvent('onRowDragEnd', (id, target) => {
      //   drag_id = null;
      //   gantt.render();
      // });

      // gantt.templates.grid_row_class = (start, end, task) => {
      //   if (drag_id && task.id != drag_id) {
      //     if (task.$level != gantt.getTask(drag_id).$level) { return 'cant-drop'; }
      //   }
      //   return '';
      // };

      // ---------------------------------------------------------------------------
      // Init
      gantt.init(this.$refs.gantt);
      // Entre fechas
      // gantt.init("gantt_here", new Date(2018, 02, 10), new Date(2018, 03, 20));

      gantt.parse(queryTasks);

      // After load sort tasks
      gantt.sort('sortorder', false);

      //= =========== EVENTOS =====================================

      gantt.attachEvent('onAfterTaskAdd', (id, task) => {
        // From list
        if (task.type === 'placeholder') return;

        // From buton
        task.progress = task.progress || 0; // eslint-disable-line 

        const newTask = {
          id: task.id,
          text: task.text,
          start_date: task.start_date,
          end_date: task.end_date,
          duration: task.duration,
          progress: task.progress,
          parent: task.parent,
          sortorder: task.sortorder,
          open: task.open,
          render: task.render,
          type: task.type,

        };
        // DEBUG
        // console.log(task);
        this.createTask(newTask);
      });

      gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
        // this.$emit('task-updated', id, 'updated', task);

        if (task.type === 'placeholder') return;
        // DEBUG
        console.log('Update task: ', id, task);

        const updateTask = {
          id: task.id,
          text: task.text,
          start_date: task.start_date,
          end_date: task.end_date,
          duration: Number(task.duration),
          progress: task.progress,
          parent: task.parent,
          sortorder: task.sortorder,
          open: task.open,
          render: task.render,
          type: task.type,

        };

        this.updateTask(updateTask);
      });

      gantt.attachEvent('onAfterTaskDelete', (id) => {
        // this.$emit('task-updated', id, 'deleted');
        if (!gantt.getSelectedId()) {
          // this.$emit('task-selected', null);
          this.deleteTask(id);
        }
      });

      gantt.attachEvent('onAfterLinkAdd', (id, link) => {
        // this.$emit('link-updated', id, 'inserted', link);
        // DEBUG
        // console.log('onAfterLinkAdd', link);
        this.createLink(link);
      });

      gantt.attachEvent('onAfterLinkUpdate', (id, link) => {
        // this.$emit('link-updated', id, 'updated', link);
        this.updateLink(link);
      });

      gantt.attachEvent('onAfterLinkDelete', (id) => {
        // this.$emit('link-updated', id, 'deleted');
        this.deleteLink(id);
      });

      gantt.attachEvent('onTaskOpened', (id) => {
        gantt.getTask(id).open = true;
        gantt.updateTask(id);
      });

      gantt.attachEvent('onTaskClosed', (id) => {
        gantt.getTask(id).open = false;
        gantt.updateTask(id);
      });

      gantt.attachEvent('onAfterSort', (field, direction, parent) => {
        console.log('field', field);
        console.log('direction', direction);
        console.log('parent', parent);
      });

      gantt.attachEvent('onBeforeRowDragEnd', (id, parent, tindex) => {
        const task = gantt.getTask(id);

        // var globalTaskIndex = gantt.getGlobalTaskIndex("t_1"); // -> 1
        // var taskIndex - gantt.getTaskIndex("t_1"); // -> 0

        if (task.parent !== parent) { return false; }

        gantt.getTask(id).sortorder = tindex;
        gantt.updateTask(id);

        console.log('id', id);
        console.log('parent', parent);
        console.log('tindex', tindex);
        console.log('task', task);
        return true;
      });
    },
    /**
     * New task
     */
    async createTask(newTask) {
      // DEBUG
      // console.log('New', newTask);

      // eslint-disable-next-line no-unused-vars
      const mutateCreateTask = await this.$apollo.mutate({
        mutation: gql`mutation (
          $text: String!,
          $start_date: DateTime,
          $end_date: DateTime,
          $duration: Int,
          $progress: Float,
          $parent: Int,
          $sortorder: Int,
          $open: Boolean,
          $render: JSON,
          $type: String,
        ) {
        createTask(input:{
          data: {
            text: $text
            start_date: $start_date
            end_date: $end_date
            duration: $duration
            progress: $progress
            parent: $parent
            sortorder: $sortorder
            open: $open
            render: $render
            type: $type
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
          text: newTask.text,
          start_date: newTask.start_date,
          end_date: newTask.end_date,
          duration: Number(newTask.duration),
          progress: Number(newTask.progress),
          parent: Number(newTask.parent),
          sortorder: Number(newTask.sortorder),
          open: newTask.open,
          render: JSON.stringify(newTask.render),
          type: newTask.type,
        },
      });

      // Asigna el id de la tarea creada por strapi a
      // a la tarea creada por el gantt
      const oldId = newTask.id;
      const newId = mutateCreateTask.data.createTask.task.id;
      gantt.changeTaskId(oldId, newId);
    },
    /**
     * Update task
     */
    async updateTask(updateTask) {
      // DEBUG
      // console.log('nnn', updateTask);

      // eslint-disable-next-line no-unused-vars
      const mutateUpdateTask = await this.$apollo.mutate({
        mutation: gql`mutation (
          $id: ID!,
          $text: String,
          $start_date: DateTime,
          $end_date: DateTime,
          $duration: Int,
          $progress: Float,
          $parent: Int,
          $sortorder: Int,
          $open: Boolean,
          $render: JSON,
          $type: String,
        ) {
        updateTask(input:{
          where:{
            id: $id
          },
          data: {
            text: $text
            start_date: $start_date
            end_date: $end_date
            duration: $duration
            progress: $progress
            parent: $parent
            sortorder: $sortorder
            open: $open
            render: $render
            type: $type
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
          id: updateTask.id,
          text: updateTask.text,
          start_date: updateTask.start_date,
          end_date: updateTask.end_date,
          duration: Number(updateTask.duration),
          progress: Number(updateTask.progress),
          parent: Number(updateTask.parent),
          sortorder: Number(updateTask.sortorder),
          open: updateTask.open,
          render: JSON.stringify(updateTask.render),
          type: updateTask.type,
        },
      });
      // Despues de actualizar una
      // console.log(mutateUpdateTask);
    },
    /**
     * Delete task
     */
    async deleteTask(deleteTask) {
      // DEBUG
      // console.log('Del: ', deleteTask);

      // eslint-disable-next-line no-unused-vars
      const mutateDeleteTask = await this.$apollo.mutate({
        mutation: gql`mutation (
          $id: ID!,
        ) {
        deleteTask(input:{
          where:{
            id: $id
          }
        }) {
          task{
            text
          }
        }
      }`,
        // Parameters
        variables: {
          id: deleteTask,
        },
      });
      // Despues de eliminar una
      // console.log(mutateDeleteTask);
    },
    /**
     * New link
     */
    async createLink(newLink) {
      // DEBUG
      // console.log('NewLink:', newLink);

      // eslint-disable-next-line no-unused-vars
      const mutateCreateLink = await this.$apollo.mutate({
        mutation: gql`mutation (
          $source: Int,
          $target: Int,
          $type: String,
        ) {
        createTasklink(input:{
          data: {
            source: $source
            target: $target
            type: $type
          }
        }) {
          tasklink{
            id
            source
            target
            type
          }
        }
      }`,
        // Parameters
        variables: {
          source: Number(newLink.source),
          target: Number(newLink.target),
          type: newLink.type,
        },
      });

      // Asigna el id del link creado por strapi a
      // al link creado por el gantt
      // DEBUG
      // console.log(mutateCreateLink);
      const oldId = newLink.id;
      const newId = mutateCreateLink.data.createTasklink.tasklink.id;
      gantt.changeLinkId(oldId, newId);
    },
    /**
     * Update link
     */
    async updateLink(updateLink) {
      // DEBUG
      // console.log('updateLink:', updateLink);

      // eslint-disable-next-line no-unused-vars
      const mutateUpdateLink = await this.$apollo.mutate({
        mutation: gql`mutation (
          $id: ID!,
          $source: Int,
          $target: Int,
          $type: String,
        ) {
        updateTasklink(input:{
          where:{
            id: $id
          },
          data: {
            source: $source
            target: $target
            type: $type
          }
        }) {
          tasklink{
            source
            target
            type
          }
        }
      }`,
        // Parameters
        variables: {
          id: updateLink.id,
          source: Number(updateLink.source),
          target: Number(updateLink.target),
          type: updateLink.type,
        },
      });

      // DEBUG
      // console.log('Mutate updatelink:', mutateUpdateLink);
    },
    /**
     * Delete link
     */
    async deleteLink(deleteLink) {
      // DEBUG
      // console.log('Del: ', deleteLink);

      // eslint-disable-next-line no-unused-vars
      const mutateDeleteLink = await this.$apollo.mutate({
        mutation: gql`mutation (
          $id: ID!,
        ) {
        deleteTasklink(input:{
          where:{
            id: $id
          }
        }) {
          tasklink{
            source
            target
            type
          }
        }
      }`,
        // Parameters
        variables: {
          id: deleteLink,
        },
      });
      // Despues de eliminar una
      // console.log(mutateDeleteTask);
    },


  },
};

</script>

<style>
  @import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
  /* @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css"; */

  html,
  body{
    margin: 0px;
  }

  #gantt{
    height: 100vh
  }

  .gantt_task_cell.week_end {
    background-color: #EFF5FD;
  }

  .gantt_task_row.gantt_selected .gantt_task_cell.week_end {
    background-color: #F8EC9C;
  }
  .gantt_split_child{
    background: rgb(185, 81, 245);
    border-color:rgb(153, 63, 206);
  }

  .cant-drop{
    background: rgba(255, 0, 0, 0.1);
  }

</style>
