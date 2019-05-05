<template>
  <div>
    <div class="gantt_control">
      <input
        id="default"
        v-model="shoview"
        type="button"
        @click="toggleGroups"
      >
    </div>
    <div
      id="gantt_here"
      ref="gantt"
    />
  <!-- <div id="gantt_here" /> -->
  </div>
</template>

<script>
/* eslint-disable func-names */
import { gantt } from 'dhtmlx-gantt';

let resourceMode = 'hours';

export default {
  name: 'Gantt',
  props: {
    tasks: {
      type: Object,
      default() {
        return { data: [], links: [] };
      },
    },
  },
  data() {
    return {
      shoview: 'Show Resource view',
    };
  },
  mounted() {
    // gantt.config.xml_date = '%Y:%m:%d';
    gantt.message({
      text: [
        'Displaying a resource usage diagram.',
        'The diagram is in sync with the main Gantt.',
        'Columns and resources are fully customizable, the resources can be changed using a public api.',
      ].join('<br><br>'),
      expire: -1,
    });

    function shouldHighlightTask(task) {
      const store = gantt.$resourcesStore;
      const taskResource = task[gantt.config.resource_property];
      const selectedResource = store.getSelectedId();
      if (taskResource === selectedResource || store.isChildOf(taskResource, selectedResource)) {
        return true;
      }
      return false;
    }

    gantt.templates.grid_row_class = function (start, end, task) {
      const css = [];
      if (gantt.hasChild(task.id)) {
        css.push('folder_row');
      }

      if (task.$virtual) {
        css.push('group_row');
      }

      if (shouldHighlightTask(task)) {
        css.push('highlighted_resource');
      }

      return css.join(' ');
    };

    gantt.templates.task_row_class = function (start, end, task) {
      if (shouldHighlightTask(task)) {
        return 'highlighted_resource';
      }
      return '';
    };

    gantt.templates.task_cell_class = function (task, date) {
      if (!gantt.isWorkTime({ date, task })) { return 'week_end'; }
      return '';
    };

    gantt.templates.resource_cell_class = function (startDate, endDate, resource, tasks) {
      const css = [];
      css.push('resource_marker');
      if (tasks.length <= 1) {
        css.push('workday_ok');
      } else {
        css.push('workday_over');
      }
      return css.join(' ');
    };

    gantt.templates.resource_cell_value = function (startDate, endDate, resource, tasks) {
      let html = '<div>';
      if (resourceMode === 'hours') {
        html += tasks.length * 8;
      } else {
        html += tasks.length;
      }
      html += '</div>';
      return html;
    };

    function shouldHighlightResource(resource) {
      const selectedTaskId = gantt.getState().selected_task;
      if (gantt.isTaskExists(selectedTaskId)) {
        const selectedTask = gantt.getTask(selectedTaskId);
        const selectedResource = selectedTask[gantt.config.resource_property];

        if (resource.id === selectedResource) {
          return true;
        } if (gantt.$resourcesStore.isChildOf(selectedResource, resource.id)) {
          return true;
        }
      }
      return false;
    }

    const resourceTemplates = {
      grid_row_class(start, end, resource) {
        const css = [];
        if (gantt.$resourcesStore.hasChild(resource.id)) {
          css.push('folder_row');
          css.push('group_row');
        }
        if (shouldHighlightResource(resource)) {
          css.push('highlighted_resource');
        }
        return css.join(' ');
      },
      task_row_class(start, end, resource) {
        const css = [];
        if (shouldHighlightResource(resource)) {
          css.push('highlighted_resource');
        }
        if (gantt.$resourcesStore.hasChild(resource.id)) {
          css.push('group_row');
        }

        return css.join(' ');
      },
    };

    gantt.locale.labels.section_owner = 'Owner';
    gantt.config.lightbox.sections = [
      {
        name: 'description', height: 38, map_to: 'text', type: 'textarea', focus: true,
      },
      {
        name: 'owner', height: 22, map_to: 'owner_id', type: 'select', options: gantt.serverList('people'),
      },
      { name: 'time', type: 'duration', map_to: 'auto' },
    ];

    function getResourceTasks(resourceId) {
      const store = gantt.getDatastore(gantt.config.resource_store);
      const field = gantt.config.resource_property;
      let tasks;

      if (store.hasChild(resourceId)) {
        tasks = gantt.getTaskBy(field, store.getChildren(resourceId));
      } else {
        tasks = gantt.getTaskBy(field, resourceId);
      }
      return tasks;
    }

    const resourceConfig = {
      scale_height: 30,
      subscales: [],
      columns: [
        {
          name: 'name',
          label: 'Name',
          tree: true,
          width: 200,
          template(resource) {
            return resource.text;
          },
          resize: true,
        },
        {
          name: 'progress',
          label: 'Complete',
          align: 'center',
          template(resource) {
            const tasks = getResourceTasks(resource.id);

            let totalToDo = 0;
            let totalDone = 0;
            tasks.forEach((task) => {
              totalToDo += task.duration;
              totalDone += task.duration * (task.progress || 0);
            });

            let completion = 0;
            if (totalToDo) {
              completion = Math.floor((totalDone / totalToDo) * 100);
            }

            return `${Math.floor(completion)}%`;
          },
          resize: true,
        },
        {
          name: 'workload',
          label: 'Workload',
          align: 'center',
          template(resource) {
            const tasks = getResourceTasks(resource.id);
            let totalDuration = 0;
            tasks.forEach((task) => {
              totalDuration += task.duration;
            });

            return `${(totalDuration || 0) * 8}h`;
          },
          resize: true,
        },

        {
          name: 'capacity',
          label: 'Capacity',
          align: 'center',
          template(resource) {
            const store = gantt.getDatastore(gantt.config.resource_store);
            const n = store.hasChild(resource.id) ? store.getChildren(resource.id).length : 1;

            const state = gantt.getState();

            return `${gantt.calculateDuration(state.min_date, state.max_date) * n * 8}h`;
          },
        },

      ],
    };

    gantt.config.subscales = [
      { unit: 'month', step: 1, date: '%F, %Y' },
    ];

    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;
    gantt.config.work_time = true;
    gantt.config.columns = [
      {
        name: 'text', tree: true, width: 200, resize: true,
      },
      {
        name: 'start_date', align: 'center', width: 80, resize: true,
      },
      {
        name: 'owner',
        align: 'center',
        width: 80,
        label: 'Owner',
        template(task) {
          if (task.type === gantt.config.types.project) {
            return '';
          }

          const store = gantt.getDatastore(gantt.config.resource_store);
          const owner = store.getItem(task[gantt.config.resource_property]);
          if (owner) {
            return owner.text;
          }
          return 'Unassigned';
        },
        resize: true,
      },
      {
        name: 'duration', width: 60, align: 'center', resize: true,
      },
      { name: 'add', width: 44 },
    ];

    gantt.config.resource_store = 'resource';
    gantt.config.resource_property = 'owner_id';
    gantt.config.order_branch = true;
    gantt.config.open_tree_initially = true;
    gantt.config.scale_height = 50;
    gantt.config.layout = {
      css: 'gantt_container',
      rows: [
        {
          gravity: 2,
          cols: [
            { view: 'grid', group: 'grids', scrollY: 'scrollVer' },
            { resizer: true, width: 1 },
            { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
            { view: 'scrollbar', id: 'scrollVer', group: 'vertical' },
          ],
        },
        { resizer: true, width: 1, next: 'resources' },
        {
          height: 35,
          cols: [
            { html: '', group: 'grids' },
            { resizer: true, width: 1 },
            {
              html: '<label class=\'active\' >Hours per day <input checked type=\'radio\' name=\'resource-mode\' value=\'hours\'></label><label>Tasks per day <input type=\'radio\' name=\'resource-mode\' value=\'tasks\'></label>',
              css: 'resource-controls',
            },
          ],
        },

        {
          gravity: 1,
          id: 'resources',
          config: resourceConfig,
          templates: resourceTemplates,
          cols: [
            { view: 'resourceGrid', group: 'grids', scrollY: 'resourceVScroll' },
            { resizer: true, width: 1 },
            { view: 'resourceTimeline', scrollX: 'scrollHor', scrollY: 'resourceVScroll' },
            { view: 'scrollbar', id: 'resourceVScroll', group: 'vertical' },
          ],
        },
        { view: 'scrollbar', id: 'scrollHor' },
      ],
    };


    gantt.attachEvent('onGanttReady', () => {
      const radios = [].slice.call(gantt.$container.querySelectorAll("input[type='radio']"));
      radios.forEach((r) => {
        gantt.event(r, 'change', function () {
          const radiosC = [].slice.call(gantt.$container.querySelectorAll("input[type='radio']"));

          radiosC.forEach((rad) => {
            rad.parentNode.className = rad.parentNode.className.replace('active', ''); // eslint-disable-line
          });

          if (this.checked) {
            resourceMode = this.value;
            this.parentNode.className += ' active';
            gantt.getDatastore(gantt.config.resource_store).refresh();
          }
        });
      });
    });

    gantt.$resourcesStore = gantt.createDatastore({
      name: gantt.config.resource_store,
      type: 'treeDatastore',
      initItem(item) {
        item.parent = item.parent || gantt.config.root_id; // eslint-disable-line
        item[gantt.config.resource_property] = item.parent; // eslint-disable-line
        item.open = true; // eslint-disable-line
        return item;
      },
    });

    gantt.$resourcesStore.attachEvent('onAfterSelect', () => {
      gantt.refreshData();
    });


    // eslint-disable-next-line no-unused-vars
    function toggleGroups(input) {
      gantt.$groupMode = !gantt.$groupMode;
      if (gantt.$groupMode) {
        // eslint-disable-next-line no-param-reassign
        input.value = 'show gantt view';

        const groups = gantt.$resourcesStore.getItems().map((item) => {
          const group = gantt.copy(item);
          group.group_id = group.id;
          group.id = gantt.uid();
          return group;
        });

        gantt.groupBy({
          groups,
          relation_property: gantt.config.resource_property,
          group_id: 'group_id',
          group_text: 'text',
        });
      } else {
        // eslint-disable-next-line no-param-reassign
        input.value = 'show resource view';
        gantt.groupBy(false);
      }
    }

    gantt.$resourcesStore.attachEvent('onParse', () => {
      const people = [];
      gantt.$resourcesStore.eachItem((res) => {
        if (!gantt.$resourcesStore.hasChild(res.id)) {
          const copy = gantt.copy(res);
          copy.key = res.id;
          copy.label = res.text;
          people.push(copy);
        }
      });
      gantt.updateCollection('people', people);
    });

    gantt.$resourcesStore.parse([
      { id: 1, text: 'QA', parent: null },
      { id: 2, text: 'Development', parent: null },
      { id: 3, text: 'Sales', parent: null },
      { id: 4, text: 'Other', parent: null },
      { id: 5, text: 'Unassigned', parent: 4 },
      { id: 6, text: 'John', parent: 1 },
      { id: 7, text: 'Mike', parent: 2 },
      { id: 8, text: 'Anna', parent: 2 },
      { id: 9, text: 'Bill', parent: 3 },
      { id: 10, text: 'Floe', parent: 3 },
    ]);

    gantt.init('gantt_here');
    gantt.load('/resource_project_single_resource_diagram.json');
  },
  methods: {
    toggleGroups() {
      gantt.$groupMode = !gantt.$groupMode;
      if (gantt.$groupMode) {
        // eslint-disable-next-line no-param-reassign
        this.shoview = 'show gantt view';

        const groups = gantt.$resourcesStore.getItems().map((item) => {
          const group = gantt.copy(item);
          group.group_id = group.id;
          group.id = gantt.uid();
          return group;
        });

        gantt.groupBy({
          groups,
          relation_property: gantt.config.resource_property,
          group_id: 'group_id',
          group_text: 'text',
        });
      } else {
        // eslint-disable-next-line no-param-reassign
        this.shoview = 'show resource view';
        gantt.groupBy(false);
      }
    },
  },
};
</script>

<style>
  /* @import "~dhtmlx-gantt/codebase/dhtmlxgantt.css"; */
  html, body {
    padding: 0px;
    margin: 0px;
    height: 100%;
  }

  #gantt_here {
    width:100%;
    height: 800px;
    height:calc(100vh - 52px);
  }

  .gantt_grid_scale .gantt_grid_head_cell,
  .gantt_task .gantt_task_scale .gantt_scale_cell {
    font-weight: bold;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
  }

  .resource_marker{
    text-align: center;
  }
  .resource_marker div{
    width: 28px;
    height: 28px;
    line-height: 29px;
    display: inline-block;

    color: #FFF;
    margin: 3px;
  }
  .resource_marker.workday_ok div {
    border-radius: 15px;
    background: #51c185;
  }

  .resource_marker.workday_over div{
    border-radius: 3px;
    background: #ff8686;
  }

  .folder_row {
    font-weight: bold;
  }

  .highlighted_resource,
  .highlighted_resource.odd
  {
    background-color: rgba(255, 251, 224, 0.6);
  }

  .resource-controls .gantt_layout_content{
    padding: 7px;
    overflow: hidden;
  }
  .resource-controls label{
    margin: 0 10px;
    vertical-align: bottom;
    display: inline-block;
    color: #3e3e3e;
    padding: 2px;
    transition: box-shadow 0.2s;
  }

  .resource-controls label:hover{
    box-shadow: 0 2px rgba(84, 147, 255, 0.42);
  }

  .resource-controls label.active,
  .resource-controls label.active:hover
  {
    box-shadow: 0 2px #5493ffae;
    color: #1f1f1f;
  }

  .resource-controls input{
    vertical-align: top;
  }

  .gantt_task_cell.week_end {
    background-color: #e8e8e87d;
  }

  .gantt_task_row.gantt_selected .gantt_task_cell.week_end {
    background-color: #e8e8e87d !important;
  }


  .group_row,
  .group_row.odd,
  .gantt_task_row.group_row{
    background-color: rgba(232, 232, 232, 0.6);
  }
  html, body {
    padding: 0px;
    margin: 0px;
    height: 100%;
  }

  #gantt_here {
    width:100%;
    height: 800px;
    height:calc(100vh - 52px);
  }

  .gantt_grid_scale .gantt_grid_head_cell,
  .gantt_task .gantt_task_scale .gantt_scale_cell {
    font-weight: bold;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
  }

  .resource_marker{
    text-align: center;
  }
  .resource_marker div{
    width: 28px;
    height: 28px;
    line-height: 29px;
    display: inline-block;

    color: #FFF;
    margin: 3px;
  }
  .resource_marker.workday_ok div {
    border-radius: 15px;
    background: #51c185;
  }

  .resource_marker.workday_over div{
    border-radius: 3px;
    background: #ff8686;
  }

  .folder_row {
    font-weight: bold;
  }

  .highlighted_resource,
  .highlighted_resource.odd
  {
    background-color: rgba(255, 251, 224, 0.6);
  }

  .resource-controls .gantt_layout_content{
    padding: 7px;
    overflow: hidden;
  }
  .resource-controls label{
    margin: 0 10px;
    vertical-align: bottom;
    display: inline-block;
    color: #3e3e3e;
    padding: 2px;
    transition: box-shadow 0.2s;
  }

  .resource-controls label:hover{
    box-shadow: 0 2px rgba(84, 147, 255, 0.42);
  }

  .resource-controls label.active,
  .resource-controls label.active:hover
  {
    box-shadow: 0 2px #5493ffae;
    color: #1f1f1f;
  }

  .resource-controls input{
    vertical-align: top;
  }

  .gantt_task_cell.week_end {
    background-color: #e8e8e87d;
  }

  .gantt_task_row.gantt_selected .gantt_task_cell.week_end {
    background-color: #e8e8e87d !important;
  }


  .group_row,
  .group_row.odd,
  .gantt_task_row.group_row{
    background-color: rgba(232, 232, 232, 0.6);
  }

</style>
