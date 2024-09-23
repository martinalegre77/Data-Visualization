// Variables
const w = 950;
const h = 700;
const wpadding = 75;
const hpadding = 100;
const leyend = [
    ["No doping allegations", 0],
    ["Riders with doping allegations", 20]
    ];

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
    .attr("id", "title")   
    .attr("text-anchor", "middle")   
    .attr("font-size", "30px")
    .attr("font-family", "Arial") 
    .attr("fill", "black") 
    .text("Doping in Professional Bicycle Racing");

// Agrega subtítulo
svg.append("text")  
    .attr("x", w / 2)
    .attr("y", 75) 
    .attr("text-anchor", "middle")   
    .attr("font-size", "18px")
    .attr("font-family", "Arial") 
    .attr("fill", "black")
    .text("35 Fastest times up Alpe d'Huez");

// Titulo eje Y
svg.append("text")  
    .attr("x", 30)
    .attr("y", h / 3)    
    .attr("font-size", "18px")
    .attr("font-family", "Arial") 
    .attr("fill", "black") 
    .attr("transform", "rotate(-90," + (30) + "," + (h / 3) + ")")   
    .text("Time in Minutes");

// Agrega copyright
svg.append("text")  
    .attr("x", w - 200)
    .attr("y", h - 50)     
    .attr("font-size", "14px")
    .attr("font-family", "Times new roman") 
    .attr("fill", "black") 
    .text("© 2024 Martín Alegre");


// Carga de los datos
const req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
req.send();
req.onload = function(){

    const dataset = JSON.parse(req.responseText);

    // Convertir Fecha y Tiempo
    const parseTime = d3.timeParse("%Y");  
    const timeTickFormat = d3.timeFormat('%M:%S'); 

    // Formatear la fecha de los datos y el tiempo
    dataset.forEach((d) => {
        const timeSplit = d.Time.split(":");
        d.Year = parseTime(d.Year);
        d.Time = new Date(1970, 0, 1, 0, +timeSplit[0], +timeSplit[1]); // Convertir el tiempo a Date object
    });

    // Escala X
    const xScale = d3.scaleTime()
                    .domain([
                            d3.timeYear.offset(d3.min(dataset, (d) => d.Year), -1), 
                            d3.timeYear.offset(d3.max(dataset, (d) => d.Year), 1)   
                            ])
                    .range([wpadding, w - wpadding]);
    
    // Escala Y
    const yScale = d3.scaleTime()
                    .domain(d3.extent(dataset, d => d.Time))  
                    .range([hpadding, h - hpadding]);

    // Crea tooltip
    const tooltip = d3.select("#tooltip");

    // Agrega circulos
    svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScale(d.Year))
            .attr("cy", (d) => yScale(d.Time))
            .attr("r", 6)
            .attr("fill", (d) => d.Doping ? "#54a7c3" : "#f6a607")
            .attr("data-xvalue", (d) => d.Year)   
            .attr("data-yvalue", (d) => d.Time) 
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(100).style("opacity", 1);
                tooltip.html(`
                    ${d.Name}: ${d.Nationality} <br>
                    Year: ${d.Year}, Time: ${d.Time}
                    ${d.Doping ? `<br><br>${d.Doping}` : ''}
                    `)
                    //.attr("data-year", d3.timeFormat("%Y")(d.Year))
                    .attr("data-year", d.Year)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });

    // Agrega leyenda
    const legendGroup = svg.append("g")
                            .attr("id", "legend")
                            .attr("class", "legend-group");
    // Indicadores de color                        
    svg.selectAll("rect")
            .data(leyend)
            .enter()
            .append("rect")
            .attr("x", w - 100)
            .attr("y", (d) => ((h / 2) + d[1]))
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d) => d[1] < 10 ? "#54a7c3" : "#f6a607");
    
    legendGroup.selectAll("text")
            .data(leyend)
            .enter()
            .append("text")
            .text((d) => d[0]) 
            .attr("x", w - 100)   
            .attr("y", (d) => ((h / 2) + d[1] + 10)) 
            .style("font-size", "10px")
            .style("font-family", "Arial") 
            .style("fill", "black")
            .attr("text-anchor", "end") // Alinea el texto a la derecha
            .attr("dx", "-0.5em"); // Desplaza el texto ligeramente hacia la izquierda

    // Eje X
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat("%Y"));

    // Agrega eje x al svg                
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (h - hpadding) + ")")
        .call(xAxis);

    // Eje Y con valores de ticks específicos y formateo
    const yAxis = d3.axisLeft(yScale)
                    .tickFormat(timeTickFormat); 

    // Añadir el eje Y al SVG
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${wpadding}, 0)`)
        .call(yAxis);

};