module.exports = function (socket,db) {
	//Task===============//
	function getProjectDataQuery(input_parent,pid) {
		var parent = input_parent.split("-")[1];
		var query = "MATCH (t:Tasks)-[:PARENT]->" +
		(input_parent == "root" ? "(pt:Projects) WHERE ID(pt) = "+pid+" "
			:"(pt:Tasks) WHERE ID(pt) = "+parent+" " ) +
			"AND t.status<>'archive' " +
			"OPTIONAL MATCH (t)-[:NEXT]->(nt:Tasks) " +
			"OPTIONAL MATCH (t)<-[:Assigned]-(tu:Users)" +
			"OPTIONAL MATCH (tc:Tasks)-[:PARENT]->(t) WHERE tc.status<>'archive' " +
			"OPTIONAL MATCH (tc)-[:NEXT]->(ntc:Tasks) " +
			"OPTIONAL MATCH (stc:Tasks)-[:PARENT]->(tc) WHERE stc.status<>'archive' " +
			"OPTIONAL MATCH (cl:Labels)-[:IN]->(tc) " +
			"OPTIONAL MATCH (l:Labels)-[:IN]->(t) " +
			"OPTIONAL MATCH (tc)<-[:Assigned]-(tcu:Users)" +
			"WITH t,tu,tc,tcu,nt,pt,ntc,COUNT(DISTINCT stc) as child_count,COLLECT(DISTINCT l) as tag,COLLECT(DISTINCT cl) as c_tag " +
			"RETURN " +
			"ID(t) as t_id," +
			"ID(tu) as a_id," +
			"tu.Name as a_name," +
			"tu.Avatar as a_avatar," +
			"tu.Color as a_color," +
			"t.title as header," +
			"t.startDate as startDate," +
			"t.endDate as endDate," +
			"t.detail as detail," +
			"t.status as status," +
			"t.color as color," +
			"t.type as type," +
			"COUNT(tc) as child_count," +
			"ID(nt) as next," +
			"tag as tag," +
			(input_parent == "root" ? "'root' as parent," : "ID(pt) as parent,")+
			"COLLECT({t_id:ID(tc)," +
				"a_id:ID(tcu)," +
				"a_name:tcu.Name," +
				"a_avatar:tcu.Avatar," +
				"a_color:tcu.Color," +
				"header:tc.title," +
				"startDate:tc.startDate," +
				"endDate:tc.endDate," +
				"detail:tc.detail," +
				"status:tc.status," +
				"color:tc.color," +
				"type:tc.type," +
				"next:ID(ntc)," +
				"tag:c_tag," +
				"child_count:child_count}" +
			") as childData";
		return query;
	}
	function listUpdateTask(data,cb){
		cb = arguments[arguments.length - 1]
		db.cypher({
			query:'MATCH x=(c:Cards)<-[:Parent*]-(t:Tasks)  ' +
			'WHERE id(c)='+data.cid+' ' +
			'AND t.status <> "archive" ' +
			'AND t.status <> "trash" ' +
			'OPTIONAL MATCH (u:Users)-[cb:Assigned]->(t) ' +
			'OPTIONAL MATCH (cm:Comments)-[in1:IN]->(t) ' +
			'WHERE cm.type <> "log"  ' +
			'OPTIONAL  MATCH (td:Todos)-[in2:IN]->(t) ' +
			'OPTIONAL  MATCH (tdc:Todos)-[in3:IN]->(t) ' +
			'WHERE tdc.status="success" ' +
			'OPTIONAL MATCH (l:Labels)-[:IN]->(t) ' +
			'RETURN length(x) as pos,u.Name,u.Avatar,u.Color,ID(t) ' +
			'AS tid,' +
			't.title,' +
			't.position,' +
			't.endDate,' +
			't.detail,' +
			't.status,' +
			'count(distinct cm) AS total_comment,' +
			data.cid+' AS cid,' +
			'count(distinct td) AS total_todo,' +
			'count(distinct tdc) AS todo_success,' +
			'collect(distinct l) as tags ' +
			'ORDER BY pos ASC',
		},function(err,results){
			if (err) console.log(err);
			let res = [];
			if(results){
				for (let k in results) {
					res.push({
						"id": results[k]['tid'],
						"title": results[k]['t.title'],
						"detail": results[k]['t.detail'],
						"position": results[k]['t.position'],
						"duedate": results[k]['t.endDate'],
						"pid": data.pid,
						"cid": results[k]['cid'],
						"total_comment": results[k]['total_comment'],
						"total_task": results[k]['todo_success']+"/"+results[k]['total_todo'],
						"user_avatar": results[k]['u.Avatar'],
						"user_color": results[k]['u.Color'],
						"user_name": results[k]['u.Name'],
						"status": results[k]['t.status'],
						"tags": results[k]['tags']
					})
				};
			}

			cb(res);
			socket.broadcast.emit('task:reUpdateList', {
				cid:data.cid,
				lists:res
			})
		});
	}
	socket.on("task:addLv1",function(data,rs) {
		var parent_query = "";
		var relation_parent = "";
		var prev_query = "";
		var order_relation = "";
		if (data.parent != "root") {
			var parent = data.parent.split("-")[1];
			parent_query = " MATCH (t_parent:Tasks) WHERE ID(t_parent) = "+parent;
			relation_parent = ",(t_parent)<-[:PARENT]-(t)";
		} else {
			relation_parent = ",(p)<-[:PARENT]-(t)";
		}
		if (data.after != null) {
			console.log("need update order");
			var after_split = data.after.split("-");
			var update_id = parseInt(after_split[1]);
			console.log("update "+ update_id);
			prev_query = " MATCH (pt:Tasks) WHERE ID(pt) = "+update_id;
			//order_relation = ",(pt)<-[:PREV]-(t) ,(pt)-[:NEXT]->(t)";
			order_relation = ",(pt)-[:NEXT]->(t)";
		}
		var query = "MATCH (p:Projects) WHERE ID(p)="+data.pid+
			" MATCH (u:Users) WHERE ID(u)="+data.uid+" " +
			" MATCH (uz:Users) WHERE ID(uz)=0 "+
			prev_query+
			parent_query+
			" CREATE (t:Tasks{title:'"+data.title+"'" +
					",startDate:'"+new Date().getTime()+"'" +
					",endDate:'"+(new Date().getTime() + 86400000)+"'" +
					",status:'active'})" +
			",(t)-[:LIVE_IN]->(p)" +
			",(t)<-[:Assigned {date:'"+data.at_create+"'}]-(uz)" +
			",(t)-[:CREATE_BY{date:"+new Date().getTime()+"}]->(u)"+
			order_relation+
			relation_parent + " return t";

    db.cypher({
      query:query
    },function(err,results){
      if (err) {
        console.error(err);
      }else{

        if(results.length < 1){
            console.error( "empty nonMatch Data: rs["+(results.length)+"]" + query );
            rs(false);
            socket.broadcast.emit('project:notic_update', {
              change:false
            });
            return ;
        }

        var queryUpdateData = "";
				var load_index = data.load_index.split("-")[1];
				queryUpdateData = getProjectDataQuery(data.load_index,data.pid);

				console.log(queryUpdateData);
				db.cypher({
					query:queryUpdateData
				},function(err,results) {
					if (err) {
						console.log(err);
					} else {
						rs(results);
						socket.broadcast.emit('project:notic_update', {
							change:true
						});
					}
				});
			}
		});
	});
	socket.on("task:loadTaskList",function(data,rs) {
		var parent =  data.parent.split("-")[1];
		query = getProjectDataQuery(data.parent,data.pid);
		console.log("\n======== Load Data =========\n"+query+"\n============================\n");
		db.cypher({
			query:query
		},function(err,results) {
			if (err) {
				console.log(err);
			} else {
				console.log(results);
				rs(results);
			}
		});
	});
	socket.on("task:moveTask",function(data,rs) {
		if (data.task_id != data.to_parent) {
			var task_id = data.task_id.split("-")[1];
			var to_parent = data.to_parent.split("-")[1];
			var after = null;
			var before = null;
			if (data.after != null) {
				after = data.after.split("-")[1];
			}
			if (data.before != null) {
				before = data.before.split("-")[1];
			}
			var query = "MATCH (move_task:Tasks) WHERE ID(move_task) = "+task_id +
				(data.from_parent == "root" ? " OPTIONAL MATCH (move_task)-[from_parent_relation:PARENT]->(from_parent:Projects)"
					: " OPTIONAL MATCH (move_task)-[from_parent_relation:PARENT]->(from_parent:Tasks)" )+
				" OPTIONAL MATCH (current_before:Tasks)-[current_before_relation:NEXT]->(move_task)" +
				" OPTIONAL MATCH (move_task)-[current_after_relation:NEXT]->(current_after:Tasks)" +
				(data.to_parent == "root" ? " OPTIONAL MATCH (to_parent:Projects) WHERE ID(to_parent) = "+data.pid
					: " OPTIONAL MATCH (to_parent:Tasks) WHERE ID(to_parent) = "+to_parent)+
				(after != null ? " OPTIONAL MATCH (to_after:Tasks) WHERE ID(to_after) = "+after +
				" OPTIONAL MATCH (to_after)-[to_replace_relation:NEXT]->(to_next:Tasks)" : "")+
				(before != null ? " OPTIONAL MATCH (to_before:Tasks) WHERE ID(to_before) = "+before : "" ) +
				" DELETE current_before_relation,current_after_relation" +
				" FOREACH (o IN CASE WHEN current_before IS NOT NULL AND current_after IS NOT NULL THEN [current_before] ELSE [] END | "+
				" MERGE (current_before)-[:NEXT]->(current_after)" +
				" ) " +
				" FOREACH (o IN CASE WHEN from_parent <> to_parent THEN [from_parent] ELSE [] END | "+
				" DELETE from_parent_relation" +
				" MERGE (move_task)-[:PARENT]->(to_parent)" +
				" ) " +
				(after != null ?
				" FOREACH (o IN CASE WHEN to_next IS NOT NULL THEN [to_next] ELSE [] END | "+
				" MERGE (move_task)-[:NEXT]->(to_next)" +
				" ) " +
				" FOREACH (o IN CASE WHEN to_after IS NOT NULL THEN [to_next] ELSE [] END | "+
				" DELETE to_replace_relation" +
				" MERGE (to_after)-[:NEXT]->(move_task)" +
				" ) ":"") +
				(before != null ?
				" FOREACH (o IN CASE WHEN to_before IS NOT NULL THEN [to_before] ELSE [] END | "+
				" MERGE (move_task)-[:NEXT]->(to_before)" +
				" ) " : "");

			/*			" CREATE (current_before)-[:NEXT]->(current_after)," +
			 "(move_task)-[:PARENT]->(to_parent)," +
			 "(to_after)-[:NEXT]->(move_task)," +
			 "(move_task)-[:NEXT]->(to_next)";*/

			console.log("\n======== Move Query =========\n"+query+"\n============================\n");
			db.cypher({
				query:query
			},function(err,results) {
				if (err) {
					console.log(err);
				} else {
					rs(results);
					socket.broadcast.emit('project:notic_update', {
						change:true
					});
				}
			});
		}
	});

	socket.on("task:getNav",function(data,rs) {
		var task_index = data.task_index.split("-")[1];
		var query = "MATCH (ct:Tasks)-[:PARENT*0..]->(t:Tasks) WHERE ID(ct) = "+task_index+" RETURN COLLECT({t_id:ID(t),title:t.title}) as parent";
		console.log("\n======== Get Navigator =========\n"+query+"\n============================\n");
		db.cypher({
			query:query
		},function(err,results) {
			if (err) {
				console.log(err);
			} else {
				rs(results);
			}
		});
	});
	socket.on("task:setColor",function(data,rs) {
		var query = "MATCH (ct:Tasks) WHERE ID(ct) = "+data.tid+" SET ct.color='"+data.color+"'";
		console.log("\n======== Set Color Query =========\n"+query+"\n============================\n");
		db.cypher({
			query:query
		},function(err,results) {
			if (err) {
				console.log(err);
			} else {
				rs(results);
			}
		});
	});
	socket.on("task:setType",function(data,rs) {
		var query = "MATCH (ct:Tasks) WHERE ID(ct) = "+data.tid+" SET ct.type='"+data.type+"'";
		console.log("\n======== Set Type Query =========\n"+query+"\n============================\n");
		db.cypher({
			query:query
		},function(err,results) {
			if (err) {
				console.log(err);
			} else {
				rs(results);
			}
		});
	});

	socket.on('task:add',function(data,rs){
		let sql_card = ''
		if(data.totalTask == 0){
			sql_card = ' CREATE (t)-[:Parent]->(c) '
		}
		db.cypher({
			query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' ' +
			'MATCH (c:Cards) WHERE ID(c) = '+data.cid+' ' +
			'MATCH (uz:Users) WHERE ID(uz)=0 ' +
			'CREATE (t:Tasks {title:"'+data.title+'",endDate:"'+(new Date().getTime() + 86400000)+'",startDate:"'+new Date().getTime()+'",detail:"",status:"active",cid:'+data.cid+'}) CREATE (u)-[:CREATE_BY {date:"'+data.at_create+'"}]->(t) '+sql_card+' CREATE (t)-[:IN]->(c) CREATE (cm:Comments {text:"Create task by "+u.Name,date:"'+data.at_create+'",type:"log"}) CREATE (u)-[:Comment {date:"'+data.at_create+'"}]->(cm)-[:IN {date:"'+data.at_create+'"}]->(t) CREATE (uz)-[:Assigned {date:"'+data.at_create+'"}]->(t) RETURN ID(t)',
		},function(err,results){
			if (err) {
				console.log(err);
			}else{
				if(data.parent){
					db.cypher({
						query:'MATCH (pt:Tasks) WHERE ID(pt) = '+data.parent+' MATCH (t:Tasks) WHERE ID(t) = '+results[0]['ID(t)']+' CREATE (t)-[:Parent]->(pt) RETURN t'
					},function(err,rs_relate){
						if (err) {
							console.log(err);
						}else{
							listUpdateTask(data,function(cb){
								if(!cb){
									rs(false)
								}else{
									rs(cb)
								}
							})
						}
					})
				}else{
					listUpdateTask(data,function(cb){
						if(!cb){
							rs(false)
						}else{
							rs(cb)
						}
					})
				}
			}
		});
	});
	socket.on('task:list',function(data,rs){
		db.cypher({
			query:'MATCH x=(c:Cards)<-[:Parent*]-(t:Tasks)  ' +
			'WHERE id(c)='+data.cid+' ' +
			'AND t.status <> "archive" ' +
			'AND t.status <> "trash" ' +
			'OPTIONAL MATCH (u:Users)-[cb:Assigned]->(t) ' +
			'OPTIONAL MATCH (cm:Comments)-[in1:IN]->(t) ' +
			'WHERE cm.type <> "log"  ' +
			'OPTIONAL  MATCH (td:Todos)-[in2:IN]->(t) ' +
			'OPTIONAL  MATCH (tdc:Todos)-[in3:IN]->(t) ' +
			'WHERE tdc.status="success" ' +
			'OPTIONAL MATCH (l:Labels)-[:IN]->(t) ' +
			'RETURN length(x) as pos,u.Name,u.Avatar,u.Color,ID(t) ' +
			'AS tid,' +
			't.title,' +
			't.position,' +
			't.endDate,' +
			't.detail,' +
			't.status,' +
			'count(distinct cm) AS total_comment,' +
			data.cid+' AS cid,' +
			'count(distinct td) AS total_todo,' +
			'count(distinct tdc) AS todo_success,' +
			'collect(distinct l) as tags ' +
			'ORDER BY pos ASC',
		},function(err,results){
			if (err) console.log(err);
			let res = [];
			if(results){
				for (let k in results) {
					res.push({
						"id": results[k]['tid'],
						"title": results[k]['t.title'],
						"detail": results[k]['t.detail'],
						"position": results[k]['t.position'],
						"duedate": results[k]['t.endDate'],
						"pid": data.pid,
						"cid": results[k]['cid'],
						"total_comment": results[k]['total_comment'],
						"total_task": results[k]['todo_success']+"/"+results[k]['total_todo'],
						"user_avatar": results[k]['u.Avatar'],
						"user_color": results[k]['u.Color'],
						"user_name": results[k]['u.Name'],
						"status": results[k]['t.status'],
						"tags": results[k]['tags']
					})
				};
			}
			rs(res);
		});
	});


	socket.on('task:listUpdate',function(data,rs){
		listUpdateTask(data,function(cb){
			if(!cb){
				rs(false)
			}else{
				rs(cb)
			}
		})
	});

	socket.on('task:listByProject',function(data,rs){
		db.cypher({
			query:"MATCH (p:Projects)<-[:LIVE_IN]-(t:Tasks) WHERE ID(p) = "+data.pid+" and t.type <> 'container' OPTIONAL MATCH (u:Users)-[a:Assigned]->(t) RETURN ID(t),t.title,t.startDate,t.endDate,t.status,ID(u)",
		},function(err,results){
			if (err) console.log(err);
			var res = [];
			if(results){
				results.forEach(function(item,index){
					res.push({
						group:item['ID(u)'],
						id:item['ID(t)'],
						title:item['t.title'],
						start_time:item['t.startDate'],
						end_time:item['t.endDate'],
						status:item['t.status']
					})
				});
				rs(res);
			}else{
				rs(false);
			}
		});
	});
	socket.on('task:changeEndTime', function (data,fn) {
		db.cypher({
			query: 'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' SET t.endDate = "'+data.time+'" RETURN t'
		}, function (err, results) {
			if (err) console.log(err);

			db.cypher({
				query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name',
			},function(err,results_sub){
				if (err) console.log(err);
				if(results_sub){
					boardList = []
					results_sub.forEach(function(item,index){
						var project_id = item['ID(p)'];
						if(typeof boardList[project_id] == "undefined" || !boardList[project_id]){
							boardList[project_id] = {
								d:{
									id: project_id,
									title: item['p']['properties']['title'],
									detail: item['p']['properties']['detail'],
								},
								m:[]
							};

						}
						boardList[project_id]['m'].push({
							id:item['ID(u)'],
							title:item['u.Name']
						});
					});
					socket.broadcast.emit('project:notic_update', {
						change:true
					});
				}
			});


			fn(true);
		});
	});

	socket.on('task:changePosition', function (data,fn) {
		var sql = 'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (u:Users)-[a:Assigned]->(t) MATCH (u2:Users) WHERE ID(u2) = '+data.new_uid+' DELETE a CREATE (u2)-[:Assigned]->(t) SET t.startDate = "'+data.time_start+'", t.endDate = "'+data.time_end+'" RETURN t'
		db.cypher({
			query: sql
		}, function (err, results_process) {
			if (err) console.log(err);

			db.cypher({
				query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name',
			},function(err,results_sub){
				if (err) console.log(err);
				if(results_sub){
					boardList = []
					results_sub.forEach(function(item,index){
						var project_id = item['ID(p)'];
						if(typeof boardList[project_id] == "undefined" || !boardList[project_id]){
							boardList[project_id] = {
								d:{
									id: project_id,
									title: item['p']['properties']['title'],
									detail: item['p']['properties']['detail'],
								},
								m:[]
							};

						}
						boardList[project_id]['m'].push({
							id:item['ID(u)'],
							title:item['u.Name']
						});
					});
					socket.broadcast.emit('task:updateEndTime', {
						pid:data.pid,
						list:boardList
					});
				}
			});
			fn(true);
		});

	});
	socket.on('task:get',function(data,rs){
		console.log(data);
		var query = 'MATCH (t:Tasks)-[:LIVE_IN]->(p:Projects) ' +
			'WHERE ID(t) = '+data.tid+' ' +
			'MATCH (uc:Users)<-[:CREATE_BY]-(t) ' +
			'OPTIONAL MATCH (ua:Users)-[:Assigned]->(t) ' +
			'WHERE ID(ua) <> 0 AND ID(t) = '+data.tid+'  ' +
			'OPTIONAL MATCH (td:Todos)-[:IN]->(t) ' +
			'RETURN t.title,t.detail,t.startDate,t.endDate,t.status,t.color,t.type,uc.Name,uc.Avatar,uc.Color,ua.Name,ua.Avatar,ua.Color,ID(ua),COUNT(distinct td) AS todo, t.cid,ID(p),p.title';
		console.log("\n=============Query Task Data===========\n"+query)+"\n==========================\n";
		db.cypher({
			query:query,
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{

				rs(results)
			}
		})
	});
	socket.on('task:save',function(data,rs){

		db.cypher({
			query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' SET t.title = "'+data["data"]["t.title"]+'",t.detail = "'+data["data"]["t.detail"]+'",t.startDate = "'+data["data"]["t.startDate"]+'",t.endDate = "'+data["data"]["t.endDate"]+'",t.status = "'+data["data"]["t.status"]+'" RETURN t',
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				rs(results)
				socket.broadcast.emit('project:notic_update', {
					change:true
				});
			}
		})
	});
	socket.on('task:setStartDate',function(data,rs){
		db.cypher({
			query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' MATCH (p:Projects)<-[:LIVE_IN]-(t) MATCH (u:Users) WHERE ID(u) = '+data.uid+' SET t.startDate = "'+data.time+'"  RETURN t',
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				rs(results)
				socket.broadcast.emit('project:notic_update', {
					change:true
				});
			}
		})
	});
	socket.on('task:setEndDate',function(data,rs){
		db.cypher({
			query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' MATCH (p:Projects)<-[:LIVE_IN]-(t) MATCH (u:Users) WHERE ID(u) = '+data.uid+' SET t.endDate = "'+data.time+'" RETURN t',
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				rs(results)
				socket.broadcast.emit('project:notic_update', {
					change:true
				});
			}
		})
	});
	socket.on('task:assignUser',function(data,rs){
		db.cypher({
			query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (u2:Users)-[a:Assigned]-(t) DELETE a CREATE (u)-[:Assigned]->(t) RETURN t',
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				if((data.uid!="0" || data.uid > 0) && (parseInt(data.uuid) !== parseInt(data.uid))){
					db.cypher({
						query: 'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' CREATE (n:Notification {Type:"task" ,date:"'+ new Date().getTime() +'",title:u.Name + " Assigned to " + t.title,detail:t.detail,readed:"no",tid:ID(t)}) CREATE (n)-[:TO {date:"'+ new Date().getTime() +'"}]->(u) RETURN n'
					}, function (err, rs_notify) {
						if (err){
							console.log(err);
						}else{
							socket.broadcast.emit('notify:updateCount', {
								uid:data.uid
							});
						}
					});
				}
				rs(results)
				socket.broadcast.emit('project:notic_update', {
					change:true
				});
			}
		})
	});
	socket.on('task:changeTaskStatus',function(data,rs) {
		console.log(data);
		var query="";
		if (data.status == "archive") {
			query = "MATCH (t:Tasks) WHERE ID(t)=" + data.tid + " OPTIONAL MATCH (sc:Tasks)-[:PARENT*0..]->(c:Tasks)-[:PARENT]->(t) " +
				"OPTIONAL MATCH (t_prev:Tasks)-[prev_r:NEXT]->(t) " +
				"OPTIONAL MATCH (t_next:Tasks)<-[next_r:NEXT]-(t) " +
				"DELETE prev_r,next_r " +
				"FOREACH (o IN CASE WHEN t_prev IS NOT NULL AND t_next IS NOT NULL THEN [t_prev] ELSE [] END | " +
					"MERGE (t_prev)-[:NEXT]->(t_next) " +
				")" +
				"SET sc.parent_status='" + data.status + "',t.status='"+ data.status +"'";
		} else if (data.status == "active") {
			query = "MATCH (t:Tasks) WHERE ID(t) = "+ data.tid +" OPTIONAL MATCH (p)<-[:PARENT]-(t)<-[:PARENT]-(c:Tasks)<-[:PARENT*0..]-(sc:Tasks) " +
				"OPTIONAL MATCH (at:Tasks)-[:PARENT]->(p) WHERE at.status='active' " +
				"WITH  t,sc, SIZE(COLLECT(at)) as alis_size,HEAD(COLLECT(at)) as last_alis_node " +
				"FOREACH (o IN CASE WHEN alis_size>0 AND t.status='archive' THEN [t] ELSE [] END | " +
					"MERGE (last_alis_node)-[:NEXT]->(t)" +
				")" +
				"SET t.status='" + data.status + "' " +
				"REMOVE sc.parent_status";
		} else if (data.status == "complete") {
			query = "MATCH (t:Tasks) WHERE ID(t)=" + data.tid + " OPTIONAL MATCH (sc:Tasks)-[:PARENT*0..]->(c:Tasks)-[:PARENT]->(t) " +
				"SET sc.parent_status='" + data.status + "',t.status='"+ data.status +"'"
		}
		console.log(query);
		db.cypher({
			query: query,
		}, function (err, results) {
			if (err) {
				console.log(err);
			} else if (!results || err) {
				rs(false)
			} else {
				rs(results)
				socket.broadcast.emit('project:notic_update', {
					change:true
				});
			}
		})
	});

	socket.on('task:changeStatus',function(data,rs){
		db.cypher({
			query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' ' +
			'MATCH (u:Users)-[:Assigned]->(t) SET t.status = "'+data.status+'" RETURN t,u.Name,ID(u)',
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				if((data.status === "active" || data.status === "complete" || data.status === "archive") && (parseInt(data.uuid) !== parseInt(results[0]['ID(u)']))){
					db.cypher({
						query: 'MATCH (u:Users) WHERE ID(u) = '+results[0]['ID(u)']+' ' +
						'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' ' +
						'CREATE (n:Notification {Type:"task" ,date:"'+ new Date().getTime() +'",title:"'+data.user_name+' Change status " + t.title + " to '+data.status+'",detail:t.detail,readed:"no",tid:ID(t)}) ' +
						'CREATE (n)-[:TO {date:"'+ new Date().getTime() +'"}]->(u) RETURN n'
					}, function (err, rs_notify) {
						if (err){
							console.log(err);
						}else{
							socket.broadcast.emit('notify:updateCount', {
								uid:data.uid
							});
						}
					});
				}
				if(data.status === "archive" || data.status === "trash"){
					db.cypher({
						query: 'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' ' +
						'MATCH (c:Cards) WHERE ID(c) = t.cid ' +
						'OPTIONAL MATCH (before:Tasks)<-[pp:Parent]-(t)  ' +
						'OPTIONAL MATCH (after:Tasks)-[bp:Parent]->(t) ' +
						'OPTIONAL MATCH (c)<-[bc:Parent]-(t) DELETE bp,pp,bc ' +
						'CREATE (t)-[:Hidden_Parent]->(c) ' +
						'RETURN ID(before),ID(after),ID(c)'
					}, function (err, rs_r) {
						if (err){
							console.log(err);
						}else{

							if(rs_r[0]['ID(parent)'] && rs_r[0]['ID(after)']){
								db.cypher({
									query:'MATCH (t:Tasks) WHERE ID(t)='+rs_r[0]['ID(after)']+' ' +
									'MATCH (c:Cards) WHERE ID(c)='+rs_r[0]['ID(c)']+' CREATE (t)-[:Parent]->(c)'
								},function(err,rs1){
									if (err) {console.log('before and after',err) }
								})
							}else if(rs_r[0]['ID(before)'] && rs_r[0]['ID(after)']){
								db.cypher({
									query:'MATCH (t:Tasks) WHERE ID(t)='+rs_r[0]['ID(before)']+' MATCH (t2:Tasks) WHERE ID(t2)='+rs_r[0]['ID(after)']+' CREATE (t2)-[:Parent]->(t)'
								},function(err,rs2){
									if (err){ console.log('before',err)}
								})
							}
						}
					});
				}
				rs(results)
				socket.broadcast.emit('project:notic_update', {
					change:true
				});
			}
		})
	});
	socket.on('task:changeSort',function(data,rs){

		db.cypher({
			query:'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' OPTIONAL MATCH (t)-[l1:Parent]->(before:Tasks) OPTIONAL MATCH (t)<-[l2:Parent]-(after:Tasks) OPTIONAL MATCH (t)-[l3:Parent]->(c:Cards) DELETE l1,l2,l3 RETURN ID(before),ID(after),ID(c)'
		},function(err,rs_relate){
			if (err) {
				console.log(err);
			}else{

				db.cypher({
					query:'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' OPTIONAL MATCH (t)-[l4:IN]->(c:Cards) DELETE l4 RETURN t,c'
				},function(err,nrs1){
					if (err){ console.log(err)}
						listUpdateTask(data,function(cb){
							if(!cb){
								rs(false)
							}else{
								rs(cb)
							}
						})
				});

				db.cypher({
					query:'MATCH (t:Tasks) WHERE ID(t)='+data.tid+' MATCH (c:Cards) WHERE ID(c)='+data.cid+' SET t.cid = '+data.cid+' CREATE (t)-[:IN]->(c)'
				},function(err,nrs1){
					if (err){ console.log(err)}
						listUpdateTask(data,function(cb){
							if(!cb){
								rs(false)
							}else{
								rs(cb)
							}
						})
				});

				if(rs_relate[0]['ID(c)'] && rs_relate[0]['ID(after)']){
					db.cypher({
						query:'MATCH (t:Tasks) WHERE ID(t)='+rs_relate[0]['ID(after)']+' MATCH (c:Cards) WHERE ID(c)='+rs_relate[0]['ID(c)']+' CREATE (t)-[:Parent]->(c)'
					},function(err,rs1){
						if (err) {console.log(err) }
							listUpdateTask(data,function(cb){
								if(!cb){
									rs(false)
								}else{
									rs(cb)
								}
							})
					})
				}else if(rs_relate[0]['ID(before)'] && rs_relate[0]['ID(after)']){
					db.cypher({
						query:'MATCH (t:Tasks) WHERE ID(t)='+rs_relate[0]['ID(before)']+' MATCH (t2:Tasks) WHERE ID(t2)='+rs_relate[0]['ID(after)']+' CREATE (t2)-[:Parent]->(t)'
					},function(err,rs2){
						if (err){ console.log(err)}
							listUpdateTask(data,function(cb){
								if(!cb){
									rs(false)
								}else{
									rs(cb)
								}
							})
					})
				}else{
					listUpdateTask(data,function(cb){
						if(!cb){
							rs(false)
						}else{
							rs(cb)
						}
					})
				}



				if((!data.parent || data.parent ==="") && (!data.after || data.after ==="")){
					db.cypher({
						query:'MATCH (t:Tasks) WHERE ID(t)='+data.tid+' MATCH (c:Cards) WHERE ID(c)='+data.cid+' SET t.cid = '+data.cid+' CREATE (t)-[:Parent]->(c)'
					},function(err,nrs1){
						if (err){ console.log(err)}
							listUpdateTask(data,function(cb){
								if(!cb){
									rs(false)
								}else{
									rs(cb)
								}
							})
					});
				}else if((data.parent && data.parent !=="") && (!data.after || data.after ==="")){
					db.cypher({
						query:'MATCH (t:Tasks) WHERE ID(t)='+data.tid+' MATCH (t2:Tasks) WHERE ID(t2)='+data.parent+' SET t.cid = '+data.cid+' CREATE (t)-[:Parent]->(t2)'
					},function(err,nrs2){
						if (err){ console.log(err)}
							listUpdateTask(data,function(cb){
								if(!cb){
									rs(false)
								}else{
									rs(cb)
								}
							})
					});
				}else if((!data.parent || data.parent ==="") && (data.after && data.after !=="")){
					db.cypher({
						query:'MATCH (t:Tasks) WHERE ID(t)='+data.tid+' MATCH (c:Cards) WHERE ID(c)='+data.cid+' MATCH (t2:Tasks) WHERE ID(t2)='+data.after+' MATCH (t2)-[r:Parent]->(c) SET t.cid = '+data.cid+' DELETE r CREATE (t2)-[:Parent]->(t)-[:Parent]->(c)'
					},function(err,nrs3){
						if (err){ console.log(err)}
							listUpdateTask(data,function(cb){
								if(!cb){
									rs(false)
								}else{
									rs(cb)
								}
							})
					});
				}else if((data.parent && data.parent !=="") && (data.after && data.after !=="")){
					db.cypher({
						query:'MATCH (t:Tasks) WHERE ID(t)='+data.tid+' MATCH (t2:Tasks) WHERE ID(t2)='+data.parent+' MATCH (t3:Tasks) WHERE ID(t3)='+data.after+' MATCH (t2)-[r:Parent]-(t3) DELETE r SET t.cid = '+data.cid+'  CREATE (t3)-[:Parent]->(t)-[:Parent]->(t2)'
					},function(err,nrs4){
						if (err){ console.log(err)}
							listUpdateTask(data,function(cb){
								if(!cb){
									rs(false)
								}else{
									rs(cb)
								}
							})
					});
				}else{
					listUpdateTask(data,function(cb){
						if(!cb){
							rs(false)
						}else{
							rs(cb)
						}
					})
				}

			}
		})
	});
};

