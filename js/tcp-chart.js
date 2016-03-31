(function (base) {

    var state = {
        running: false,
        tick: 0,
        sender: {
            app_pending: 0,
            rwnd: 64*1024,
            cwnd: 10
        },
        recipient: {
            rwnd: 64*1024,
            app_available: 64*1024
        },
        network: {
            avail: 100,
            sent:[],
            rcvd:[]
        }
    };

    var tick = 1;
    var globalConfig = {
        tick: {
            ratio: 20,
            duration: 100
        }
    };

    var config = null;

    function nextState(tick) {
        var done             = 0,
            bytesReceived    = 0,
            inflightBytes    = 0,
            windowMax        = Math.min(net.cwnd,net.rwnd),
            windowCurrent    = windowMax,
            unackedPackets   = 0,
            ackBytes         = {},
            sentBytes        = {},
            time             = 0.0,
            name             = net.id,
            mss              = net.mtu - 40,
            cwnd             = Math.min(net.cwnd * mss,10*1460),
            rwnd             = net.rwnd * 1024,
            latency          = net.rtt * 0.5,
            tryIndicator     = 0,
            loop             = 0,
            target           = net.target,
            ssmode           = true;

        while (done == 0 && loop < 10000) {
            var sendable = 0

            // we've recieved ACK packets
            if (ackBytes[time]) {
                // update CWND using SS algorithm
                if (ssmode)
                    if (TTLChart.modelGlobals.delayAck)
                        cwnd += ackBytes[time] / 2
                    else
                        cwnd += ackBytes[time]
                else
                    cwnd += mss
                inflightBytes -= ackBytes[time]
            }

            // update windows
            windowMax = Math.min(cwnd,rwnd)
            windowCurrent = Math.max(0,windowMax-inflightBytes)

            // we've received some packets on the client
            if (sentBytes[time]) {
                var numPackets = Math.ceil(sentBytes[time] / mss) + unackedPackets
                if (TTLChart.modelGlobals.delayAck) {
                    var unacked = numPackets % 2
                    unackedPackets = unacked
                    numPackets -= unacked
                }
                ackBytes[time+latency] = Math.min(sentBytes[time],numPackets * mss)
                bytesReceived += sentBytes[time]
                if (bytesReceived >= target * 1024 ) done = 1
            } else {
                sentBytes[time]=0
            }

            // if window is open, try to send data
            if (windowCurrent > 0) {
                sendable = Math.min(2*latency * net.bw * 1024 / 8, windowCurrent)
                if ( sendable < windowCurrent )
                {
                    // congestion
                    cwnd = Math.floor(cwnd / 2)
                    ssmode = false
                }
                sentBytes[time+latency]= sendable
                inflightBytes += sendable
            }

            if (time > 0)
                data.push({
                    "name":name,
                    "try":tryIndicator,
                    "send":Math.max(0,time-latency),
                    "receive":time,
                    "bytes":sentBytes[time],
                    "done":0})
            time += latency;
            loop++;
        }
        return time;
    }

    function config() {
        return Object.assign({},globalConfig, {
            sender: {
                app_bytes_tick: $('.app.sender',base).data('value'),
                tcp_cwnd: $('.tcp.sender.cwnd',base).data('value')
            },
            recipient: {
                app_bytes_tick: $('.app.recipient',base).data('value'),
                tcp_rwnd: $('.tcp.recipient.rwnd',base).data('value')
            },
            network: {
                bw: $('.network',base).data('bw'),
                latency: $('.network',base).data('latency'),
                bdp: 200
            }
        });
    }

    function update(state) {
        $('.app.sender',base).style('height',state.sender.app_pending);
        $('.tcp.sender.rwnd',base).style('height',state.sender.rwnd);
        $('.tcp.sender.cwnd',base).style('height',state.sender.cwnd);

        var sent = d3.select('.network',base).selectAll('.packet.sent').data(state.network.sent);
        sent.enter().append('div').class('packet sent');
        sent.transition(50).style('left',function (d) { return d.time});
        sent.exit().remove();

        var rcvd = d3.select('.network',base).selectAll('.packet.rcvd').data(state.network.rcvd);
        rcvd.enter().append('div').class('packet rcvd');
        rcvd.transition(50).style('left',function (d) { return d.time});
        rcvd.exit().remove();

        $('.tcp.recipient',base).style('height',state.recipient.rwnd);
        $('.app.recipient',base).style('height',state.recipient.app_available);
    }

    function run() {
        if (state.running) {
            state = nextState(tick++);
            update(state);
            setTimeout(run,config.tick.duration);
        }
    }
    run();

    $('.tcp.recipient.rwnd')
        .drag("start",function (ev,dd) {
            var property = $(this).data('property');
            var netIdx = $(this).closest('[data-net]').data('net');
            var baseNet = TTLChart.selectedNets[netIdx]
            var net = {'id':baseNet.id+'drag'}
            for (var prop in baseNet) { if (prop != 'id') net[prop] = baseNet[prop] }
            TTLChart.selectedNets.push(net);
        })
        .drag(function (ev,dd) {
            var property = $(this).data('property');
            var net = TTLChart.selectedNets[TTLChart.selectedNets.length-1]
            net[property] = TTLChart.updateValue(ev,dd,net[property],$(this).data('min'),$(this).data('max'),$(this).data('step'))
            $(this).text(net[property]);
            TTLChart.update()
        })
        .drag("end",function (ev,dd) {
            var property = $(this).data('property');
            var netIdx = $(this).closest('[data-net]').data('net');
            var net = TTLChart.selectedNets[TTLChart.selectedNets.length-1]
            var baseNet = TTLChart.selectedNets[netIdx]
            for (var prop in baseNet) { if (prop != 'id') baseNet[prop] = net[prop] }
            $(this).text(baseNet[property]);
            TTLChart.selectedNets.pop();
            TTLChart.update()
        });

    $('.tcp.sender.cwnd')
        .drag("start",function (ev,dd) {
            var property = $(this).data('property');
            var netIdx = $(this).closest('[data-net]').data('net');
            var baseNet = TTLChart.selectedNets[netIdx]
            var net = {'id':baseNet.id+'drag'}
            for (var prop in baseNet) { if (prop != 'id') net[prop] = baseNet[prop] }
            TTLChart.selectedNets.push(net);
        })
        .drag(function (ev,dd) {
            var property = $(this).data('property');
            var net = TTLChart.selectedNets[TTLChart.selectedNets.length-1]
            net[property] = TTLChart.updateValue(ev,dd,net[property],$(this).data('min'),$(this).data('max'),$(this).data('step'))
            $(this).text(net[property]);
            TTLChart.update()
        })
        .drag("end",function (ev,dd) {
            var property = $(this).data('property');
            var netIdx = $(this).closest('[data-net]').data('net');
            var net = TTLChart.selectedNets[TTLChart.selectedNets.length-1]
            var baseNet = TTLChart.selectedNets[netIdx]
            for (var prop in baseNet) { if (prop != 'id') baseNet[prop] = net[prop] }
            $(this).text(baseNet[property]);
            TTLChart.selectedNets.pop();
            TTLChart.update()
        });

    $('.network')
        .drag("start",function (ev,dd) {
            var property = $(this).data('property');
            var netIdx = $(this).closest('[data-net]').data('net');
            var baseNet = TTLChart.selectedNets[netIdx]
            var net = {'id':baseNet.id+'drag'}
            for (var prop in baseNet) { if (prop != 'id') net[prop] = baseNet[prop] }
            TTLChart.selectedNets.push(net);
        })
        .drag(function (ev,dd) {
            var property = $(this).data('property');
            var net = TTLChart.selectedNets[TTLChart.selectedNets.length-1]
            net[property] = TTLChart.updateValue(ev,dd,net[property],$(this).data('min'),$(this).data('max'),$(this).data('step'))
            $(this).text(net[property]);
            TTLChart.update()
        })
        .drag("end",function (ev,dd) {
            var property = $(this).data('property');
            var netIdx = $(this).closest('[data-net]').data('net');
            var net = TTLChart.selectedNets[TTLChart.selectedNets.length-1]
            var baseNet = TTLChart.selectedNets[netIdx]
            for (var prop in baseNet) { if (prop != 'id') baseNet[prop] = net[prop] }
            $(this).text(baseNet[property]);
            TTLChart.selectedNets.pop();
            TTLChart.update()
        });
})($('script[src="js/tcp-chart.js"]').get(0).parentNode)