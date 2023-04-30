// Làm sạch dữ liệu
match (n) set n.section=split(n.path,'/')[0..-1] return properties(n);
match (n) set n.group=n.section[0] return properties(n);
match (n:tag_m_legend) remove n:note return labels(n);
match (n) remove n.obsidian_url, n.id, n.vault, n.path return properties(n);
match (n)-[r:Tuongduongvoi]->(m) create (n)-[:Chonen]->(m) return n,m;
match (n)-[r:Mauthuanvoi]-(m) with n,m,type(r) as typ, tail(collect(r)) as coll foreach(x in coll | delete x) return n,m;
match ()-[r:Boivi]-() delete r;
match ()-[r:Tuongduongvoi]-() delete r;
//match (n) set n.wrappedname=trim(apoc.text.regreplace(n.name, "(.{1,30})( +|$\n?)", "$1\n")) return n.wrappedname
match (n) set n.wrappedname=trim(apoc.text.regreplace(n.name, "(?:((?>.{1,30}(?:[^\r\n]{1,5}(?=\r?\n|$)|(?<=[^\S\r\n])[^\S\r\n]?|(?=\r?\n)|$|[^\S\r\n]))|.{1,30})(?:\r?\n)?|(?:\r?\n|$))", "$1\r\n")) return n.wrappedname;

// Tạo gid
match (n) with n, split(n.group," ") as array set n.gid=left(array[0],1)+left(array[1],1) return n.name, n.group, n.gid;

MATCH (p) with collect(DISTINCT p.gid) as gids
UNWIND gids as gid
MATCH (n) where n.gid=gid
WITH n.gid AS gid, collect(n) as nodes
WITH apoc.coll.zip(nodes, range(0, size(nodes))) as pairs
UNWIND pairs as pair 
SET (pair[0]).id = pair[0].gid+pair[1]
return pair[0].name, pair[0].id;

CALL gds.graph.create( 'ChonenUND', 'note', {Chonen: {orientation: 'UNDIRECTED'}});
CALL gds.graph.create( 'ChonenNAT', 'note', {Chonen: {orientation: 'NATURAL'}});
CALL gds.graph.create( 'ChonenREV', 'note', {Chonen: {orientation: 'REVERSE'}});
CALL gds.graph.create( 'MauthuanvoiUND', 'note', {Mauthuanvoi: {orientation: 'UNDIRECTED'}});

CALL gds.degree.write('ChonenUND', { writeProperty: 'degree_und' });
CALL gds.degree.write('ChonenNAT', { writeProperty: 'degree_nat' });
CALL gds.degree.write('ChonenREV', { writeProperty: 'degree_rev' });
CALL gds.alpha.closeness.write('ChonenNAT', { writeProperty: 'closeness_nat' });
CALL gds.betweenness.write('ChonenNAT', { writeProperty: 'betweenness_nat' });

//Triangle count | UNDIRECTED
CALL gds.triangleCount.write('ChonenUND', { writeProperty: 'trianglesCount' });
//Local clustering coeficient | UNDIRECTED
CALL gds.localClusteringCoefficient.write('ChonenUND', { writeProperty: 'coefficient' });
//Strong connected components| UNDIRECTED | Mauthuanvoi
CALL gds.alpha.scc.write('MauthuanvoiUND', { writeProperty: 'scc_Mauthuan' });
//Strong connected components| NATURAL
CALL gds.alpha.scc.write('ChonenNAT', { writeProperty: 'scc_nat' });

//Lập bảng phân tích từng niềm tin cụ thể
match (x)-[:Chonen]->(a)
where x.name="Chỉ có cảm xúc là đúng nhất" 
WITH x, collect(a) as allAs
match (x)<-[:Chonen]-(b)
WITH x, allAs, collect(b) as allBs
match (x)-[:Mauthuanvoi]-(c) 
WITH x, allAs, allBs, collect(c) as allCs
WITH x, allAs, allBs, allCs, apoc.coll.max([size(allAs), size(allBs), size(allCs)]) as maxSize
UNWIND range(0, maxSize -1) as index
RETURN allAs[index].name as `Hệ quả`, allBs[index].name as `Lý do`, allCs[index].name as `Mâu thuẫn với`;

//Tính số nút trong một nhóm nút
match (n) where n.degree_rev=0 call gds.alpha.bfs.stream('ChonenNAT', {startnode: id(n)} ) yield path with n, size(nodes(path)) as size return n.name, size order by size

//Kiểm tra xem đây có phải là các nút nguồn không?
match (a {name: 'Người đang có quyền lực thì sẽ không bao giờ từ bỏ'}), (b {name: 'Không có gì là đúng, không có gì là sai'}) 
set a.A=0, b.B=0 
return a.degree_rev, b.degree_rev;

//Dò nút tổ tiên từ một nút bất kỳ
match (n {name: 'Phải tránh mọi rủi ro'}) call gds.alpha.bfs.stream('ChonenREV', {startnode: id(n)} ) yield path return path;

//Đánh dấu các nút hậu duệ của các nút nguồn
match (source) where source.degree_rev=0
match p=shortestpath((source)-[:Chonen*..8]->(n)) where n.name<>source.name
UNWIND RANGE(1,LENGTH(p)) AS i
WITH source,i,nodes(p)[i] AS descendant 
CALL apoc.create.setProperty(descendant,"Z"+source.name,i) YIELD node
RETURN source.name, i, descendant.name;

MATCH (x) WHERE x.name = "a" RETURN apoc.map.removeKeys(x, [p IN keys(x) WHERE NOT p STARTS WITH "Z"])

//CREATE (n2)-[:_RELATED]->(C)<-[:_RELATED]-(n6)-[:_RELATED]->(n2)<-[:_RELATED]-(n0)-[:_RELATED]->(n1)-[:_RELATED]->(),
//(n8)-[:_RELATED]->(n4)<-[:_RELATED]-(n0)-[:_RELATED]->(n3)<-[:_RELATED]-(n2),
//(n6)<-[:_RELATED]-(n0)-[:_RELATED]->(),
//(n3)-[:_RELATED]->(n8),
//(n4)-[:_RELATED]->(n1),
//(n18)-[:_RELATED]->(n14)<-[:_RELATED]-(n12)-[:_RELATED]->(n13)-[:_RELATED]->(),
//(n13)<-[:_RELATED]-(n16)<-[:_RELATED]-(n12)-[:_RELATED]->(n15)<-[:_RELATED]-(n14),
//(n20)-[:_RELATED]->(n12)-[:_RELATED]->(n18),
//(n20)-[:_RELATED]->(C)-[:_RELATED]->(n16)-[:_RELATED]->(n20)-[:_RELATED]->(n15)

