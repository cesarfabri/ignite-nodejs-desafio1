const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username)
  // console.log(user)
  
  if (!user) {
    return response.status(400).json({ error: 'User not found'})
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  users.push({
      id: uuidv4(), // precisa ser um uuid
      name, 
      username, 
      todos: []
  })
  // console.log(users)
  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    create_at: new Date()
  }

  user.todos.push(newTodo)
  // console.log(user)
  return response.status(201).send()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  console.log(id)

  const { user } = request

  const todo = user.todos.find((todo) => todo.id === id )
  if (!todo) {
    return response.status(400).json({ error: 'Todo not found'})
  }
  
  const { title, deadline } = request.body
  todo.title = title
  todo.deadline = deadline

  return response.json(user)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;