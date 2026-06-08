import ollama from 'ollama'

const response = await ollama.chat({
      model: 'minimax-m2.7:cloud',
        messages: [{role: 'user', content: 'Hello!'}],
})
console.log(response.message.content)