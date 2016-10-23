var dipVisible = false;
if (typeof window.dip_get_rnd_num === 'undefined') {
    window.dip_get_rnd_num = function() {
        return Math.floor(Math.random() * (1000000 - 1 + 1) + 1);
    };
}
var id = dip_get_rnd_num();
var boxId = dip_get_rnd_num();
var create = false;
var connected = false;
var connection;

var sendMessage = function(message){
	var container = document.getElementById(id);
	if(document.getElementById(id).children.length > 4){
		container.removeChild(container.childNodes[1]);
	}
	var defaultMessageContainer = document.createElement('div');
	defaultMessageContainer.style.width = "100%";

	var defaultMessageImage = document.createElement('div');
	defaultMessageImage.style.width = "40px";
	defaultMessageImage.style.height = "40px";
	defaultMessageImage.style.float = "left";
	defaultMessageImage.style.backgroundColor = "#ed97cf";

	var defaultImage = document.createElement('img');
	defaultImage.src = "http://imgur.com/PT3nlfy.jpg";
	defaultImage.style.height = "40px";
	defaultImage.style.width = "40px";

	defaultMessageImage.appendChild(defaultImage);
	defaultMessageContainer.appendChild(defaultMessageImage);

	var defaultMessageText = document.createElement('div');
	defaultMessageText.style.width = "100%";

	defaultMessageContainer.appendChild(defaultMessageText);

	var defaultMessage = document.createElement('span');
	defaultMessage.innerHTML = message;
	defaultMessage.style.padding = "0 0 0 10px";
	defaultMessage.style.lineHeight = "40px";
	defaultMessage.style.fontSize = "20px";
	defaultMessageText.appendChild(defaultMessage);

	container.appendChild(defaultMessageContainer);
};

var receiveMessage = function(message){
	var container = document.getElementById(id);
	if(document.getElementById(id).children.length > 4){
		container.removeChild(container.childNodes[1]);
	}
	var defaultMessageContainer = document.createElement('div');
	defaultMessageContainer.style.width = "100%";

	var defaultMessageImage = document.createElement('div');
	defaultMessageImage.style.width = "40px";
	defaultMessageImage.style.height = "40px";
	defaultMessageImage.style.float = "left";
	defaultMessageImage.style.backgroundColor = "#5a8ee2";

	var defaultImage = document.createElement('img');
	defaultImage.src = "http://imgur.com/qG4e2tV.jpg";
	defaultImage.style.height = "40px";
	defaultImage.style.width = "40px";

	defaultMessageImage.appendChild(defaultImage);
	defaultMessageContainer.appendChild(defaultMessageImage);

	var defaultMessageText = document.createElement('div');
	defaultMessageText.style.width = "100%";

	defaultMessageContainer.appendChild(defaultMessageText);

	var defaultMessage = document.createElement('span');
	defaultMessage.innerHTML = message;
	defaultMessage.style.padding = "0 0 0 10px";
	defaultMessage.style.lineHeight = "40px";
	defaultMessage.style.fontSize = "20px";
	defaultMessageText.appendChild(defaultMessage);

	container.appendChild(defaultMessageContainer);
};

var connect = function() {
	$(function () {
	    "use strict";

	    // for better performance - to avoid searching in DOM
	    var content = $('#content');
	    var input = $('#'+boxId);
	    var status = $('#status');

	    // my color assigned by the server
	    var myColor = false;
	    // my name sent to the server
	    var myName = false;

	    // if user is running mozilla then use it's built-in WebSocket
	    window.WebSocket = window.WebSocket || window.MozWebSocket;

	    // if browser doesn't support WebSocket, just show some notification and exit
	    if (!window.WebSocket) {
	        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
	                                    + 'support WebSockets.'} ));
	        input.hide();
	        $('span').hide();
	        return;
	    }

	    // open connection
	    connection = new WebSocket('ws://168.235.144.28:1337');

	    connection.onopen = function () {
	        // first we want users to enter their names
			input = document.getElementById(boxId);
	        input.disabled = false;
	        connection.send('clientType:survivor');
	    };

	    connection.onerror = function (error) {
	        // just in there were some problems with conenction...
	        console.log("There was a problem connecting.");
	    };

	    // most important part - incoming messages
	    connection.onmessage = function (message) {
	        // try to parse JSON message. Because we know that the server always returns
	        // JSON this should work without any problem but we should make sure that
	        // the massage is not chunked or otherwise damaged.
	        try {
	            var json = JSON.parse(message.data);
	        } catch (e) {
	            console.log('This doesn\'t look like a valid JSON: ', message.data);
	            return;
	        }

	        // NOTE: if you're not sure about the JSON structure
	        // check the server source code above
	        if (json.type === 'color') { // first response from the server with user's color
	            myColor = json.data;
	            status.text(myName + ': ').css('color', myColor);
	            input.removeAttr('disabled').focus();
	            // from now user can start sending messages
	        } else if (json.type === 'history') { // entire message history
	            // insert every single message to the chat window
	            for (var i=0; i < json.data.length; i++) {
	                addMessage(json.data[i].author, json.data[i].text,
	                           json.data[i].color, new Date(json.data[i].time));
	            }
	        } else if (json.type === 'message') { // it's a single message
	            input = document.getElementById(boxId);
				input.disabled = false;
	            addMessage(json.data.author, json.data.text,
	                       json.data.color, new Date(json.data.time));
	        } else {
	            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
	        }
	    };

	    /**
	     * Send mesage when user presses Enter key
	     */
	    document.getElementById(boxId).addEventListener("keydown",function(e) {
	        if (e.keyCode === 13) {
	        		//sendMessage($(this).val());
	            var msg = document.getElementById(boxId).value;
	            if (!msg) {
	                return;
	            }
	            // send the message as an ordinary text
	            connection.send(msg);
	            $(this).val('');
	            // disable the input field to make the user wait until server
	            // sends back response
	            input = document.getElementById(boxId);
				input.disabled = false;
	            document.getElementById(boxId).value = '';
	        }
	    });

	    /**
	     * This method is optional. If the server wasn't able to respond to the
	     * in 3 seconds then show some error message to notify the user that
	     * something is wrong.
	     */
	    setInterval(function() {
	        if (connection.readyState !== 1) {
	            input.attr('disabled', 'disabled').val('Unable to connect to server.');
	        }
	    }, 3000);

	    /**
	     * Add message to the chat window
	     */
	    function addMessage(author, message, color, dt) {
	    	if(author === 'helper')
	        receiveMessage(message);
	      else 
	      	sendMessage(message);
	    }
	});
	connected = true;
};

