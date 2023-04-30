var viz;
var allNodes;
var highlightActive = false;

function draw() {
    var config = {
        containerId: "viz",
        initialCypher: "match (n)-[r]-(m) return n,r,m",
        neo4j: {
            serverUrl: 'bolt://b95e1176.databases.neo4j.io',
            serverUser: 'neo4j',
            serverPassword: 'jgqHo9s6c2fCRv_mT2l1S693dSQ0GKYYC0LZ5Rn7XI8',
            driverConfig: { 
                encrypted: "ENCRYPTION_ON",
                trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES"
            },
            // serverUrl: 'bolt://localhost:7687',
            // serverUser: 'neo4j',
            // serverPassword: 'a',
        },
        visConfig: {
            edges: {
                color: "dimgray",
                selectionWidth: 7,
            },
            nodes: {
                shape: "dot",
                labelHighlightBold: true,
                margin: 1000,
                scaling: {
                    min: 10,
                    max: 30,
                    label: {
                        min: 8,
                        max: 30,
                        drawThreshold: 12,
                        maxVisible: 20,
                    },
                },
            },
            interaction: {
                hover: true,
                hoverConnectedEdges: true,
                multiselect: true,
            },
            configure: {
                filter: "physics",
            }  
        },
        labels: {
            note: {
                label: "wrappedname",
                group: "group",
                value: "degree_und",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    function: {
                        title: (props) => NeoVis.objectToTitleHtml(props, ["name", "group", "gid", "in", "out", "contr"])
                    },
                    static: {
                    }
                }
            },
        },
        relationships: {
            Mauthuanvoi: {
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    cypher: {}, 
                    function: { 
                        // title: NeoVis.objectToTitleHtml,
                    },
                    static: {
                        color: " #ff9999",
                        title: "Mâu thuẫn",
                        smooth: false,
                        // physics: false
                    }
                }
            },
            
            Chonen: {
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    function: {
                        title: NeoVis.objectToTitleHtml,
                        // title: (props) => NeoVis.objectToTitleHtml(props, ["name", "group", "content"])
                    },
                    static: { 
                        arrows: "to",
                        title: "Cho nên",
                    } 
                }
            },
        },
    }
    
    viz = new NeoVis.default(config)
    viz.render();
    console.log(viz);
    // Your after render code here
    viz.registerOnEvent("completed", () => {
        network = viz.network
        console.log('Visualization completed at '+ new Date().getHours() + ":" + new Date().getMinutes() ) 
        // nodes = viz.nodes;
        // nodesDataset = viz.nodes; 
        // edgesDataset = viz.edges; 
        // allNodes = nodesDataset.get({
            //     returnType: "Object"
            //     });
            // network.on("click", neighbourhoodHighlight);

        var status = document.getElementById("status")
        network.on("stabilizationProgress", function () {
            status.innerHTML = "Đang tải...";
            status.setAttribute("style", "color: red"  );
        })
        network.once("stabilizationIterationsDone", function () {
            status.innerHTML = "Đã tải xong";
            status.setAttribute("style", "color: green"  ) ;
        })

        //download button
        network.on("afterDrawing", function (ctx) {
            var dataURL = ctx.canvas.toDataURL();
            document.getElementById('canvasImg').href = dataURL;
          });
    })
}


// function neighbourhoodHighlight(params) {
//     // if something is selected:
//     if (params.nodes.length > 0) {
//       highlightActive = true;
//       var i, j;
//       var selectedNode = params.nodes[0];
//       var degrees = 2;
  
//       // mark all nodes as hard to read.
//       for (var nodeId in allNodes) {
//         allNodes[nodeId].color = "rgba(200,200,200,0.5)";
//         if (allNodes[nodeId].hiddenLabel === undefined) {
//           allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
//           allNodes[nodeId].label = undefined;
//         }
//       }
//       var connectedNodes = network.getConnectedNodes(selectedNode);
//       var allConnectedNodes = [];
  
//       // get the second degree nodes
//       for (i = 1; i < degrees; i++) {
//         for (j = 0; j < connectedNodes.length; j++) {
//           allConnectedNodes = allConnectedNodes.concat(
//             network.getConnectedNodes(connectedNodes[j])
//           );
//         }
//       }
  
//       // all second degree nodes get a different color and their label back
//       for (i = 0; i < allConnectedNodes.length; i++) {
//         allNodes[allConnectedNodes[i]].color = "rgba(150,150,150,0.75)";
//         if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
//           allNodes[allConnectedNodes[i]].label =
//             allNodes[allConnectedNodes[i]].hiddenLabel;
//           allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
//         }
//       }
  
//       // all first degree nodes get their own color and their label back
//       for (i = 0; i < connectedNodes.length; i++) {
//         allNodes[connectedNodes[i]].color = undefined;
//         if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
//           allNodes[connectedNodes[i]].label =
//             allNodes[connectedNodes[i]].hiddenLabel;
//           allNodes[connectedNodes[i]].hiddenLabel = undefined;
//         }
//       }
  
//       // the main node gets its own color and its label back.
//       allNodes[selectedNode].color = undefined;
//       if (allNodes[selectedNode].hiddenLabel !== undefined) {
//         allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
//         allNodes[selectedNode].hiddenLabel = undefined;
//       }
//     } else if (highlightActive === true) {
//       // reset all nodes
//       for (var nodeId in allNodes) {
//         allNodes[nodeId].color = undefined;
//         if (allNodes[nodeId].hiddenLabel !== undefined) {
//           allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
//           allNodes[nodeId].hiddenLabel = undefined;
//         }
//       }
//       highlightActive = false;
//     }
  
//     // transform the object into an array
//     var updateArray = [];
//     for (nodeId in allNodes) {
//       if (allNodes.hasOwnProperty(nodeId)) {
//         updateArray.push(allNodes[nodeId]);
//       }
//     }
//     nodesDataset.update(updateArray);
// }

/*
 * Make table
 */
let header = document.getElementById("header");
let body = document.getElementById("body");

example();

// async function example() {
//     const driver = neo4j.driver(
//         "bolt://b95e1176.databases.neo4j.io",
//         neo4j.auth.basic("neo4j", "jgqHo9s6c2fCRv_mT2l1S693dSQ0GKYYC0LZ5Rn7XI8"), {    
//             encrypted: "ENCRYPTION_ON",
//             trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES"
//         } 
//     );
//     const session = driver.session();
//     try {
//         // const result = await session.run(cypherstring);
//         const result = await session.run("MATCH (n) RETURN n");

//         // Assumes all nodes returned have the same properties as the first one returned.
//         Object.keys(result.records[0].get(0).properties).forEach((key) => {
//         let colHead = document.createElement("th");
//         let headerText = document.createTextNode(key);
//         colHead.appendChild(headerText);
//         header.appendChild(colHead);
//         });

//         // There are nicer ways to do this. This is just a hacked together example.
//         result.records.forEach((record) => {
//         let row = document.createElement("tr");
//         Object.values(record.get(0).properties).forEach((val) => {
//             let cell = document.createElement("td");
//             let text = document.createTextNode(val);
//             cell.appendChild(text);
//             row.appendChild(cell);
//         });
//         body.appendChild(row);
//         });
//     } finally {
//         await session.close();
//     }
//     await driver.close();
// }