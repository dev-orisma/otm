import React, {Component} from 'react';
import auth from './Module/Auth';
import {Scrollbars} from 'react-custom-scrollbars';
import {Link} from 'react-router';
import projects from './Module/Project'
import Task from './Task'
import TaskModule from "./Module/Task";
import PopupPage from './PopupPage'
import TaskDetail from './TaskDetail'
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Redirect from 'react-router/Redirect'
import NavigationPrompt from 'react-router/NavigationPrompt'
var _ = require('lodash')
const MatchWhenAuthorized = ({component: Component, ...rest}) => (
    <Match {...rest} render={props => (
        auth.loggedIn() ? (
            <Component {...props} {...rest} />
        ) : (
            <Redirect to='/login'/>
        )
    )}/>
)
class Project extends Component {
    constructor(props) {
        super(props);
        let taskData = new Array();
        /*
         taskData["id-100"] = {id:"id-100",header:"test 100 sdas",detail:"detail 100",preview:"none"};
         taskData["id-101"] = {id:"id-101",header:"child 101",detail:"detail 101",preview:"none"};
         taskData["id-102"] = {id:"id-102",header:"child 102",detail:"detail 102",preview:"none"};
         taskData["id-200"] = {id:"id-200",header:"test 200 sdas",detail:"detail 200",preview:"none"};
         taskData["id-201"] = {id:"id-201",header:"child 201",detail:"detail 201",preview:"none"};
         taskData["id-202"] = {id:"id-202",header:"child 202",detail:"detail 202",preview:"none"};
         taskData["id-203"] = {id:"id-203",header:"child 203",detail:"detail 203",preview:"none"};
         taskData["id-204"] = {id:"id-204",header:"child 204",detail:"detail 204",preview:"none"};
         taskData["id-205"] = {id:"id-205",header:"child 205",detail:"detail 205",preview:"none"};
         taskData["id-206"] = {id:"id-206",header:"child 206",detail:"detail 206",preview:"none"};
         taskData["id-207"] = {id:"id-207",header:"child 207",detail:"detail 207",preview:"none"};
         taskData["id-208"] = {id:"id-208",header:"child 208",detail:"detail 208",preview:"none"};
         taskData["id-209"] = {id:"id-209",header:"child 209",detail:"detail 209",preview:"none"};
         taskData["id-210"] = {id:"id-210",header:"child 210",detail:"detail 210",preview:"none"};
         taskData["id-211"] = {id:"id-211",header:"child 211",detail:"detail 211",preview:"none"};
         taskData["id-212"] = {id:"id-212",header:"child 212",detail:"detail 212",preview:"none"};
         taskData["id-213"] = {id:"id-213",header:"child 213",detail:"detail 213",preview:"none"};
         taskData["id-214"] = {id:"id-214",header:"child 214",detail:"detail 214",preview:"none"};
         taskData["id-215"] = {id:"id-215",header:"child 215",detail:"detail 215",preview:"none"};
         taskData["id-216"] = {id:"id-216",header:"child 216",detail:"detail 216",preview:"none"};
         taskData["id-300"] = {id:"id-300",header:"test 300 sad",detail:"detail 300",preview:"none"};
         taskData["id-301"] = {id:"id-301",header:"child 301",detail:"detail 301",preview:"none"};
         taskData["id-302"] = {id:"id-302",header:"child 302",detail:"detail 302",preview:"none"};
         taskData["id-303"] = {id:"id-303",header:"child 303",detail:"detail 303 asdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd sasdasdasdas asd as dasd asd asd asd assa as as dasd s",preview:"none"};
         taskData["id-333"] = {id:"id-333",header:"child 333",detail:"detail 333",preview:"none"};
         taskData["id-334"] = {id:"id-334",header:"child 334",detail:"detail 334",preview:"none"};
         taskData["id-335"] = {id:"id-335",header:"child 335",detail:"detail 335",preview:"none"};
         */
        let taskChild = new Array();
        taskChild["root"] = [];
        taskChild["id-344"] = [];
        /*
         taskChild["root"] = ["id-100","id-200","id-300"];
         taskChild["id-100"] = ["id-101","id-102"];
         taskChild["id-200"] = ["id-201",
         "id-202",
         "id-203",
         "id-204",
         "id-205",
         "id-206",
         "id-207",
         "id-208",
         "id-209",
         "id-210",
         "id-211",
         "id-212",
         "id-213",
         "id-214",
         "id-215",
         "id-216"];
         taskChild["id-300"] = ["id-301",
         "id-302",
         "id-303"];
         taskChild["id-303"] = ["id-333","id-334","id-335"];
         */
        let addPreview = new Array();
        /*
         addPreview["root"] = false;
         addPreview["id-100"] = false;
         addPreview["id-200"] = false;
         addPreview["id-300"] = false;
         */
        this.state = {
            error: false,
            errorMsg: "",
            projectId: this.props.params.projectId || "",
            cardList: [],
            addCardEnable: false,
            mouseDownInput: false,
            projectTitle: "",
            dialogEdit: false,
            cardEditTitle: "",
            cardEditColor: "",
            cardEditIcon: "",
            cardEditId: "",
            cardEditPosition: 0,
            taskCount: [],
            taskData: taskData,
            taskChild: taskChild,
            taskIndex: "root",
            moveState: false,
            dragZone: null,
            dragFrom: null,
            dragTo: null,
            checkDrop: null,
            startPos: null,
            previewElement: null,
            movingElement: null,
            scrollLeft: null,
            addTaskLv1: false,
            addPreview: addPreview,
            taskDetail: [],
            navigator: []
        }
    };
    closeTaskDetail() {
        var taskDetail = [];
        this.setState({taskDetail: taskDetail});
        window.history.pushState("", 'Project', '/project/'+this.state.projectId);
        this.updateTaskCount();
        this.loadTaskData();
    }
    viewTaskDetail(task_id) {
        var taskDetail = [];
        taskDetail.push(task_id);
        this.setState({taskDetail: taskDetail});
        window.history.pushState("", 'Project', '/task/'+task_id);
    }
    setScrollLeft(scrollLeft) {
        this.setState({scrollLeft: scrollLeft});
    }
    setDropZone(parent, taskId, status) {
        //console.log(parent,taskId,status);
        this.state.taskData[taskId].preview = status;
        this.state.dragTo = {parent: parent, taskId: taskId, position: status};
        this.setState({taskChild: this.state.taskChild});
    }
    calculateAddTask(parent, data) {
        var ref_parent;
        var ref_array_id;
        if (parent == null) {
            ref_parent = this.state.taskIndex;
            ref_array_id = ref_parent;
        } else {
            ref_parent = parent
            ref_array_id = parent;
        }
        if (data == null) {
            var parent_array_name = "";
            if (parent == null) {
                parent_array_name = "root";
            } else {
                parent_array_name = parent;
            }
            this.state.addPreview[parent_array_name] = false;
            this.setState({addPreview: this.state.addPreview});
        } else {
            var lastChild = null;
            //console.log("ref_p", ref_parent);
            if (typeof(this.state.taskChild[ref_array_id]) != "undefined" && this.state.taskChild[ref_array_id].length > 0) {
                lastChild = this.state.taskChild[ref_array_id][this.state.taskChild[ref_array_id].length - 1];
            }
            this.addTaskLv1(this.state.projectId, ref_parent, lastChild, data);
        }
    }
    addTaskLv1(projectId, parent, after, header) {
        //console.log(">>>", this.props.socket, localStorage.uid, projectId, parent, header, after, this.state.taskIndex);
        TaskModule.addLv1(this.props.socket, localStorage.uid, projectId, parent, header, after, this.state.taskIndex, (rs)=> {
            if (!rs) {
                return Materialize.toast("Error", 4000)
            } else {
                this.definedTask(rs);
            }
        });
    }
    getNavigator(index) {
        if (index != "root") {
            //console.log(1);
            this.state.taskIndex = index;
            TaskModule.getNav(this.props.socket, index,(rs)=> {
                if (!rs) {
                    return Materialize.toast("Error", 4000);
                } else {
                    this.updateNavigator(rs);
                }
            });
        } else {
            //console.log(2);
            this.state.navigator = [{id:"root",title:this.state.projectTitle}];
            this.setState({navigator:this.state.navigator,taskIndex:"root"});
            setTimeout(() => {
                this.loadTaskData();
            },10);
        }
    }
    updateNavigator(data) {
        var parent_data = data[0].parent;
        var root_data = {id:"root",title:this.state.projectTitle}
        var nav_data = new Array();
        for (var i in parent_data) {
            var np_data = {id:"id-"+parent_data[i].t_id,title:parent_data[i].title}
            console.log(np_data);
            nav_data.splice(0,0,np_data);
        }
        nav_data.splice(0,0,root_data);
        this.setState({navigator:nav_data,taskIndex:this.state.taskIndex});
        setTimeout(() => {
            this.loadTaskData();
        },10);
    }
    definedTask(data) {
        let taskData = this.state.taskData;
        let newAddPreview = new Array();
        let newChildList = new Array();
        if (data.length > 0) {
            var count_p = 0;
            var index_p = 0;
            while (data.length > 0 && count_p < 100) {
                var parent = "";
                if (data[index_p].parent == "root") {
                    parent = "root";
                } else {
                    parent = "id-" + data[index_p].parent;
                }
                if (typeof(newChildList[parent]) == "undefined") {
                    newChildList[parent] = new Array();
                    newAddPreview[parent] = false;
                }
                if (newChildList[parent].length == 0 || newChildList[parent].indexOf("id-" + data[index_p].next) > -1 || data[index_p].next == null) {
                    var dataDetail = data.splice(index_p, 1);
                    var t_id = "id-" + dataDetail[0].t_id;
                    taskData[t_id] = dataDetail[0];
                    taskData[t_id].preview = "none";
                    if (dataDetail[0].next != null) {
                        var position = newChildList[parent].indexOf("id-" + dataDetail[0].next);
                        newChildList[parent].splice(position, 0, t_id);
                    } else {
                        newChildList[parent].push(t_id);
                    }
                    if (dataDetail[0].childData[0].t_id != null) {
                        var childData = dataDetail[0].childData;
                        var index = 0;
                        var ct_parent = t_id;
                        if (typeof(newChildList[ct_parent]) == "undefined") {
                            newChildList[ct_parent] = new Array();
                        }
                        var count = 0;
                        while (childData.length > 0 && count < 100) {
                            if (newChildList[ct_parent].length == 0 || newChildList[ct_parent].indexOf("id-" + childData[index].next) > -1 || childData[index].next == null) {
                                var childDetail = childData.splice(index, 1);
                                var ct_id = "id-" + childDetail[0].t_id;
                                taskData[ct_id] = childDetail[0];

                                if (childDetail[0].next != null) {
                                    var ct_position = newChildList[ct_parent].indexOf("id-" + childDetail[0].next);
                                    newChildList[ct_parent].splice(ct_position, 0, ct_id);
                                } else {
                                    newChildList[ct_parent].push(ct_id);
                                }
                            }
                            if (index < childData.length - 1) {
                                index++;
                            } else {
                                index = 0;
                            }
                            count++;
                        }
                    }
                }
                if (index_p < data.length - 1) {
                    index_p++;
                } else {
                    index_p = 0;
                }
                count_p++;
            }

            //console.log("newChildList", newChildList, "taskData", taskData, "newAddPreview", newAddPreview);
            this.setState({taskData: taskData, taskChild: newChildList, addPreview: newAddPreview});
        }
    }
    openTaskDetail(task_id) {
        var task_id = task_id.split("-")[1];
        this.setState({taskDetail:[task_id]});
    }
    showAddTask(parent) {
        if (parent == null) {
            this.state.addPreview[this.state.taskIndex] = true;
        } else {
            this.state.addPreview[parent] = true;
            //console.log(2,parent);
        }
        //console.log(this.state.addPreview);
        this.setState({addPreview: this.state.addPreview});
    }
    dropElement() {
        this.updateDragZone(null);
        if (this.state.checkDrop == "move" && this.state.dragTo != null && this.state.dragFrom != null
            && (this.state.dragTo.parent != this.state.dragFrom.parent || this.state.dragFrom.taskId != this.state.dragTo.taskId)) {
            var from_index = this.state.taskChild[this.state.dragFrom.parent].indexOf(this.state.dragFrom.taskId);
            var to_index = null;
            var afterElement = null;
            var beforeElement = null;
            var to_parent_first_child = null;
            if (typeof (this.state.taskChild[this.state.dragTo.parent]) != "undefined" && this.state.taskChild[this.state.dragTo.parent].length > 0) {
                to_parent_first_child = this.state.taskChild[this.state.dragTo.parent][0];
            }
            if (this.state.dragTo.position == "last") {
                if (typeof(this.state.taskChild[this.state.dragTo.parent]) == "undefined") {
                    this.state.taskChild[this.state.dragTo.parent] = new Array();
                }
                to_index = this.state.taskChild[this.state.dragTo.parent].length;
                afterElement = this.state.taskChild[this.state.dragTo.parent][this.state.taskChild[this.state.dragTo.parent].length - 1];
            } else {
                to_index = this.state.taskChild[this.state.dragTo.parent].indexOf(this.state.dragTo.taskId);
                //console.log(this.state.dragTo);
                if (this.state.dragTo.position == "after") {
                    afterElement = this.state.dragTo.taskId;
                    to_index++;
                } else if (this.state.dragTo.position == "before") {
                    if (to_index > 0) {
                        afterElement = this.state.taskChild[this.state.dragTo.parent][to_index - 1];
                    } else {
                        afterElement = null;
                    }
                    if (this.state.dragFrom.parent == this.state.dragTo.parent && from_index == (to_index - 1)) {
                        to_index = from_index;
                    }
                }
            }
            if (this.state.dragFrom.parent != this.state.dragTo.parent || from_index != to_index) {
                if (from_index < to_index && this.state.dragFrom.parent == this.state.dragTo.parent) {
                    to_index--;
                }
                this.state.taskChild[this.state.dragFrom.parent].splice(from_index, 1);
                this.state.taskChild[this.state.dragTo.parent].splice(to_index, 0, this.state.dragFrom.taskId);
                this.setState({taskChild: this.state.taskChild});
                if (afterElement == null) {
                    beforeElement = to_parent_first_child;
                }
                //console.log("from:", this.state.dragFrom.parent, " - to:", this.state.dragTo.parent, " - after:", afterElement, " - before:", beforeElement, " - id:", this.state.dragFrom.taskId);
                var reload = false;
                if (this.state.dragTo.parent == this.state.taskIndex || (this.state.dragFrom.parent == this.state.taskIndex && this.state.dragTo.parent != this.state.taskIndex)) {
                    reload = true;
                }
                TaskModule.moveTask(this.props.socket, this.state.dragFrom.parent, this.state.dragTo.parent, this.state.dragFrom.taskId, afterElement, beforeElement, this.state.projectId,reload, (rs)=> {
                    if (!rs) {
                        return Materialize.toast("Error", 4000)
                    } else {
                        if (reload == true) {
                            this.loadTaskData();
                        }
                    }
                });
            }
        }
        this.state.moveState = false;
        this.state.startPos = null;
        this.setState({previewElement: [], movingElement: null});
    }
    setDragFrom(parent, taskId, height, previewElement) {
        this.state.moveState = true;
        this.setState({
            dragFrom: {parent: parent, taskId: taskId, height: height},
            previewElement: [taskId],
            movingElement: taskId
        });
    }
    componentDidMount() {
        this.loadProjectData();
        this.updateTaskCount();
    }
    updateTaskCount() {
        projects.getCount(this.props.socket, this.state.projectId, (rs) => {
            if (!rs) {
                return Materialize.toast("Error", 4000)
            } else {
                console.log(rs);
                this.setState({taskCount:rs});
            }
        });
    }
    loadProjectData() {
        projects.get(this.props.socket, this.state.projectId, (rs) => {
            if (!rs) {
                return Materialize.toast("Error", 4000)
            } else {
                this.setState({projectTitle:rs[0].p.properties.title});
                this.getNavigator("root");
            }
        });
    }
    loadTaskData() {
        //console.log("load data>>",this.props.socket, this.state.projectId, this.state.taskIndex);
        TaskModule.loadTaskList(this.props.socket, this.state.projectId, this.state.taskIndex, (rs)=> {
            if (!rs) {
                return Materialize.toast("Error", 4000)
            } else {
                this.definedTask(rs);
            }
        });
    }
    dragComponent(x, y) {
        if (this.state.moveState == true) {
            this.updateDragZone({x: x, y: y});
        }
    }
    updateDragZone(dragZone) {
        if (dragZone == null) {
            this.state.checkDrop = null;
            for (var i in this.state.taskData) {
                if (this.state.taskData[i].preview != "none") {
                    this.state.checkDrop = "move";
                }
                this.state.taskData[i].preview = "none";
            }
        }
        if (typeof(window.getSelection) != "undefined") {
            window.getSelection().removeAllRanges();
        } else if (typeof(document.selection) != "undefined") {
            document.selection.empty();
        }
        this.setState({dragZone: dragZone});
    }
    switchTaskIndex(data) {
        //console.log(data);
        this.getNavigator(data);
    }
    render() {
        return (
            <div id="projects">
                <ProjectHead projectTitle={this.state.projectTitle} taskCount={this.state.taskCount}/>
                <TaskNavBar
                    navigator={this.state.navigator}
                    currentIndex={this.state.taskIndex}
                    switchTaskIndex={this.switchTaskIndex.bind(this)}/>
                <TaskList
                    taskList={this.state.taskChild[this.state.taskIndex]}
                    taskData={this.state.taskData}
                    taskChild={this.state.taskChild}
                    dragZone={this.state.dragZone}
                    dragFrom={this.state.dragFrom}
                    dragTo={this.state.dragTo}
                    parent={this.state.taskIndex}
                    previewElement={this.state.previewElement}
                    movingElement={this.state.movingElement}
                    addTaskLv1={this.state.addTaskLv1}
                    addPreview={this.state.addPreview}
                    setScrollLeft={this.setScrollLeft.bind(this)}
                    dragComponent={this.dragComponent.bind(this)}
                    setDragFrom={this.setDragFrom.bind(this)}
                    dropElement={this.dropElement.bind(this)}
                    updateDragZone={this.updateDragZone.bind(this)}
                    setDropZone={this.setDropZone.bind(this)}
                    calculateAddTask={this.calculateAddTask.bind(this)}
                    showAddTask={this.showAddTask.bind(this)}
                    switchTaskIndex={this.switchTaskIndex.bind(this)}
                    openTaskDetail={this.openTaskDetail.bind(this)}/>
                {this.state.taskDetail.map((task_id,index) =>
                    <TaskDetail key={index} taskId={task_id} socket={this.props.socket} closeTask={this.closeTaskDetail.bind(this)}/>
                )}
            </div>

        );
    }
}
class TaskNavBar extends Component {
    render() {
        return (
            <div className="task_nav_bar">
                {this.props.navigator.map((data,index) =>
                    <NavigatorElement key={index} data={data}
                                      currentIndex={this.props.currentIndex}
                                      switchTaskIndex={this.props.switchTaskIndex} />
                )}
            </div>
        );
    }
}
class NavigatorElement extends Component {
    calculateIndex(data) {
        this.props.switchTaskIndex(data);
    }
    render() {
        return (
            <div className={this.props.data.id == this.props.currentIndex ? "deactive" : "active"}
                onClick={this.calculateIndex.bind(this,this.props.data.id)}>{this.props.data.title}</div>
        );
    }
}
class ProjectHead extends Component {
    render() {
        return (
            <div className="project_header">
                <div className='project_name'>
                    {this.props.projectTitle}
                </div>
                <div className='taskCount'>
                    <abbr title='Active'>
                        <i className="material-icons inline">play_for_work</i>
                        {typeof(this.props.taskCount.active) != "undefined" ? this.props.taskCount.active : 0}
                    </abbr>
                    <abbr title='Complete'>
                        <i className="material-icons inline">check_circle</i>
                        {typeof(this.props.taskCount.complete) != "undefined" ? this.props.taskCount.complete : 0}
                    </abbr>
                    <abbr title='Archive'>
                        <i className="material-icons inline">archive</i>
                        {typeof(this.props.taskCount.archive) != "undefined" ? this.props.taskCount.archive : 0}
                    </abbr>
                    {/*<abbr title='Trash'><i className="material-icons inline">delete</i>1</abbr>*/}
                </div>
            </div>
        );
    }
}
class TaskList extends Component {
    state = {
        scrollLeft: null,
    }

