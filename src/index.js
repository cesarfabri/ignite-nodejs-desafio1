const express = require('express');
const cors = require('cors');
const { v4: uuidv4, validate } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  // console.log(user)
  
  if (!user) {
    return response.status(400).json({ error: 'User not found'})
  }

  request.user = user
  return next()
}

function searchIndex(list, obj) {
  return list.findIndex((current) =>
    Object.keys(current).every((key) => obj[key] === current[key])
  );
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
 
  const userAlreadyExists = users.some(user => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({error: 'Username already Exists!'})
  }
 
  users.push({
      id: uuidv4(), // precisa ser um uuid
      name, 
      username, 
      todos: []
  })

  return response.status(201).send(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  // console.log(user)
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
    created_at: new Date()
  }
  console.log(newTodo)
  user.todos.push(newTodo)
  // console.log(user)
  return response.status(201).send(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params
  // console.log(id)

  const todo = user.todos.find((todo) => todo.id === id )
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found'})
  }
  
  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id, done } = request.params
  // console.log(id)
  const { user } = request

  const todo = user.todos.find((todo) => todo.id === id )
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found'})
  }
  todo.done = true
  console.log(todo)
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  
  // const todo = user.todos.find((todo) => todo.id === id )
  // if (!todo) {
  //   return response.status(400).json({ error: 'Todo not found'})
  // }

  // const indexTodo = searchIndex(user.todos, todo)
  // user.todos.splice(indexTodo, 1)

  const todoIndex = user.todos.findIndex(todo => todo.id === id )
  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found'})
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).send([])
});

module.exports = app;