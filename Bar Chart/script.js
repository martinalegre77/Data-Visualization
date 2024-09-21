// Variables
const w = 950;
const h = 600;
const wpadding = 75;
const hpadding = 100;


// Carga de los datos
const req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json', true);
req.send();
req.onload = function(){
    const json = JSON.parse(req.responseText);
    const dataset = json.data

    // Agrega el SVG
    const svg = d3.select("body")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("class", "canvas");
    
    // Agrega título
    svg.append("text")  
        .attr("x", w / 2)
        .attr("y", 55)   
        .attr("text-anchor", "middle") // Centrar el texto horizontalmente  
        .attr("font-size", "40px")
        .attr("font-family", "Times new roman") 
        .attr("fill", "black") 
        .text("United States GDP");

    // Agrega subtítulo
    svg.append("text")  
        .attr("x", w / 10)
        .attr("y", h / 2)    
        .attr("font-size", "16px")
        .attr("font-family", "Times new roman") 
        .attr("fill", "black") 
        .attr("transform", "rotate(-90," + (w / 10) + "," + (h / 2) + ")")   
        .text("Gross Domestic Product");


    // Agrega copyright
    svg.append("text")  
        .attr("x", w - 200)
        .attr("y", h - 50)     
        .attr("font-size", "14px")
        .attr("font-family", "Times new roman") 
        .attr("fill", "black") 
        .text("© 2024 Martín Alegre");

    // Escala X
    const xScale = d3.scaleTime()
                        .domain(d3.extent(dataset, d => new Date(d[0])))
                        .range([wpadding, w - wpadding]);

    // Escala Y
    const yScale = d3.scaleLinear()
                        .domain([0, d3.max(dataset, (d) => d[1])])
                        .range([h - hpadding, hpadding]);

    // Crea tooltip
    const tooltip = d3.select("#tooltip");

    // Agrega barras
    svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(new Date(d[0]))) // Usa la fecha para la posición X  
            .attr("y", (d) => yScale(d[1]))
            .attr("width", 4)
            .attr("height", (d) => h - hpadding - yScale(d[1]))
            .attr("fill", "rgb(237, 134, 23)") 
            .attr("data-date", d => d[0])
            .attr("data-gdp", d => d[1])
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(100).style("opacity", 1);
                tooltip.html(`${data_date(d[0])} <br> ${data_gdp(d[1])}`)
                    .attr("data-date", d[0])
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", h - 60 + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });

    // Eje X
    // Crear un rango de fechas para los años que son múltiplos de 5
    const startYear = d3.min(dataset, d => new Date(d[0]).getUTCFullYear());
    const endYear = d3.max(dataset, d => new Date(d[0]).getUTCFullYear());
    const ticks = [];

    // Agregar fechas de enero para años que son múltiplos de 5
    for (let year = startYear; year <= endYear; year++) {
        if (year % 5 === 0) {
            ticks.push(new Date(year, 0)); 
        }
    }
    // Configura el eje x
    const xAxis = d3.axisBottom(xScale)
                    .tickValues(ticks) 
                    .tickFormat((d) => {
                        return d.getUTCFullYear();
                    });
    // Agrega eje x al svg                
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (h - hpadding) + ")")
        .call(xAxis);

    // Eje Y
    const yAxis = d3.axisLeft(yScale);
    // Agrega eje x al svg
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + (wpadding) + ", 0)")
        .call(yAxis);
    };


// Obtener datos de la fecha
function data_date(date) {
    const fecha = new Date(date); 
    const year = fecha.getUTCFullYear();
    const month = fecha.getUTCMonth() + 1;   
    const q_year = Math.ceil(month / 3);
    return `${year} Q${q_year}`; 
    }


// Obtener valor GDP
function data_gdp(gdp) {
    gdp = gdp.toFixed(1);
    const numero = gdp.toString().split(".");
    numero[0] = numero[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return `$${numero.join(".")} Billion`;
}