document.getElementsByTagName('body')[0].addEventListener("keyup", function(event) {
	event.preventDefault();
  if (event.keyCode === 27) {
  	var el = document.getElementById(id);
		el.parentElement.removeChild(el);
		dipVisible = false;
		connection.send('Survivor had to leave in a hurry and has disconnected.');
		connection.close();
		window.scrollTo(0,0);
  }
});

var construct = function () {
		var containerHeight = 200;
				var chatBoxHeight = 40;
				var container = document.createElement('DIV');
				container.id = id;
				container.style.height = containerHeight + 'px';
				container.style.backgroundColor = "white";

				var chatBox = document.createElement('input');
				chatBox.id = boxId;
				chatBox.disabled = "disabled";
				chatBox.placeholder = "Type your message here and hit enter.";
				chatBox.style.border = "2px solid #444";
				chatBox.style.borderWidth = "2px 0 0 0";
				chatBox.style.position = "absolute";
				chatBox.style.paddingLeft = "10px";
				chatBox.style.marginTop = (containerHeight - chatBoxHeight) + 'px'; 
				chatBox.style.height = chatBoxHeight + 'px';
				chatBox.style.width = "100%";
				chatBox.style.fontSize = "18px";

				var defaultMessageContainer = document.createElement('div');
				defaultMessageContainer.style.width = "100%";

				var defaultMessageImage = document.createElement('div');
				defaultMessageImage.style.width = "40px";
				defaultMessageImage.style.height = "40px";
				defaultMessageImage.style.float = "left";
				defaultMessageImage.style.backgroundColor = "#5a8ee2";

				var defaultImage = document.createElement('img');
				defaultImage.src = "http://imgur.com/qG4e2tV.jpg";
				defaultImage.style.height = "40px";
				defaultImage.style.width = "40px";

				defaultMessageImage.appendChild(defaultImage);
				defaultMessageContainer.appendChild(defaultMessageImage);

				var defaultMessageText = document.createElement('div');
				//defaultMessageText.style.width = "80%";

				defaultMessageContainer.appendChild(defaultMessageText);

				var defaultMessage = document.createElement('span');
				defaultMessage.innerHTML = "Hi, we're here to help. Let us know if you need help finding a shelter, learning about outreach programs, or getting something off your mind.";
				defaultMessage.style.padding = "0 0 0 10px";
				defaultMessage.style.lineHeight = "40px";
				defaultMessage.style.fontSize = "20px";
				defaultMessageText.appendChild(defaultMessage);

				container.appendChild(chatBox);
				container.appendChild(defaultMessageContainer);

				document.getElementsByTagName('body')[0].appendChild(container);
				window.scrollTo(0,document.body.scrollHeight);
				dipVisible = true;
}

var run = function(){
	if(!dipVisible){
		if(document.getElementById(id)){
			document.getElementById(id).style.display="block";
			window.scrollTo(0,document.body.scrollHeight);
			dipVisible = true;
			if(create){console.log('f');
				var container = document.getElementById(id);
				var defaultMessageContainer = document.createElement('div');
				defaultMessageContainer.style.width = "100%";

				var defaultMessageImage = document.createElement('div');
				defaultMessageImage.style.width = "40px";
				defaultMessageImage.style.height = "40px";
				defaultMessageImage.style.float = "left";
				defaultMessageImage.style.backgroundColor = "#5a8ee2";

				var defaultImage = document.createElement('img');
				defaultImage.src = "http://imgur.com/qG4e2tV.jpg";
				defaultImage.style.height = "40px";
				defaultImage.style.width = "40px";

				defaultMessageImage.appendChild(defaultImage);
				defaultMessageContainer.appendChild(defaultMessageImage);

				var defaultMessageText = document.createElement('div');
				//defaultMessageText.style.width = "80%";

				defaultMessageContainer.appendChild(defaultMessageText);

				var defaultMessage = document.createElement('span');
				defaultMessage.innerHTML = "Hi, we're here to help. Let us know if you need help finding a shelter, learning about outreach programs, or getting something off your mind.";
				defaultMessage.style.padding = "0 0 0 10px";
				defaultMessage.style.lineHeight = "40px";
				defaultMessage.style.fontSize = "20px";
				defaultMessageText.appendChild(defaultMessage);

				container.appendChild(defaultMessageContainer);
				create = false;
			}
		}
		else {
			construct();
			connect();
		}
	}
	else {
		connection.close();
		var el = document.getElementById(id);
		el.parentElement.removeChild(el);
		dipVisible = false;
		window.scrollTo(0,0);
	}
	//document.write('<div style="height:400px">test</div>');
};
document.write("<script src='https://code.jquery.com/jquery-1.12.4.min.js'></script>");
document.write("<img src='http://i.imgur.com/oZjhSae.png' onclick='run()' height='13px' width='13px'>");