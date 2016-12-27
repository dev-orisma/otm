import React, { Component } from 'react';
import auth from './Module/Auth';
import { Scrollbars } from 'react-custom-scrollbars';
import {Link} from 'react-router';
import projects from './Module/Project'
import Task from './Task'
import PopupPage from './PopupPage'
import TaskDetail from './TaskDetail'
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Redirect from 'react-router/Redirect'
import NavigationPrompt from 'react-router/NavigationPrompt'
var _ = require('lodash')
const MatchWhenAuthorized = ({ component: Component, ...rest }) => (
	<Match {...rest} render={props => (
		auth.loggedIn() ? (
			<Component {...props} {...rest} />
			) : (
			<Redirect to='/login'/>
			)
			)}/>
	)
class ProjectDemo extends Component {
	constructor(props) {
		super(props);
		var taskData = new Array();
		taskData["id-100"] = {id:"id-100",header:"test 100",detail:"detail 100",preview:"none"};
		taskData["id-101"] = {id:"id-101",header:"child 101",detail:"detail 101",preview:"none"};
		taskData["id-102"] = {id:"id-102",header:"child 102",detail:"detail 102",preview:"none"};
		taskData["id-200"] = {id:"id-200",header:"test 200",detail:"detail 200",preview:"none"};
		taskData["id-201"] = {id:"id-201",header:"child 201",detail:"detail 201",preview:"none"};
		taskData["id-202"] = {id:"id-202",header:"child 202",detail:"detail 202",preview:"none"};
		taskData["id-300"] = {id:"id-300",header:"test 300",detail:"detail 300",preview:"none"};
		taskData["id-301"] = {id:"id-301",header:"child 301",detail:"detail 301",preview:"none"};
		taskData["id-302"] = {id:"id-302",header:"child 302",detail:"detail 302",preview:"none"};
		taskData["id-303"] = {id:"id-303",header:"child 303",detail:"detail 303 asdasdasdas asd as dasd asd asd asd assa as as dasd s",preview:"none"};
		taskData["id-333"] = {id:"id-333",header:"child 333",detail:"detail 333",preview:"none"};
		taskData["id-334"] = {id:"id-334",header:"child 334",detail:"detail 334",preview:"none"};
		taskData["id-335"] = {id:"id-335",header:"child 335",detail:"detail 335",preview:"none"};

		var taskChild = new Array();
		taskChild["id-100"] = ["id-101","id-102"];
		taskChild["id-200"] = ["id-201","id-202"];
		taskChild["id-300"] = ["id-301","id-302","id-303"];
		taskChild["id-303"] = ["id-333","id-334","id-335"];

		this.state = {
			error: false,
			errorMsg:"",
			projectId:this.props.params.projectId || "",
			cardList:[],
			addCardEnable:false,
			mouseDownInput:false,
			projectTitle:"",
			dialogEdit:false,
			cardEditTitle:"",
			cardEditColor:"",
			cardEditIcon:"",
			cardEditId:"",
			cardEditPosition:0,
			activeTask:0,
			archiveTask:0,
			trashTask:0,
			completeTask:0,
            testTask:[
                "id-100",
                "id-200",
                "id-300"
            ],
            taskData:taskData,
			taskChild:taskChild,
			taskIndex:null,
			moveState:false,
			dragZone:null,
			dragFrom:null,
			dragTo:null,
			checkDrop:null
		}


	}
	setDropZone(parent,taskId,status) {
		this.state.taskData[taskId].preview = status;
		this.state.dragTo = {parent:parent,taskId:taskId,position:status};
		this.setState({taskChild:this.state.taskChild});
	}
	dropElement() {
		this.updateDragZone(null);
		if (this.state.checkDrop == "move") {
			var from_index = this.state.taskChild[this.state.dragFrom.parent].indexOf(this.state.dragFrom.taskId);
			var to_index = this.state.taskChild[this.state.dragTo.parent].indexOf(this.state.dragTo.taskId);
			if (this.state.dragTo.position == "after") {
				to_index++;
			}
			this.state.taskChild[this.state.dragFrom.parent].splice(from_index,1);
			this.state.taskChild[this.state.dragTo.parent].splice(to_index,0,this.state.dragFrom.taskId);
			this.setState({taskChild:this.state.taskChild});
		}
	}
	setDragFrom(parent,taskId,height) {
		this.setState({dragFrom:{parent:parent,taskId:taskId,height:height}});
	}
	componentDidMount(){
		// window.addEventListener('mousedown', this.inputClick.bind(this), false);
		$( "#card-sort" ).sortable({update: this.handleSortCardUpdate.bind(this)
		}).disableSelection();
		this.projectsListCard.bind(this)()
		this.taskCount.bind(this)();
		this.props.socket.on('card:updateSort', this._updateSortCardList.bind(this));
		this.props.socket.on('card:updateAddList', this._updateAddCardList.bind(this));
		this.props.socket.on('card:updateEditCard', this._updateEditCard.bind(this));
		this.props.socket.on('project:countStatus', this._countStatus.bind(this));
		cal_list();
	}
	updateDragZone(dragZone) {
		if (dragZone == null) {
			this.state.checkDrop = null;
			for (var i in this.state.taskData) {
				if (this.state.taskData[i].preview != "none" ) {
					this.state.checkDrop = "move";
				}
				this.state.taskData[i].preview = "none";
			}
		}
		this.setState({dragZone:dragZone});
	}
	componentWillMount() {

	}
	componentDidUpdate(prevProps, prevState){
		cal_list();

	}
	_countStatus(data){
		// console.log("data",data);
	}
	_updateAddCardList(data){
		if(data.pid == this.state.projectId){
			var {cardList} = this.state;
			cardList.push(data.lists);
			this.setState({cardList});
		}
	}
	_updateSortCardList(data){
		if(data.pid == this.state.projectId){
			this.setState({ cardList: data.lists });
		}
	}
	_updateEditCard(data){
		var {cardList} = this.state;
		var index = _.findIndex(cardList,{'id':data.id})
		cardList.splice(index, 1, {id:data.id,title:data.title,color:data.color,icon:data.icon,position:data.position});
		this.setState({
			cardList,
			cardEditTitle:"",
			cardEditColor:"",
			cardEditIcon:"",
			cardEditId:"",
			cardEditPosition:0
		});
	}
	projectsListCard(){
		console.log(this.state.projectId);
		if(this.state.projectId !==""){
			this.setState({cardList:[]});
			projects.listCard(this.props.socket,this.state.projectId,(rs)=>{
				if(!rs){

				}else{
					this.setState({projectTitle:rs.board,cardList:rs.lists});
				}
			})
		}
	}
	taskCount() {
		if(this.state.projectId !==""){
			projects.getCount(this.props.socket,this.state.projectId, (rs)=>{
				this.setState({activeTask:(rs.active > 0 ? rs.active : 0)});
				this.setState({archiveTask:(rs.archive > 0 ? rs.archive : 0)});
				this.setState({trashTask:(rs.trash > 0 ? rs.trash : 0)});
				this.setState({completeTask:(rs.complete > 0 ? rs.complete : 0)});
			});
		}

	}
	componentWillReceiveProps(nextProps){
		// console.log(nextProps)
	}
	handleSortCardUpdate(event, ui){
		var newItems = this.state.cardList;
		var $node = $('#card-sort');
		var ids = $node.sortable('toArray', { attribute: 'data-id' });
		ids.forEach(function (i, index) {
			var elementPos = newItems.map(function(x) {return x.id;}).indexOf(parseInt(i));
			var item = newItems[elementPos];
			item.position = index;
		});
		$node.sortable('cancel');
		let store_state = this.state.cardList
		this.setState({ cardList: newItems });
		projects.updateCard(this.props.socket,this.state.projectId,newItems,(rs)=>{
			if(!rs){
				this.setState({ cardList: store_state });
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}
		})
	}


