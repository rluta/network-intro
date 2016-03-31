(function (base) {
    var states = {
        sender: $('[data-role="sender"]',base),
        recipient: $('[data-role="recipient"]',base)
    };

    Reveal.addEventListener( 'fragmentshown', function( event ) {
        var fragment  = event.fragment
        if ($(fragment.parentNode).hasClass('message-wrapper')) {
            show(fragment,states)
        }
    })

    Reveal.addEventListener( 'fragmenthidden', function( event ) {
        var fragment  = event.fragment
        if ($(fragment.parentNode).hasClass("message-wrapper")) {
            hide(fragment,states)
        }
    })

    function show(fragment,states) {
        var flagBefore = $(fragment).data('flag-before');
        var flagAfter = $(fragment).data('flag-after');
        var clientType = $(fragment).hasClass('to')?'sender':'recipient';
        var senderState = $(fragment).data('sender-state');
        var recipientState = $(fragment).data('recipient-state');
        var height = fragment.offsetHeight+'px'

        if (flagBefore)
            states[clientType].append('<div data-flag="'+flagBefore+'" class="item flag before">'+flagBefore+'</div>');
        if (senderState)
            states.sender.append('<div style="height: '+height+'" data-state="'+senderState+'" class="item state">'+senderState+'</div>');
        if (recipientState)
            states.recipient.append('<div style="height: '+height+'" data-state="'+recipientState+'" class="item state">'+recipientState+'</div>');
        if (flagAfter)
            states[clientType].append('<div data-flag="'+flagAfter+'" class="item flag after">'+flagAfter+'</div>');
    }

    function hide(fragment,states) {
        var flagBefore = $(fragment).data('flag-before');
        var flagAfter = $(fragment).data('flag-after');
        var clientType = $(fragment).hasClass('to')?'sender':'recipient';
        var senderState = $(fragment).data('sender-state');
        var recipientState = $(fragment).data('recipient-state');

        if (flagBefore)
            $('[data-flag="'+flagBefore+'"]',states[clientType]).remove()
        if (flagAfter)
            $('[data-flag="'+flagAfter+'"]',states[clientType]).remove()
        if (senderState)
            $('[data-state="'+senderState+'"]',states.sender).remove()
        if (recipientState)
            $('[data-state="'+recipientState+'"]',states.recipient).remove()

    }

})($('script[src="js/tcp-chat.js"]').get(0).parentNode)