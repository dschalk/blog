
<script>
import {fade} from "svelte/transition"
let visible = true;

var j  = 2;

 var s = "stop"; var h = "halt"; var c = "clear";

let GO = "Cornucopia";;
var koo;
var ko = [];
var jo = [];
var bo = []

function ff (m) {
ko = []
bo = m(s);
var ar = [...bo.keys()]
jo = m(h);
koo = [...bo.keys()].map(v =>ko.concat(`The prime fuctors of ${bo[v]} are ${jo[v]}`))
ko = koo.map(v => v[0]);
GO = koo;
return koo;
}

var toInt = function toInt (a) {
    if (Array.isArray(a)) return NaN; 
    else return parseInt(a, 10)
};

function Monad () { 
    var ar1 = [];
    var ar2 = [];
    var s = "stop"; var h = "halt"; 
    console.log("New Monad");
    function _f (func) {
        if (func === "stop") return ar1
        else if (func === "halt") return ar2
        else if (func === "clear") {ar1 = []; ar2 = []}
        else if (toInt(func) === toInt(func) && typeof func !== "function" ) {
            ar1.push(func) 
        }
        else if (Array.isArray(func)) ar2.push(func)
        else if (typeof func ==="function") ar3.push (func(ar1))
    } 
   return _f;
}

var ace = Monad();

var worker_OO = new Worker('worker_OO.js');

worker_OO.onmessage = function(e) {
     ace(e.data); 
     ff(ace);
};

// var socket = new WebSocket("ws://localhost:3055")
// var socket = new WebSocket("ws://167.71.168.53:3055")
var socket = new WebSocket("ws://schalk.net:3055")

socket.onclose = function (event) {
console.log('<><><> ALERT - socket is closing. <><><> ', event);
};

socket.onmessage = function(e) {
// console.log("WebSocket message is", e);
var v = e.data.split(',');
if (v[0] === "BE#$42") {
    ace(v[3]);
    worker_OO.postMessage([v[3]])
}
}

login();

function login() {
console.log('00000000000000000000000000000000 Entering login', socket.readyState);
setTimeout(function () {
if (socket.readyState === 1) {
  console.log('readyState is', socket.readyState);
  var v = Math.random().toString().substring(5);
  var v2 = v.toString().substring(2);
  var combo = v + '<o>' + v2;
  socket.send('CC#$42' + combo);
  factors();
  // socket.send(`GZ#$42,solo,${v}`);
} else {
  login();
}
}, 200)
}

function factors () {
  ace("clear")
  socket.send("BE#$42,solo,name,10000"); 
  socket.send("BE#$42,solo,name,100000"); 
  socket.send("BE#$42,solo,name,1000  "); 
  socket.send("BE#$42,solo,name,100000"); 
  socket.send("BE#$42,solo,name,10000  "); 
}  

var btn = `ace('clear')
socket.send("BE#$42,solo,name,10000")
socket.send("BE#$42,solo,name,100000")
socket.send("BE#$42,solo,name,1000 ")
socket.send("BE#$42,solo,name,100000")
socket.send("BE#$42,solo,name,10000 ")`


</script>

<style>
button {
text-align: left;
background-color: #004400;
border-width: 2px;
border-color: #E8F7C1;
border-radius: 70px;
text-decoration-color: red;
font-size: 20px;

-webkit-box-shadow: 0px 0px 15px 0px rgb(255, 215, 0);
box-shadow:         0px 0px 15px 0px rgb(255, 215, 0);
padding: 3px 10px 3px 10px;
}

button:hover {
background-color: #0000CC;
padding: 3px 10px 3px 10px;
text-decoration-color: yellow;
border-color: #0000AA;
}
</style>
<br><br>
{#if j === 2} 
<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 38px;" transition:fade>
ASYNCHRONOUSLY MODIFIED STATE
</div>
{/if}
<br>
<p> Clicking the button below sends three requests to the server asking for quasi-random integers. </p> 
<div style = "font-size: 28; margin-left: 130px; color: #EECCFF">
 {GO[0]}
<br>
 {GO[1]}
<br>
 {GO[2]}
<br>
 {GO[3]}
<br>
 {GO[4]}
 </div>
<br>
<button on:click = {factors} >
  <pre>{btn}</pre>
</button>

<br>

<p> Messages sent to the Haskell WebSockets server with prefix BE#$42 are requests for pseudo-random integers between 1 and an upper bound.specified at the end of each request.  The server sends a message back to the browser prefixed by "BE#$42" and ending with the requested pseudo-random number.  That number is extracted from the message in socket.onmessage and sent to a Web Worker named worker_OO. which returns a message containing the pseudo-random number's prime factors.  </p>