	addCard(event){
		if(!this.state.addCardEnable){
			this.setState({addCardEnable:true})
		}
	}
	inputClick(e) {
		if (this.state.mouseDownInput) {
			return;
		}

		this.setState({
			addCardEnable: false
		})
	}
	mouseDownHandler() {
		this.state.mouseDownInput = true;
	}

	mouseUpHandler() {
		this.state.mouseDownInput = false;
	}
	submitAdd(e){
		e.preventDefault()
		const title = this.refs.addTitle.value
		const sortNum = parseInt($('.card-item').length) + 1
		if(title == ""){
			return false
		}
		projects.addCard(this.props.socket,title,this.state.projectId,sortNum,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {cardList} = this.state;
				cardList.push(rs.lists);
				this.setState({cardList,addCardEnable: false});
			}
		})
	}
	esc(e){
		if(e.key=="Escape"){
			this.setState({
				addCardEnable: false
			})
		}
	}

	editCard(id){
		if(!this.state.dialogEdit){
			projects.getCard(this.props.socket,id,(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาด ไม่พบข้อมูลนี้", 4000)
				}else{
					this.setState({dialogEdit:true,
						cardEditTitle:rs.title,
						cardEditColor:rs.color,
						cardEditIcon:rs.icon,
						cardEditPosition:rs.position,
						cardEditId:id})
				}
			})

		}
	}

	closeEditCard(e){
		this.setState({dialogEdit:false})
	}
	submitEditCard(event){
		event.preventDefault()
		const title = this.refs.card_edit_name.value
		const color = this.refs.color_edit_card.value
		const icon = this.refs.icon_edit_card.value
		const position = this.state.cardEditPosition
		projects.saveCard(this.props.socket,title,color,icon,position,this.state.cardEditId,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {cardList} = this.state;
				var index = _.findIndex(cardList,{'id':this.state.cardEditId})
				cardList.splice(index, 1, {id:this.state.cardEditId,title:title,color:color,icon:icon,position:position});
				this.setState({
					cardList,
					cardEditTitle:"",
					cardEditColor:"",
					cardEditIcon:"",
					cardEditId:"",
					cardEditPosition:0,
					dialogEdit:false
				});
			}
		})
	}
	changeTitleEdit(e){
		this.setState({cardEditTitle:e.target.value});
	}
	setColor(color){
		this.setState({cardEditColor:color});
	}
	setIcon(icon){
		this.setState({cardEditIcon:icon});
	}
	classIcon(icon){
		if(icon == this.state.cardEditIcon){
			return "icon-select active";
		}else{
			return "icon-select";
		}
	}
	classColor(color){
		if(color == this.state.cardEditColor){
			return 'color-select active ' + color
		}else{
			return 'color-select ' + color
		}
	}
	deletePanel(event){
		event.preventDefault()
	}
	RerenderProject(pid){
		this.setState({projectId:pid});
		this.projectsListCard.bind(this)()
	}
	render() {
		return (
            <div id="projects">
                <ProjectHead />
                <TaskNavBar />
                <TaskList taskList={this.state.taskIndex == null ? this.state.testTask:this.state.taskChild[this.state.taskIndex]}
						  taskData={this.state.taskData}
						  taskChild={this.state.taskChild}
						  dragZone={this.state.dragZone}
						  dragFrom={this.state.dragFrom}
						  setDragFrom={this.setDragFrom.bind(this)}
						  dropElement={this.dropElement.bind(this)}
						  updateDragZone={this.updateDragZone.bind(this)}
						  setDropZone={this.setDropZone.bind(this)}	/>
            </div>
		);
	}
}
class TaskNavBar extends Component {
    render() {
        return (
            <div className="task_nav_bar">
                root > task1.. > task1.1
            </div>
        );
    }
}
class ProjectHead extends Component {
    render() {
        return (
            <div className="project_header">
                <div className='project_name'>
                    Project Name
                </div>
                <div className='taskCount'>
                    <abbr title='Active'><i className="material-icons inline">play_for_work</i>1</abbr>
                    <abbr title='Complete'><i className="material-icons inline">check_circle</i>1</abbr>
                    <abbr title='Archive'><i className="material-icons inline">archive</i>1</abbr>
                    <abbr title='Trash'><i className="material-icons inline">delete</i>1</abbr>
                </div>
            </div>
        );
    }
}
class TaskList extends Component {
    render() {
        return (
            <div className="task_panel">
                <Scrollbars className="scroll">
                    <div className="task_list">
                        <div className="task_row">
                            {this.props.taskList.map((task_id,index) =>
                                <TaskLevel1 key={index} taskId={task_id}
											taskData={this.props.taskData}
											taskChild={this.props.taskChild[task_id]}
											dragZone={this.props.dragZone}
											dragFrom={this.props.dragFrom}
											setDragFrom={this.props.setDragFrom}
											updateDragZone={this.props.updateDragZone}
											dropElement={this.props.dropElement}
											setDropZone={this.props.setDropZone}/>
                            )}
                            <AddTaskPanel />
                        </div>
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
class AddTaskPanel extends Component {
    render() {
        return (
            <div className="add_task_panel">
                +
            </div>
        );
    }
}
class TaskLevel1 extends Component {
    render() {
        return (
            <div className="task_cell">
                <div className="task_cell_fixed">
                    <div className="task_level1">
                        <div className="task_header">
                            {this.props.taskData[this.props.taskId].header}
                        </div>
                        <div className="task_child">
                            {typeof(this.props.taskChild) == "object" ? this.props.taskChild.map((taskId,index) =>
                                <TaskLevel2 key={index}
											taskId={taskId}
											parent={this.props.taskId}
											taskData={this.props.taskData[taskId]}
											dragZone={this.props.dragZone}
											dragFrom={this.props.dragFrom}
											setDragFrom={this.props.setDragFrom}
											updateDragZone={this.props.updateDragZone}
											dropElement={this.props.dropElement}
											setDropZone={this.props.setDropZone}/>
                            ) : ""}
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}
class TaskLevel2 extends Component {
	state = {
		tempTarget:null,
		tempMPosX:null,
		tempMPosY:null,
		tempTPosX:null,
		tempTPosY:null,
		setMove:false,
		marginPreview:{top:"0px",bottom:"0px"},
		position:null,
		displayTimeout:null,
	}
	componentDidUpdate() {
		var dragZone = this.props.dragZone;
		var dropZone = $(this.dropZone);
		var posDropZone = dropZone.offset();
		var dropZoneX = {start:posDropZone.left,end:posDropZone.left+dropZone.width()};
		var dropZoneY = {start:posDropZone.top,end:posDropZone.top+dropZone.height()};
		var dropZoneYBefore = {start:posDropZone.top,end:posDropZone.top+(dropZone.height()/2)};
		var dropZoneYAfter = {start:posDropZone.top+(dropZone.height()/2),end:posDropZone.top+dropZone.height()};
		//console.log(dropZoneX,dropZoneY);
		if (dragZone != null && this.state.setMove == false) {
			if (dragZone.x >= dropZoneX.start
				&& dragZone.x <= dropZoneX.end
				&& dragZone.y >= dropZoneY.start
				&& dragZone.y <= dropZoneY.end) {
				if (dragZone.y > dropZoneYBefore.start
					&& dragZone.y < dropZoneYBefore.end
					&& this.props.taskData.preview != "before") {
					this.props.setDropZone(this.props.parent,this.props.taskId,"before");
				} else if (dragZone.y > dropZoneYAfter.start
					&& dragZone.y < dropZoneYAfter.end
					&& this.props.taskData.preview != "after") {
					this.props.setDropZone(this.props.parent,this.props.taskId,"after");
				}
			} else {
				if (this.props.taskData.preview != "none") {
					this.props.setDropZone(this.props.parent,this.props.taskId,"none");
				}
			}
		}
	}
	addMoveAble(event) {
/*		console.log(event.currentTarget);
		event.currentTarget.style.position = "absolute";*/
		var target = $(event.currentTarget);
		var pos = target.offset();
		//console.log(pos);
		target.css("position","absolute");
		this.state.tempTPosX = pos.left;
		this.state.tempTPosY = pos.top;
		var m_pos_x = event.clientX;
		var m_pos_y = event.clientY;
		this.state.tempMPosX = m_pos_x;
		this.state.tempMPosY = m_pos_y;
		//console.log(m_pos_x,m_pos_y);
		this.state.tempTarget = target;
		this.state.setMove = true;
		this.props.setDragFrom(this.props.parent,this.props.taskId,target.height()+10);
	}
	removeMoveAble(event) {
		this.state.tempMPosX = null;
		this.state.tempMPosY = null;
		this.state.tempTPosX = null;
		this.state.tempTPosY = null;
		this.state.tempTarget.css("position", "");
		this.state.tempTarget.css("left", "");
		this.state.tempTarget.css("top", "");
		this.state.setMove = false;
		this.props.dropElement()
	}
	moveTask(event) {
		if (this.state.setMove == true) {
			var m_pos_x_to = event.clientX;
			var m_pos_y_to = event.clientY;
			var new_target_x = this.state.tempTPosX + (m_pos_x_to - this.state.tempMPosX);
			this.state.tempTarget.css("left", new_target_x);
			var new_target_y = (this.state.tempTPosY + (m_pos_y_to - this.state.tempMPosY)) - 134;
			this.state.tempTarget.css("top", new_target_y);
			this.props.updateDragZone({x:m_pos_x_to,y:m_pos_y_to});
		}
	}
    render() {
		var topMargin = "5px";
		var bottomMargin = "5px";
		if (this.props.taskData.preview == "before") {
			topMargin = this.props.dragFrom.height+"px";
		}
		if (this.props.taskData.preview == "after") {
			bottomMargin = this.props.dragFrom.height+"px";
		}
        return (
        	<div className="task_2_cover" ref={(dropZone) => this.dropZone = dropZone}
				 onMouseDown={this.addMoveAble.bind(this)}
				 onMouseUp={this.removeMoveAble.bind(this)}
				 onMouseMove={this.moveTask.bind(this)}>
				<div className="task_level2" ref={(dropZoneDisplay) => this.dropZoneDisplay = dropZoneDisplay}
					 style={{paddingTop:topMargin,paddingBottom:bottomMargin}}>
					<div className="task_2_panel">
						<div className="task_2_header">
							{this.props.taskData.header}
						</div>
						<div className="task_2_detail">
							{this.props.taskData.detail}
						</div>
					</div>
				</div>
			</div>
        );
    }
}
export default ProjectDemo;