const chat = document.getElementById("chat")

let messages = []

/* Add message */

function addMessage(content, role){

const msg = document.createElement("div")

msg.className = "message " + role

const avatar = role === "bot" ? "🤖" : "👤"

msg.innerHTML = `
<div class="avatar">${avatar}</div>
<div>${marked.parse(content)}</div>
`

chat.appendChild(msg)

hljs.highlightAll()

addCopyButtons()

chat.scrollTop = chat.scrollHeight

}

/* Copy code button */

function addCopyButtons(){

document.querySelectorAll("pre").forEach(block => {

if(!block.querySelector(".copy-btn")){

const btn = document.createElement("button")

btn.className = "copy-btn"

btn.innerText = "Copy"

btn.onclick = () => {

navigator.clipboard.writeText(block.innerText)

btn.innerText = "Copied!"

setTimeout(() => btn.innerText = "Copy", 2000)

}

block.appendChild(btn)

}

})

}

/* Suggestion buttons */

function suggest(text){

document.getElementById("prompt").value = text

}

/* New chat */

function newChat(){

chat.innerHTML = ""

messages = []

}

/* Voice input */

function startVoice(){

const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)()

recognition.lang = "en-US"

recognition.start()

recognition.onresult = function(event){

const text = event.results[0][0].transcript

document.getElementById("prompt").value = text

}

}

/* File upload */

document.getElementById("fileInput").addEventListener("change", function(){

const file = this.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = function(){

document.getElementById("prompt").value =
"Explain this code:\n\n" + reader.result

}

reader.readAsText(file)

})

/* Typing indicator */

function typingIndicator(){

const t = document.createElement("div")

t.className = "message bot"

t.id = "typing"

t.innerHTML = `
<div class="avatar">🤖</div>
<div>DevAI is thinking...</div>
`

chat.appendChild(t)

}

/* Remove typing */

function removeTyping(){

const t = document.getElementById("typing")

if(t) t.remove()

}

/* Send message */

async function sendMessage(){

const input = document.getElementById("prompt")

const text = input.value.trim()

if(!text) return

input.value = ""

addMessage(text, "user")

messages.push({
role:"user",
content:text
})

typingIndicator()

try{

const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer YOUR API KEY"
},

body:JSON.stringify({

model:"llama-3.3-70b-versatile",

messages:messages

})

})

const data = await res.json()

removeTyping()

const reply = data.choices[0].message.content

messages.push({
role:"assistant",
content:reply
})

addMessage(reply,"bot")

saveChat()

}catch(err){

removeTyping()

addMessage("⚠️ DevAI couldn't reach the server.","bot")

}

}

/* Enter key send */

document.getElementById("prompt").addEventListener("keypress", function(e){

if(e.key === "Enter") sendMessage()

})

/* Save chat */

function saveChat(){

localStorage.setItem("devai_chat", JSON.stringify(messages))

}

/* Load chat */

function loadChat(){

const saved = localStorage.getItem("devai_chat")

if(saved){

messages = JSON.parse(saved)

messages.forEach(m => addMessage(m.content, m.role))

}

}

/* Welcome message */

window.onload = function(){

loadChat()

addMessage(
"👋 **Welcome to DevAI**\n\nYour AI Developer Assistant.\n\nTry asking:\n\n• Explain JavaScript closures\n• Debug a React error\n• Upload a code file",
"bot")

}