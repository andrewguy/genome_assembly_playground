var drag = simulation => {
  
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event,d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event,d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }

function reads2graph(textInput, kmerSize){
    let dnaStrings = textInput

    let kmers = []

    let kmerLength = kmerSize

    let nodes = new Set()

    let edges = new Array()
    dnaStrings.forEach((dnaString) => 
        {for (var i = 0, charsLength = dnaString.length; i < charsLength - kmerLength + 1; i += 1) {
            
            let prefix = dnaString.substring(i, i + kmerLength - 1)
            let suffix = dnaString.substring(i + 1, i + kmerLength)
            let kmer = dnaString.substring(i, i + kmerLength)
            kmers.push(kmer);
            nodes.add(prefix)
            nodes.add(suffix)
            edges.push({'source': prefix, 'target': suffix, 'kmer': kmer, 'type': "Eulerian"})
        }
    }
    )
    let nodeArray = Array.from(nodes).map(x => ({'id': x}))
    return {'links': edges, 'nodes': nodeArray}
}


function chart2(data) {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
  
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("x", d3.forceX())
        .force("y", d3.forceY());
  
    const svg = d3.select("#chart").append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .style("font", "12px sans-serif");
  
    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
      .data(['Eulerian'])
      .join("marker")
        .attr("id", d => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("path")
        .attr("fill", "red")
        .attr("d", "M0,-5L10,0L0,5");
  
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
        .attr("stroke", "red")
        .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);
  
    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
        .call(drag(simulation));
  
    node.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 4);
  
    node.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(d => d.id)
      .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);
  
    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
  
    return svg.node();
  }

  function linkArc(d) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
  }


const height = 600;
const width = 800;

var kmerSizes = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const source = document.getElementById('values');

const inputHandler = function(e) {
    d3.select("#chart svg").remove()
       var dataset = e.target.value.split("\n");
       let graphData = reads2graph(dataset, parseInt(document.getElementById("kmerRange").value))
       chart2(graphData)
  }
  
source.addEventListener('input', inputHandler)
      
var dataset = document.getElementById("values").value.split("\n")

let graphData = reads2graph(dataset, parseInt(document.getElementById("kmerRange").value))

chart2(graphData)


var slider = document.getElementById("kmerRange");
var output = document.getElementById("kmerSliderValue");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}


d3.select("#kmerRange")
  .on('change', () => {
    d3.select("#chart svg").remove()
    var dataset = document.getElementById("values").value.split("\n");
    let graphData = reads2graph(dataset, parseInt(document.getElementById("kmerRange").value))
    chart2(graphData)
  });