    dragComponent(event) {
        this.props.dragComponent(event.clientX, event.clientY);
    }

    handleScroll(event) {
        //this.state.scrollLeft = $(event.currentTarget).scrollLeft();
        this.setState({scrollLeft: $(event.currentTarget).scrollLeft()});
        //this.props.setScrollLeft($(event.currentTarget).scrollLeft());
    }

    render() {
        return (
            <div className="task_panel" onMouseMove={this.dragComponent.bind(this)}>
                <Scrollbars className="scroll"
                            onScroll={this.handleScroll.bind(this)}>
                    <div className="task_list">
                        <div className="task_row">
                            {(typeof(this.props.taskList) != "undefined" ? this.props.taskList.map((task_id, index) =>
                                <TaskLevel1 key={index} taskId={task_id}
                                            taskData={this.props.taskData}
                                            taskChild={this.props.taskChild[task_id]}
                                            parent={this.props.parent}
                                            dragZone={this.props.dragZone}
                                            dragFrom={this.props.dragFrom}
                                            dragTo={this.props.dragTo}
                                            movingElement={this.props.movingElement}
                                            addPreview={this.props.addPreview}
                                            setDragFrom={this.props.setDragFrom}
                                            updateDragZone={this.props.updateDragZone}
                                            dropElement={this.props.dropElement}
                                            setDropZone={this.props.setDropZone}
                                            calculateAddTask={this.props.calculateAddTask}
                                            showAddTask={this.props.showAddTask}
                                            switchTaskIndex={this.props.switchTaskIndex}
                                            openTaskDetail={this.props.openTaskDetail}/>
                            ) : null )}
                            {this.props.addPreview[this.props.parent] == true ?
                                <AddTaskLv1
                                    calculateAddTask={this.props.calculateAddTask}/> :
                                null
                            }
                            <AddTaskPanel
                                showAddTask={this.props.showAddTask}/>
                        </div>
                    </div>
                    <div ref={(preview) => this.preview = preview}>
                        {this.props.previewElement != null ? this.props.previewElement.map((taskId, index) =>
                            <TaskLevel2 key={index}
                                        taskId={taskId}
                                        parent={this.props.taskId}
                                        taskData={this.props.taskData[taskId]}
                                        dragZone={this.props.dragZone}
                                        dragFrom={this.props.dragFrom}
                                        dragTo={this.props.dragTo}
                                        previewMode={true}
                                        movingElement={this.props.movingElement}
                                        scrollLeft={this.state.scrollLeft}
                                        setDragFrom={this.props.setDragFrom}
                                        updateDragZone={this.props.updateDragZone}
                                        dropElement={this.props.dropElement}
                                        setDropZone={this.props.setDropZone}
                                        openTaskDetail={this.props.openTaskDetail}
                                        switchTaskIndex={this.props.switchTaskIndex}/>

                        ) : ""}
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
class AddTaskPanel extends Component {
    render() {
        return (
            <div className="add_task_panel" onClick={this.props.showAddTask.bind(this, null)}>
                <div className="add_tab">
                    <i className="material-icons">add_circle</i>
                </div>
            </div>
        );
    }
}
class AddTaskLv1 extends Component {
    componentDidMount() {
        setTimeout(() => {
            $(this.fixedPanel).css("width", "");
            $(this.fixedPanel).css("opacity", "");
            $(this.taskHeaderInput).focus();
        }, 10);
    }

    calculateNewTask() {
        if ($(this.taskHeaderInput).val().length == 0) {
            $(this.fixedPanel).css("width", "0px");
            $(this.fixedPanel).css("opacity", "0");
            setTimeout(() => {
                this.props.calculateAddTask(null, null);
            }, 600);
        } else {
            this.props.calculateAddTask(null, $(this.taskHeaderInput).val());
        }
    }

    render() {
        return (
            <div className="task_cell">
                <div className="drop_panel">
                    <div className="task_cell_fixed" style={{width: "0px", opacity: 0}}
                         ref={(fixedPanel) => this.fixedPanel = fixedPanel}>
                        <div className="task_level1">
                            <div className="task_header">
                                <input className="addTaskLv1Input" type="text"
                                       ref={(inputTaskHeader) => this.taskHeaderInput = inputTaskHeader}
                                       onBlur={this.calculateNewTask.bind(this)}/>
                            </div>
                            <div className="task_child">
                                <Scrollbars className="scrollTaskList">
                                </Scrollbars>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class AddTaskLv2 extends Component {
    componentDidMount() {
        setTimeout(() => {
            $(this.fixedPanel).css("height", "55px");
            $(this.fixedPanel).css("opacity", "");
            $(this.fixedPanel).css("padding", "5px 0");
            $(this.taskHeaderInput).focus();
        }, 10);
    }

    calculateNewTask() {
        if ($(this.taskHeaderInput).val().length == 0) {
            $(this.fixedPanel).css("height", "0px");
            $(this.fixedPanel).css("opacity", "0");
            $(this.fixedPanel).css("padding", "0px");
            setTimeout(() => {
                this.props.calculateAddTask(this.props.parent, null);
            }, 600);
        } else {
            this.props.calculateAddTask(this.props.parent, $(this.taskHeaderInput).val());
        }
    }

    render() {
        return (
            <div className="task_2_cover">
                <div className="task_level2 add_preview" ref={(fixedPanel) => this.fixedPanel = fixedPanel}>
                    <div className="task_2_panel">
                        <div className="task_2_header">
                            <input className="addTaskLv2Input" type="text"
                                   ref={(inputTaskHeader) => this.taskHeaderInput = inputTaskHeader}
                                   onBlur={this.calculateNewTask.bind(this)}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
class TaskLevel1 extends Component {
    state = {
        tempTarget: null,
        tempMPosX: null,
        tempMPosY: null,
        tempTPosX: null,
        tempTPosY: null,
        setMove: false,
        marginPreview: {top: "0px", bottom: "0px"},
        position: null,
        displayTimeout: null,
    }

    componentDidUpdate() {
        //console.log(dropZoneX,dropZoneY);
        if (this.props.dragZone != null) {
            var dragZone = this.props.dragZone;
            var dropZone = $(this.dropZoneCard);
            var cardHeader = $(this.cardHeader);
            var posDropZone = dropZone.offset();
            var dropZoneX = {start: posDropZone.left, end: posDropZone.left + dropZone.width()};
            var dropZoneY = {start: posDropZone.top, end: posDropZone.top + cardHeader.height()};
            if (dragZone.x >= dropZoneX.start
                && dragZone.x <= dropZoneX.end
                && dragZone.y >= dropZoneY.start
                && dragZone.y <= dropZoneY.end) {
                var dropZoneXBefore = {start: posDropZone.left, end: posDropZone.left + (dropZone.width() / 2)};
                var dropZoneXAfter = {
                    start: posDropZone.left + (dropZone.width() / 2),
                    end: posDropZone.left + dropZone.width()
                };
                //console.log(dragZone, dropZoneXBefore, dropZoneXAfter);
                if (dragZone.x > dropZoneXBefore.start
                    && dragZone.x < dropZoneXBefore.end
                    && (this.props.taskData[this.props.taskId].preview != "before" || this.props.dragTo.taskId != this.props.taskId)) {
                    //clearTimeout(this.state.displayTimeout);
                    //console.log("before");
                    //this.state.displayTimeout = setTimeout(() => {
                    this.props.setDropZone(this.props.parent, this.props.taskId, "before");
                    //},50)
                } else if (dragZone.x > dropZoneXAfter.start
                    && dragZone.x < dropZoneXAfter.end
                    && (this.props.taskData[this.props.taskId].preview != "after" || this.props.dragTo.taskId != this.props.taskId)) {
                    //clearTimeout(this.state.displayTimeout);
                    //console.log("after");
                    //this.state.displayTimeout = setTimeout(() => {
                    this.props.setDropZone(this.props.parent, this.props.taskId, "after");
                    //},50)
                }
            } else {
                if (this.props.taskData[this.props.taskId].preview == "before" || this.props.taskData[this.props.taskId].preview == "after") {
                    this.props.setDropZone(this.props.parent, this.props.taskId, "none");
                }
            }
        }
        if (this.props.dragZone == null && this.props.movingElement == null) {
            this.state.setMove = false;
            $(this.dropZoneCard).removeClass("alpha");
        } else {
            if (this.state.setMove == true) {
                $(this.dropZoneCard).addClass("alpha");
            }
        }
    }

    addMoveAble(event) {
        /*		console.log(event.currentTarget);
         event.currentTarget.style.position = "absolute";*/
        if (event.button == 0) {
            var target = $(this.dragItem);
            var pos = target.offset();
            this.state.tempTPosX = pos.left;
            this.state.tempTPosY = pos.top;
            var m_pos_x = event.clientX;
            var m_pos_y = event.clientY;
            this.state.tempMPosX = m_pos_x;
            this.state.tempMPosY = m_pos_y;
            //console.log(m_pos_x,m_pos_y);
            this.state.tempTarget = target;
            this.state.displayTimeout = setTimeout(() => {
                this.state.setMove = true;
                this.props.setDragFrom(this.props.parent, this.props.taskId, target.height() + 10);
            }, 200);
        }
    }

    removeMoveAble(event) {
        if (this.props.previewMode == true || this.state.setMove == true) {
            this.props.dropElement()
        } else {
            clearTimeout(this.state.displayTimeout);
        }
    }

    render() {
        var leftMargin = "0px";
        var rightMargin = "0px";
        if (this.props.movingElement != this.props.taskId) {
            if (this.props.taskData[this.props.taskId].preview == "before") {
                //topMargin = this.props.dragFrom.height+"px";
                leftMargin = "60px";
            }
            if (this.props.taskData[this.props.taskId].preview == "after") {
                //bottomMargin = this.props.dragFrom.height+"px";
                rightMargin = "60px";
            }
        }
        return (
            <div className="task_cell" ref={(dragItem) => {
                this.dragItem = dragItem
            }}>
                <div className="drop_panel" style={{
                    paddingLeft: leftMargin,
                    paddingRight: rightMargin
                }} ref={(dropZoneCard) => {
                    this.dropZoneCard = dropZoneCard
                }}>
                    <div className="task_cell_fixed">
                        <div className="task_level1">
                            <div className="task_header"
                                 onMouseDown={this.addMoveAble.bind(this)}
                                 onMouseUp={this.removeMoveAble.bind(this)} ref={(cardHeader) => {
                                this.cardHeader = cardHeader
                            }}>
                                {this.props.taskData[this.props.taskId].header}
                                    <div className="expand_icon">
                                        {typeof(this.props.taskChild) != "undefined" && this.props.taskChild.length > 0 ?
                                            <i className="material-icons" onClick={this.props.switchTaskIndex.bind(this,this.props.taskId)}>toc</i>
                                            : ""}
                                        <i className="material-icons" onClick={this.props.openTaskDetail.bind(this,this.props.taskId)}>settings</i>
                                    </div>

                            </div>
                            <div className="task_child">
                                <Scrollbars className="scrollTaskList">
                                    {typeof(this.props.taskChild) == "object" ? this.props.taskChild.map((taskId, index) =>
                                        <TaskLevel2 key={index}
                                                    taskId={taskId}
                                                    parent={this.props.taskId}
                                                    taskData={this.props.taskData[taskId]}
                                                    dragZone={this.props.dragZone}
                                                    dragFrom={this.props.dragFrom}
                                                    dragTo={this.props.dragTo}
                                                    previewMode={false}
                                                    movingElement={this.props.movingElement}
                                                    setDragFrom={this.props.setDragFrom}
                                                    updateDragZone={this.props.updateDragZone}
                                                    dropElement={this.props.dropElement}
                                                    setDropZone={this.props.setDropZone}
                                                    openTaskDetail={this.props.openTaskDetail}
                                                    switchTaskIndex={this.props.switchTaskIndex}/>
                                    ) : ""}
                                    {this.props.addPreview[this.props.taskId] == true ?
                                        <AddTaskLv2
                                            calculateAddTask={this.props.calculateAddTask}
                                            parent={this.props.taskId}
                                        /> :
                                        null
                                    }
                                    <NewTaskBtn
                                        parent={this.props.taskId}
                                        taskData={this.props.taskData[this.props.taskId]}
                                        dragZone={this.props.dragZone}
                                        dragFrom={this.props.dragFrom}
                                        dragTo={this.props.dragTo}
                                        movingElement={this.props.movingElement}
                                        updateDragZone={this.props.updateDragZone}
                                        dropElement={this.props.dropElement}
                                        setDropZone={this.props.setDropZone}
                                        showAddTask={this.props.showAddTask}/>
                                </Scrollbars>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
class NewTaskBtn extends Component {
    componentDidUpdate() {
        if (this.props.movingElement != this.props.parent) {
            //console.log(dropZoneX,dropZoneY);
            var dragZone = this.props.dragZone;
            if (dragZone != null) {
                var dropZone = $(this.dropZoneAddTask);
                var posDropZone = dropZone.offset();
                var dropZoneX = {start: posDropZone.left, end: posDropZone.left + dropZone.width()};
                var dropZoneY = {start: posDropZone.top, end: posDropZone.top + dropZone.height()};
                if (dragZone.x >= dropZoneX.start
                    && dragZone.x <= dropZoneX.end
                    && dragZone.y >= dropZoneY.start
                    && dragZone.y <= dropZoneY.end) {
                    if (this.props.taskData.preview == "none") {
                        this.props.setDropZone(this.props.parent, this.props.parent, "last");
                    }
                } else {
                    if (this.props.taskData.preview == "last") {
                        this.props.setDropZone(this.props.parent, this.props.parent, "none");
                    }
                }
            }
        }
    }

    render() {
        var paddingTop = "0px";
        if (this.props.taskData.preview == "last") {
            paddingTop = "60px"
        }
        return (
            <div className="new_task_lv2" ref={(dropZoneAddTask) => {
                this.dropZoneAddTask = dropZoneAddTask
            }}
                 onClick={this.props.showAddTask.bind(this, this.props.parent)}>
                <div className="move_preview" style={{
                    paddingTop: paddingTop
                }}>
                    <div className="add_btn_panel">
                        <i className="material-icons">add_circle</i>
                    </div>
                </div>
            </div>
        );
    }
}
class TaskLevel2 extends Component {
    state = {
        tempTarget: null,
        tempMPosX: null,
        tempMPosY: null,
        tempTPosX: null,
        tempTPosY: null,
        setMove: false,
        marginPreview: {top: "0px", bottom: "0px"},
        position: null,
        displayTimeout: null,
    }

    componentDidUpdate() {
        if (this.props.previewMode == false && this.props.movingElement != this.props.parent) {
            //console.log(dropZoneX,dropZoneY);
            var dragZone = this.props.dragZone;
            if (dragZone != null && this.props.previewMode == false) {
                var dropZone = $(this.dropZoneDisplay);
                var posDropZone = dropZone.offset();
                var dropZoneX = {start: posDropZone.left, end: posDropZone.left + dropZone.width()};
                var dropZoneY = {start: posDropZone.top, end: posDropZone.top + dropZone.height() + 10};
                if (dragZone.x >= dropZoneX.start
                    && dragZone.x <= dropZoneX.end
                    && dragZone.y >= dropZoneY.start
                    && dragZone.y <= dropZoneY.end) {
                    var dropZoneYBefore = {start: posDropZone.top, end: posDropZone.top + (dropZone.height() / 2)};
                    var dropZoneYAfter = {
                        start: posDropZone.top + (dropZone.height() / 2),
                        end: posDropZone.top + dropZone.height() + 10
                    };
                    if (dragZone.y > dropZoneYBefore.start
                        && dragZone.y < dropZoneYBefore.end
                        && (this.props.taskData.preview != "before" || this.props.dragTo.taskId != this.props.taskId)) {
                        //clearTimeout(this.state.displayTimeout);
                        //this.state.displayTimeout = setTimeout(() => {
                        this.props.setDropZone(this.props.parent, this.props.taskId, "before");
                        //},50)
                    } else if (dragZone.y > dropZoneYAfter.start
                        && dragZone.y < dropZoneYAfter.end
                        && (this.props.taskData.preview != "after" || this.props.dragTo.taskId != this.props.taskId)) {
                        //clearTimeout(this.state.displayTimeout);
                        //this.state.displayTimeout = setTimeout(() => {
                        this.props.setDropZone(this.props.parent, this.props.taskId, "after");
                        //},50)
                    }
                } else {
                    if (this.props.taskData.preview != "none") {
                        this.props.setDropZone(this.props.parent, this.props.taskId, "none");
                    }
                }
            }
        }
        if (this.props.dragZone == null && this.props.movingElement == null) {
            this.state.setMove = false;
            $(this.dropZone).removeClass("alpha");
        } else {
            if (this.state.setMove == true) {
                $(this.dropZone).addClass("alpha");
            }
        }
    }

    addMoveAble(event) {
        /*		console.log(event.currentTarget);
         event.currentTarget.style.position = "absolute";*/
        if (this.props.previewMode == false) {
            if (event.button == 0) {
                var target = $(this.dropZone);
                var pos = target.offset();
                this.state.tempTPosX = pos.left;
                this.state.tempTPosY = pos.top;
                var m_pos_x = event.clientX;
                var m_pos_y = event.clientY;
                this.state.tempMPosX = m_pos_x;
                this.state.tempMPosY = m_pos_y;
                //console.log(m_pos_x,m_pos_y);
                this.state.tempTarget = target;
                this.state.displayTimeout = setTimeout(() => {
                    this.state.setMove = true;
                    this.props.setDragFrom(this.props.parent, this.props.taskId, target.height() + 10);
                }, 200);
            }
        }
    }

    removeMoveAble(event) {
        if (this.props.previewMode == true || this.state.setMove == true) {
            this.props.dropElement()
        } else {
            clearTimeout(this.state.displayTimeout);
        }
    }

    render() {
        var position = {};
        if (this.props.previewMode == true && this.props.dragZone != null) {
            var new_target_x = this.state.tempTPosX + (this.props.dragZone.x - this.state.tempMPosX) - 30 + this.props.scrollLeft;
            var new_target_y = this.state.tempTPosY + (this.props.dragZone.y - this.state.tempMPosY) - 164;
            position = {top: new_target_y + "px", left: new_target_x + "px"}
        }
        var topMargin = "5px";
        var bottomMargin = "5px";
        if (this.props.previewMode == false && this.props.movingElement != this.props.taskId) {
            if (this.props.taskData.preview == "before") {
                //topMargin = this.props.dragFrom.height+"px";
                topMargin = "60px";
            }
            if (this.props.taskData.preview == "after") {
                //bottomMargin = this.props.dragFrom.height+"px";
                bottomMargin = "60px";
            }
        }
        console.log(this.props.taskData.tag);
        return (
            <div className={"task_2_cover " + (this.props.previewMode == true ? "move_able" : "")}
                 ref={(dropZone) => this.dropZone = dropZone}
                 style={position}>
                <div className="task_level2" ref={(dropZoneDisplay) => this.dropZoneDisplay = dropZoneDisplay}
                     style={{paddingTop: topMargin, paddingBottom: bottomMargin}}>
                    <div className="task_2_panel">
                        <div className="task_2_header"
                             onMouseDown={this.addMoveAble.bind(this)}
                             onMouseUp={this.removeMoveAble.bind(this)}
                             onClick={this.props.openTaskDetail.bind(this,this.props.taskId)}>
                            {this.props.taskData.header}
                        </div>
                        <div className="task_2_detail">
                            {this.props.taskData.detail}
                        </div>
                        {typeof(this.props.taskData.tag) != "undefined" && this.props.taskData.tag.length > 0 ?
                            <div className="task_label">
                                {this.props.taskData.tag.map((tag, i)=>
                                    <div key={"color-" + i} className={"tagColor " + tag.properties.color} style={{
                                        backgroundColor: tag.properties.bg_color,
                                        color: tag.properties.f_color
                                    }}>{tag.properties.text}</div>
                                )}
                                <div className="clear_fix"></div>
                            </div> : null
                        }
                        <div className="bottom_space"></div>
                        {this.props.taskData.child_count > 0 ?
                        <div className="child_task" onClick={this.props.switchTaskIndex.bind(this,this.props.taskId)}>
                            <i className="material-icons">toc</i>
                            {this.props.taskData.child_count}
                        </div>
                            :null}
                    </div>
                </div>
            </div>
        );
    }
}
export default Project;