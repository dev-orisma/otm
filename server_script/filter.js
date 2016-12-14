module.exports = function (socket) {
	var request = require("request");
	var neo4j = require('neo4j');
	var config = {
		port: 5000,
		neo4jURL: process.env.NEO4JURL ||'0.0.0.0:7474',
		neo4jUSER: process.env.NEO4JUSER ||'neo4j',
		neo4jPASS:  process.env.NEO4JPASS ||'orisma'
	};
	var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);
	var md5 = require('js-md5');
	var fs = require('fs');

	//Filter
	socket.on('filter:loadProject',function(data,rs){
		db.cypher({
			query:"MATCH (p:Projects)-[:CREATE_BY|:Assigned]-(u:Users) WHERE ID(u) = "+data.uid+" RETURN ID(p) as id,p.title as name",
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
		db.cypher({
			query:"MATCH (ua:Users)-[:CREATE_BY|:Assigned]-(p:Projects)-[:CREATE_BY|:Assigned]-(u:Users) " +
			"WHERE ID(u) = "+data.uid+" " +
			"RETURN ua.Name as name,ID(ua) as id,ua.Avatar as avatar,ua.Color as color, count(ID(ua)) as count " +
			"UNION MATCH (u:Users) WHERE ID(u) = "+data.uid+" " +
			"RETURN u.Name as name,ID(u) as id,u.Avatar as avatar,u.Color as color, count(ID(u)) as count",
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
			query:"MATCH (t:Labels)-[:IN]-(p:Projects)-[:CREATE_BY|:Assigned]-(u:Users) " +
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
		var project_query = "";
		var where_all = [];
		if (data.filter.project.length > 0) {
			project_query = "-[:LIVE_IN]-(p:Projects)"
			var project_where = [];
			for (var i in data.filter.project) {
				project_where.push("ID(p) = "+data.filter.project[i]);
			}
			var project_where_str = "("+project_where.join(" OR ")+")";
			where_all.push(project_where_str);
		}
		var user_query = "";
		if (data.filter.user.length > 0) {
			user_query = "(u:Users)-[a:Assigned]-";
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
		var status_array = Array("active","archive","complete","trash");
		if (data.filter.status.length > 0) {
			var status_where = [];
			for (var i in data.filter.status) {
				status_where.push("t.status = '"+status_array[data.filter.status[i]]+"'");
			}
			var status_where_str = "("+status_where.join(" OR ")+")";
			where_all.push(status_where_str);
		}
		if (data.filter.keyword.length > 0) {
			var keyword_title_where = [];
			var keyword_detail_where = [];
			for (var i in data.filter.keyword) {
				keyword_title_where.push("t.title CONTAINS '"+data.filter.keyword[i]+"'");
				keyword_detail_where.push("t.detail CONTAINS '"+data.filter.keyword[i]+"'");
			}
			var keyword_where_str = "("+keyword_title_where.join(" OR ")+" OR "+keyword_detail_where.join(" OR ")+")";
			where_all.push(keyword_where_str);
		}
		var where_all_str = "";
		if (where_all.length > 0) {
			where_all_str = " WHERE "+where_all.join(" AND ");
		}
		var query = "MATCH "+user_query+"(t:Tasks)"+project_query+tag_query+where_all_str+
			" OPTIONAL MATCH (lb:Labels)-[:IN]->(t) " +
			"WITH t,COUNT(lb) as tags_count,lb as tags " +
			"RETURN ID(t) as id,t.title as title,t.startDate as start_date,t.endDate as end_date,COLLECT(tags) as tags,count(ID(t)) AS count SKIP 0 LIMIT 30";
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

