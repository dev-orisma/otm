module.exports = function (socket,db) {
	//Filter
	socket.on('filter:loadProject',function(data,rs){
		db.cypher({
			query:"MATCH (p:Projects)-[:Create|:Assigned]-(u:Users) WHERE ID(u) = "+data.uid+" AND p.status = 'active' RETURN ID(p) as id,p.title as name",
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				rs(results)
			}
		});
	});

	socket.on('filter:loadUser',function(data,rs){
    var query =  "MATCH (ua:Users)-[:Create|:Assigned]-(p:Projects)-[:Create|:Assigned]-(u:Users) " +
      "WHERE ID(u) = "+data.uid+" " +
      "RETURN ua.Name as name,ID(ua) as id,ua.Avatar as avatar,ua.Color as color, count(ID(ua)) as count " +
      "UNION MATCH (u:Users) WHERE ID(u) = "+data.uid+" " +
      "RETURN u.Name as name,ID(u) as id,u.Avatar as avatar,u.Color as color, count(ID(u)) as count";
      console.log("qeury: ", query);
		db.cypher({
			query:query
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				rs(results)
			}
		});
	});

	socket.on('filter:loadTags',function(data,rs){
		db.cypher({
			query:"MATCH (t:Labels)-[:IN]-(p:Projects)-[:Create|:Assigned]-(u:Users) " +
			"WHERE ID(u) = "+data.uid+" RETURN ID(t) as id,t.color as color,t.bg_color as bg,t.f_color as f,t.text as text;",
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				rs(results)
			}
		});
	});

	socket.on('filter:loadFilter',function(data,rs){
		var where_all = [];
		var only_active_project = "(p.status = 'active')";
		where_all.push(only_active_project);
		//console.log(data);
		var project_query = "-[:LIVE_IN]-(p:Projects)";
		if (data.filter.project.length > 0) {
			var project_where = [];
			for (var i in data.filter.project) {
				project_where.push("ID(p) = "+data.filter.project[i]);
			}
			var project_where_str = "("+project_where.join(" OR ")+")";
			where_all.push(project_where_str);
		}
		var user_query = "(u:Users)-[a:Assigned]-";
		if (data.filter.user.length > 0) {
			var user_where = [];
			for (var i in data.filter.user) {
				user_where.push("ID(u) = "+data.filter.user[i]);
			}
			var user_where_str = "("+user_where.join(" OR ")+")";
			where_all.push(user_where_str);
		}
		var tag_query = "";
		if (data.filter.tags.length > 0) {
			tag_query = ",(t)-[i:IN]-(l:Labels)";
			var tags_where = [];
			for (var i in data.filter.tags) {
				tags_where.push("ID(l) = "+data.filter.tags[i]);
			}
			var tags_where_str = "("+tags_where.join(" OR ")+")";
			where_all.push(tags_where_str);
		}
		var with_where_status = "";
		var status_array = Array("active","archive","complete");
		if (data.filter.status.length > 0) {
			var status_where = [];
			var with_where = [];
			for (var i in data.filter.status) {
				status_where.push("t.status = '"+status_array[data.filter.status[i]]+"'");
				status_where.push("t.parent_status = '"+status_array[data.filter.status[i]]+"'");
				with_where.push("status = '"+status_array[data.filter.status[i]]+"'");
			}
			var status_where_str = "("+status_where.join(" OR ")+")";
			var with_where_str = "("+with_where.join(" OR ")+")";
			where_all.push(status_where_str);
			with_where_status = "," +
				"CASE WHEN t.parent_status IS NULL THEN t.status " +
				"ELSE t.parent_status END as status WHERE "+with_where_str;
		}
		var keyword_operator = "";
		if (data.filter.operator.keyword == "&") {
			keyword_operator = " AND ";
		} else {
			keyword_operator = " OR ";
		}
		if (data.filter.keyword.length > 0) {
			var keyword_title_where = [];
			var keyword_detail_where = [];
			for (var i in data.filter.keyword) {
				keyword_title_where.push("t.title CONTAINS '"+data.filter.keyword[i]+"'");
				keyword_detail_where.push("t.detail CONTAINS '"+data.filter.keyword[i]+"'");
			}
			var keyword_where_str = "(("+keyword_title_where.join(keyword_operator)+") OR ("+keyword_detail_where.join(keyword_operator)+"))";
			where_all.push(keyword_where_str);
		}
		var where_all_str = "";
		if (where_all.length > 0) {
			where_all_str = " WHERE "+where_all.join(" AND ");
		}
		var query = "MATCH "+user_query+"(t:Tasks)"+project_query+tag_query+where_all_str+
			" OPTIONAL MATCH (lb:Labels)-[:IN]->(t) " +
			"WITH t,u,COUNT(lb) as tags_count,lb as tags " + with_where_status +
			"RETURN ID(t) as id," +
			"t.title as title," +
			"t.startDate as start_date," +
			"t.endDate as end_date," +
			"ID(u) as a_id," +
			"u.Name as name," +
			"u.Avatar as avatar," +
			"u.Color as color," +
			(data.filter.status.length > 0 ? "status," :"") +
			"COLLECT(tags) as tags," +
			"count(ID(t)) AS count " +
			"SKIP 0 LIMIT 30";
		console.log("========Filter=========\n"+query+"\n==================\n");
		db.cypher({
			query:query,
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				rs(results)
			}
		});
	});
	return socket;
	//Filter
};

