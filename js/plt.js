(function() {
    var mySection = $('script[src="js/plt.js"]').get(0).parentNode;

    d3.csv("data/plt-vary-bw.txt",function(error,data) {
    nv.addGraph(function() {
        var nvdata = [{
            key:"Page Load Time by Bandwidth",
            values: data
        }];
        var chart = nv.models.discreteBarChart()
                .margin({top: 10, right: 30, bottom: 50, left: 100})
                .x(function(d,i) { return d.bw_mbps })
                .y(function(d,i) {return d.plt_ms })
                .color(function (d) { return "steelblue";})
                .showYAxis(true)
            ;

        chart.yDomain([0,d3.max(data.map(function(d) {return d.plt_ms}))]);
        chart.xAxis.tickFormat(function (d) { return d3.format('d')(d)+'mb';});
        chart.yAxis.tickFormat(d3.format('d'));

        d3.select('#chart-bw svg')
            .datum(nvdata)
            .transition()
            .duration(350)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
});

d3.csv("data/plt-vary-lat.txt",function(error,data) {
    nv.addGraph(function() {
        var nvdata = [{
            key:"Page Load Time by Latency",
            values: data
        }];
        var chart = nv.models.discreteBarChart()
                .margin({top: 10, right: 30, bottom: 50, left: 120})
                .x(function(d,i) { return d.lat_ms })
                .y(function(d,i) {return d.plt_ms })
                .color(function (d) { return "steelblue";})
                .showYAxis(true)

            ;

        chart.yDomain([0,d3.max(data.map(function(d) {return parseInt(d.plt_ms)}))]);

        chart.xAxis.tickFormat(function (d) { return d3.format('d')(d)+' ms';});
        chart.yAxis.tickFormat(d3.format('d'));

        d3.select('#chart-lat svg')
            .datum(nvdata)
            .transition()
            .duration(350)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
});

    $(mySection).on('action', function () {
        $(".chart",mySection).toggleClass('hidden');
    });
}());
