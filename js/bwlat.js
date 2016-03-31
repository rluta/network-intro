(function (base) {
    var specs = {};
    var charts = {};
    $('.button:not(.disabled)', base).on('click', function (e) {
        var val = $(this).text().toLowerCase();
        $('.button:not(.disabled)', base).removeClass('active');
        $(this).addClass('active');
        var m = specs.bwlat;
        for (var idx in m.scales) {
            var scale = m.scales[idx];
            if (scale.name.indexOf("y") == 0) scale.type = val;
        }
        vg.parse.spec(m, function (chart) {
            charts.bwlat = chart({el: $('[data-chart="vega"]',base).get(0)}).update();
        });
    });

    $('.item:not(.disabled)', base).on('click', function (e) {
        var val = $(this).data('source');
        $('.item:not(.disabled)', base).removeClass('active');
        $(this).addClass('active');

        d3.json(val, function (error, json) {
            specs.bwlat = json;
            $('.button.active', base).click();
        });
    });
    $('.item.active', base).click();
})($('script[src="js/bwlat.js"]').get(0).parentNode)