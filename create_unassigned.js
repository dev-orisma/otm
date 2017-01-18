var neo4j = require('neo4j');
var config = {
    port: 5000,
    neo4jURL: process.env.NEO4JURL ||'0.0.0.0:7474',
    neo4jUSER: process.env.NEO4JUSER ||'neo4j',
    neo4jPASS:  process.env.NEO4JPASS ||'orisma'
};
var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);
console.log(1);